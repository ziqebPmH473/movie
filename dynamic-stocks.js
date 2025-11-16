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
                    <label for="stock-reading-${i}">読みがな:</label>
                    <input type="text" id="stock-reading-${i}" placeholder="読みがな">
                </div>
                <div class="search-buttons">
                    <button onclick="searchIR('${i}')">IR情報</button>
                </div>
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
        const readingInput = document.getElementById(`stock-reading-${i}`);
        
        if (stockData[`stock-name-${i}`]) {
            nameInput.value = stockData[`stock-name-${i}`];
        }
        if (stockData[`stock-reading-${i}`]) {
            readingInput.value = stockData[`stock-reading-${i}`];
        }
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
                        { label: "銘柄分析(ランクNG)", copyId: "analysisRankNg" }
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

// テキストコピー機能（仮実装）
function copyText(copyId) {
    const stockCount = parseInt(document.getElementById('stock-count').value) || 0;
    let text = '';
    
    // 銘柄情報を取得
    const stocks = [];
    for (let i = 1; i <= stockCount; i++) {
        const name = document.getElementById(`stock-name-${i}`).value;
        const reading = document.getElementById(`stock-reading-${i}`).value;
        if (name) {
            stocks.push({ name, reading });
        }
    }
    
    switch (copyId) {
        case 'analysis':
            text = `分析対象銘柄:\n${stocks.map((stock, i) => `${i+1}. ${stock.name}（${stock.reading}）`).join('\n')}`;
            break;
        case 'urls':
            text = stocks.map(stock => `https://www.google.com/search?q=${encodeURIComponent(stock.name + ' IR情報')}`).join('\n');
            break;
        default:
            text = `${copyId}用のテキスト（銘柄数: ${stockCount}）\n銘柄一覧:\n${stocks.map(stock => stock.name).join(', ')}`;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        alert('テキストをコピーしました');
    }).catch(err => {
        console.error('コピーに失敗しました:', err);
    });
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