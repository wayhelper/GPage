// 全局配置文件
export const i18n = {
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
        topList: '展示排名',
        btnClose: '关闭',
        contact: 'Github Code',
        alertComplete: '请完整填写表单',
        alertExists: '该卡片已存在',
        alertAuth: '验证已关闭，使用默认用户: admin',
        promptAuth: '输入认证码 (appKey)：',
        confirmDel: '删除卡片',
        bgSetting: '自定义背景',
        bgMaxSize: '图片过大，保存失败（请尝试 2MB 以内的图片）',
        Dynamic: '动态背景'
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
        topList: 'Top Display',
        btnClose: 'Close',
        contact: 'Github Code',
        langSelect: 'Language (CN/EN)',
        alertComplete: 'Please complete the form',
        alertExists: 'This card already exists',
        alertAuth: 'Authentication disabled, using default user: admin',
        promptAuth: 'Input auth (appKey):',
        confirmDel: 'Delete card',
        bgSetting: 'Background',
        bgMaxSize: 'Image too large, save failed (please try an image within 2MB)',
        Dynamic: 'Dynamic Background'
    }
};

export const state = {
    navData: [],
    appKey: localStorage.getItem('appKey') || 'admin',
    currentLang: localStorage.getItem('lang') || 'zh',
    refresh: false,
    topList: localStorage.getItem('topList') || 'false'
};