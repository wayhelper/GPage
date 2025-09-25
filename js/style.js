// =================== 全局变量 ===================
let navData = [];
let clickCount = 0;
let clickTimer;

// =================== 加载 JSON 数据 ===================
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
        card.textContent = item.name;
        // 打开新窗口（安全）并增加点击量
        card.onclick = async () => {
            // 点击量 +1
            item.clicks++;

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
    let foundItem = navData.find(navItem => navItem.name === item.name);
    if (foundItem) {
        foundItem.clicks = item.clicks;
    }
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

// =================== 创建隐藏弹窗（编辑 JSON） ===================
function createHiddenModal() {
    const modal = document.createElement('div');
    modal.id = 'modal';
    Object.assign(modal.style, {
        display: 'none',
        position: 'fixed',
        top: '0', left: '0', right: '0', bottom: '0',
        background: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '9999'
    });

    const modalContent = document.createElement('div');
    Object.assign(modalContent.style, {
        background: 'white',
        padding: '20px',
        width: '80%',
        maxWidth: '600px',
        borderRadius: '10px'
    });

    const title = document.createElement('h3');
    title.textContent = '编辑导航 JSON';
    modalContent.appendChild(title);

    const textarea = document.createElement('textarea');
    textarea.style.width = '100%';
    textarea.style.height = '300px';
    textarea.style.marginBottom = '10px';
    modalContent.appendChild(textarea);

    // 按钮
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '保存';
    Object.assign(saveBtn.style, {
        padding: '10px 15px',
        background: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        marginRight: '10px',
        cursor: 'pointer'
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    Object.assign(closeBtn.style, {
        padding: '10px 15px',
        background: '#ccc',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    });

    modalContent.appendChild(saveBtn);
    modalContent.appendChild(closeBtn);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 保存按钮逻辑
    saveBtn.addEventListener('click', async () => {
        let token = prompt("请输入密钥以保存：");
        if (!token) {
            alert("密钥不能为空！");
            return;
        }
        fetch('pwd.txt')
            .then(response => response.text())
            .then(async text => {
                let pwd = decrypt(text.trim(), token);
                if (pwd !== token) {
                    alert("认证失败！");
                } else {
                    await fetch('/nav', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: textarea.value
                    });
                    alert('已保存');
                    modal.style.display = 'none';
                }
            })
            .catch(() => {
                alert("认证过程出错");
            });
        loadNavData();
    });

    // 关闭按钮逻辑
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    return { modal, textarea };
}

// =================== 初始化弹窗 ===================
const { modal, textarea } = createHiddenModal();

// =================== 标题点击（触发编辑模式） ===================
document.querySelector('h1').addEventListener('click', async () => {
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => clickCount = 0, 800);
    if (clickCount >= 5) {
        clickCount = 0;
        const res = await fetch('/nav');
        const json = await res.text();
        textarea.value = json;
        modal.style.display = 'flex';
    }
});

// =================== 页面加载事件 ===================
window.addEventListener('DOMContentLoaded', () => {
    loadNavData();
    document.getElementById('searchBox').focus();
});

// =================== 工具函数 ===================
/**
 * 将十六进制字符串转换为字节数组
 * @param {string} hexStr
 * @returns {Uint8Array}
 */
function hexStr2ByteArr(hexStr) {
    let bytes = [];
    for (let i = 0; i < hexStr.length; i += 2) {
        bytes.push(parseInt(hexStr.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
}

/**
 * 生成 8 字节 DES 密钥
 * @param {string} keyStr
 * @returns {CryptoJS.lib.WordArray}
 */
function getKey(keyStr) {
    let keyBytes = CryptoJS.enc.Utf8.parse(keyStr);
    return CryptoJS.lib.WordArray.create(keyBytes.words.slice(0, 2)); // 取前 8 字节
}

/**
 * DES 解密
 * @param {string} encryptedText 需要解密的十六进制字符串
 * @param {string} key 解密密钥
 * @returns {string} 解密后的字符串
 */
function decrypt(encryptedText, key) {
    let encryptedBytes = hexStr2ByteArr(encryptedText);
    let encryptedWordArray = CryptoJS.lib.WordArray.create(encryptedBytes);
    let decrypted = CryptoJS.DES.decrypt({ ciphertext: encryptedWordArray }, getKey(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}
