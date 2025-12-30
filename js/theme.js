// 主题代码
export function toggleTheme(isDark) {
    const theme = isDark ? 'dark' : 'light';
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
}
// 应用自定义背景图或彩带效果
export function applyBackground(bgData) {
    if (bgData) {
        removeRibbon();
        Object.assign(document.body.style, {
            backgroundImage: `url('${bgData}')`,
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center'
        });
    } else {
        document.body.style.backgroundImage = '';
        loadRibbon();
    }
}
export function loadRibbon() {
    // 创建配置用的虚拟元素
    if (!document.getElementById('ribbon')) {
        const meta = document.createElement('div');
        meta.id = 'ribbon';
        meta.setAttribute('size', '100');
        meta.setAttribute('alpha', '0.6');
        meta.setAttribute('zIndex', '-1');
        meta.setAttribute('mobile', 'false');
        meta.setAttribute('data-click', 'true');
        document.body.appendChild(meta);
        initRibbon(); // 直接运行代码
    }
}

export function removeRibbon() {
    const canvas = document.getElementById('ribbon-canvas');
    const meta = document.getElementById('ribbon');
    if (canvas) canvas.remove();
    if (meta) meta.remove();
    document.onclick = null; // 清除彩带的点击刷新事件
}

// 背景彩带效果代码
function initRibbon() {
    const e = document.getElementById("ribbon");
    if (!e) return;
    const t = /Android|webOS|iPhone|iPod|iPad|BlackBerry/i.test(navigator.userAgent);
    if ("false" === e.getAttribute("mobile") && t) return;

    const i = (e, t, i) => Number(e.getAttribute(t)) || i;
    const n = {
        zIndex: i(e, "zIndex", -1),
        alpha: i(e, "alpha", .6),
        size: i(e, "size", 90),
        clickToRedraw: "false" !== e.getAttribute("data-click")
    };

    const o = document.createElement("canvas");
    o.id = "ribbon-canvas"; // 添加 ID 方便删除
    const a = o.getContext("2d");
    const { devicePixelRatio: c = 1 } = window;
    const { innerWidth: l, innerHeight: d } = window;
    const r = n.size;

    o.width = l * c;
    o.height = d * c;
    a.scale(c, c);
    a.globalAlpha = n.alpha;
    o.style.cssText = `opacity: ${n.alpha}; position: fixed; top: 0; left: 0; z-index: ${n.zIndex}; width: 100%; height: 100%; pointer-events: none;`;
    document.body.appendChild(o);

    let h = [{ x: 0, y: .7 * d + r }, { x: 0, y: .7 * d - r }], s = 0;
    const x = 2 * Math.PI;

    const y = (e) => {
        const t = e + (2 * Math.random() - 1.1) * r;
        return t > d || t < 0 ? y(e) : t;
    };

    const g = (e, t) => {
        a.beginPath();
        a.moveTo(e.x, e.y);
        a.lineTo(t.x, t.y);
        const i = t.x + (2 * Math.random() - .25) * r, n = y(t.y);
        a.lineTo(i, n);
        a.closePath();
        s -= x / -50;
        a.fillStyle = "#" + (127 * Math.cos(s) + 128 << 16 | 127 * Math.cos(s + x / 3) + 128 << 8 | 127 * Math.cos(s + x / 3 * 2) + 128).toString(16);
        a.fill();
        h[0] = h[1];
        h[1] = { x: i, y: n };
    };

    const u = () => {
        a.clearRect(0, 0, l, d);
        h = [{ x: 0, y: .7 * d + r }, { x: 0, y: .7 * d - r }];
        while (h[1].x < l + r) g(h[0], h[1]);
    };

    if (n.clickToRedraw) {
        document.onclick = u;
        document.ontouchstart = u;
    }
    u();
}
// 季节性特效：春花、夏雨、秋叶、冬雪
export class SeasonEffects {
    constructor(options = {}) {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        // 允许手动传入季节，否则自动获取
        this.season = options.season || this._getSeason();
        this.init();
    }

    _getSeason() {
        const month = new Date().getMonth() + 1;
        if ([3, 4, 5].includes(month)) return 'spring';
        if ([6, 7, 8].includes(month)) return 'summer';
        if ([9, 10, 11].includes(month)) return 'autumn';
        return 'winter';
    }

    _createParticles() {
        // 配置参数
        const density = 30;
        const baseSize = 25;
        const sizeRandom = 15;
        const baseSpeed = 0.3;
        const speedRandom = 0.5;
        const driftIntensity = 0.5;

        const icons = {
            spring: ['🌸', '💮'],
            summer: ['✨', '💧'],
            autumn: ['🍂', '🍁'],
            winter: ['❄️', '❅', '❆']
        }[this.season];

        this.particles = [];
        for (let i = 0; i < density; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vy: (Math.random() * speedRandom + 0.5) * baseSpeed,
                vx: (Math.random() - 0.5) * driftIntensity,
                size: Math.random() * sizeRandom + baseSize,
                opacity: Math.random() * 0.6 + 0.3,
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.05,
                content: icons[Math.floor(Math.random() * icons.length)]
            });
        }
    }

    _drawParticle(p) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.content, 0, 0);
        ctx.restore();
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        Object.assign(this.canvas.style, {
            position: 'fixed', top: '0', left: '0',
            width: '100vw', height: '100vh',
            zIndex: '999999', pointerEvents: 'none'
        });
        document.body.appendChild(this.canvas);

        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        this._createParticles();

        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.particles.forEach(p => {
                p.y += p.vy;
                p.x += p.vx + Math.sin(p.y / 100);
                p.angle += p.spin;

                if (p.y > this.canvas.height + 50) {
                    p.y = -50;
                    p.x = Math.random() * this.canvas.width;
                }
                this._drawParticle(p);
            });
            requestAnimationFrame(animate);
        };
        animate();
    }
}