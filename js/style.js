// =================== 全局变量 ===================
let navData = [];
let appKey = localStorage.getItem('appKey') || '';
let startTime = new Date("2024-01-01 00:00:00");

// ================== 加载 JSON 数据 ===============
async function loadNavData() {
    try {
        const res = await fetch('/nav', {
            method: 'GET',
            headers: {'Content-Type': 'application/json', 'appKey': appKey},
        });
        navData = await res.json();
        renderCards(navData.slice(0, 6));
    } catch (err) {
        console.error('load db error', err);
    }
}

// ================== 修改 JSON 数据 ===============
async function updateNavData(navData) {
    try {
        const res = await fetch('/nav', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'appKey': appKey},
            body: JSON.stringify(navData)
        });
    } catch (err) {
        console.error('load db error', err);
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
        //左键打开
        card.onclick = async () => {
            if (item.url === 'add') {
                //执行表单提交
                openModal();
                return;
            }
            item.clicks = item.clicks===-1 ? -1 : (item.clicks || 0) + 1;
            clicksElement.textContent = `${item.clicks}`;
            await updateClickRate(item);
            window.open(item.url, '_blank', 'noopener,noreferrer');
        };
        // 右键删除
        card.oncontextmenu = (e) => {
            e.preventDefault();
            const ok = confirm(`删除卡片 "${item.name}" ?`);
            if (!ok) return;
            removeNav(item.name).then(r => filterCards());
        };
        container.appendChild(card);
    });
}

// =================== 更新点击率 ===================
async function updateClickRate(item) {
    navData = navData.filter(navItem => navItem.name !== item.name);
    navData.push(item);
    navData.sort((a, b) => b.clicks - a.clicks);
    await updateNavData(navData);
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

// =================== 打开模态框 ===================
function openModal() {
    document.getElementById("myModal").style.display = "flex";
}

// =================== 关闭模态框 ===================
function closeModal() {
    document.getElementById("myModal").style.display = "none";
}

// =================== 提交新收藏 ===================
function submitNewNav() {
    const data = {
        name: document.getElementById("nameInput").value,
        url: document.getElementById("urlInput").value,
        clicks:0
    };
    if (data.name === '' || data.url === '') {
        alert('please complete the form');
        closeModal();
        return;
    }
    // 去重逻辑
    const exists = navData.some(item => item.name.toLowerCase() === data.name.toLowerCase());
    if (exists) {
        alert('this card already exists');
        closeModal();
        return;
    }
    navData.push(data);
    updateNavData(navData).then(r => closeModal());
    location.reload();
}

// ================= 根据名称删除卡片 =================
async function removeNav(name){
    navData = navData.filter(item => item.name !== name);
    await updateNavData(navData);
}

// =================== 设置模态框逻辑 ===================

function openSettingsModal() {
    document.getElementById("settingsModal").style.display = "flex";

    // 初始化开关状态
    const currentTheme = localStorage.getItem('theme');
    const isAuth = localStorage.getItem('auth')
    const isDark = currentTheme === 'dark';
    document.getElementById('themeToggle').checked = isDark;
    document.getElementById('authToggle').checked = isAuth === 'true';
}

function closeSettingsModal() {
    document.getElementById("settingsModal").style.display = "none";
    location.reload();
}

// 切换主题核心逻辑
function toggleTheme(isDark) {
    const theme = isDark ? 'dark' : 'light';
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
}
function toggleAuth(isAuth) {
    localStorage.setItem('auth', isAuth);
    if (!isAuth) {
        localStorage.setItem('appKey', localStorage.getItem('appKey') || 'admin');
        appKey = localStorage.getItem('appKey');
    }
}

// ==================页面加载事件 ===================
window.addEventListener('DOMContentLoaded', async () => {
    //===============恢复保存的主题==================
    toggleTheme(localStorage.getItem('theme') === 'dark');
    //===============加载认证信息====================
    toggleAuth(localStorage.getItem('auth') === 'true');
    //===============加载导航数据====================
    await loadNavData();
    //===============显示网站运行时间=================
    getWebsiteRunTime();
    //==============初始化搜索=======================
    const searchBox = document.getElementById('searchBox');
    searchBox.focus();
    // ==============为搜索框添加键盘事件监听器=========
    searchBox.addEventListener('keydown', handleSearchEnter);
});

// =================== 工具函数 ===================
function getWebsiteRunTime() {
    const now = new Date();
    const diff = now - startTime;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    console.log(`this website has been run ：${days} day ${hours} hour ${minutes} minute ${seconds} seconds`)
}

// =================== 身份验证 ===================
function auth(auth){
    if (auth) {
        appKey = localStorage.getItem('appKey') || 'admin';
        isAuth = localStorage.getItem('auth') === 'true';
        if (appKey==='admin' && isAuth) {
            appKey =prompt('Input auth（appKey）：');
            localStorage.setItem('appKey', appKey);
        } else {
            appKey = localStorage.getItem('appKey');
        }
    } else {
        localStorage.setItem('appKey', 'admin');
        appKey = 'admin';
        alert('已清除您的身份验证信息！使用默认身份 "admin" 继续访问。');
    }
    location.reload();
}