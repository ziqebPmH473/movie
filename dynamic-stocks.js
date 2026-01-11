// 銘柄データを保存するオブジェクト
let stockData = {};

// 日付関連の処理
function initializeDates() {
    const today = new Date();
    const baseDateInput = document.getElementById('base-date-input');
    baseDateInput.value = today.toISOString().split('T')[0];
    updateDates();
}

function updateDates() {
    const baseDate = new Date(document.getElementById('base-date-input').value);
    const dateArea = document.getElementById('date-area');
    
    const today = new Date(baseDate);
    const lastWeekFriday = new Date(baseDate);
    lastWeekFriday.setDate(baseDate.getDate() - 7);
    const thisWeekFriday = new Date(baseDate);
    
    dateArea.innerHTML = `
        <span>今日: ${formatDate(today)}</span>
        <span>先週金曜: ${formatDate(lastWeekFriday)}</span>
        <span>今週金曜: ${formatDate(thisWeekFriday)}</span>
    `;
}

function formatDate(date) {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

// 銘柄入力フィールドの動的生成
function updateStockInputs() {
    const count = parseInt(document.getElementById('stock-count').value) || 0;
    const container = document.getElementById('dynamic-stocks-container');
    
    // 現在の値を保存
    saveCurrentValues();
    
    // コンテナをクリア
    container.innerHTML = '';
    
    // 新しい入力フィールドを生成
    for (let i = 1; i <= count; i++) {
        const stockDiv = document.createElement('div');
        stockDiv.className = 'card';
        stockDiv.innerHTML = `
            <h4>銘柄${i}</h4>
            <div class="ticker-name-row">
                <div>
                    <label for="stock-name-${i}">銘柄名:</label>
                    <input type="text" id="stock-name-${i}" placeholder="銘柄名">
                </div>
                <div>
                    <label for="stock-code-${i}">証券コード:</label>
                    <input type="text" id="stock-code-${i}" placeholder="証券コード">
                </div>
                <div>
                    <label for="stock-reading-${i}">読みがな:</label>
                    <input type="text" id="stock-reading-${i}" placeholder="読みがな">
                </div>
            </div>
            <div class="ticker-name-row">
                <div>
                    <label for="stock-date-${i}">日付:</label>
                    <input type="text" id="stock-date-${i}" placeholder="例: 12/25">
                </div>
                <div>
                    <label for="stock-period-${i}">期間:</label>
                    <input type="text" id="stock-period-${i}" placeholder="例: 前日比">
                </div>
                <div>
                    <label for="stock-direction-${i}">方向:</label>
                    <select id="stock-direction-${i}">
                        <option value="">選択してください</option>
                        <option value="上昇した">上昇した</option>
                        <option value="下落した">下落した</option>
                        <option value="急騰した">急騰した</option>
                        <option value="急落した">急落した</option>
                    </select>
                </div>
                <div>
                    <label for="stock-afterhours-${i}">決算タイミング:</label>
                    <select id="stock-afterhours-${i}">
                        <option value="">選択してください</option>
                        <option value="引け後に">引け後に</option>
                        <option value="寄り前に">寄り前に</option>
                        <option value="場中に">場中に</option>
                    </select>
                </div>
            </div>
            <div class="search-buttons">
                <button onclick="searchIR('${i}')">IR情報</button>
            </div>
        `;
        container.appendChild(stockDiv);
    }
    
    // 保存した値を復元
    restoreValues(count);
}

function saveCurrentValues() {
    const inputs = document.querySelectorAll('[id^="stock-"]');
    inputs.forEach(input => {
        if (input.value) {
            stockData[input.id] = input.value;
        }
    });
}

function restoreValues(count) {
    for (let i = 1; i <= count; i++) {
        const nameInput = document.getElementById(`stock-name-${i}`);
        const codeInput = document.getElementById(`stock-code-${i}`);
        const readingInput = document.getElementById(`stock-reading-${i}`);
        const dateInput = document.getElementById(`stock-date-${i}`);
        const periodInput = document.getElementById(`stock-period-${i}`);
        const directionInput = document.getElementById(`stock-direction-${i}`);
        const afterhoursInput = document.getElementById(`stock-afterhours-${i}`);
        
        if (stockData[`stock-name-${i}`]) nameInput.value = stockData[`stock-name-${i}`];
        if (stockData[`stock-code-${i}`]) codeInput.value = stockData[`stock-code-${i}`];
        if (stockData[`stock-reading-${i}`]) readingInput.value = stockData[`stock-reading-${i}`];
        if (stockData[`stock-date-${i}`]) dateInput.value = stockData[`stock-date-${i}`];
        if (stockData[`stock-period-${i}`]) periodInput.value = stockData[`stock-period-${i}`];
        if (stockData[`stock-direction-${i}`]) directionInput.value = stockData[`stock-direction-${i}`];
        if (stockData[`stock-afterhours-${i}`]) afterhoursInput.value = stockData[`stock-afterhours-${i}`];
    }
}

// IR情報検索機能
function searchIR(stockIndex) {
    const stockName = document.getElementById(`stock-name-${stockIndex}`).value;
    if (!stockName) {
        alert('銘柄名を入力してください');
        return;
    }
    
    const irUrl = `https://www.google.com/search?q=${encodeURIComponent(stockName + ' IR情報')}`;
    window.open(irUrl, '_blank');
}

// ボタンエリアの生成
function generateButtons() {
    const buttonArea = document.getElementById('button-area');
    
    const buttonData = [
        { 
            category: "【分析】", 
            services: [
                { 
                    service: "chatGPT", 
                    buttons: [
                        { label: "注目銘柄分析", copyId: "analysis" }, 
                        { label: "ループテンプレート", copyId: "loopTemplate" }
                    ] 
                }
            ] 
        },
        { 
            category: "【音声生成前】", 
            services: [
                { 
                    service: "notebookLM", 
                    buttons: [
                        { label: "URLコピー", copyId: "urls" }, 
                        { label: "ランキング生成", copyId: "rank" }, 
                        { label: "音声生成", copyId: "voice" }, 
                        { label: "根拠資料生成", copyId: "reportKk" }
                    ] 
                }
            ] 
        },
        { 
            category: "【プレゼン資料】（スライド：6+銘柄数）", 
            services: [
                { 
                    service: "gamma", 
                    buttons: [
                        { label: "*プレゼン生成", copyId: "presentation" }
                    ] 
                }
            ] 
        },
        { 
            category: "【音声生成後】", 
            services: [
                { 
                    service: "notebookLM", 
                    buttons: [
                        { label: "*概要欄", copyId: "gaiyo" }, 
                        { label: "動画タイトル", copyId: "titleBf" }, 
                        { label: "動画内容", copyId: "videoContent" }, 
                        { label: "X告知", copyId: "xNotify" }, 
                        { label: "note記事", copyId: "noteArticle" }
                    ] 
                }
            ] 
        }
    ];

    buttonArea.innerHTML = '';
    
    buttonData.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'service-group';
        
        const categoryTitle = document.createElement('div');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = category.category;
        categoryDiv.appendChild(categoryTitle);
        
        category.services.forEach(service => {
            const serviceDiv = document.createElement('div');
            serviceDiv.className = 'button-row';
            
            const serviceName = document.createElement('span');
            serviceName.className = 'service-name';
            serviceName.textContent = service.service;
            serviceDiv.appendChild(serviceName);
            
            service.buttons.forEach(button => {
                const btn = document.createElement('button');
                btn.textContent = button.label;
                btn.onclick = () => copyText(button.copyId);
                serviceDiv.appendChild(btn);
            });
            
            categoryDiv.appendChild(serviceDiv);
        });
        
        buttonArea.appendChild(categoryDiv);
    });
}

// ループテンプレート設定
const loopTexts = {
    default: {
        line1: '・決算ハイライト（{{決算タイミング}}）',
        line2: '・{{日付}}の株価が{{期間}}{{方向}}理由',
        line3: '・今後の見通し'
    },
    detailed: {
        line1: '・{{決算タイミング}}発表の決算内容',
        line2: '・株価動向：{{日付}}に{{期間}}{{方向}}',
        line3: '・アナリスト予想と今後の見通し',
        line4: '・投資判断のポイント'
    },
    simple: {
        line1: '・{{決算タイミング}}決算発表',
        line2: '・{{日付}}の株価{{方向}}'
    }
};

// テキストコピー機能
function copyText(copyId) {
    const stockCount = parseInt(document.getElementById('stock-count').value) || 0;
    
    // 銘柄情報を取得
    const stocks = [];
    for (let i = 1; i <= stockCount; i++) {
        const name = document.getElementById(`stock-name-${i}`).value;
        const code = document.getElementById(`stock-code-${i}`).value;
        const reading = document.getElementById(`stock-reading-${i}`).value;
        const date = document.getElementById(`stock-date-${i}`).value;
        const period = document.getElementById(`stock-period-${i}`).value;
        const direction = document.getElementById(`stock-direction-${i}`).value;
        const afterhours = document.getElementById(`stock-afterhours-${i}`).value;
        
        if (name) {
            stocks.push({ name, code, reading, date, period, direction, afterhours });
        }
    }
    
    const copyTexts = {
        analysis: `分析対象銘柄:\n${stocks.map((stock, i) => `${i+1}. ${stock.name}（${stock.reading}）`).join('\n')}`,
        urls: stocks.map(stock => `https://www.google.com/search?q=${encodeURIComponent(stock.name + ' IR情報')}`).join('\n'),
        voice: `以下の銘柄の決算ハイライトを分析してください。\n\n{{loopDefault}}`.replace('{{loopDefault}}', generateLoopContent(stocks, 'default')),
        reportKk: `決算ハイライトレポート\n\n{{loopDetailed}}`.replace('{{loopDetailed}}', generateLoopContent(stocks, 'detailed')),
        presentation: `決算ハイライトプレゼン資料\n\n{{loopSimple}}`.replace('{{loopSimple}}', generateLoopContent(stocks, 'simple')),
        gaiyo: `決算ハイライト概要\n\n{{loopDefault}}`.replace('{{loopDefault}}', generateLoopContent(stocks, 'default')),
        loopTemplate: generateLoopTemplate(stocks)
    };
    
    const text = copyTexts[copyId] || `${copyId}用のテキスト（銘柄数: ${stockCount}）\n銘柄一覧:\n${stocks.map(stock => stock.name).join(', ')}`;
    
    navigator.clipboard.writeText(text).then(() => {
        alert('テキストをコピーしました');
    }).catch(err => {
        console.error('コピーに失敗しました:', err);
    });
}

// ループ内容生成関数
function generateLoopContent(stocks, templateName = 'default') {
    const template = loopTexts[templateName] || loopTexts.default;
    
    return stocks.map(stock => {
        const vars = {
            '{{証券コード}}': stock.code || '{{証券コード}}',
            '{{日付}}': stock.date || '{{日付}}',
            '{{期間}}': stock.period || '{{期間}}',
            '{{方向}}': stock.direction || '{{方向}}',
            '{{決算タイミング}}': stock.afterhours || '{{決算タイミング}}'
        };
        
        const code = stock.code ? `（${stock.code}）` : '（{{証券コード}}）';
        
        let lines = [];
        Object.keys(template).forEach(key => {
            let line = template[key];
            Object.keys(vars).forEach(varKey => {
                line = line.replace(new RegExp(varKey.replace(/[{}]/g, '\\$&'), 'g'), vars[varKey]);
            });
            lines.push(line);
        });
        
        return `---\n${stock.name}${code}\n${lines.join('\n')}\n---`;
    }).join('\n\n');
}

// ループテンプレート生成関数
function generateLoopTemplate(stocks) {
    return `{{前文}}\n\n${generateLoopContent(stocks)}\n\n{{後文}}`;
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeDates();
    updateStockInputs();
    generateButtons();
    
    // イベントリスナーの設定
    document.getElementById('base-date-input').addEventListener('change', updateDates);
    document.getElementById('stock-count').addEventListener('input', updateStockInputs);
});