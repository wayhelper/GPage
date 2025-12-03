// =================== 全局变量 ===================
let navData = [];
let token = localStorage.getItem('token') || '';
let startTime = new Date("2024-01-01 00:00:00");

// ================== 加载 JSON 数据 ===============
async function loadNavData() {
    try {
        const res = await fetch('/nav');
        navData = await res.json();
        renderCards(navData.slice(0, 6));
    } catch (err) {
        console.error('加载导航数据失败', err);
    }
}

// =================== 渲染卡片 =====================
function renderCards(data) {
    const container = document.getElementById('navCards');
    container.innerHTML = '';
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        const nameElement = document.createElement('div');
        nameElement.className = 'card-name';
        nameElement.textContent = item.name;
        const clicksElement = document.createElement('div');
        clicksElement.className = 'card-clicks';
        clicksElement.textContent = `${item.clicks || 0}`;
        card.appendChild(nameElement);
        card.appendChild(clicksElement);
        card.onclick = async () => {
            item.clicks = (item.clicks || 0) + 1;
            clicksElement.textContent = `${item.clicks}`;
            if (item.url === 'add') {
                //执行表单提交
                openModal();
                return;
            }
            await updateClickRate(item);
            window.open(item.url, '_blank', 'noopener,noreferrer');
        };
        container.appendChild(card);
    });
}
// =================== 更新点击率 ===================
async function updateClickRate(item) {
    navData = navData.filter(navItem => navItem.name !== item.name);
    navData.push(item);
    navData.sort((a, b) => b.clicks - a.clicks);
    await fetch('/nav', {
        method: 'POST',
        headers: {'Content-Type': 'application/json','token': token},
        body: JSON.stringify(navData)
    });
}

// =================== 实时搜索 =====================
function filterCards() {
    const query = document.getElementById('searchBox').value.toLowerCase();
    const filtered = navData.filter(item => item.name.toLowerCase().includes(query));
    query === "/" ? renderCards(navData) : renderCards(filtered.slice(0, 6).length === 0 ? exactSearchByName('AddNav') : filtered.slice(0, 6));
}

// =================== 精确查找根据Name ===================
function exactSearchByName(name) {
    const filtered = navData.filter(item => item.name.toLowerCase() === name.toLowerCase());
    if (filtered.length > 0) {
        return filtered;
    }
}

// =================== 处理回车搜索 ===================
function handleSearchEnter(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
        event.preventDefault();
        const query = document.getElementById('searchBox').value.trim();
        if (query) {
            const searchUrl = getSearchEngineUrl(query);
            window.open(searchUrl, '_blank', 'noopener,noreferrer');
        } else {
            filterCards();
        }
    }
}

// =========== 根据当前浏览器返回不同的搜索 URL =============
function getSearchEngineUrl(query) {
    const userAgent = navigator.userAgent;
    const encodedQuery = encodeURIComponent(query);
    if (userAgent.includes('Edg')) {
        return `https://www.bing.com/search?q=${encodedQuery}`;
    } else if (userAgent.includes('Chrome')) {
        return `https://www.google.com/search?q=${encodedQuery}`;
    } else {
        return `https://www.bing.com/search?q=${encodedQuery}`;
    }
}
// =================== 提交新收藏 ===================
// 打开
function openModal() {
    document.getElementById("myModal").style.display = "flex";
}

// 关闭
function closeModal() {
    document.getElementById("myModal").style.display = "none";
}
function submitNewNav() {
    const data = {
        name: document.getElementById("nameInput").value,
        url: document.getElementById("urlInput").value,
        clicks:0
    };
    navData.push(data);
    fetch('/nav', {
        method: 'POST',
        headers: {'Content-Type': 'application/json','token': token},
        body: JSON.stringify(navData)
    });
    closeModal();
}

// =================== 页面加载事件 ===================
window.addEventListener('DOMContentLoaded', () => {
    loadNavData();
    //================显示网站运行时间====================
    getWebsiteRunTime();
    // =================== 初始化搜索 ===================
    document.getElementById('searchBox').focus();
    // =========== 为搜索框添加键盘事件监听器 ==============
    searchBox.addEventListener('keydown', handleSearchEnter);
});

// =================== 工具函数 ===================

function getWebsiteRunTime() {
    const now = new Date();
    const diff = now - startTime; // 毫秒差

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    console.log(`this website has been run ：${days} day ${hours} hour ${minutes} minute ${seconds} seconds`)
}
// =================== 身份验证 ===================
function auth(auth){
    if (auth) {
        token = localStorage.getItem('token') || '';
        if (token==='') {
            token =prompt('Input auth（token）：');
            localStorage.setItem('token', token);
        } else {
            token = localStorage.getItem('token');
        }
    } else {
        localStorage.setItem('token', '');
        token = '';
        alert('已清除身份验证信息');
    }
}