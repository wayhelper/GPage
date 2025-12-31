// ================== 导入模块 ===================
import { state } from './config.js';
import { loadNavDataApi } from './api.js';
import { applyDynamic,toggleTheme, applyBackground } from './theme.js';
import { getSearchEngineUrl, settingAuth ,renderCards, applyLanguageUI, submitNewNav, handleBgUpload } from './logic.js';

// ================== 初始化 ===================
window.addEventListener('DOMContentLoaded', async () => {
    // 读取动态背景设置
    applyDynamic();
    // 读取语言设置
    applyLanguageUI();
    // 读取主题设置
    applyBackground(localStorage.getItem('customBg'));
    // 读取认证信息
    settingAuth();
    // 加载导航数据
    state.navData = await loadNavDataApi();
    // 渲染导航卡片
    renderCards(state.navData);
    // 聚焦搜索框
    const searchBox = document.getElementById('searchBox');
    searchBox.focus();
    // 索引逻辑
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
    // 回车搜索
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
// ================== 打开设置 =================================
window.openSettingsModal = () => {
    document.getElementById("settingsModal").style.display = "flex";
    document.getElementById('themeToggle').checked = localStorage.getItem('theme') === 'dark';
    document.getElementById('authToggle').checked = localStorage.getItem('auth') === 'true';
    document.getElementById('languageToggle').checked = (state.currentLang === 'zh');
    document.getElementById('topToggle').checked = localStorage.getItem('topList') === 'true';
    document.getElementById('bgToggle').checked = Boolean(localStorage.getItem('customBg'));
    document.getElementById('dynamicToggle').checked = localStorage.getItem('dynamicBg') === 'true';
};
// ================== 关闭设置 ===================================
window.closeSettingsModal = () => {document.getElementById("settingsModal").style.display = "none";if (state.refresh) location.reload();};
// ================== 切换主题 ===================================
window.toggleTheme = (isOn) => toggleTheme(isOn);
// ================== 切换身份验证 ================================
window.toggleAuth = (isOn) => { localStorage.setItem('auth', isOn); state.refresh = true; };
// ================== 切换语言 =================================
window.toggleLanguage = (isOn) => { localStorage.setItem('lang', isOn ? 'zh' : 'en');applyLanguageUI(); state.refresh=true; };
// ================== 切换置顶显示 =================================
window.toggleTop = (isOn) => { localStorage.setItem('topList', isOn); state.refresh = true; };
// ================== 切换自定义背景 ===============================
window.toggleBackground = (isOn) => { if (isOn) document.getElementById('bgFileInput').click(); else { localStorage.removeItem('customBg'); applyBackground(null); } };
// ================== 切换动态背景 =================================
window.toggleDynamic= (isOn)=>{ localStorage.setItem('dynamicBg', isOn); state.refresh=true;};
// ================== 提交新增导航 =================================
window.submitNewNav = async () => submitNewNav();
// ================== 处理背景图上传 ================================
window.handleBgUpload = (input) => handleBgUpload(input);