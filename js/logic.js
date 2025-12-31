// 业务逻辑处理
import { state, i18n } from './config.js';
import { updateNavDataApi } from './api.js';
import { applyBackground } from './theme.js';

export function getSearchEngineUrl(query) {
    const userAgent = navigator.userAgent;
    const encodedQuery = encodeURIComponent(navigator.userAgent);
    return userAgent.includes('Chrome') ? `https://www.google.com/search?q=${encodedQuery}` : `https://www.bing.com/search?q=${encodedQuery}`;
}
// 更新点击率并重新排序导航数据
export async function updateClickRate(item) {
    state.navData = state.navData.filter(navItem => navItem.name !== item.name);
    state.navData.push(item);
    state.navData.sort((a, b) => b.clicks - a.clicks);
    await updateNavDataApi(state.navData);
}
// 删除导航项
export async function removeNav(name) {
    state.navData = state.navData.filter(item => item.name !== name);
    await updateNavDataApi(state.navData);
}
// 处理身份验证设置
export function settingAuth() {
    const texts = i18n[state.currentLang];
    if (localStorage.getItem('auth') === 'true') {
        let _appKey = localStorage.getItem('appKey');
        if (!_appKey || _appKey === 'null' || _appKey === 'admin') {
            state.appKey = prompt(texts.promptAuth) || 'admin';
            localStorage.setItem('appKey', state.appKey);
            state.refresh = true;
        }
    } else {
        if (localStorage.getItem('appKey') && localStorage.getItem('appKey') !== 'admin') {
            localStorage.setItem('appKey', 'admin');
            state.appKey = 'admin';
            alert(texts.alertAuth);
            state.refresh = true;
        }
    }
}
// 渲染导航卡片
export function renderCards(data) {
    const container = document.getElementById('navCards');
    if (!container) return;
    container.innerHTML = '';

    // 处理置顶逻辑
    const query = document.getElementById('searchBox').value.trim();
    let displayData = data;
    if (state.topList === 'true' && query === '') {
        displayData = data.slice(0, 6);
    }

    displayData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<div class="card-name">${item.name}</div><div class="card-clicks">${item.clicks || 0}</div>`;

        card.onclick = async () => {
            if (item.url === 'add') {
                window.openModal();
                return;
            }
            item.clicks = item.clicks === -1 ? -1 : (item.clicks || 0) + 1;
            await updateClickRate(item);
            window.open(item.url, '_blank', 'noopener,noreferrer');
        };

        card.oncontextmenu = (e) => {
            e.preventDefault();
            if (confirm(`${i18n[state.currentLang].confirmDel} "${item.name}"?`)) {
                removeNav(item.name).then(() => {
                    const newQuery = document.getElementById('searchBox').value.toLowerCase();
                    const filtered = state.navData.filter(n => n.name.toLowerCase().includes(newQuery));
                    renderCards(filtered);
                });
            }
        };
        container.appendChild(card);
    });
}
// 应用语言设置到 UI 元素
export function applyLanguageUI() {
    const texts = i18n[state.currentLang];
    document.title = texts.title;
    const h1 = document.querySelector('h1');
    if (h1) h1.textContent = texts.title;

    const searchBox = document.getElementById('searchBox');
    if (searchBox) searchBox.placeholder = texts.searchPlaceholder;

    const settingsH3 = document.querySelector('#settingsModal h3');
    if (settingsH3) settingsH3.textContent = texts.settings;

    // 更新各 Label (根据 ID 匹配)
    const labelMap = { 'id-theme': 'darkMode', 'id-auth': 'auth', 'id-lang': 'langSelect', 'id-top': 'topList', 'id-bg': 'bgSetting', 'id-dynamic': 'Dynamic','inputName':'inputName','inputUrl':'inputUrl','h3-add':'addNav','label-site':'siteName','label-url':'siteUrl'};
    for (let id in labelMap) {
        const el = document.getElementById(id);
        if (el) el.textContent = texts[labelMap[id]];
    }
}

export async function submitNewNav() {
    const name = document.getElementById("inputName").value;
    const url = document.getElementById("inputUrl").value;
    const texts = i18n[state.currentLang];
    if (!name || !url) {
        return alert(texts.alertComplete);
    }
    if (state.navData.some(item => item.name.toLowerCase() === name.toLowerCase())) return alert(texts.alertExists);
    state.navData.push({name, url, clicks: 0});
    await updateNavDataApi(state.navData);
    location.reload();
}

export function handleBgUpload(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            localStorage.setItem('customBg', e.target.result);
            applyBackground(e.target.result);
            state.refresh = true;
        } catch (err) {
            alert(i18n[state.currentLang].bgMaxSize);
            document.getElementById('bgToggle').checked = false;
        }
    };
    reader.readAsDataURL(file);
}