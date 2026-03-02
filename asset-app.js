'use strict';

// ============================================================
//  DATA MODEL
// ============================================================
const DEFAULT_STATE = {
  holdings: [],      // 保有資産
  monthlyData: [],   // 月次データ（実績・予定）
  importHistory: [], // 取り込み履歴
  settings: {
    simulation: {
      currentAge: 35, retireAge: 65,
      currentAssets: 10000000, monthlyInvest: 100000,
      annualReturn: 5, retireExpense: 250000, inflation: 2
    }
  }
};

// ============================================================
//  STORAGE
// ============================================================
const Storage = {
  KEY: 'asset_mgmt_v1',
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return structuredClone(DEFAULT_STATE);
      const saved = JSON.parse(raw);
      return { ...structuredClone(DEFAULT_STATE), ...saved };
    } catch { return structuredClone(DEFAULT_STATE); }
  },
  save(s) {
    try { localStorage.setItem(this.KEY, JSON.stringify(s)); } catch (e) { console.warn('Storage error:', e); }
  }
};

let state = Storage.load();

// ============================================================
//  CHART REGISTRY
// ============================================================
const charts = {};
function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

// ============================================================
//  UTILITIES
// ============================================================
function fmt(n) {
  if (typeof n !== 'number' || isNaN(n)) return '—';
  return n.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 });
}
function fmtN(n, dec = 0) {
  if (typeof n !== 'number' || isNaN(n)) return '—';
  return n.toLocaleString('ja-JP', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtPct(n) {
  if (typeof n !== 'number' || isNaN(n)) return '—';
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function currentYM() { return new Date().toISOString().slice(0, 7); }
function prevYM(ym) {
  const [y, m] = ym.split('-').map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
}
function yAxisFormatter(v) {
  if (Math.abs(v) >= 1e8) return (v / 1e8).toFixed(0) + '億';
  if (Math.abs(v) >= 1e4) return (v / 1e4).toFixed(0) + '万';
  return v;
}

const CATEGORY_LABELS = {
  domestic_stock: '国内株式',
  foreign_stock: '外国株式',
  domestic_fund: '国内投信',
  foreign_fund: '外国投信',
  bond: '債券',
  reit: 'REIT',
  cash: '現金・預金',
  crypto: '暗号資産',
  other: 'その他'
};
const ACCOUNT_LABELS = {
  taxable: '特定口座',
  nisa: 'NISA(成長)',
  nisa_tsumitate: 'NISA(積立)',
  ideco: 'iDeCo',
  other: 'その他'
};
const COLORS = [
  '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6b7280'
];

// ============================================================
//  TAB NAVIGATION
// ============================================================
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(`tab-${btn.dataset.tab}`);
      if (panel) panel.classList.add('active');
      renderTab(btn.dataset.tab);
    });
  });
}
function renderTab(id) {
  switch (id) {
    case 'dashboard':  renderDashboard();  break;
    case 'portfolio':  renderPortfolio();  break;
    case 'monthly':    renderMonthly();    break;
    case 'analysis':   renderAnalysis();   break;
    case 'simulation': renderSimulation(); break;
    case 'import':     renderImport();     break;
  }
}

// ============================================================
//  DASHBOARD
// ============================================================
function renderDashboard() {
  const totalHoldings = state.holdings.reduce((s, h) => s + h.currentPrice * h.quantity, 0);
  const latestMonthly = [...state.monthlyData]
    .filter(m => m.type === 'actual' && m.totalAssets > 0)
    .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))[0];

  const displayAssets = totalHoldings > 0 ? totalHoldings : (latestMonthly?.totalAssets || 0);

  const ym = currentYM();
  const thisMonth = state.monthlyData.find(m => m.yearMonth === ym && m.type === 'actual');

  document.getElementById('kpi-total-assets').innerHTML =
    kpiHtml('総資産', fmt(displayAssets), totalHoldings > 0 ? 'ポートフォリオ合計' : (latestMonthly ? latestMonthly.yearMonth + ' 月末' : ''));
  document.getElementById('kpi-monthly-income').innerHTML =
    kpiHtml('今月の収入', fmt(thisMonth?.income?.total || 0), ym);
  document.getElementById('kpi-monthly-expense').innerHTML =
    kpiHtml('今月の支出', fmt(thisMonth?.expense?.total || 0), ym);
  document.getElementById('kpi-monthly-investment').innerHTML =
    kpiHtml('今月の投資', fmt(thisMonth?.investment?.total || 0), ym);

  renderAllocationChart();
  renderTrendChart();
}

function kpiHtml(label, value, sub) {
  return `<div class="kpi-label">${label}</div>
    <div class="kpi-value">${value}</div>
    ${sub ? `<div class="kpi-sub">${sub}</div>` : ''}`;
}

function renderAllocationChart() {
  destroyChart('allocation');
  const canvas = document.getElementById('chart-allocation');
  const empty = document.getElementById('chart-allocation-empty');
  const byCategory = {};
  state.holdings.forEach(h => {
    const v = h.currentPrice * h.quantity;
    byCategory[h.category] = (byCategory[h.category] || 0) + v;
  });
  if (Object.keys(byCategory).length === 0) {
    canvas.style.display = 'none'; empty.style.display = 'block'; return;
  }
  canvas.style.display = ''; empty.style.display = 'none';
  charts['allocation'] = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: Object.keys(byCategory).map(k => CATEGORY_LABELS[k] || k),
      datasets: [{ data: Object.values(byCategory), backgroundColor: COLORS, borderWidth: 2, borderColor: '#fff' }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 8, boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => ` ${fmt(ctx.parsed)} (${((ctx.parsed / ctx.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)` } }
      }
    }
  });
}

function renderTrendChart() {
  destroyChart('trend');
  const canvas = document.getElementById('chart-trend');
  const empty = document.getElementById('chart-trend-empty');
  const actuals = [...state.monthlyData]
    .filter(m => m.type === 'actual' && m.totalAssets > 0)
    .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth))
    .slice(-24);
  if (actuals.length === 0) {
    canvas.style.display = 'none'; empty.style.display = 'block'; return;
  }
  canvas.style.display = ''; empty.style.display = 'none';
  charts['trend'] = new Chart(canvas, {
    type: 'line',
    data: {
      labels: actuals.map(m => m.yearMonth),
      datasets: [{
        label: '総資産',
        data: actuals.map(m => m.totalAssets),
        borderColor: COLORS[0], backgroundColor: COLORS[0] + '20',
        fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 5
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { ticks: { callback: yAxisFormatter } } }
    }
  });
}

// ============================================================
//  PORTFOLIO
// ============================================================
function renderPortfolio() {
  const holdings = state.holdings;
  const tbody = document.getElementById('portfolio-tbody');
  const tfoot = document.getElementById('portfolio-tfoot');

  let totalValue = 0, totalAcq = 0;

  if (holdings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:24px;color:var(--text-muted)">保有資産がありません。「＋ 保有資産を追加」から入力、または「取り込み」タブからCSVを読み込んでください。</td></tr>`;
    tfoot.innerHTML = '';
  } else {
    tbody.innerHTML = holdings.map(h => {
      const value = h.currentPrice * h.quantity;
      const acq = (h.acquisitionPrice || 0) * h.quantity;
      const gain = acq > 0 ? value - acq : NaN;
      const gainRate = acq > 0 ? (value - acq) / acq * 100 : NaN;
      totalValue += value;
      totalAcq += acq;
      const gc = isNaN(gain) ? '' : gain >= 0 ? 'positive' : 'negative';
      return `<tr>
        <td>
          <div style="font-weight:600">${h.name}</div>
          ${h.ticker ? `<div style="font-size:11px;color:var(--text-muted)">${h.ticker}</div>` : ''}
        </td>
        <td>${CATEGORY_LABELS[h.category] || h.category}</td>
        <td>${ACCOUNT_LABELS[h.account] || h.account}</td>
        <td class="num">${fmtN(h.quantity, h.quantity % 1 !== 0 ? 4 : 0)}</td>
        <td class="num">${h.acquisitionPrice > 0 ? fmtN(h.acquisitionPrice, 2) : '—'}</td>
        <td class="num">${fmtN(h.currentPrice, 2)}</td>
        <td class="num">${fmt(value)}</td>
        <td class="num ${gc}">${isNaN(gain) ? '—' : fmt(gain)}</td>
        <td class="num ${gc}">${isNaN(gainRate) ? '—' : fmtPct(gainRate)}</td>
        <td class="col-actions">
          <button class="btn btn-sm btn-outline" onclick="openHoldingModal('${h.id}')">編集</button>
          <button class="btn btn-sm btn-danger" style="margin-left:4px" onclick="deleteHolding('${h.id}')">削除</button>
        </td>
      </tr>`;
    }).join('');

    const totalGain = totalAcq > 0 ? totalValue - totalAcq : NaN;
    const totalRate = totalAcq > 0 ? (totalValue - totalAcq) / totalAcq * 100 : NaN;
    const gc = isNaN(totalGain) ? '' : totalGain >= 0 ? 'positive' : 'negative';
    tfoot.innerHTML = `<tr>
      <td colspan="6"><strong>合計</strong></td>
      <td class="num"><strong>${fmt(totalValue)}</strong></td>
      <td class="num ${gc}"><strong>${isNaN(totalGain) ? '—' : fmt(totalGain)}</strong></td>
      <td class="num ${gc}"><strong>${isNaN(totalRate) ? '—' : fmtPct(totalRate)}</strong></td>
      <td></td>
    </tr>`;
  }

  renderPortfolioCharts(holdings);
}

function renderPortfolioCharts(holdings) {
  destroyChart('portfolio-category');
  destroyChart('portfolio-account');
  const byCategory = {}, byAccount = {};
  holdings.forEach(h => {
    const v = h.currentPrice * h.quantity;
    byCategory[h.category] = (byCategory[h.category] || 0) + v;
    byAccount[h.account] = (byAccount[h.account] || 0) + v;
  });
  const donut = (id, labels, data) => {
    if (data.length === 0) return;
    charts[id] = new Chart(document.getElementById(id), {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: COLORS, borderWidth: 2, borderColor: '#fff' }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 6, boxWidth: 12 } },
          tooltip: { callbacks: { label: ctx => ` ${fmt(ctx.parsed)}` } }
        }
      }
    });
  };
  donut('chart-portfolio-category',
    Object.keys(byCategory).map(k => CATEGORY_LABELS[k] || k),
    Object.values(byCategory));
  donut('chart-portfolio-account',
    Object.keys(byAccount).map(k => ACCOUNT_LABELS[k] || k),
    Object.values(byAccount));
}

// Holding modal
function openHoldingModal(id) {
  const modal = document.getElementById('modal-holding');
  if (id) {
    const h = state.holdings.find(x => x.id === id);
    if (!h) return;
    document.getElementById('modal-holding-title').textContent = '保有資産の編集';
    document.getElementById('holding-id').value = id;
    document.getElementById('holding-name').value = h.name;
    document.getElementById('holding-ticker').value = h.ticker || '';
    document.getElementById('holding-category').value = h.category;
    document.getElementById('holding-account').value = h.account;
    document.getElementById('holding-currency').value = h.currency || 'JPY';
    document.getElementById('holding-quantity').value = h.quantity;
    document.getElementById('holding-acq-price').value = h.acquisitionPrice || '';
    document.getElementById('holding-cur-price').value = h.currentPrice;
    document.getElementById('holding-date').value = h.date || '';
    document.getElementById('holding-memo').value = h.memo || '';
  } else {
    document.getElementById('modal-holding-title').textContent = '保有資産の追加';
    document.getElementById('form-holding').reset();
    document.getElementById('holding-id').value = '';
    document.getElementById('holding-date').value = new Date().toISOString().slice(0, 10);
  }
  modal.classList.add('open');
}

function saveHolding() {
  const id = document.getElementById('holding-id').value;
  const name = document.getElementById('holding-name').value.trim();
  const curPrice = parseFloat(document.getElementById('holding-cur-price').value);
  const quantity = parseFloat(document.getElementById('holding-quantity').value);
  if (!name || isNaN(curPrice) || isNaN(quantity)) { alert('銘柄名・数量・現在単価は必須です'); return; }

  const h = {
    id: id || uid(),
    name,
    ticker: document.getElementById('holding-ticker').value.trim(),
    category: document.getElementById('holding-category').value,
    account: document.getElementById('holding-account').value,
    currency: document.getElementById('holding-currency').value,
    quantity,
    acquisitionPrice: parseFloat(document.getElementById('holding-acq-price').value) || 0,
    currentPrice: curPrice,
    date: document.getElementById('holding-date').value,
    memo: document.getElementById('holding-memo').value.trim()
  };

  if (id) {
    const idx = state.holdings.findIndex(x => x.id === id);
    if (idx >= 0) state.holdings[idx] = h;
  } else {
    state.holdings.push(h);
  }
  Storage.save(state);
  closeModal('modal-holding');
  renderPortfolio();
  renderDashboard();
}

function deleteHolding(id) {
  if (!confirm('この保有資産を削除しますか？')) return;
  state.holdings = state.holdings.filter(h => h.id !== id);
  Storage.save(state);
  renderPortfolio();
  renderDashboard();
}

// ============================================================
//  MONTHLY
// ============================================================
let monthlyYear = new Date().getFullYear();

function renderMonthly() {
  document.getElementById('monthly-year-label').textContent = `${monthlyYear}年`;

  const months = Array.from({ length: 12 }, (_, i) =>
    `${monthlyYear}-${String(i + 1).padStart(2, '0')}`);

  const actuals = state.monthlyData.filter(m =>
    m.type === 'actual' && m.yearMonth.startsWith(String(monthlyYear)));
  const sumI = actuals.reduce((s, m) => s + (m.income?.total || 0), 0);
  const sumE = actuals.reduce((s, m) => s + (m.expense?.total || 0), 0);
  const sumV = actuals.reduce((s, m) => s + (m.investment?.total || 0), 0);
  const surplus = sumI - sumE - sumV;

  document.getElementById('monthly-summary').innerHTML = `
    <div class="kpi-card">${kpiHtml('年間収入（実績）', fmt(sumI), '')}</div>
    <div class="kpi-card">${kpiHtml('年間支出（実績）', fmt(sumE), '')}</div>
    <div class="kpi-card">${kpiHtml('年間投資（実績）', fmt(sumV), '')}</div>
    <div class="kpi-card">${kpiHtml('年間余剰資金', `<span style="color:${surplus >= 0 ? 'var(--success)' : 'var(--danger)'}">${fmt(surplus)}</span>`, '')}</div>
  `;

  const today = currentYM();
  const tbody = document.getElementById('monthly-tbody');
  tbody.innerHTML = months.map(ym => {
    const actual = state.monthlyData.find(m => m.yearMonth === ym && m.type === 'actual');
    const planned = state.monthlyData.find(m => m.yearMonth === ym && m.type === 'planned');
    const isFuture = ym > today;
    let rows = '';
    if (actual) rows += monthlyRow(actual);
    if (planned) rows += monthlyRow(planned);
    if (!actual && !planned) {
      rows = `<tr>
        <td>${ym}</td>
        <td colspan="6" style="color:var(--text-muted);font-size:12px;text-align:center">${isFuture ? '予定未入力' : 'データなし'}</td>
        <td class="col-actions">
          <button class="btn btn-sm btn-outline" onclick="openMonthlyModal(null,'${ym}','actual')">実績</button>
          <button class="btn btn-sm btn-outline" style="margin-left:4px" onclick="openMonthlyModal(null,'${ym}','planned')">予定</button>
        </td>
      </tr>`;
    }
    return rows;
  }).join('');
}

function monthlyRow(m) {
  const inc = m.income?.total || 0;
  const exp = m.expense?.total || 0;
  const inv = m.investment?.total || 0;
  const rate = inc > 0 ? ((inc - exp) / inc * 100).toFixed(1) : '—';
  return `<tr>
    <td>${m.type === 'actual' ? m.yearMonth : ''}</td>
    <td><span class="badge badge-${m.type}">${m.type === 'actual' ? '実績' : '予定'}</span></td>
    <td class="num">${fmt(inc)}</td>
    <td class="num">${fmt(exp)}</td>
    <td class="num">${fmt(inv)}</td>
    <td class="num">${rate !== '—' ? rate + '%' : '—'}</td>
    <td class="num">${m.totalAssets ? fmt(m.totalAssets) : '—'}</td>
    <td class="col-actions">
      <button class="btn btn-sm btn-outline" onclick="openMonthlyModal('${m.id}')">編集</button>
      <button class="btn btn-sm btn-danger" style="margin-left:4px" onclick="deleteMonthly('${m.id}')">削除</button>
    </td>
  </tr>`;
}

function openMonthlyModal(id, defaultYm, defaultType) {
  if (id) {
    const m = state.monthlyData.find(x => x.id === id);
    if (!m) return;
    document.getElementById('modal-monthly-title').textContent = '月次データの編集';
    document.getElementById('monthly-id').value = id;
    document.getElementById('monthly-yearmonth').value = m.yearMonth;
    document.getElementById('monthly-type').value = m.type;
    document.getElementById('monthly-income-salary').value = m.income?.salary || 0;
    document.getElementById('monthly-income-business').value = m.income?.business || 0;
    document.getElementById('monthly-income-other').value = m.income?.otherIncome || 0;
    document.getElementById('monthly-exp-housing').value = m.expense?.housing || 0;
    document.getElementById('monthly-exp-food').value = m.expense?.food || 0;
    document.getElementById('monthly-exp-utilities').value = m.expense?.utilities || 0;
    document.getElementById('monthly-exp-insurance').value = m.expense?.insurance || 0;
    document.getElementById('monthly-exp-medical').value = m.expense?.medical || 0;
    document.getElementById('monthly-exp-entertainment').value = m.expense?.entertainment || 0;
    document.getElementById('monthly-exp-other').value = m.expense?.otherExpense || 0;
    document.getElementById('monthly-inv-stocks').value = m.investment?.stocks || 0;
    document.getElementById('monthly-inv-funds').value = m.investment?.funds || 0;
    document.getElementById('monthly-inv-other').value = m.investment?.otherInvestment || 0;
    document.getElementById('monthly-total-assets').value = m.totalAssets || 0;
    document.getElementById('monthly-memo').value = m.memo || '';
  } else {
    document.getElementById('modal-monthly-title').textContent = '月次データの追加';
    document.getElementById('form-monthly').reset();
    document.getElementById('monthly-id').value = '';
    document.getElementById('monthly-yearmonth').value = defaultYm || currentYM();
    document.getElementById('monthly-type').value = defaultType || 'actual';
    document.querySelectorAll('#form-monthly input[type="number"]').forEach(el => el.value = 0);
  }
  document.getElementById('modal-monthly').classList.add('open');
}

function saveMonthly() {
  const id = document.getElementById('monthly-id').value;
  const ym = document.getElementById('monthly-yearmonth').value;
  if (!ym) { alert('年月を選択してください'); return; }

  const g = id => parseFloat(document.getElementById(id).value) || 0;

  const salary = g('monthly-income-salary');
  const business = g('monthly-income-business');
  const otherIncome = g('monthly-income-other');
  const totalIncome = salary + business + otherIncome;

  const housing = g('monthly-exp-housing');
  const food = g('monthly-exp-food');
  const utilities = g('monthly-exp-utilities');
  const insurance = g('monthly-exp-insurance');
  const medical = g('monthly-exp-medical');
  const entertainment = g('monthly-exp-entertainment');
  const otherExpense = g('monthly-exp-other');
  const totalExpense = housing + food + utilities + insurance + medical + entertainment + otherExpense;

  const stocks = g('monthly-inv-stocks');
  const funds = g('monthly-inv-funds');
  const otherInvestment = g('monthly-inv-other');
  const totalInvestment = stocks + funds + otherInvestment;

  const record = {
    id: id || uid(),
    yearMonth: ym,
    type: document.getElementById('monthly-type').value,
    income: { total: totalIncome, salary, business, otherIncome },
    expense: { total: totalExpense, housing, food, utilities, insurance, medical, entertainment, otherExpense },
    investment: { total: totalInvestment, stocks, funds, otherInvestment },
    totalAssets: g('monthly-total-assets'),
    memo: document.getElementById('monthly-memo').value.trim()
  };

  if (id) {
    const idx = state.monthlyData.findIndex(m => m.id === id);
    if (idx >= 0) state.monthlyData[idx] = record;
  } else {
    state.monthlyData.push(record);
  }
  Storage.save(state);
  closeModal('modal-monthly');
  renderMonthly();
  renderDashboard();
}

function deleteMonthly(id) {
  if (!confirm('このデータを削除しますか？')) return;
  state.monthlyData = state.monthlyData.filter(m => m.id !== id);
  Storage.save(state);
  renderMonthly();
}

// ============================================================
//  ANALYSIS
// ============================================================
let analysisYear = new Date().getFullYear();

function renderAnalysis() {
  document.getElementById('analysis-year-label').textContent = `${analysisYear}年`;

  const months = Array.from({ length: 12 }, (_, i) =>
    `${analysisYear}-${String(i + 1).padStart(2, '0')}`);
  const labels = months.map((_, i) => `${i + 1}月`);

  const byType = (type, field) => months.map(ym => {
    const m = state.monthlyData.find(x => x.yearMonth === ym && x.type === type);
    return m?.[field]?.total || 0;
  });

  const ai = byType('actual', 'income');
  const pi = byType('planned', 'income');
  const ae = byType('actual', 'expense');
  const pe = byType('planned', 'expense');
  const av = byType('actual', 'investment');
  const pv = byType('planned', 'investment');

  function barChart(id, label, planned, actual) {
    destroyChart(id);
    charts[id] = new Chart(document.getElementById(id), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: `${label}(予)`, data: planned, backgroundColor: COLORS[1] + '90', borderColor: COLORS[1], borderWidth: 1 },
          { label: `${label}(実)`, data: actual, backgroundColor: COLORS[0] + '90', borderColor: COLORS[0], borderWidth: 1 }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 12 } } },
        scales: { y: { ticks: { callback: yAxisFormatter } } }
      }
    });
  }

  barChart('chart-analysis-income', '収入', pi, ai);
  barChart('chart-analysis-expense', '支出', pe, ae);
  barChart('chart-analysis-investment', '投資', pv, av);

  const diffClass = (v, inverse) => v === 0 ? '' : (v > 0) !== inverse ? 'positive' : 'negative';
  document.getElementById('analysis-tbody').innerHTML = months.map((ym, i) => {
    const di = ai[i] - pi[i], de = ae[i] - pe[i], dv = av[i] - pv[i];
    return `<tr>
      <td>${i + 1}月</td>
      <td class="num">${fmt(pi[i])}</td>
      <td class="num">${fmt(ai[i])}</td>
      <td class="num ${diffClass(di, false)}">${di !== 0 ? fmt(di) : '—'}</td>
      <td class="num">${fmt(pe[i])}</td>
      <td class="num">${fmt(ae[i])}</td>
      <td class="num ${diffClass(de, true)}">${de !== 0 ? fmt(de) : '—'}</td>
      <td class="num">${fmt(pv[i])}</td>
      <td class="num">${fmt(av[i])}</td>
      <td class="num ${diffClass(dv, false)}">${dv !== 0 ? fmt(dv) : '—'}</td>
    </tr>`;
  }).join('');
}

// ============================================================
//  SIMULATION
// ============================================================
function renderSimulation() {
  const s = state.settings.simulation;
  document.getElementById('sim-current-age').value = s.currentAge;
  document.getElementById('sim-retire-age').value = s.retireAge;
  document.getElementById('sim-current-assets').value = s.currentAssets;
  document.getElementById('sim-monthly-invest').value = s.monthlyInvest;
  document.getElementById('sim-annual-return').value = s.annualReturn;
  document.getElementById('sim-retire-expense').value = s.retireExpense;
  document.getElementById('sim-inflation').value = s.inflation;
}

function runSimulation() {
  const currentAge = +document.getElementById('sim-current-age').value;
  const retireAge = +document.getElementById('sim-retire-age').value;
  const currentAssets = +document.getElementById('sim-current-assets').value;
  const monthlyInvest = +document.getElementById('sim-monthly-invest').value;
  const annualReturn = +document.getElementById('sim-annual-return').value / 100;
  const retireExpense = +document.getElementById('sim-retire-expense').value;
  const inflation = +document.getElementById('sim-inflation').value / 100;
  const scenario = document.getElementById('sim-scenario').value;

  state.settings.simulation = {
    currentAge, retireAge, currentAssets, monthlyInvest,
    annualReturn: annualReturn * 100, retireExpense, inflation: inflation * 100
  };
  Storage.save(state);

  const endAge = Math.max(retireAge + 30, 95);

  function calcScenario(ret, inf) {
    const monthlyRet = ret / 12;
    const data = [];
    let assets = currentAssets;
    for (let yr = 0; yr <= endAge - currentAge; yr++) {
      const age = currentAge + yr;
      data.push({ age, assets: Math.max(0, Math.round(assets)) });
      if (age < retireAge) {
        for (let m = 0; m < 12; m++) assets = assets * (1 + monthlyRet) + monthlyInvest;
      } else {
        const yearsRetired = age - retireAge;
        const adj = retireExpense * Math.pow(1 + inf, yearsRetired);
        for (let m = 0; m < 12; m++) { assets = assets * (1 + monthlyRet) - adj; if (assets < 0) { assets = 0; break; } }
      }
    }
    return data;
  }

  const baseData = calcScenario(annualReturn, inflation);
  const retireAssets = baseData.find(d => d.age === retireAge)?.assets || 0;
  const depleted = baseData.find(d => d.assets === 0 && d.age > retireAge);
  const fireX = retireExpense > 0 ? retireAssets / (retireExpense * 12) : 0;

  document.getElementById('sim-kpis').innerHTML = `
    <div class="kpi-card">${kpiHtml(`引退時資産（${retireAge}歳）`, fmt(retireAssets), '基本シナリオ')}</div>
    <div class="kpi-card">${kpiHtml('FIREマルチプル', fireX.toFixed(1) + '倍', '25倍以上が目安')}</div>
    <div class="kpi-card">${kpiHtml('資産枯渇予想', depleted ? `<span style="color:var(--danger)">${depleted.age}歳</span>` : '<span style="color:var(--success)">枯渇なし</span>', '基本シナリオ')}</div>
  `;

  destroyChart('simulation');
  const datasets = [];

  const push = (label, data, color, fill) => datasets.push({
    label, data: data.map(d => d.assets),
    borderColor: color, backgroundColor: color + '18',
    fill, tension: 0.4, pointRadius: 0, borderWidth: 2
  });

  if (scenario === 'base' || scenario === 'all')
    push('基本シナリオ', baseData, COLORS[0], scenario === 'base');
  if (scenario === 'optimistic' || scenario === 'all')
    push('楽観シナリオ', calcScenario(annualReturn * 1.5, inflation * 0.5), COLORS[1], false);
  if (scenario === 'pessimistic' || scenario === 'all')
    push('悲観シナリオ', calcScenario(annualReturn * 0.5, inflation * 1.5), COLORS[3], false);

  charts['simulation'] = new Chart(document.getElementById('chart-simulation'), {
    type: 'line',
    data: { labels: baseData.map(d => `${d.age}歳`), datasets },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 12 } } },
      scales: { y: { ticks: { callback: yAxisFormatter } } }
    }
  });

  // Table (every 5 years)
  document.getElementById('sim-table-wrapper').innerHTML = `
    <table class="data-table" style="min-width:300px">
      <thead>
        <tr>
          <th style="text-align:left">年齢</th>
          <th class="num">想定資産額</th>
          <th>フェーズ</th>
        </tr>
      </thead>
      <tbody>
        ${baseData.filter((d, i) => i % 5 === 0 || d.age === endAge).map(d => `
          <tr>
            <td>${d.age}歳</td>
            <td class="num">${fmt(d.assets)}</td>
            <td style="text-align:center">${d.age < retireAge ? '積立期' : '取崩期'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ============================================================
//  IMPORT / EXPORT
// ============================================================
function renderImport() { renderImportHistory(); }

function renderImportHistory() {
  const el = document.getElementById('import-history');
  if (state.importHistory.length === 0) {
    el.innerHTML = '<p class="text-muted" style="font-size:13px">取り込み履歴はありません</p>';
    return;
  }
  el.innerHTML = `
    <table class="history-table">
      <thead><tr><th>日時</th><th>ソース</th><th>ファイル</th><th>件数</th></tr></thead>
      <tbody>
        ${[...state.importHistory].reverse().slice(0, 15).map(h => `
          <tr>
            <td>${new Date(h.timestamp).toLocaleString('ja-JP')}</td>
            <td>${h.source}</td>
            <td>${h.fileName}</td>
            <td>${h.count}件</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// --- CSV PARSE ---
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n');
  if (lines.length < 2) return [];
  const headers = csvSplit(lines[0]).map(h => h.replace(/^["'\uFEFF]+|["']+$/g, '').trim());
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = csvSplit(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || '').replace(/^["']+|["']+$/g, '').trim(); });
    return obj;
  });
}

function csvSplit(line) {
  const res = []; let cur = ''; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; }
    else if (c === ',' && !inQ) { res.push(cur); cur = ''; }
    else { cur += c; }
  }
  res.push(cur);
  return res;
}

function parseNum(s) {
  if (typeof s !== 'string') return 0;
  return parseFloat(s.replace(/[,，円\s]/g, '')) || 0;
}

// --- SECURITIES IMPORT ---
function handleSecuritiesImport() {
  const file = document.getElementById('securities-file').files[0];
  const type = document.getElementById('securities-type').value;
  const preview = document.getElementById('securities-preview');
  if (!file) { alert('ファイルを選択してください'); return; }

  const reader = new FileReader();
  reader.onload = e => {
    try {
      let text = e.target.result;
      // Try to decode as Shift-JIS if garbled
      const rows = parseCSV(text);
      let count = 0;
      rows.forEach(row => {
        const h = parseSecuritiesRow(row, type);
        if (!h) return;
        const existing = state.holdings.find(x =>
          (h.ticker && x.ticker === h.ticker) || x.name === h.name);
        if (existing) Object.assign(existing, h);
        else state.holdings.push({ id: uid(), ...h });
        count++;
      });
      Storage.save(state);
      state.importHistory.push({ timestamp: Date.now(), source: `証券(${type})`, fileName: file.name, count });
      Storage.save(state);
      preview.innerHTML = `<span style="color:var(--success)">✓ ${count}件を取り込みました</span>`;
      renderImportHistory();
    } catch (err) {
      preview.innerHTML = `<span style="color:var(--danger)">エラー: ${err.message}</span>`;
    }
  };
  reader.readAsText(file, 'UTF-8');
}

function parseSecuritiesRow(row, type) {
  // Universal column names tried in order
  const name = row['銘柄名'] || row['銘柄'] || row['ファンド名'] || row['name'] || '';
  const ticker = row['銘柄コード'] || row['コード'] || row['ticker'] || '';
  const quantity = parseNum(row['数量'] || row['口数'] || row['保有口数'] || row['quantity'] || '0');
  const acqPrice = parseNum(row['取得単価'] || row['平均取得単価'] || row['取得価額'] || '0');
  const curPrice = parseNum(row['現在値'] || row['時価'] || row['基準価額'] || row['current_price'] || row['評価単価'] || '0');
  if (!name || quantity === 0) return null;
  return {
    name, ticker, quantity,
    acquisitionPrice: acqPrice,
    currentPrice: curPrice || acqPrice,
    category: ticker.length === 4 ? 'domestic_stock' : (ticker.length > 4 ? 'foreign_stock' : 'domestic_fund'),
    account: 'taxable',
    currency: 'JPY',
    date: new Date().toISOString().slice(0, 10)
  };
}

// --- MONEYFORWARD IMPORT ---
function handleMFImport() {
  const file = document.getElementById('mf-file').files[0];
  const type = document.getElementById('mf-type').value;
  const preview = document.getElementById('mf-preview');
  if (!file) { alert('ファイルを選択してください'); return; }

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const rows = parseCSV(e.target.result);
      let count = 0;

      if (type === 'cashflow') {
        // 入出金履歴: 日付, 内容, 金額(円), 保有金融機関, 大項目, 中項目
        rows.forEach(row => {
          const dateStr = row['日付'] || '';
          const ym = dateStr.slice(0, 7).replace('/', '-');
          if (!ym.match(/^\d{4}-\d{2}$/)) return;

          const amountRaw = parseFloat((row['金額(円)'] || row['金額'] || '0').replace(/[,，]/g, '')) || 0;
          const absAmt = Math.abs(amountRaw);
          if (absAmt === 0) return;

          const cat = row['大項目'] || '';
          const sub = row['中項目'] || '';
          const isInvestment = ['証券', '株式', '投資信託', '投資', 'NISA', 'iDeCo'].some(k => cat.includes(k) || sub.includes(k));
          const isHousing = ['住宅', '家賃', '住居'].some(k => cat.includes(k));
          const isFood = ['食費', '日用品'].some(k => cat.includes(k));
          const isIncome = amountRaw > 0;

          let rec = state.monthlyData.find(m => m.yearMonth === ym && m.type === 'actual');
          if (!rec) {
            rec = {
              id: uid(), yearMonth: ym, type: 'actual',
              income: { total: 0, salary: 0, business: 0, otherIncome: 0 },
              expense: { total: 0, housing: 0, food: 0, utilities: 0, insurance: 0, medical: 0, entertainment: 0, otherExpense: 0 },
              investment: { total: 0, stocks: 0, funds: 0, otherInvestment: 0 },
              totalAssets: 0, memo: ''
            };
            state.monthlyData.push(rec);
          }

          if (isIncome) {
            rec.income.otherIncome += absAmt;
            rec.income.total += absAmt;
          } else if (isInvestment) {
            rec.investment.otherInvestment += absAmt;
            rec.investment.total += absAmt;
          } else if (isHousing) {
            rec.expense.housing += absAmt; rec.expense.total += absAmt;
          } else if (isFood) {
            rec.expense.food += absAmt; rec.expense.total += absAmt;
          } else {
            rec.expense.otherExpense += absAmt; rec.expense.total += absAmt;
          }
          count++;
        });
      } else {
        // 資産残高: 日付, 金融機関名, 口座名, 残高
        rows.forEach(row => {
          const name = ((row['金融機関名'] || '') + ' ' + (row['口座名'] || '')).trim();
          const amount = parseNum(row['残高'] || row['評価額'] || '0');
          if (!name || !amount) return;
          const ex = state.holdings.find(h => h.name === name);
          if (ex) { ex.currentPrice = amount; ex.quantity = 1; }
          else {
            state.holdings.push({
              id: uid(), name, ticker: '', category: 'cash',
              account: 'other', currency: 'JPY',
              quantity: 1, acquisitionPrice: amount, currentPrice: amount,
              date: row['日付'] || new Date().toISOString().slice(0, 10)
            });
          }
          count++;
        });
      }

      Storage.save(state);
      state.importHistory.push({ timestamp: Date.now(), source: `マネーフォワード(${type})`, fileName: file.name, count });
      Storage.save(state);
      preview.innerHTML = `<span style="color:var(--success)">✓ ${count}件を取り込みました</span>`;
      renderImportHistory();
    } catch (err) {
      preview.innerHTML = `<span style="color:var(--danger)">エラー: ${err.message}</span>`;
    }
  };
  reader.readAsText(file, 'UTF-8');
}

// --- JSON EXPORT / IMPORT ---
function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `asset_data_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importJSON(file) {
  if (!confirm('現在のデータを上書きしてインポートしますか？')) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      state = { ...structuredClone(DEFAULT_STATE), ...JSON.parse(e.target.result) };
      Storage.save(state);
      renderDashboard();
      renderImportHistory();
      alert('インポートしました');
    } catch { alert('ファイルの形式が正しくありません'); }
  };
  reader.readAsText(file);
}

function clearAllData() {
  if (!confirm('全データを削除しますか？この操作は取り消せません。')) return;
  if (!confirm('本当に削除しますか？')) return;
  state = structuredClone(DEFAULT_STATE);
  Storage.save(state);
  renderDashboard();
  alert('データを削除しました');
}

// ============================================================
//  SAMPLE DATA
// ============================================================
function loadSampleData() {
  if (!confirm('サンプルデータを読み込みます。既存データは上書きされます。よろしいですか？')) return;

  const today = new Date();
  const ym = (y, m) => `${y}-${String(m).padStart(2, '0')}`;
  const y = today.getFullYear();
  const mo = today.getMonth() + 1; // 1-based

  // Holdings
  state.holdings = [
    { id: uid(), name: 'eMAXIS Slim 全世界株式（オール・カントリー）', ticker: '0131103C', category: 'foreign_fund', account: 'nisa_tsumitate', currency: 'JPY', quantity: 500000, acquisitionPrice: 1.8, currentPrice: 2.3, date: ym(y, mo), memo: '' },
    { id: uid(), name: 'SBI・V・S&P500インデックス', ticker: '89311199', category: 'foreign_fund', account: 'nisa', currency: 'JPY', quantity: 200000, acquisitionPrice: 1.5, currentPrice: 2.1, date: ym(y, mo), memo: '' },
    { id: uid(), name: 'トヨタ自動車', ticker: '7203', category: 'domestic_stock', account: 'taxable', currency: 'JPY', quantity: 100, acquisitionPrice: 2500, currentPrice: 3200, date: ym(y, mo), memo: '' },
    { id: uid(), name: 'Apple Inc.', ticker: 'AAPL', category: 'foreign_stock', account: 'taxable', currency: 'USD', quantity: 10, acquisitionPrice: 150, currentPrice: 180, date: ym(y, mo), memo: '' },
    { id: uid(), name: '三菱UFJ銀行 普通預金', ticker: '', category: 'cash', account: 'other', currency: 'JPY', quantity: 1, acquisitionPrice: 3000000, currentPrice: 3000000, date: ym(y, mo), memo: '' },
    { id: uid(), name: 'iDeCoインデックス世界株式', ticker: '', category: 'foreign_fund', account: 'ideco', currency: 'JPY', quantity: 1, acquisitionPrice: 2500000, currentPrice: 3100000, date: ym(y, mo), memo: '' },
  ];

  // Monthly data (12 months actual + 6 months planned)
  state.monthlyData = [];
  let assets = 15000000;
  for (let i = 12; i >= 1; i--) {
    let d = new Date(today); d.setMonth(d.getMonth() - i);
    const MY = ym(d.getFullYear(), d.getMonth() + 1);
    const income = 450000 + Math.round((Math.random() - 0.5) * 50000);
    const exp = 220000 + Math.round((Math.random() - 0.5) * 30000);
    const inv = 100000;
    assets += (income - exp - inv) + Math.round(assets * 0.004);
    state.monthlyData.push({
      id: uid(), yearMonth: MY, type: 'actual',
      income: { total: income, salary: 400000, business: 30000, otherIncome: income - 430000 },
      expense: { total: exp, housing: 80000, food: 50000, utilities: 15000, insurance: 20000, medical: 5000, entertainment: 25000, otherExpense: exp - 195000 },
      investment: { total: inv, stocks: 30000, funds: 60000, otherInvestment: 10000 },
      totalAssets: assets, memo: ''
    });
  }
  // Planned (future 6 months)
  for (let i = 0; i < 6; i++) {
    let d = new Date(today); d.setMonth(d.getMonth() + i + 1);
    const MY = ym(d.getFullYear(), d.getMonth() + 1);
    state.monthlyData.push({
      id: uid(), yearMonth: MY, type: 'planned',
      income: { total: 450000, salary: 400000, business: 30000, otherIncome: 20000 },
      expense: { total: 210000, housing: 80000, food: 45000, utilities: 15000, insurance: 20000, medical: 5000, entertainment: 20000, otherExpense: 25000 },
      investment: { total: 100000, stocks: 30000, funds: 60000, otherInvestment: 10000 },
      totalAssets: 0, memo: '予定'
    });
  }

  Storage.save(state);
  renderDashboard();
  alert('サンプルデータを読み込みました');
}

// ============================================================
//  MODAL HELPERS
// ============================================================
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// ============================================================
//  INIT
// ============================================================
function init() {
  initTabs();

  // --- Portfolio ---
  document.getElementById('btn-add-holding').addEventListener('click', () => openHoldingModal(null));
  document.getElementById('btn-save-holding').addEventListener('click', saveHolding);

  // --- Monthly ---
  document.getElementById('btn-add-monthly').addEventListener('click', () => openMonthlyModal(null));
  document.getElementById('btn-save-monthly').addEventListener('click', saveMonthly);
  document.getElementById('btn-prev-year').addEventListener('click', () => { monthlyYear--; renderMonthly(); });
  document.getElementById('btn-next-year').addEventListener('click', () => { monthlyYear++; renderMonthly(); });

  // --- Analysis ---
  document.getElementById('btn-analysis-prev').addEventListener('click', () => { analysisYear--; renderAnalysis(); });
  document.getElementById('btn-analysis-next').addEventListener('click', () => { analysisYear++; renderAnalysis(); });

  // --- Simulation ---
  document.getElementById('btn-run-sim').addEventListener('click', runSimulation);

  // --- Import ---
  document.getElementById('btn-import-securities').addEventListener('click', handleSecuritiesImport);
  document.getElementById('btn-import-mf').addEventListener('click', handleMFImport);
  document.getElementById('btn-export-data').addEventListener('click', exportData);
  document.getElementById('btn-import-json').addEventListener('click', () => document.getElementById('import-json-file').click());
  document.getElementById('import-json-file').addEventListener('change', e => { if (e.target.files[0]) importJSON(e.target.files[0]); });
  document.getElementById('btn-clear-data').addEventListener('click', clearAllData);

  // File label update
  document.getElementById('securities-file').addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) document.querySelector('#lbl-securities-file span').textContent = f.name;
  });
  document.getElementById('mf-file').addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) document.querySelector('#lbl-mf-file span').textContent = f.name;
  });

  // --- Sample data ---
  document.getElementById('btn-load-sample').addEventListener('click', loadSampleData);

  // --- Modal close buttons (data-modal attribute) ---
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modal));
  });

  // --- Close modal on overlay click ---
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  // --- Initial render ---
  renderDashboard();
}

document.addEventListener('DOMContentLoaded', init);
