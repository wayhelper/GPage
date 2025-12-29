// =================== 全局变量 ===================
let navData = [];
let appKey = localStorage.getItem('appKey') || 'admin';
let startTime = new Date("2025-12-29 00:00:00");
let currentLang = localStorage.getItem('lang') || 'zh';
let refresh = false;
let top =localStorage.getItem('top') || 'false';

// ================== 加载 JSON 数据 ===============
async function loadNavData() {
    try {
        const res = await fetch('/nav', {
            method: 'GET',
            headers: {'Content-Type': 'application/json', 'appKey': appKey},
        });
        navData = await res.json();
        if (top === 'false') {
            renderCards(navData);
        } else {
            renderCards(navData.slice(0, 6));
        }
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
            const ok = confirm(i18n[currentLang].confirmDel+`"${item.name}" ?`);
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
    if (top === 'true') {
        query === "/" ? renderCards(navData) : renderCards(filtered.slice(0, 6).length === 0 ? exactSearchByName('AddNav') : filtered.slice(0, 6));
    } else {
        query === "/" ? renderCards(navData) : renderCards(filtered.length === 0 ? exactSearchByName('AddNav') : filtered);
    }
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
        alert(i18n[currentLang].alertComplete);
        closeModal();
        return;
    }
    // 去重逻辑
    const exists = navData.some(item => item.name.toLowerCase() === data.name.toLowerCase());
    if (exists) {
        alert(i18n[currentLang].alertExists);
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
    //=================初始化开关状态====================
    document.getElementById('themeToggle').checked = localStorage.getItem('theme') === 'dark';
    document.getElementById('authToggle').checked = localStorage.getItem('auth') === 'true';
    document.getElementById('languageToggle').checked = (currentLang === 'zh');
}

function closeSettingsModal() {
    document.getElementById("settingsModal").style.display = "none";
    refreshPage();
}

// ============切换主题核心逻辑===================
function toggleTheme(isDark) {
    const theme = isDark ? 'dark' : 'light';
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
}
//===================切换认证函数==================
function toggleAuth(isAuth) {
    localStorage.setItem('auth', isAuth);
    refresh = true;
}
//===================切换语言函数==================
function toggleLanguage(lang) {
    currentLang = lang ? 'zh' : 'en';
    localStorage.setItem('lang', currentLang);
    applyLanguage();
}

//===================切换置顶函数==================
function toggleTop(top) {
    localStorage.setItem('top', top);
    refresh = true;
}

// ==================页面加载事件 ===================
window.addEventListener('DOMContentLoaded', async () => {
    //===============加载语言=======================
    applyLanguage();
    //===============恢复保存的主题==================
    toggleTheme(localStorage.getItem('theme') === 'dark');
    //===============身份验证=======================
    settingAuth();
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
function settingAuth(){
    if (localStorage.getItem('auth') === 'true') {
        let _appKey = (() => {
            const v = localStorage.getItem('appKey');
            return v === null || v === 'null' ? 'admin' : v;
        })();
        if (_appKey==='admin') {
            appKey =prompt('Input auth（appKey）：');
            localStorage.setItem('appKey', appKey);
            refresh = true;
        } else {
            appKey = localStorage.getItem('appKey');
        }
    } else {
        if (localStorage.getItem('appKey') && localStorage.getItem('appKey') !== 'admin') {
            localStorage.setItem('appKey', 'admin');
            appKey = 'admin';
            alert(i18n[currentLang].alertAuth);
            refresh = true;
        }
    }
}
//==================刷新逻辑=======================
function refreshPage(){
    if (refresh) {
        location.reload();
    }
    refresh = false;
}

//====================应用语言到 DOM===============
function applyLanguage() {
    const texts = i18n[currentLang];
    // 1. 更新页面标题和搜索框
    document.title = texts.title;
    const h1 = document.querySelector('h1');
    if (h1) h1.textContent = texts.title;
    const searchBox = document.getElementById('searchBox');
    if (searchBox) searchBox.placeholder = texts.searchPlaceholder;
    // 2. 更新“新增导航”模态框 (myModal)
    const myModal = document.getElementById('myModal');
    if (myModal) {
        myModal.querySelector('h3').textContent = texts.addNav;
        const labels = myModal.querySelectorAll('label');
        if (labels[0]) labels[0].textContent = texts.siteName;
        if (labels[1]) labels[1].textContent = texts.siteUrl;
        document.getElementById('nameInput').placeholder = texts.inputName;
        document.getElementById('submitBtn').textContent = texts.btnOk;
    }
    // 3. 更新“设置”模态框 (settingsModal)
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
        settingsModal.querySelector('h3').textContent = texts.settings;
        let id_theme = document.getElementById('id-theme');
        let id_auth = document.getElementById('id-auth');
        let id_lang = document.getElementById('id-lang');
        let id_top = document.getElementById('id-top');
        id_theme.textContent = texts.darkMode;
        id_auth.textContent = texts.auth;
        id_lang.textContent = texts.langSelect;
        id_top.textContent = texts.top;
        settingsModal.querySelector('.submit-btn').textContent = texts.btnClose;
    }
    // 4. 更新页脚
    const contactLink = document.querySelector('.contact-link');
    if (contactLink) contactLink.textContent = texts.contact;
}

// =================== 语言配置 ===================
const i18n = {
    'zh': {
        title: '路书',
        searchPlaceholder: '搜索... (输入 / 显示所有卡片)',
        addNav: '新增导航',
        siteName: '网站名称',
        siteUrl: '网站链接',
        inputName: '输入网站名称',
        inputUrl: 'https://example.com',
        btnOk: '确定',
        btnUpdate: '更新',
        settings: '设置',
        darkMode: '暗黑模式',
        auth: '身份验证',
        langSelect: '切换语言 (中/英)',
        top: '展示排名',
        btnClose: '关闭',
        contact: '联系我 📫',
        alertComplete: '请完整填写表单',
        alertExists: '该卡片已存在',
        alertAuth: '验证已关闭，使用默认用户: admin',
        promptAuth: '输入认证码 (appKey)：',
        confirmDel: '删除卡片'
    },
    'en': {
        title: 'WaySearch',
        searchPlaceholder: 'Search... (Input / to show all cards)',
        addNav: 'Add Nav',
        siteName: 'Site Name',
        siteUrl: 'URL',
        inputName: 'Input Website Name',
        inputUrl: 'https://example.com',
        btnOk: 'OK',
        btnUpdate: 'Update',
        settings: 'Settings',
        darkMode: 'Dark Mode',
        auth: 'Auth',
        top: 'Top Display',
        btnClose: 'Close',
        contact: 'Contact Me 📫',
        langSelect: 'Language (CN/EN)',
        alertComplete: 'Please complete the form',
        alertExists: 'This card already exists',
        alertAuth: 'Authentication disabled, using default user: admin',
        promptAuth: 'Input auth (appKey):',
        confirmDel: 'Delete card'
    }
};