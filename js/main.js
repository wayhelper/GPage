// ================== 导入模块 ===================
import { state, i18n } from './config.js';
import { loadNavDataApi, updateNavDataApi } from './api.js';
import { SeasonEffects,toggleTheme, applyBackground } from './theme.js';
import { getSearchEngineUrl, settingAuth ,renderCards, applyLanguageUI, filterCards} from './logic.js';

// ================== 初始化 ===================
window.addEventListener('DOMContentLoaded', async () => {
    new SeasonEffects();
    applyLanguageUI();
    applyBackground(localStorage.getItem('customBg'));
    toggleTheme(localStorage.getItem('theme') === 'dark');
    settingAuth();

    state.navData = await loadNavDataApi();
    renderCards(state.navData);

    const searchBox = document.getElementById('searchBox');
    searchBox.focus();

    // 搜索逻辑
    searchBox.addEventListener('input', () => {
        const query = searchBox.value.toLowerCase();
        const filtered = state.navData.filter(item => item.name.toLowerCase().includes(query));
        // 若无结果则查找 AddNav (精确匹配逻辑)
        if (filtered.length === 0 && query !== '') {
            const addNode = state.navData.filter(item => item.name.toLowerCase() === 'addnav');
            renderCards(addNode);
        } else {
            renderCards(filtered);
        }
    });

    searchBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = searchBox.value.trim();
            if (query) window.open(getSearchEngineUrl(query), '_blank');
        }
    });
});

// ================== 全局挂载 (供 HTML 调用) ===================
window.openModal = () => document.getElementById("myModal").style.display = "flex";
window.closeModal = () => document.getElementById("myModal").style.display = "none";

window.openSettingsModal = () => {
    document.getElementById("settingsModal").style.display = "flex";
    document.getElementById('themeToggle').checked = localStorage.getItem('theme') === 'dark';
    document.getElementById('authToggle').checked = localStorage.getItem('auth') === 'true';
    document.getElementById('languageToggle').checked = (state.currentLang === 'zh');
    document.getElementById('topToggle').checked = localStorage.getItem('topList') === 'true';
    document.getElementById('bgToggle').checked = Boolean(localStorage.getItem('customBg'));
};

window.closeSettingsModal = () => {
    document.getElementById("settingsModal").style.display = "none";
    if (state.refresh) location.reload();
};

window.submitNewNav = async () => {
    const name = document.getElementById("nameInput").value;
    const url = document.getElementById("urlInput").value;
    const texts = i18n[state.currentLang];

    if (!name || !url) return alert(texts.alertComplete);
    if (state.navData.some(item => item.name.toLowerCase() === name.toLowerCase())) return alert(texts.alertExists);

    state.navData.push({ name, url, clicks: 0 });
    await updateNavDataApi(state.navData);
    location.reload();
};

window.toggleTheme = (isDark) => toggleTheme(isDark);
window.toggleAuth = (isAuth) => { localStorage.setItem('auth', isAuth); state.refresh = true; };
window.toggleLanguage = (isZh) => {
    state.currentLang = isZh ? 'zh' : 'en';
    localStorage.setItem('lang', state.currentLang);
    applyLanguageUI();
};
window.toggleTop = (isTop) => { localStorage.setItem('topList', isTop); state.refresh = true; };

window.toggleBackground = (isOn) => {
    if (isOn) document.getElementById('bgFileInput').click();
    else { localStorage.removeItem('customBg'); applyBackground(null); }
};

window.handleBgUpload = (input) => {
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
};
window.filterCards =()=>filterCards();