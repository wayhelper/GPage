// =================== 全局变量 ===================
let navData = [];

// ================== 加载 JSON 数据 ===============
async function loadNavData() {
    try {
        const res = await fetch('/nav');
        navData = await res.json();
        renderCards(navData);
    } catch (err) {
        console.error('加载导航数据失败', err);
    }
}

// =================== 渲染卡片 ===================
function renderCards(data) {
    const container = document.getElementById('navCards');
    container.innerHTML = '';
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        // 创建卡片名称元素
        const nameElement = document.createElement('div');
        nameElement.className = 'card-name';
        nameElement.textContent = item.name;

        // 创建点击率显示元素
        const clicksElement = document.createElement('div');
        clicksElement.className = 'card-clicks';
        // 假设 item 中有 clicks 属性，如果它不存在或不是数字，则显示 0
        clicksElement.textContent = `${item.clicks || 0}`;

        // 将名称和点击率元素添加到卡片中
        card.appendChild(nameElement);
        card.appendChild(clicksElement);

        // 打开新窗口（安全）并增加点击量
        card.onclick = async () => {
            // 点击量 +1
            item.clicks = (item.clicks || 0) + 1;

            // 实时更新卡片上的点击率显示
            clicksElement.textContent = `${item.clicks}`;

            // 调用保存方法，将 navData 更新到后端
            await updateClickRate(item);

            // 打开链接
            window.open(item.url, '_blank', 'noopener,noreferrer');
        };
        container.appendChild(card);
    });
}
// =================== 更新点击率 ===================
async function updateClickRate(item) {
    // 按点击量排序
    navData = navData.filter(navItem => navItem.name !== item.name);
    navData.push(item);
    navData.sort((a, b) => b.clicks - a.clicks);
    await fetch('/nav', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(navData)
    });
}

// =================== 实时搜索 ===================
function filterCards() {
    const query = document.getElementById('searchBox').value.toLowerCase();
    const filtered = navData.filter(item => item.name.toLowerCase().includes(query));
    renderCards(filtered);
}

// =================== 处理回车搜索 ===================
function handleSearchEnter(event) {
    // 检查是否按下了回车键（Enter KeyCode 13 或 event.key 'Enter'）
    if (event.key === 'Enter' || event.keyCode === 13) {
        // 阻止默认的表单提交行为（虽然这里没有表单，但最好习惯性地加上）
        event.preventDefault();

        const query = document.getElementById('searchBox').value.trim();

        if (query) {
            const searchUrl = getSearchEngineUrl(query);
            window.open(searchUrl, '_blank', 'noopener,noreferrer');

        } else {
            // 如果搜索框为空，可以保持不变或做其他提示
            filterCards(); // 仍然执行原有的过滤操作
        }
    }
}

// =================== 根据当前浏览器返回不同的搜索 URL ===================
function getSearchEngineUrl(query) {
    const userAgent = navigator.userAgent;
    const encodedQuery = encodeURIComponent(query);

    // 优先判断 Edge 浏览器 (标识符通常是 "Edg" 或 "Edg/" 而非 "Edge")
    if (userAgent.includes('Edg')) {
        // Edge 浏览器，返回 Bing 搜索 URL
        return `https://www.bing.com/search?q=${encodedQuery}`;
    }
    // 其次判断 Chrome 浏览器 (User Agent 中通常包含 "Chrome" 但不包含 "Edg")
    else if (userAgent.includes('Chrome')) {
        // Chrome 浏览器，返回 Google 搜索 URL
        return `https://www.google.com/search?q=${encodedQuery}`;
    }
    // 其他浏览器（如 Firefox, Safari 等），默认返回 Google
    else {
        return `https://www.bing.com/search?q=${encodedQuery}`;
    }
}

// =================== 页面加载事件 ===================
window.addEventListener('DOMContentLoaded', () => {
    loadNavData();
    // =================== 初始化弹窗 ===================
    document.getElementById('searchBox').focus();

    // 为搜索框添加键盘事件监听器
    searchBox.addEventListener('keydown', handleSearchEnter);
});

// =================== 工具函数 ===================

function hexStr2ByteArr(hexStr) {
    let bytes = [];
    for (let i = 0; i < hexStr.length; i += 2) {
        bytes.push(parseInt(hexStr.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
}
function getKey(keyStr) {
    let keyBytes = CryptoJS.enc.Utf8.parse(keyStr);
    return CryptoJS.lib.WordArray.create(keyBytes.words.slice(0, 2));
}
function decrypt(encryptedText, key) {
    let encryptedBytes = hexStr2ByteArr(encryptedText);
    let encryptedWordArray = CryptoJS.lib.WordArray.create(encryptedBytes);
    let decrypted = CryptoJS.DES.decrypt({ ciphertext: encryptedWordArray }, getKey(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}
