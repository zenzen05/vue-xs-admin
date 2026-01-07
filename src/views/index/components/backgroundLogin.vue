<template>
    <div class="tech-login-container">
        <div class="bg-layer">
            <img src="@/assets/image/动图背景.webp" alt="Animated Background" class="bg-image" />
            <!-- <div class="bg-mask"></div> -->
            <div class="scan-line"></div>
        </div>

        <div class="login-box">
            <div class="corner-mark top-left"></div>
            <div class="corner-mark top-right"></div>
            <div class="corner-mark bottom-left"></div>
            <div class="corner-mark bottom-right"></div>

            <div class="header">
                <div class="logo-symbol">
                    <svg viewBox="0 0 100 100">
                        <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" stroke="#00f2ff" fill="none"
                            stroke-width="2">
                            <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50"
                                dur="10s" repeatCount="indefinite" />
                        </polygon>
                        <circle cx="50" cy="50" r="20" fill="#00f2ff">
                            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                        </circle>
                    </svg>
                </div>
                <h2>SYSTEM CONSOLE</h2>
                <p class="sub-text">IDENTIFY YOURSELF</p>
            </div>

            <form @submit.prevent="handleLogin">
                <div class="input-wrapper">
                    <input type="text" v-model="form.username" required placeholder=" " />
                    <label>请输入用户名</label>
                    <div class="input-border"></div>
                </div>

                <div class="input-wrapper">
                    <input type="password" v-model="form.password" required placeholder=" " />
                    <label>请输入密码</label>
                    <div class="input-border"></div>
                </div>

                <button type="submit" class="tech-btn">
                    <span class="btn-text">登录</span>
                    <div class="btn-glitch"></div>
                </button>
            </form>

            <div class="system-status">
                <span>STATUS: <b style="color:#0f0">SECURE</b></span>
                <span>PING: 5ms</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';

const form = reactive({
    username: '',
    password: ''
});

const handleLogin = () => {
    const btn = document.querySelector('.tech-btn');
    btn.classList.add('loading');
    btn.innerHTML = 'AUTHENTICATING...';

    setTimeout(() => {
        alert('认证成功！欢迎回来。');
        btn.classList.remove('loading');
        btn.innerHTML = '<span class="btn-text">INITIATE LOGIN</span><div class="btn-glitch"></div>';
    }, 1800);
};
</script>

<style scoped>
/* 核心配色变量 */
.tech-login-container {
    --primary-color: #00f2ff;
    /* 青色，主要科技色 */
    --secondary-color: #0077ff;
    /* 蓝色，辅助色 */
    --bg-color-dark: #020b16;
    /* 深蓝背景 */
    --glass-panel-bg: rgba(2, 11, 22, 0.7);
    /* 半透明玻璃背景 */

    position: relative;
    width: 100vw;
    height: 100vh;
    background-color: var(--bg-color-dark);
    /* 动图加载前的默认背景色 */
    overflow: hidden;
    font-family: 'Rajdhani', 'Segoe UI', 'Roboto', sans-serif;
    /* 建议引入科技感字体 */
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* --- 背景层，包含动图和遮罩 --- */
.bg-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    /* 最底层 */
}

/* .bg-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
} */
.bg-image {
  width: 100%;
  height: 100%;
  /* object-fit: cover; 
  object-position: center;
  display: block; */
}

.bg-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 5, 15, 0.6);
    /* 深蓝色半透明遮罩，使背景更沉稳 */
    z-index: 1;
    /* 在动图之上，登录框之下 */
}

/* 顶部扫描线装饰 */
.scan-line {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    /* 调整扫描线粗细 */
    background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
    opacity: 0.2;
    /* 调低透明度，不抢背景风头 */
    animation: scan 8s linear infinite;
    /* 调整扫描速度 */
    z-index: 2;
    /* 在遮罩之上 */
}

@keyframes scan {
    0% {
        top: -10%;
    }

    100% {
        top: 110%;
    }
}

/* --- 登录主体框 (UI) --- */
.login-box {
    position: relative;
    width: 420px;
    /* 稍微宽一点 */
    padding: 55px 45px;
    /* 增加内边距 */
    background: var(--glass-panel-bg);
    backdrop-filter: blur(12px);
    /* 提高模糊度，玻璃感更强 */
    border: 1px solid rgba(0, 242, 255, 0.25);
    /* 边框更明显 */
    z-index: 10;
    /* 确保在最上层 */
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.8), inset 0 0 5px rgba(0, 242, 255, 0.1);
    /* 内外阴影 */
    text-align: center;
    border-radius: 6px;
}

/* 边角 HUD 装饰 */
.corner-mark {
    position: absolute;
    width: 25px;
    /* 稍大一点 */
    height: 25px;
    border: 2px solid var(--primary-color);
    transition: 0.3s;
    opacity: 0.6;
}

.top-left {
    top: -1px;
    left: -1px;
    border-right: 0;
    border-bottom: 0;
}

.top-right {
    top: -1px;
    right: -1px;
    border-left: 0;
    border-bottom: 0;
}

.bottom-left {
    bottom: -1px;
    left: -1px;
    border-right: 0;
    border-top: 0;
}

.bottom-right {
    bottom: -1px;
    right: -1px;
    border-left: 0;
    border-top: 0;
}

.login-box:hover .corner-mark {
    width: 35px;
    /* 悬停时放大 */
    height: 35px;
    box-shadow: 0 0 15px var(--primary-color);
    opacity: 1;
}

/* 头部样式 */
.header {
    margin-bottom: 50px;
    /* 增加间距 */
}

.logo-symbol {
    width: 70px;
    /* 放大 Logo */
    height: 70px;
    margin: 0 auto 20px;
    filter: drop-shadow(0 0 8px var(--primary-color));
    /* 给 SVG 加光晕 */
}

.header h2 {
    margin: 0;
    font-size: 28px;
    /* 放大标题 */
    letter-spacing: 5px;
    color: var(--primary-color);
    text-shadow: 0 0 15px rgba(0, 242, 255, 0.7);
    /* 标题更亮 */
}

.sub-text {
    font-size: 11px;
    color: #88a;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-top: 8px;
}

/* 输入框动效 */
.input-wrapper {
    position: relative;
    margin-bottom: 35px;
    /* 增加间距 */
    text-align: left;
}

.input-wrapper input {
    width: 100%;
    padding: 12px 8px;
    /* 增大输入框 */
    background: rgba(0, 0, 0, 0.3);
    border: none;
    border-bottom: 1px solid #334;
    color: #fff;
    font-size: 17px;
    outline: none;
    transition: 0.4s;
}

.input-wrapper label {
    position: absolute;
    left: 8px;
    /* 调整 Label 位置 */
    top: 12px;
    color: #667;
    pointer-events: none;
    transition: 0.4s;
    font-size: 15px;
}

.input-wrapper input:focus~label,
.input-wrapper input:not(:placeholder-shown)~label {
    top: -20px;
    /* 抬更高 */
    left: 0;
    color: var(--primary-color);
    font-size: 13px;
    text-shadow: 0 0 5px var(--primary-color);
}

.input-border {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 3px;
    /* 边框更粗 */
    background: var(--primary-color);
    transition: 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    /* 弹跳效果 */
    box-shadow: 0 0 15px var(--primary-color);
}

.input-wrapper input:focus~.input-border,
.input-wrapper input:not(:placeholder-shown)~.input-border {
    width: 100%;
}

/* 按钮样式 */
.tech-btn {
    position: relative;
    width: 100%;
    padding: 18px;
    /* 增大按钮 */
    background: rgba(0, 242, 255, 0.1);
    border: 1px solid var(--primary-color);
    color: var(--primary-color);
    font-size: 18px;
    letter-spacing: 3px;
    font-weight: bold;
    cursor: pointer;
    overflow: hidden;
    transition: 0.4s ease-in-out;
    text-transform: uppercase;
    border-radius: 4px;
    margin-top: 20px;
}

.tech-btn:hover {
    background: var(--primary-color);
    color: var(--bg-color-dark);
    /* 悬停时文字变暗 */
    box-shadow: 0 0 25px var(--primary-color);
}

/* 按钮加载状态 */
.tech-btn.loading {
    cursor: progress;
    background: linear-gradient(90deg, #00f2ff, #0077ff);
    color: white;
    box-shadow: 0 0 30px #00f2ff;
}

/* 按钮故障风扫光 */
.btn-glitch {
    position: absolute;
    top: 0;
    left: -120%;
    /* 初始位置更靠左 */
    width: 60%;
    /* 扫光更宽 */
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
    transform: skewX(-25deg);
    /* 倾斜更明显 */
    transition: 0.6s;
}

.tech-btn:hover .btn-glitch {
    left: 140%;
    /* 扫过距离更长 */
    transition: 0.6s ease-out;
}

/* 底部状态栏 */
.system-status {
    margin-top: 40px;
    /* 增加间距 */
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #557;
    font-family: 'Courier New', Courier, monospace;
    padding-top: 15px;
    border-top: 1px dashed rgba(0, 242, 255, 0.1);
    /* 虚线分隔 */
}

/* 响应式调整 */
@media (max-width: 600px) {
    .login-box {
        width: 90%;
        padding: 40px 20px;
    }

    .header h2 {
        font-size: 24px;
    }

    .input-wrapper input,
    .tech-btn {
        font-size: 16px;
    }
}
</style>