'use strict';

// ============================================================
//  DEFAULT MASTERS
// ============================================================
const DEFAULT_MASTERS = {
  securitiesLayouts: [
    {
      id: 'sbi', name: 'SBI証券', encoding: 'UTF-8', isBuiltin: true,
      colName: '銘柄名,銘柄', colTicker: '銘柄コード,コード',
      colQuantity: '数量', colAcqPrice: '取得単価,平均取得単価',
      colCurPrice: '現在値,時価', colValue: '評価額',
      defaultCategory: 'domestic_stock', defaultAccount: 'taxable', notes: ''
    },
    {
      id: 'rakuten', name: '楽天証券', encoding: 'UTF-8', isBuiltin: true,
      colName: '銘柄名,ファンド名', colTicker: '銘柄コード',
      colQuantity: '数量,口数,保有口数', colAcqPrice: '取得単価',
      colCurPrice: '基準価額,時価,現在値', colValue: '評価額',
      defaultCategory: 'domestic_fund', defaultAccount: 'taxable', notes: ''
    },
    {
      id: 'monex', name: 'マネックス証券', encoding: 'UTF-8', isBuiltin: true,
      colName: '銘柄名,銘柄', colTicker: '銘柄コード,コード',
      colQuantity: '数量', colAcqPrice: '取得単価,平均取得単価',
      colCurPrice: '現在値,時価', colValue: '評価額,時価総額',
      defaultCategory: 'domestic_stock', defaultAccount: 'taxable', notes: ''
    },
    {
      id: 'matsui', name: '松井証券', encoding: 'UTF-8', isBuiltin: true,
      colName: '銘柄名', colTicker: 'コード',
      colQuantity: '保有株数,保有数量', colAcqPrice: '平均買付単価,取得単価',
      colCurPrice: '現在値,現在値段', colValue: '評価額',
      defaultCategory: 'domestic_stock', defaultAccount: 'taxable', notes: ''
    },
    {
      id: 'nomura', name: '野村證券', encoding: 'UTF-8', isBuiltin: true,
      colName: '銘柄名称,銘柄名', colTicker: '銘柄コード',
      colQuantity: '保有数量,数量', colAcqPrice: '取得単価',
      colCurPrice: '現在値段,現在値', colValue: '時価評価額,評価額',
      defaultCategory: 'domestic_stock', defaultAccount: 'taxable', notes: ''
    }
  ],
  cashflowCategories: [
    { id: 'salary',       type: 'income',     label: '給与・賞与',     mfKeywords: '給与,賞与,ボーナス',                 order: 1, isBuiltin: true },
    { id: 'business',     type: 'income',     label: '副業・事業収入', mfKeywords: '副業,事業収入,フリーランス',          order: 2, isBuiltin: true },
    { id: 'other_income', type: 'income',     label: 'その他収入',     mfKeywords: '',                                   order: 3, isBuiltin: true },
    { id: 'housing',      type: 'expense',    label: '住居費',         mfKeywords: '住宅,家賃,住居,地代',               order: 1, isBuiltin: true },
    { id: 'food',         type: 'expense',    label: '食費',           mfKeywords: '食費,外食,日用品,コンビニ',          order: 2, isBuiltin: true },
    { id: 'utilities',    type: 'expense',    label: '光熱・通信費',   mfKeywords: '電気,ガス,水道,通信,携帯,インターネット', order: 3, isBuiltin: true },
    { id: 'insurance',    type: 'expense',    label: '保険料',         mfKeywords: '保険',                               order: 4, isBuiltin: true },
    { id: 'medical',      type: 'expense',    label: '医療費',         mfKeywords: '医療,病院,薬,クリニック',            order: 5, isBuiltin: true },
    { id: 'entertainment',type: 'expense',    label: '交際・娯楽費',   mfKeywords: '交際費,娯楽,趣味,飲み会',           order: 6, isBuiltin: true },
    { id: 'other_expense',type: 'expense',    label: 'その他支出',     mfKeywords: '',                                   order: 7, isBuiltin: true },
    { id: 'inv_stocks',   type: 'investment', label: '株式',           mfKeywords: '株式,株,個別株',                    order: 1, isBuiltin: true },
    { id: 'inv_funds',    type: 'investment', label: '投資信託',       mfKeywords: '投資信託,ファンド,NISA,iDeCo',      order: 2, isBuiltin: true },
    { id: 'inv_other',    type: 'investment', label: 'その他投資',     mfKeywords: '証券,債券,REIT',                    order: 3, isBuiltin: true }
  ],
  assetCategories: [
    { id: 'domestic_stock', label: '国内株式',   color: '#2563eb', order: 1, isBuiltin: true },
    { id: 'foreign_stock',  label: '外国株式',   color: '#10b981', order: 2, isBuiltin: true },
    { id: 'domestic_fund',  label: '国内投信',   color: '#f59e0b', order: 3, isBuiltin: true },
    { id: 'foreign_fund',   label: '外国投信',   color: '#8b5cf6', order: 4, isBuiltin: true },
    { id: 'bond',           label: '債券',       color: '#06b6d4', order: 5, isBuiltin: true },
    { id: 'reit',           label: 'REIT',       color: '#f97316', order: 6, isBuiltin: true },
    { id: 'cash',           label: '現金・預金', color: '#84cc16', order: 7, isBuiltin: true },
    { id: 'crypto',         label: '暗号資産',   color: '#ec4899', order: 8, isBuiltin: true },
    { id: 'other',          label: 'その他',     color: '#6b7280', order: 9, isBuiltin: true }
  ],
  accountTypes: [
    { id: 'taxable',       label: '特定口座（課税）',  order: 1, isBuiltin: true },
    { id: 'nisa',          label: 'NISA（成長投資枠）',order: 2, isBuiltin: true },
    { id: 'nisa_tsumitate',label: 'NISA（つみたて枠）',order: 3, isBuiltin: true },
    { id: 'ideco',         label: 'iDeCo',             order: 4, isBuiltin: true },
    { id: 'other_account', label: 'その他口座',         order: 5, isBuiltin: true }
  ]
};

// ============================================================
//  DEFAULT STATE
// ============================================================
const DEFAULT_STATE = {
  holdings: [],
  monthlyData: [],
  importHistory: [],
  settings: {
    simulation: {
      currentAge: 35, retireAge: 65,
      currentAssets: 10000000, monthlyInvest: 100000,
      annualReturn: 5, retireExpense: 250000, inflation: 2
    }
  },
  masters: structuredClone ? structuredClone(DEFAULT_MASTERS) : JSON.parse(JSON.stringify(DEFAULT_MASTERS))
};

// ============================================================
//  STORAGE
// ============================================================
const Storage = {
  KEY: 'asset_mgmt_v2',
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return deepClone(DEFAULT_STATE);
      const saved = JSON.parse(raw);
      // Merge masters: keep saved data but fill in any missing builtin entries
      const merged = deepClone(DEFAULT_STATE);
      if (saved.holdings)      merged.holdings      = saved.holdings;
      if (saved.monthlyData)   merged.monthlyData   = saved.monthlyData;
      if (saved.importHistory) merged.importHistory = saved.importHistory;
      if (saved.settings)      merged.settings      = { ...merged.settings, ...saved.settings };
      if (saved.masters) {
        merged.masters = saved.masters;
        // Add any new builtin entries not yet in saved masters
        for (const key of Object.keys(DEFAULT_MASTERS)) {
          if (!merged.masters[key]) merged.masters[key] = deepClone(DEFAULT_MASTERS[key]);
          DEFAULT_MASTERS[key].forEach(def => {
            if (!merged.masters[key].find(m => m.id === def.id))
              merged.masters[key].push(deepClone(def));
          });
        }
      }
      return merged;
    } catch { return deepClone(DEFAULT_STATE); }
  },
  save(s) {
    try { localStorage.setItem(this.KEY, JSON.stringify(s)); } catch (e) { console.warn('Storage:', e); }
  }
};

function deepClone(o) {
  return typeof structuredClone === 'function' ? structuredClone(o) : JSON.parse(JSON.stringify(o));
}

let state = Storage.load();

// ============================================================
//  MASTER ACCESSORS
// ============================================================
const M = {
  assetCategories()    { return [...state.masters.assetCategories].sort((a,b) => a.order - b.order); },
  accountTypes()       { return [...state.masters.accountTypes].sort((a,b) => a.order - b.order); },
  cashflow(type)       { return state.masters.cashflowCategories.filter(c => c.type === type).sort((a,b) => a.order - b.order); },
  secLayouts()         { return state.masters.securitiesLayouts; },
  assetLabel(id)       { return state.masters.assetCategories.find(c => c.id === id)?.label || id; },
  assetColor(id)       { return state.masters.assetCategories.find(c => c.id === id)?.color || '#6b7280'; },
  accountLabel(id)     { return state.masters.accountTypes.find(a => a.id === id)?.label || id; },
  allColors()          { return M.assetCategories().map(c => c.color); }
};

// ============================================================
//  CHARTS
// ============================================================
const charts = {};
function destroyChart(id) { if (charts[id]) { charts[id].destroy(); delete charts[id]; } }

// ============================================================
//  UTILITIES
// ============================================================
function fmt(n)         { if (typeof n !== 'number' || isNaN(n)) return '—'; return n.toLocaleString('ja-JP',{style:'currency',currency:'JPY',maximumFractionDigits:0}); }
function fmtN(n, d=0)   { if (typeof n !== 'number' || isNaN(n)) return '—'; return n.toLocaleString('ja-JP',{minimumFractionDigits:d,maximumFractionDigits:d}); }
function fmtPct(n)      { if (typeof n !== 'number' || isNaN(n)) return '—'; return (n>=0?'+':'')+n.toFixed(2)+'%'; }
function uid()          { return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function currentYM()    { return new Date().toISOString().slice(0,7); }
function yFmt(v)        { if(Math.abs(v)>=1e8) return (v/1e8).toFixed(0)+'億'; if(Math.abs(v)>=1e4) return (v/1e4).toFixed(0)+'万'; return v; }

/** Build <option> HTML list from master */
function optionsHtml(items, selectedId) {
  return items.map(x => `<option value="${x.id}"${x.id===selectedId?' selected':''}>${x.label}</option>`).join('');
}

/** Resolve the first matching column value from a row using comma-separated candidates */
function resolveCol(row, candidates) {
  const keys = (candidates || '').split(',').map(s => s.trim()).filter(Boolean);
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== '') return row[k];
  }
  return '';
}

// ============================================================
//  TAB NAVIGATION
// ============================================================
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById('tab-'+btn.dataset.tab);
      if (panel) panel.classList.add('active');
      renderTab(btn.dataset.tab);
    });
  });
}
function renderTab(id) {
  switch(id) {
    case 'dashboard':  renderDashboard();  break;
    case 'portfolio':  renderPortfolio();  break;
    case 'monthly':    renderMonthly();    break;
    case 'analysis':   renderAnalysis();   break;
    case 'simulation': renderSimulation(); break;
    case 'import':     renderImport();     break;
    case 'master':     renderMaster();     break;
  }
}

// ============================================================
//  DASHBOARD
// ============================================================
function renderDashboard() {
  const totalHoldings = state.holdings.reduce((s,h) => s + h.currentPrice*h.quantity, 0);
  const latestMonthly = [...state.monthlyData].filter(m=>m.type==='actual'&&m.totalAssets>0)
    .sort((a,b)=>b.yearMonth.localeCompare(a.yearMonth))[0];
  const displayAssets = totalHoldings>0 ? totalHoldings : (latestMonthly?.totalAssets||0);
  const ym = currentYM();
  const tm = state.monthlyData.find(m=>m.yearMonth===ym&&m.type==='actual');

  document.getElementById('kpi-total-assets').innerHTML     = kpiHtml('総資産', fmt(displayAssets), totalHoldings>0?'ポートフォリオ合計':(latestMonthly?latestMonthly.yearMonth+' 月末':''));
  document.getElementById('kpi-monthly-income').innerHTML   = kpiHtml('今月の収入',   fmt(getTotal(tm,'income')),     ym);
  document.getElementById('kpi-monthly-expense').innerHTML  = kpiHtml('今月の支出',   fmt(getTotal(tm,'expense')),    ym);
  document.getElementById('kpi-monthly-investment').innerHTML = kpiHtml('今月の投資', fmt(getTotal(tm,'investment')), ym);

  renderAllocationChart();
  renderTrendChart();
}
function kpiHtml(label, value, sub) {
  return `<div class="kpi-label">${label}</div><div class="kpi-value">${value}</div>${sub?`<div class="kpi-sub">${sub}</div>`:''}`;
}

function renderAllocationChart() {
  destroyChart('allocation');
  const canvas = document.getElementById('chart-allocation');
  const empty  = document.getElementById('chart-allocation-empty');
  const byCategory = {};
  state.holdings.forEach(h => { const v=h.currentPrice*h.quantity; byCategory[h.category]=(byCategory[h.category]||0)+v; });
  if (!Object.keys(byCategory).length) { canvas.style.display='none'; empty.style.display='block'; return; }
  canvas.style.display=''; empty.style.display='none';
  charts['allocation'] = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: Object.keys(byCategory).map(k=>M.assetLabel(k)),
      datasets: [{data:Object.values(byCategory), backgroundColor:Object.keys(byCategory).map(k=>M.assetColor(k)), borderWidth:2, borderColor:'#fff'}]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins: {
        legend:{position:'bottom',labels:{font:{size:11},padding:8,boxWidth:12}},
        tooltip:{callbacks:{label:ctx=>' '+fmt(ctx.parsed)+' ('+(ctx.parsed/ctx.dataset.data.reduce((a,b)=>a+b,0)*100).toFixed(1)+'%)'}}
      }
    }
  });
}
function renderTrendChart() {
  destroyChart('trend');
  const canvas = document.getElementById('chart-trend');
  const empty  = document.getElementById('chart-trend-empty');
  const data = [...state.monthlyData].filter(m=>m.type==='actual'&&m.totalAssets>0).sort((a,b)=>a.yearMonth.localeCompare(b.yearMonth)).slice(-24);
  if (!data.length) { canvas.style.display='none'; empty.style.display='block'; return; }
  canvas.style.display=''; empty.style.display='none';
  charts['trend'] = new Chart(canvas, {
    type:'line',
    data:{labels:data.map(m=>m.yearMonth), datasets:[{label:'総資産',data:data.map(m=>m.totalAssets),borderColor:'#2563eb',backgroundColor:'#2563eb18',fill:true,tension:0.4,pointRadius:3}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{ticks:{callback:yFmt}}}}
  });
}

// ============================================================
//  PORTFOLIO
// ============================================================
function renderPortfolio() {
  // Populate selects from master
  const catSel = document.getElementById('holding-category');
  const acctSel = document.getElementById('holding-account');
  if (catSel) catSel.innerHTML = optionsHtml(M.assetCategories(), catSel.value);
  if (acctSel) acctSel.innerHTML = optionsHtml(M.accountTypes(), acctSel.value);

  const tbody = document.getElementById('portfolio-tbody');
  const tfoot = document.getElementById('portfolio-tfoot');
  let totalValue=0, totalAcq=0;

  if (!state.holdings.length) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:24px;color:var(--text-muted)">保有資産がありません。「＋ 保有資産を追加」から入力、または「取り込み」タブからCSVを読み込んでください。</td></tr>`;
    tfoot.innerHTML = '';
  } else {
    tbody.innerHTML = state.holdings.map(h => {
      const value = h.currentPrice*h.quantity;
      const acq   = (h.acquisitionPrice||0)*h.quantity;
      const gain  = acq>0 ? value-acq : NaN;
      const rate  = acq>0 ? (value-acq)/acq*100 : NaN;
      totalValue += value; totalAcq += acq;
      const gc = isNaN(gain)?'':(gain>=0?'positive':'negative');
      return `<tr>
        <td><div style="font-weight:600">${h.name}</div>${h.ticker?`<div style="font-size:11px;color:var(--text-muted)">${h.ticker}</div>`:''}</td>
        <td><span class="color-swatch" style="background:${M.assetColor(h.category)}"></span>${M.assetLabel(h.category)}</td>
        <td>${M.accountLabel(h.account)}</td>
        <td class="num">${fmtN(h.quantity, h.quantity%1?4:0)}</td>
        <td class="num">${h.acquisitionPrice>0?fmtN(h.acquisitionPrice,2):'—'}</td>
        <td class="num">${fmtN(h.currentPrice,2)}</td>
        <td class="num">${fmt(value)}</td>
        <td class="num ${gc}">${isNaN(gain)?'—':fmt(gain)}</td>
        <td class="num ${gc}">${isNaN(rate)?'—':fmtPct(rate)}</td>
        <td class="col-actions">
          <button class="btn btn-sm btn-outline" onclick="openHoldingModal('${h.id}')">編集</button>
          <button class="btn btn-sm btn-danger" style="margin-left:4px" onclick="deleteHolding('${h.id}')">削除</button>
        </td>
      </tr>`;
    }).join('');
    const tg = totalAcq>0?totalValue-totalAcq:NaN, tr = totalAcq>0?(totalValue-totalAcq)/totalAcq*100:NaN;
    const gc = isNaN(tg)?'':(tg>=0?'positive':'negative');
    tfoot.innerHTML = `<tr><td colspan="6"><strong>合計</strong></td><td class="num"><strong>${fmt(totalValue)}</strong></td><td class="num ${gc}"><strong>${isNaN(tg)?'—':fmt(tg)}</strong></td><td class="num ${gc}"><strong>${isNaN(tr)?'—':fmtPct(tr)}</strong></td><td></td></tr>`;
  }
  renderPortfolioCharts(state.holdings);
}

function renderPortfolioCharts(holdings) {
  ['portfolio-category','portfolio-account'].forEach(id=>destroyChart(id));
  const byCategory={}, byAccount={};
  holdings.forEach(h=>{const v=h.currentPrice*h.quantity; byCategory[h.category]=(byCategory[h.category]||0)+v; byAccount[h.account]=(byAccount[h.account]||0)+v;});
  const donut = (id, labels, data, colors) => {
    if (!data.length) return;
    charts[id]=new Chart(document.getElementById(id),{
      type:'doughnut',
      data:{labels,datasets:[{data,backgroundColor:colors,borderWidth:2,borderColor:'#fff'}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{size:11},padding:6,boxWidth:12}},tooltip:{callbacks:{label:ctx=>' '+fmt(ctx.parsed)}}}}
    });
  };
  donut('chart-portfolio-category',
    Object.keys(byCategory).map(k=>M.assetLabel(k)), Object.values(byCategory),
    Object.keys(byCategory).map(k=>M.assetColor(k)));
  const PALETTE=['#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];
  donut('chart-portfolio-account',
    Object.keys(byAccount).map(k=>M.accountLabel(k)), Object.values(byAccount),
    Object.keys(byAccount).map((_,i)=>PALETTE[i%PALETTE.length]));
}

function openHoldingModal(id) {
  // Rebuild selects from master each time (may have changed)
  document.getElementById('holding-category').innerHTML = optionsHtml(M.assetCategories(),'');
  document.getElementById('holding-account').innerHTML  = optionsHtml(M.accountTypes(),'');

  if (id) {
    const h = state.holdings.find(x=>x.id===id);
    if (!h) return;
    document.getElementById('modal-holding-title').textContent='保有資産の編集';
    setV({ 'holding-id':id, 'holding-name':h.name, 'holding-ticker':h.ticker||'',
      'holding-category':h.category, 'holding-account':h.account,
      'holding-currency':h.currency||'JPY', 'holding-quantity':h.quantity,
      'holding-acq-price':h.acquisitionPrice||'', 'holding-cur-price':h.currentPrice,
      'holding-date':h.date||'', 'holding-memo':h.memo||'' });
  } else {
    document.getElementById('modal-holding-title').textContent='保有資産の追加';
    document.getElementById('form-holding').reset();
    document.getElementById('holding-id').value='';
    document.getElementById('holding-date').value=new Date().toISOString().slice(0,10);
  }
  openModal('modal-holding');
}
function saveHolding() {
  const id=gv('holding-id'), name=gv('holding-name').trim();
  const curPrice=parseFloat(gv('holding-cur-price')), quantity=parseFloat(gv('holding-quantity'));
  if (!name||isNaN(curPrice)||isNaN(quantity)) { alert('銘柄名・数量・現在単価は必須です'); return; }
  const h={id:id||uid(), name, ticker:gv('holding-ticker').trim(),
    category:gv('holding-category'), account:gv('holding-account'), currency:gv('holding-currency'),
    quantity, acquisitionPrice:parseFloat(gv('holding-acq-price'))||0, currentPrice:curPrice,
    date:gv('holding-date'), memo:gv('holding-memo').trim()};
  if (id) { const idx=state.holdings.findIndex(x=>x.id===id); if(idx>=0) state.holdings[idx]=h; }
  else state.holdings.push(h);
  Storage.save(state); closeModal('modal-holding'); renderPortfolio(); renderDashboard();
}
function deleteHolding(id) {
  if (!confirm('この保有資産を削除しますか？')) return;
  state.holdings=state.holdings.filter(h=>h.id!==id);
  Storage.save(state); renderPortfolio(); renderDashboard();
}

// ============================================================
//  MONTHLY
// ============================================================
let monthlyYear = new Date().getFullYear();

/** Get total for a cashflow type from a monthly record */
function getTotal(rec, type) {
  if (!rec) return 0;
  const items = rec[type]?.items;
  if (items) return Object.values(items).reduce((s,v)=>s+(v||0),0);
  return rec[type]?.total||0;
}
/** Get item value for a specific category from a monthly record */
function getItem(rec, type, catId) {
  if (!rec) return 0;
  const items = rec[type]?.items;
  if (items) return items[catId]||0;
  // Legacy field mapping
  const legacyMap = {
    salary:'salary', business:'business', other_income:'otherIncome',
    housing:'housing', food:'food', utilities:'utilities', insurance:'insurance',
    medical:'medical', entertainment:'entertainment', other_expense:'otherExpense',
    inv_stocks:'stocks', inv_funds:'funds', inv_other:'otherInvestment'
  };
  return rec[type]?.[legacyMap[catId]]||0;
}

function renderMonthly() {
  document.getElementById('monthly-year-label').textContent=`${monthlyYear}年`;
  const months = Array.from({length:12},(_,i)=>`${monthlyYear}-${String(i+1).padStart(2,'0')}`);
  const actuals = state.monthlyData.filter(m=>m.type==='actual'&&m.yearMonth.startsWith(String(monthlyYear)));
  const sumI=actuals.reduce((s,m)=>s+getTotal(m,'income'),0);
  const sumE=actuals.reduce((s,m)=>s+getTotal(m,'expense'),0);
  const sumV=actuals.reduce((s,m)=>s+getTotal(m,'investment'),0);
  const surplus=sumI-sumE-sumV;
  document.getElementById('monthly-summary').innerHTML=`
    <div class="kpi-card">${kpiHtml('年間収入（実績）',fmt(sumI),'')}</div>
    <div class="kpi-card">${kpiHtml('年間支出（実績）',fmt(sumE),'')}</div>
    <div class="kpi-card">${kpiHtml('年間投資（実績）',fmt(sumV),'')}</div>
    <div class="kpi-card">${kpiHtml('年間余剰資金',`<span style="color:${surplus>=0?'var(--success)':'var(--danger)'}">${fmt(surplus)}</span>`,'')}</div>`;
  const today=currentYM();
  document.getElementById('monthly-tbody').innerHTML=months.map(ym=>{
    const actual=state.monthlyData.find(m=>m.yearMonth===ym&&m.type==='actual');
    const planned=state.monthlyData.find(m=>m.yearMonth===ym&&m.type==='planned');
    const isFuture=ym>today;
    let rows='';
    if (actual) rows+=monthlyRow(actual);
    if (planned) rows+=monthlyRow(planned);
    if (!actual&&!planned) rows=`<tr>
      <td>${ym}</td>
      <td colspan="6" style="color:var(--text-muted);font-size:12px;text-align:center">${isFuture?'予定未入力':'データなし'}</td>
      <td class="col-actions">
        <button class="btn btn-sm btn-outline" onclick="openMonthlyModal(null,'${ym}','actual')">実績</button>
        <button class="btn btn-sm btn-outline" style="margin-left:4px" onclick="openMonthlyModal(null,'${ym}','planned')">予定</button>
      </td></tr>`;
    return rows;
  }).join('');
}
function monthlyRow(m) {
  const inc=getTotal(m,'income'), exp=getTotal(m,'expense'), inv=getTotal(m,'investment');
  const rate=inc>0?((inc-exp)/inc*100).toFixed(1):'—';
  return `<tr>
    <td>${m.type==='actual'?m.yearMonth:''}</td>
    <td><span class="badge badge-${m.type}">${m.type==='actual'?'実績':'予定'}</span></td>
    <td class="num">${fmt(inc)}</td><td class="num">${fmt(exp)}</td><td class="num">${fmt(inv)}</td>
    <td class="num">${rate!=='—'?rate+'%':'—'}</td>
    <td class="num">${m.totalAssets?fmt(m.totalAssets):'—'}</td>
    <td class="col-actions">
      <button class="btn btn-sm btn-outline" onclick="openMonthlyModal('${m.id}')">編集</button>
      <button class="btn btn-sm btn-danger" style="margin-left:4px" onclick="deleteMonthly('${m.id}')">削除</button>
    </td></tr>`;
}

function buildMonthlyDynamicFields(rec) {
  const html = ['income','expense','investment'].map(type=>{
    const typeLabel = type==='income'?'収入':type==='expense'?'支出':'投資';
    const cats = M.cashflow(type);
    return `<div class="form-section">
      <h4>${typeLabel}</h4>
      <div class="form-row-3col">
        ${cats.map(c=>`<div class="form-row">
          <label>${c.label}</label>
          <input type="number" class="mf-field" data-type="${type}" data-cat="${c.id}" min="0" step="1000" value="${getItem(rec,type,c.id)}">
        </div>`).join('')}
      </div>
    </div>`;
  }).join('');
  document.getElementById('monthly-dynamic-fields').innerHTML = html;
}

function openMonthlyModal(id, defaultYm, defaultType) {
  if (id) {
    const m=state.monthlyData.find(x=>x.id===id);
    if (!m) return;
    document.getElementById('modal-monthly-title').textContent='月次データの編集';
    setV({'monthly-id':id,'monthly-yearmonth':m.yearMonth,'monthly-type':m.type,
          'monthly-total-assets':m.totalAssets||0,'monthly-memo':m.memo||''});
    buildMonthlyDynamicFields(m);
  } else {
    document.getElementById('modal-monthly-title').textContent='月次データの追加';
    document.getElementById('form-monthly').reset();
    document.getElementById('monthly-id').value='';
    document.getElementById('monthly-yearmonth').value=defaultYm||currentYM();
    document.getElementById('monthly-type').value=defaultType||'actual';
    document.getElementById('monthly-total-assets').value=0;
    buildMonthlyDynamicFields(null);
  }
  openModal('modal-monthly');
}
function saveMonthly() {
  const id=gv('monthly-id'), ym=gv('monthly-yearmonth');
  if (!ym) { alert('年月を選択してください'); return; }
  const record={id:id||uid(), yearMonth:ym, type:gv('monthly-type'),
    income:{total:0,items:{}}, expense:{total:0,items:{}}, investment:{total:0,items:{}},
    totalAssets:parseFloat(gv('monthly-total-assets'))||0, memo:gv('monthly-memo').trim()};
  document.querySelectorAll('#monthly-dynamic-fields .mf-field').forEach(el=>{
    const v=parseFloat(el.value)||0;
    const type=el.dataset.type, cat=el.dataset.cat;
    record[type].items[cat]=v;
    record[type].total+=v;
  });
  if (id) { const idx=state.monthlyData.findIndex(m=>m.id===id); if(idx>=0) state.monthlyData[idx]=record; }
  else state.monthlyData.push(record);
  Storage.save(state); closeModal('modal-monthly'); renderMonthly(); renderDashboard();
}
function deleteMonthly(id) {
  if (!confirm('このデータを削除しますか？')) return;
  state.monthlyData=state.monthlyData.filter(m=>m.id!==id);
  Storage.save(state); renderMonthly();
}

// ============================================================
//  ANALYSIS
// ============================================================
let analysisYear = new Date().getFullYear();

function renderAnalysis() {
  document.getElementById('analysis-year-label').textContent=`${analysisYear}年`;
  const months=Array.from({length:12},(_,i)=>`${analysisYear}-${String(i+1).padStart(2,'0')}`);
  const labels=months.map((_,i)=>`${i+1}月`);
  const byType=(type,mtype)=>months.map(ym=>{const m=state.monthlyData.find(x=>x.yearMonth===ym&&x.type===mtype); return m?getTotal(m,type):0;});
  const ai=byType('income','actual'), pi=byType('income','planned');
  const ae=byType('expense','actual'),pe=byType('expense','planned');
  const av=byType('investment','actual'),pv=byType('investment','planned');
  const bar=(id,label,planned,actual)=>{
    destroyChart(id);
    charts[id]=new Chart(document.getElementById(id),{
      type:'bar',
      data:{labels,datasets:[
        {label:`${label}(予)`,data:planned,backgroundColor:'#10b98190',borderColor:'#10b981',borderWidth:1},
        {label:`${label}(実)`,data:actual,backgroundColor:'#2563eb90',borderColor:'#2563eb',borderWidth:1}
      ]},
      options:{responsive:true,plugins:{legend:{position:'top',labels:{font:{size:11},boxWidth:12}}},scales:{y:{ticks:{callback:yFmt}}}}
    });
  };
  bar('chart-analysis-income','収入',pi,ai);
  bar('chart-analysis-expense','支出',pe,ae);
  bar('chart-analysis-investment','投資',pv,av);
  const dc=(v,inv)=>v===0?'':(v>0)!==inv?'positive':'negative';
  document.getElementById('analysis-tbody').innerHTML=months.map((ym,i)=>{
    const di=ai[i]-pi[i],de=ae[i]-pe[i],dv=av[i]-pv[i];
    return `<tr>
      <td>${i+1}月</td>
      <td class="num">${fmt(pi[i])}</td><td class="num">${fmt(ai[i])}</td><td class="num ${dc(di,false)}">${di?fmt(di):'—'}</td>
      <td class="num">${fmt(pe[i])}</td><td class="num">${fmt(ae[i])}</td><td class="num ${dc(de,true)}">${de?fmt(de):'—'}</td>
      <td class="num">${fmt(pv[i])}</td><td class="num">${fmt(av[i])}</td><td class="num ${dc(dv,false)}">${dv?fmt(dv):'—'}</td>
    </tr>`;
  }).join('');
}

// ============================================================
//  SIMULATION
// ============================================================
function renderSimulation() {
  const s=state.settings.simulation;
  setV({'sim-current-age':s.currentAge,'sim-retire-age':s.retireAge,'sim-current-assets':s.currentAssets,
        'sim-monthly-invest':s.monthlyInvest,'sim-annual-return':s.annualReturn,
        'sim-retire-expense':s.retireExpense,'sim-inflation':s.inflation});
}
function runSimulation() {
  const currentAge=+gv('sim-current-age'), retireAge=+gv('sim-retire-age'),
        currentAssets=+gv('sim-current-assets'), monthlyInvest=+gv('sim-monthly-invest'),
        annualReturn=+gv('sim-annual-return')/100, retireExpense=+gv('sim-retire-expense'),
        inflation=+gv('sim-inflation')/100, scenario=gv('sim-scenario');
  state.settings.simulation={currentAge,retireAge,currentAssets,monthlyInvest,
    annualReturn:annualReturn*100,retireExpense,inflation:inflation*100};
  Storage.save(state);
  const endAge=Math.max(retireAge+30,95);
  function calc(ret,inf){
    const mr=ret/12; const data=[]; let assets=currentAssets;
    for(let yr=0;yr<=endAge-currentAge;yr++){
      const age=currentAge+yr;
      data.push({age,assets:Math.max(0,Math.round(assets))});
      if(age<retireAge){for(let m=0;m<12;m++)assets=assets*(1+mr)+monthlyInvest;}
      else{const adj=retireExpense*Math.pow(1+inf,age-retireAge);for(let m=0;m<12;m++){assets=assets*(1+mr)-adj;if(assets<0){assets=0;break;}}}
    }
    return data;
  }
  const base=calc(annualReturn,inflation);
  const retireAssets=base.find(d=>d.age===retireAge)?.assets||0;
  const depleted=base.find(d=>d.assets===0&&d.age>retireAge);
  const fireX=retireExpense>0?retireAssets/(retireExpense*12):0;
  document.getElementById('sim-kpis').innerHTML=`
    <div class="kpi-card">${kpiHtml(`引退時資産（${retireAge}歳）`,fmt(retireAssets),'基本シナリオ')}</div>
    <div class="kpi-card">${kpiHtml('FIREマルチプル',fireX.toFixed(1)+'倍','25倍以上が目安')}</div>
    <div class="kpi-card">${kpiHtml('資産枯渇予想',depleted?`<span style="color:var(--danger)">${depleted.age}歳</span>`:'<span style="color:var(--success)">枯渇なし</span>','基本シナリオ')}</div>`;
  destroyChart('simulation');
  const datasets=[];
  const push=(label,data,color,fill)=>datasets.push({label,data:data.map(d=>d.assets),borderColor:color,backgroundColor:color+'18',fill,tension:0.4,pointRadius:0,borderWidth:2});
  if(scenario==='base'||scenario==='all') push('基本シナリオ',base,'#2563eb',scenario==='base');
  if(scenario==='optimistic'||scenario==='all') push('楽観シナリオ',calc(annualReturn*1.5,inflation*0.5),'#10b981',false);
  if(scenario==='pessimistic'||scenario==='all') push('悲観シナリオ',calc(annualReturn*0.5,inflation*1.5),'#ef4444',false);
  charts['simulation']=new Chart(document.getElementById('chart-simulation'),{
    type:'line',
    data:{labels:base.map(d=>`${d.age}歳`),datasets},
    options:{responsive:true,plugins:{legend:{position:'top',labels:{font:{size:11},boxWidth:12}}},scales:{y:{ticks:{callback:yFmt}}}}
  });
  document.getElementById('sim-table-wrapper').innerHTML=`
    <table class="data-table" style="min-width:300px"><thead><tr><th style="text-align:left">年齢</th><th class="num">想定資産額</th><th>フェーズ</th></tr></thead>
    <tbody>${base.filter((d,i)=>i%5===0||d.age===endAge).map(d=>`<tr><td>${d.age}歳</td><td class="num">${fmt(d.assets)}</td><td style="text-align:center">${d.age<retireAge?'積立期':'取崩期'}</td></tr>`).join('')}</tbody></table>`;
}

// ============================================================
//  IMPORT
// ============================================================
function renderImport() {
  // Populate securities type select from master
  const sel = document.getElementById('securities-type');
  sel.innerHTML = M.secLayouts().map(l=>`<option value="${l.id}">${l.name}</option>`).join('');
  renderImportHistory();
}
function renderImportHistory() {
  const el=document.getElementById('import-history');
  if (!state.importHistory.length){el.innerHTML='<p class="text-muted" style="font-size:13px">取り込み履歴はありません</p>';return;}
  el.innerHTML=`<table class="history-table"><thead><tr><th>日時</th><th>ソース</th><th>ファイル</th><th>件数</th></tr></thead><tbody>
    ${[...state.importHistory].reverse().slice(0,15).map(h=>`<tr><td>${new Date(h.timestamp).toLocaleString('ja-JP')}</td><td>${h.source}</td><td>${h.fileName}</td><td>${h.count}件</td></tr>`).join('')}
  </tbody></table>`;
}

// --- CSV ---
function parseCSV(text){
  const lines=text.replace(/\r\n/g,'\n').replace(/\r/g,'\n').trim().split('\n');
  if(lines.length<2)return[];
  const headers=csvSplit(lines[0]).map(h=>h.replace(/^["'\uFEFF]+|["']+$/g,'').trim());
  return lines.slice(1).filter(l=>l.trim()).map(line=>{
    const vals=csvSplit(line);
    const obj={};
    headers.forEach((h,i)=>{obj[h]=(vals[i]||'').replace(/^["']+|["']+$/g,'').trim();});
    return obj;
  });
}
function csvSplit(line){
  const res=[];let cur='';let inQ=false;
  for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){inQ=!inQ;}else if(c===','&&!inQ){res.push(cur);cur='';}else{cur+=c;}}
  res.push(cur);return res;
}
function parseNum(s){if(typeof s!=='string')return 0;return parseFloat(s.replace(/[,，円\s]/g,''))||0;}

function handleSecuritiesImport(){
  const file=document.getElementById('securities-file').files[0];
  const layoutId=document.getElementById('securities-type').value;
  const preview=document.getElementById('securities-preview');
  if(!file){alert('ファイルを選択してください');return;}
  const layout=M.secLayouts().find(l=>l.id===layoutId);
  if(!layout){alert('レイアウトが見つかりません');return;}
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const rows=parseCSV(e.target.result);
      let count=0;
      rows.forEach(row=>{
        const name=resolveCol(row,layout.colName);
        const ticker=resolveCol(row,layout.colTicker);
        const quantity=parseNum(resolveCol(row,layout.colQuantity));
        const acqPrice=parseNum(resolveCol(row,layout.colAcqPrice));
        const curPrice=parseNum(resolveCol(row,layout.colCurPrice));
        if(!name||quantity===0)return;
        const h={id:uid(),name,ticker,quantity,acquisitionPrice:acqPrice,
          currentPrice:curPrice||acqPrice,category:layout.defaultCategory||'other',
          account:layout.defaultAccount||'taxable',currency:'JPY',
          date:new Date().toISOString().slice(0,10),memo:''};
        const ex=state.holdings.find(x=>(ticker&&x.ticker===ticker)||x.name===name);
        if(ex)Object.assign(ex,{currentPrice:h.currentPrice,quantity:h.quantity});
        else state.holdings.push(h);
        count++;
      });
      Storage.save(state);
      state.importHistory.push({timestamp:Date.now(),source:`証券(${layout.name})`,fileName:file.name,count});
      Storage.save(state);
      preview.innerHTML=`<span style="color:var(--success)">✓ ${count}件を取り込みました</span>`;
      renderImportHistory();
    }catch(err){preview.innerHTML=`<span style="color:var(--danger)">エラー: ${err.message}</span>`;}
  };
  reader.readAsText(file,'UTF-8');
}

function handleMFImport(){
  const file=document.getElementById('mf-file').files[0];
  const type=document.getElementById('mf-type').value;
  const preview=document.getElementById('mf-preview');
  if(!file){alert('ファイルを選択してください');return;}
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const rows=parseCSV(e.target.result);
      let count=0;
      if(type==='cashflow'){
        rows.forEach(row=>{
          const dateStr=row['日付']||'';
          const ym=dateStr.slice(0,7).replace('/','-');
          if(!ym.match(/^\d{4}-\d{2}$/))return;
          const amountRaw=parseFloat((row['金額(円)']||row['金額']||'0').replace(/[,，]/g,''))||0;
          const absAmt=Math.abs(amountRaw);
          if(!absAmt)return;
          const cat=row['大項目']||'', sub=row['中項目']||'';
          const text=cat+sub;
          let rec=state.monthlyData.find(m=>m.yearMonth===ym&&m.type==='actual');
          if(!rec){
            rec={id:uid(),yearMonth:ym,type:'actual',
              income:{total:0,items:{}},expense:{total:0,items:{}},investment:{total:0,items:{}},totalAssets:0,memo:''};
            state.monthlyData.push(rec);
          }
          // Match by master keywords
          const allCats=state.masters.cashflowCategories;
          let matched=null;
          for(const c of allCats){
            if(!c.mfKeywords)continue;
            const kws=c.mfKeywords.split(',').map(s=>s.trim()).filter(Boolean);
            if(kws.some(k=>text.includes(k))){matched=c;break;}
          }
          if(amountRaw>0){
            const catId=matched?.type==='income'?matched.id:'other_income';
            if(!rec.income.items[catId])rec.income.items[catId]=0;
            rec.income.items[catId]+=absAmt; rec.income.total+=absAmt;
          }else{
            if(matched?.type==='investment'){
              const catId=matched.id;
              if(!rec.investment.items[catId])rec.investment.items[catId]=0;
              rec.investment.items[catId]+=absAmt; rec.investment.total+=absAmt;
            }else{
              const catId=matched?.type==='expense'?matched.id:'other_expense';
              if(!rec.expense.items[catId])rec.expense.items[catId]=0;
              rec.expense.items[catId]+=absAmt; rec.expense.total+=absAmt;
            }
          }
          count++;
        });
      }else{
        rows.forEach(row=>{
          const name=((row['金融機関名']||'')+' '+(row['口座名']||'')).trim();
          const amount=parseNum(row['残高']||row['評価額']||'0');
          if(!name||!amount)return;
          const ex=state.holdings.find(h=>h.name===name);
          if(ex){ex.currentPrice=amount;ex.quantity=1;}
          else state.holdings.push({id:uid(),name,ticker:'',category:'cash',account:'other_account',
            currency:'JPY',quantity:1,acquisitionPrice:amount,currentPrice:amount,
            date:row['日付']||new Date().toISOString().slice(0,10),memo:''});
          count++;
        });
      }
      Storage.save(state);
      state.importHistory.push({timestamp:Date.now(),source:`マネーフォワード(${type})`,fileName:file.name,count});
      Storage.save(state);
      preview.innerHTML=`<span style="color:var(--success)">✓ ${count}件を取り込みました</span>`;
      renderImportHistory();
    }catch(err){preview.innerHTML=`<span style="color:var(--danger)">エラー: ${err.message}</span>`;}
  };
  reader.readAsText(file,'UTF-8');
}

function exportData(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download=`asset_data_${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);
}
function importJSON(file){
  if(!confirm('現在のデータを上書きしてインポートしますか？'))return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{state={...deepClone(DEFAULT_STATE),...JSON.parse(e.target.result)};Storage.save(state);renderDashboard();renderImportHistory();alert('インポートしました');}
    catch{alert('ファイルの形式が正しくありません');}
  };
  reader.readAsText(file);
}
function clearAllData(){
  if(!confirm('全データを削除しますか？この操作は取り消せません。'))return;
  if(!confirm('本当に削除しますか？'))return;
  state=deepClone(DEFAULT_STATE);Storage.save(state);renderDashboard();alert('データを削除しました');
}

// ============================================================
//  MASTER MANAGEMENT
// ============================================================
let activeMasterPanel = 'securities';

function renderMaster() {
  renderMasterPanel(activeMasterPanel);
}
function switchMasterPanel(name) {
  activeMasterPanel = name;
  document.querySelectorAll('.master-tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.master===name));
  document.querySelectorAll('.master-panel').forEach(p=>p.classList.toggle('active',p.id===`master-${name}`));
  renderMasterPanel(name);
}
function renderMasterPanel(name) {
  switch(name){
    case 'securities': renderSecuritiesMaster(); break;
    case 'cashflow':   renderCashflowMaster();   break;
    case 'assetcat':   renderAssetCatMaster();   break;
    case 'account':    renderAccountMaster();    break;
  }
}

// --- Securities Layout Master ---
function renderSecuritiesMaster() {
  document.getElementById('tbody-securities-layouts').innerHTML =
    M.secLayouts().map(l=>`<tr>
      <td><strong>${l.name}</strong>${l.isBuiltin?'<span class="builtin-badge">組込</span>':''}</td>
      <td><small>${l.colName||'—'}</small></td>
      <td><small>${l.colTicker||'—'}</small></td>
      <td><small>${l.colQuantity||'—'}</small></td>
      <td><small>${l.colAcqPrice||'—'}</small></td>
      <td><small>${l.colCurPrice||'—'}</small></td>
      <td>${M.assetLabel(l.defaultCategory)}</td>
      <td>${M.accountLabel(l.defaultAccount)}</td>
      <td class="col-actions">
        <button class="btn btn-sm btn-outline" onclick="openSecLayoutModal('${l.id}')">編集</button>
        ${!l.isBuiltin?`<button class="btn btn-sm btn-danger" style="margin-left:4px" onclick="deleteSecLayout('${l.id}')">削除</button>`:''}
      </td>
    </tr>`).join('');
}
function openSecLayoutModal(id) {
  // Rebuild category/account selects
  document.getElementById('sec-default-category').innerHTML = optionsHtml(M.assetCategories(),'');
  document.getElementById('sec-default-account').innerHTML  = optionsHtml(M.accountTypes(),'');
  if (id) {
    const l=state.masters.securitiesLayouts.find(x=>x.id===id);
    if(!l)return;
    document.getElementById('modal-sec-title').textContent='証券会社CSVレイアウトの編集';
    setV({'sec-id':id,'sec-name':l.name,'sec-encoding':l.encoding||'UTF-8',
          'sec-col-name':l.colName||'','sec-col-ticker':l.colTicker||'',
          'sec-col-quantity':l.colQuantity||'','sec-col-acq-price':l.colAcqPrice||'',
          'sec-col-cur-price':l.colCurPrice||'','sec-col-value':l.colValue||'',
          'sec-default-category':l.defaultCategory||'','sec-default-account':l.defaultAccount||'',
          'sec-notes':l.notes||''});
  } else {
    document.getElementById('modal-sec-title').textContent='証券会社CSVレイアウトの追加';
    document.getElementById('form-securities-layout').reset();
    document.getElementById('sec-id').value='';
  }
  openModal('modal-securities-layout');
}
function saveSecLayout() {
  const id=gv('sec-id'), name=gv('sec-name').trim();
  if(!name){alert('証券会社名は必須です');return;}
  const l={id:id||uid(),name,encoding:gv('sec-encoding'),
    colName:gv('sec-col-name'),colTicker:gv('sec-col-ticker'),colQuantity:gv('sec-col-quantity'),
    colAcqPrice:gv('sec-col-acq-price'),colCurPrice:gv('sec-col-cur-price'),colValue:gv('sec-col-value'),
    defaultCategory:gv('sec-default-category'),defaultAccount:gv('sec-default-account'),
    notes:gv('sec-notes'),isBuiltin:false};
  if(id){
    const idx=state.masters.securitiesLayouts.findIndex(x=>x.id===id);
    if(idx>=0){l.isBuiltin=state.masters.securitiesLayouts[idx].isBuiltin; state.masters.securitiesLayouts[idx]=l;}
  }else state.masters.securitiesLayouts.push(l);
  Storage.save(state);closeModal('modal-securities-layout');renderSecuritiesMaster();
}
function deleteSecLayout(id) {
  if(!confirm('このレイアウトを削除しますか？'))return;
  state.masters.securitiesLayouts=state.masters.securitiesLayouts.filter(l=>l.id!==id);
  Storage.save(state);renderSecuritiesMaster();
}

// --- Cashflow Category Master ---
function renderCashflowMaster() {
  const container=document.getElementById('cashflow-cat-panels');
  const types=[{id:'income',label:'収入'},{id:'expense',label:'支出'},{id:'investment',label:'投資'}];
  container.innerHTML=types.map(t=>`
    <div class="cashflow-type-section">
      <h4>${t.label}</h4>
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th class="col-name">カテゴリ名</th><th>MFキーワード</th><th>表示順</th><th class="col-actions">操作</th></tr></thead>
          <tbody>
            ${M.cashflow(t.id).map(c=>`<tr>
              <td>${c.label}${c.isBuiltin?'<span class="builtin-badge">組込</span>':''}</td>
              <td><small>${c.mfKeywords||'—'}</small></td>
              <td style="text-align:center">${c.order}</td>
              <td class="col-actions">
                <button class="btn btn-sm btn-outline" onclick="openCashflowCatModal('${c.id}')">編集</button>
                ${!c.isBuiltin?`<button class="btn btn-sm btn-danger" style="margin-left:4px" onclick="deleteCashflowCat('${c.id}')">削除</button>`:''}
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`).join('');
}
function openCashflowCatModal(id) {
  if(id){
    const c=state.masters.cashflowCategories.find(x=>x.id===id);
    if(!c)return;
    document.getElementById('modal-cashflow-title').textContent='収支カテゴリの編集';
    setV({'cf-id':id,'cf-type':c.type,'cf-label':c.label,'cf-keywords':c.mfKeywords||'','cf-order':c.order});
  }else{
    document.getElementById('modal-cashflow-title').textContent='収支カテゴリの追加';
    document.getElementById('form-cashflow-cat').reset();
    document.getElementById('cf-id').value='';
    document.getElementById('cf-order').value=99;
  }
  openModal('modal-cashflow-cat');
}
function saveCashflowCat() {
  const id=gv('cf-id'), label=gv('cf-label').trim();
  if(!label){alert('カテゴリ名は必須です');return;}
  const c={id:id||'cf_'+uid(),type:gv('cf-type'),label,mfKeywords:gv('cf-keywords').trim(),
    order:parseInt(gv('cf-order'))||99,isBuiltin:false};
  if(id){
    const idx=state.masters.cashflowCategories.findIndex(x=>x.id===id);
    if(idx>=0){c.isBuiltin=state.masters.cashflowCategories[idx].isBuiltin;state.masters.cashflowCategories[idx]=c;}
  }else state.masters.cashflowCategories.push(c);
  Storage.save(state);closeModal('modal-cashflow-cat');renderCashflowMaster();
}
function deleteCashflowCat(id) {
  if(!confirm('このカテゴリを削除しますか？'))return;
  state.masters.cashflowCategories=state.masters.cashflowCategories.filter(c=>c.id!==id);
  Storage.save(state);renderCashflowMaster();
}

// --- Asset Category Master ---
function renderAssetCatMaster() {
  document.getElementById('tbody-asset-cats').innerHTML=
    M.assetCategories().map(c=>`<tr>
      <td><span class="color-swatch" style="background:${c.color}"></span>${c.label}${c.isBuiltin?'<span class="builtin-badge">組込</span>':''}</td>
      <td style="text-align:center"><input type="color" value="${c.color}" disabled style="width:32px;height:24px;border:1px solid var(--border);border-radius:4px;cursor:default"></td>
      <td style="text-align:center">${c.order}</td>
      <td class="col-actions">
        <button class="btn btn-sm btn-outline" onclick="openAssetCatModal('${c.id}')">編集</button>
        ${!c.isBuiltin?`<button class="btn btn-sm btn-danger" style="margin-left:4px" onclick="deleteAssetCat('${c.id}')">削除</button>`:''}
      </td>
    </tr>`).join('');
}
function openAssetCatModal(id) {
  if(id){
    const c=state.masters.assetCategories.find(x=>x.id===id);
    if(!c)return;
    document.getElementById('modal-asset-cat-title').textContent='資産カテゴリの編集';
    setV({'ac-id':id,'ac-label':c.label,'ac-color':c.color,'ac-order':c.order});
  }else{
    document.getElementById('modal-asset-cat-title').textContent='資産カテゴリの追加';
    document.getElementById('form-asset-cat').reset();
    document.getElementById('ac-id').value='';
    document.getElementById('ac-color').value='#2563eb';
    document.getElementById('ac-order').value=99;
  }
  openModal('modal-asset-cat');
}
function saveAssetCat() {
  const id=gv('ac-id'), label=gv('ac-label').trim();
  if(!label){alert('カテゴリ名は必須です');return;}
  const c={id:id||'ac_'+uid(),label,color:gv('ac-color'),order:parseInt(gv('ac-order'))||99,isBuiltin:false};
  if(id){
    const idx=state.masters.assetCategories.findIndex(x=>x.id===id);
    if(idx>=0){c.isBuiltin=state.masters.assetCategories[idx].isBuiltin;state.masters.assetCategories[idx]=c;}
  }else state.masters.assetCategories.push(c);
  Storage.save(state);closeModal('modal-asset-cat');renderAssetCatMaster();
}
function deleteAssetCat(id) {
  if(!confirm('このカテゴリを削除しますか？'))return;
  state.masters.assetCategories=state.masters.assetCategories.filter(c=>c.id!==id);
  Storage.save(state);renderAssetCatMaster();
}

// --- Account Type Master ---
function renderAccountMaster() {
  document.getElementById('tbody-account-types').innerHTML=
    M.accountTypes().map(a=>`<tr>
      <td>${a.label}${a.isBuiltin?'<span class="builtin-badge">組込</span>':''}</td>
      <td style="text-align:center">${a.order}</td>
      <td class="col-actions">
        <button class="btn btn-sm btn-outline" onclick="openAccountTypeModal('${a.id}')">編集</button>
        ${!a.isBuiltin?`<button class="btn btn-sm btn-danger" style="margin-left:4px" onclick="deleteAccountType('${a.id}')">削除</button>`:''}
      </td>
    </tr>`).join('');
}
function openAccountTypeModal(id) {
  if(id){
    const a=state.masters.accountTypes.find(x=>x.id===id);
    if(!a)return;
    document.getElementById('modal-account-title').textContent='口座種別の編集';
    setV({'at-id':id,'at-label':a.label,'at-order':a.order});
  }else{
    document.getElementById('modal-account-title').textContent='口座種別の追加';
    document.getElementById('form-account-type').reset();
    document.getElementById('at-id').value='';
    document.getElementById('at-order').value=99;
  }
  openModal('modal-account-type');
}
function saveAccountType() {
  const id=gv('at-id'), label=gv('at-label').trim();
  if(!label){alert('口座種別名は必須です');return;}
  const a={id:id||'at_'+uid(),label,order:parseInt(gv('at-order'))||99,isBuiltin:false};
  if(id){
    const idx=state.masters.accountTypes.findIndex(x=>x.id===id);
    if(idx>=0){a.isBuiltin=state.masters.accountTypes[idx].isBuiltin;state.masters.accountTypes[idx]=a;}
  }else state.masters.accountTypes.push(a);
  Storage.save(state);closeModal('modal-account-type');renderAccountMaster();
}
function deleteAccountType(id) {
  if(!confirm('この口座種別を削除しますか？'))return;
  state.masters.accountTypes=state.masters.accountTypes.filter(a=>a.id!==id);
  Storage.save(state);renderAccountMaster();
}

// ============================================================
//  SAMPLE DATA
// ============================================================
function loadSampleData() {
  if(!confirm('サンプルデータを読み込みます。既存のデータは上書きされます。よろしいですか？'))return;
  const today=new Date();
  const ym=(y,m)=>`${y}-${String(m).padStart(2,'0')}`;
  const y=today.getFullYear(), mo=today.getMonth()+1;
  state.holdings=[
    {id:uid(),name:'eMAXIS Slim 全世界株式（ｵｰﾙ・ｶﾝﾄﾘｰ）',ticker:'0131103C',category:'foreign_fund',account:'nisa_tsumitate',currency:'JPY',quantity:500000,acquisitionPrice:1.8,currentPrice:2.3,date:ym(y,mo),memo:''},
    {id:uid(),name:'SBI・V・S&P500インデックス',ticker:'89311199',category:'foreign_fund',account:'nisa',currency:'JPY',quantity:200000,acquisitionPrice:1.5,currentPrice:2.1,date:ym(y,mo),memo:''},
    {id:uid(),name:'トヨタ自動車',ticker:'7203',category:'domestic_stock',account:'taxable',currency:'JPY',quantity:100,acquisitionPrice:2500,currentPrice:3200,date:ym(y,mo),memo:''},
    {id:uid(),name:'Apple Inc.',ticker:'AAPL',category:'foreign_stock',account:'taxable',currency:'USD',quantity:10,acquisitionPrice:150,currentPrice:180,date:ym(y,mo),memo:''},
    {id:uid(),name:'三菱UFJ銀行 普通預金',ticker:'',category:'cash',account:'other_account',currency:'JPY',quantity:1,acquisitionPrice:3000000,currentPrice:3000000,date:ym(y,mo),memo:''},
    {id:uid(),name:'iDeCoインデックス世界株式',ticker:'',category:'foreign_fund',account:'ideco',currency:'JPY',quantity:1,acquisitionPrice:2500000,currentPrice:3100000,date:ym(y,mo),memo:''},
  ];
  state.monthlyData=[];
  let assets=15000000;
  for(let i=12;i>=1;i--){
    let d=new Date(today);d.setMonth(d.getMonth()-i);
    const MY=ym(d.getFullYear(),d.getMonth()+1);
    const income=450000+Math.round((Math.random()-.5)*50000);
    const exp=220000+Math.round((Math.random()-.5)*30000);
    const inv=100000;
    assets+=(income-exp-inv)+Math.round(assets*.004);
    state.monthlyData.push({id:uid(),yearMonth:MY,type:'actual',
      income:{total:income,items:{salary:400000,business:30000,other_income:income-430000}},
      expense:{total:exp,items:{housing:80000,food:50000,utilities:15000,insurance:20000,medical:5000,entertainment:25000,other_expense:exp-195000}},
      investment:{total:inv,items:{inv_stocks:30000,inv_funds:60000,inv_other:10000}},
      totalAssets:assets,memo:''});
  }
  for(let i=0;i<6;i++){
    let d=new Date(today);d.setMonth(d.getMonth()+i+1);
    const MY=ym(d.getFullYear(),d.getMonth()+1);
    state.monthlyData.push({id:uid(),yearMonth:MY,type:'planned',
      income:{total:450000,items:{salary:400000,business:30000,other_income:20000}},
      expense:{total:210000,items:{housing:80000,food:45000,utilities:15000,insurance:20000,medical:5000,entertainment:20000,other_expense:25000}},
      investment:{total:100000,items:{inv_stocks:30000,inv_funds:60000,inv_other:10000}},
      totalAssets:0,memo:'予定'});
  }
  Storage.save(state);renderDashboard();alert('サンプルデータを読み込みました');
}

// ============================================================
//  MODAL / FORM HELPERS
// ============================================================
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function gv(id)         { return document.getElementById(id)?.value ?? ''; }
function setV(map)       { Object.entries(map).forEach(([id,v])=>{ const el=document.getElementById(id); if(el)el.value=v; }); }

// ============================================================
//  INIT
// ============================================================
function init() {
  initTabs();

  // Portfolio
  document.getElementById('btn-add-holding').addEventListener('click',()=>openHoldingModal(null));
  document.getElementById('btn-save-holding').addEventListener('click',saveHolding);

  // Monthly
  document.getElementById('btn-add-monthly').addEventListener('click',()=>openMonthlyModal(null));
  document.getElementById('btn-save-monthly').addEventListener('click',saveMonthly);
  document.getElementById('btn-prev-year').addEventListener('click',()=>{monthlyYear--;renderMonthly();});
  document.getElementById('btn-next-year').addEventListener('click',()=>{monthlyYear++;renderMonthly();});

  // Analysis
  document.getElementById('btn-analysis-prev').addEventListener('click',()=>{analysisYear--;renderAnalysis();});
  document.getElementById('btn-analysis-next').addEventListener('click',()=>{analysisYear++;renderAnalysis();});

  // Simulation
  document.getElementById('btn-run-sim').addEventListener('click',runSimulation);

  // Import
  document.getElementById('btn-import-securities').addEventListener('click',handleSecuritiesImport);
  document.getElementById('btn-import-mf').addEventListener('click',handleMFImport);
  document.getElementById('btn-export-data').addEventListener('click',exportData);
  document.getElementById('btn-import-json').addEventListener('click',()=>document.getElementById('import-json-file').click());
  document.getElementById('import-json-file').addEventListener('change',e=>{if(e.target.files[0])importJSON(e.target.files[0]);});
  document.getElementById('btn-clear-data').addEventListener('click',clearAllData);
  document.getElementById('securities-file').addEventListener('change',e=>{if(e.target.files[0])document.querySelector('#lbl-securities-file span').textContent=e.target.files[0].name;});
  document.getElementById('mf-file').addEventListener('change',e=>{if(e.target.files[0])document.querySelector('#lbl-mf-file span').textContent=e.target.files[0].name;});

  // Master tab inner navigation
  document.getElementById('master-nav').addEventListener('click',e=>{
    const btn=e.target.closest('.master-tab-btn');
    if(btn)switchMasterPanel(btn.dataset.master);
  });

  // Master CRUD buttons
  document.getElementById('btn-add-securities-layout').addEventListener('click',()=>openSecLayoutModal(null));
  document.getElementById('btn-save-sec-layout').addEventListener('click',saveSecLayout);
  document.getElementById('btn-add-cashflow-cat').addEventListener('click',()=>openCashflowCatModal(null));
  document.getElementById('btn-save-cashflow-cat').addEventListener('click',saveCashflowCat);
  document.getElementById('btn-add-asset-cat').addEventListener('click',()=>openAssetCatModal(null));
  document.getElementById('btn-save-asset-cat').addEventListener('click',saveAssetCat);
  document.getElementById('btn-add-account-type').addEventListener('click',()=>openAccountTypeModal(null));
  document.getElementById('btn-save-account-type').addEventListener('click',saveAccountType);

  // Generic close (data-modal attribute)
  document.querySelectorAll('[data-modal]').forEach(btn=>btn.addEventListener('click',()=>closeModal(btn.dataset.modal)));
  document.querySelectorAll('.modal-overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open');}));

  // Sample data
  document.getElementById('btn-load-sample').addEventListener('click',loadSampleData);

  renderDashboard();
}

document.addEventListener('DOMContentLoaded', init);
