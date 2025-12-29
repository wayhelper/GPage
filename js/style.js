// =================== 全局变量 ===================
let navData=[],appKey=localStorage.getItem('appKey')||'admin',currentLang=localStorage.getItem('lang')||'zh',refresh=false,topList=localStorage.getItem('topList')||'false';

// ================== 加载 JSON 数据 ===============
async function loadNavData(){try{const r=await fetch('/nav',{method:'GET',headers:{'Content-Type':'application/json',appKey}});navData=await r.json(),topList==='false'?renderCards(navData):renderCards(navData.slice(0,6))}catch(e){console.error('load db error',e)}}

// ================== 修改 JSON 数据 ===============
async function updateNavData(d){try{await fetch('/nav',{method:'POST',headers:{'Content-Type':'application/json',appKey},body:JSON.stringify(d)})}catch(e){console.error('load db error',e)}}

// =================== 渲染卡片 =====================
function renderCards(d){const c=document.getElementById('navCards');c.innerHTML='',d.forEach(i=>{const n=document.createElement('div');n.className='card';const t=document.createElement('div');t.className='card-name',t.textContent=i.name;const r=document.createElement('div');r.className='card-clicks',r.textContent=i.clicks||0,n.appendChild(t),n.appendChild(r),n.onclick=async()=>{if(i.url==='add')return openModal();i.clicks=i.clicks===-1?-1:(i.clicks||0)+1,r.textContent=i.clicks,await updateClickRate(i),window.open(i.url,'_blank','noopener,noreferrer')},n.oncontextmenu=e=>{e.preventDefault();const t=confirm(i18n[currentLang].confirmDel+'"'+i.name+'" ?');t&&removeNav(i.name).then(r=>filterCards())},c.appendChild(n)})}

// =================== 更新点击率 ===================
async function updateClickRate(i){navData=navData.filter(n=>n.name!==i.name),navData.push(i),navData.sort((a,b)=>b.clicks-a.clicks),await updateNavData(navData)}

// =================== 实时搜索 =====================
function filterCards(){const q=document.getElementById('searchBox').value.toLowerCase(),f=navData.filter(i=>i.name.toLowerCase().includes(q));topList==='true'?q==='/'?renderCards(navData):renderCards(f.slice(0,6).length===0?exactSearchByName('AddNav'):f.slice(0,6)):q==='/'?renderCards(navData):renderCards(f.length===0?exactSearchByName('AddNav'):f)}

// =================== 精确查找根据Name ===================
function exactSearchByName(n){const f=navData.filter(i=>i.name.toLowerCase()===n.toLowerCase());return f.length>0?f:void 0}

// =================== 处理回车搜索 ===================
function handleSearchEnter(e){(e.key==='Enter'||e.keyCode===13)&&(e.preventDefault(),(q=document.getElementById('searchBox').value.trim())?window.open(getSearchEngineUrl(q),'_blank','noopener,noreferrer'):filterCards())}

// =========== 根据当前浏览器返回不同的搜索 URL =============
function getSearchEngineUrl(q){const u=navigator.userAgent,e=encodeURIComponent(q);return u.includes('Edg')||!u.includes('Chrome')?`https://www.bing.com/search?q=${e}`:`https://www.google.com/search?q=${e}`}

// =================== 打开模态框 ===================
function openModal(){document.getElementById('myModal').style.display='flex'}

// =================== 关闭模态框 ===================
function closeModal(){document.getElementById('myModal').style.display='none'}

// =================== 提交新收藏 ===================
function submitNewNav(){const d={name:document.getElementById('nameInput').value,url:document.getElementById('urlInput').value,clicks:0};if(d.name===''||d.url===''){alert(i18n[currentLang].alertComplete),closeModal();return}if(navData.some(i=>i.name.toLowerCase()===d.name.toLowerCase())){alert(i18n[currentLang].alertExists),closeModal();return}navData.push(d),updateNavData(navData).then(r=>closeModal()),location.reload()}

// ================= 根据名称删除卡片 =================
async function removeNav(n){navData=navData.filter(i=>i.name!==n),await updateNavData(navData)}

// =================== 设置模态框逻辑 ===================
function openSettingsModal(){document.getElementById('settingsModal').style.display='flex',document.getElementById('themeToggle').checked=localStorage.getItem('theme')==='dark',document.getElementById('authToggle').checked=localStorage.getItem('auth')==='true',document.getElementById('languageToggle').checked=currentLang==='zh',document.getElementById('topToggle').checked=localStorage.getItem('topList')==='true',document.getElementById('bgToggle').checked=Boolean(localStorage.getItem('customBg'))}
function closeSettingsModal(){document.getElementById('settingsModal').style.display='none',refreshPage()}

// ============切换主题核心逻辑===================
function toggleTheme(d){const t=d?'dark':'light';d?document.documentElement.setAttribute('data-theme','dark'):document.documentElement.removeAttribute('data-theme'),localStorage.setItem('theme',t)}

//===================切换认证函数==================
function toggleAuth(a){localStorage.setItem('auth',a),refresh=true}

//===================切换语言函数==================
function toggleLanguage(l){currentLang=l?'zh':'en',localStorage.setItem('lang',currentLang),applyLanguage()}

//===================切换置顶函数==================
function toggleTop(t){localStorage.setItem('topList',t),refresh=true}

// =================== 背景图片逻辑 ===================

// 切换背景开关
function toggleBackground(o){const f=document.getElementById('bgFileInput');if(o){f.click(),window.addEventListener('focus',function n(){setTimeout(()=>{(!f.value&&!localStorage.getItem('customBg'))&&(document.getElementById('bgToggle').checked=false),window.removeEventListener('focus',n)},300)})}else clearBackground()}

// 处理文件上传
function handleBgUpload(i){const f=i.files[0];if(!f)return void(document.getElementById('bgToggle').checked=false);const r=new FileReader;r.onload=function(e){const t=e.target.result;try{localStorage.setItem('customBg',t.trim()),applyBackground(t)}catch(e){alert(i18n[currentLang].bgMaxSize),document.getElementById('bgToggle').checked=false,clearBackground()}};r.readAsDataURL(f)}

// 应用背景样式
function applyBackground(b){b?(removeRibbon(),document.body.style.backgroundImage=`url('${b}')`,document.body.style.backgroundSize='cover',document.body.style.backgroundAttachment='fixed',document.body.style.backgroundPosition='center',refresh=true):(document.body.style.backgroundImage='',loadRibbon())}

// 清除背景数据
function clearBackground(){localStorage.removeItem('customBg'),applyBackground(null),document.getElementById('bgFileInput').value=''}

// ==================页面加载事件 ===================
window.addEventListener('DOMContentLoaded',async()=>{applyLanguage(),applyBackground(localStorage.getItem('customBg')),toggleTheme(localStorage.getItem('theme')==='dark'),settingAuth(),await loadNavData();const e=document.getElementById('searchBox');e.focus(),e.addEventListener('keydown',handleSearchEnter)})

// =================== 身份验证 ===================
function settingAuth(){if(localStorage.getItem('auth')==='true'){let k=(()=>{const v=localStorage.getItem('appKey');return v===null||v==='null'?'admin':v})();k==='admin'?(appKey=prompt(i18n[currentLang].promptAuth),localStorage.setItem('appKey',appKey),refresh=true):appKey=localStorage.getItem('appKey')}else localStorage.getItem('appKey')&&localStorage.getItem('appKey')!=='admin'&&(localStorage.setItem('appKey','admin'),appKey='admin',alert(i18n[currentLang].alertAuth),refresh=true)}

//==================刷新逻辑=======================
function refreshPage(){refresh&&(location.reload(),refresh=false)}

//==================默认背景加载=======================
function loadRibbon(){if(!document.getElementById('ribbon')){const s=document.createElement('script');s.id='ribbon',s.src='./js/canvas-ribbon.min.js',s.defer=true,s.setAttribute('size','100'),s.setAttribute('alpha','0.6'),s.setAttribute('zIndex','-1'),s.setAttribute('mobile','false'),s.setAttribute('data-click','true'),document.body.appendChild(s)}}
function removeRibbon(){const r=document.getElementById('ribbon');r&&r.remove()}

//====================应用语言到 DOM===============
function applyLanguage(){const t=i18n[currentLang];document.title=t.title;const h=document.querySelector('h1');h&&(h.textContent=t.title);const s=document.getElementById('searchBox');s&&(s.placeholder=t.searchPlaceholder);const m=document.getElementById('myModal');if(m){m.querySelector('h3').textContent=t.addNav;const l=m.querySelectorAll('label');l[0]&&(l[0].textContent=t.siteName),l[1]&&(l[1].textContent=t.siteUrl),document.getElementById('nameInput').placeholder=t.inputName,document.getElementById('submitBtn').textContent=t.btnOk}const sm=document.getElementById('settingsModal');if(sm){sm.querySelector('h3').textContent=t.settings;let th=document.getElementById('id-theme'),au=document.getElementById('id-auth'),lg=document.getElementById('id-lang'),tp=document.getElementById('id-top'),bg=document.getElementById('id-bg');th.textContent=t.darkMode,au.textContent=t.auth,lg.textContent=t.langSelect,tp.textContent=t.topList,bg&&(bg.textContent=t.bgSetting),sm.querySelector('.submit-btn').textContent=t.btnClose}const c=document.querySelector('.contact-link');c&&(c.textContent=t.contact)}

// =================== 语言配置 ===================
const i18n={'zh':{title:'路书',searchPlaceholder:'搜索... (输入 / 显示所有卡片)',addNav:'新增导航',siteName:'网站名称',siteUrl:'网站链接',inputName:'输入网站名称',inputUrl:'https://example.com',btnOk:'确定',btnUpdate:'更新',settings:'设置',darkMode:'暗黑模式',auth:'身份验证',langSelect:'切换语言 (中/英)',topList:'展示排名',btnClose:'关闭',contact:'Github Code',alertComplete:'请完整填写表单',alertExists:'该卡片已存在',alertAuth:'验证已关闭，使用默认用户: admin',promptAuth:'输入认证码 (appKey)：',confirmDel:'删除卡片',bgSetting:'自定义背景',bgMaxSize:'图片过大，保存失败（请尝试 2MB 以内的图片）'},'en':{title:'WaySearch',searchPlaceholder:'Search... (Input / to show all cards)',addNav:'Add Nav',siteName:'Site Name',siteUrl:'URL',inputName:'Input Website Name',inputUrl:'https://example.com',btnOk:'OK',btnUpdate:'Update',settings:'Settings',darkMode:'Dark Mode',auth:'Auth',topList:'Top Display',btnClose:'Close',contact:'Github Code',langSelect:'Language (CN/EN)',alertComplete:'Please complete the form',alertExists:'This card already exists',alertAuth:'Authentication disabled, using default user: admin',promptAuth:'Input auth (appKey):',confirmDel:'Delete card',bgSetting:'Background',bgMaxSize:'Image too large, save failed (please try an image within 2MB)'}};
