<template>
  <div class="tech-login-container">
    <div class="bg-layer">
      <div class="grid-floor"></div>
      <div class="horizon-glow"></div>
      <div class="decor-circle circle-1"></div>
      <div class="decor-circle circle-2"></div>
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
            <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" stroke="#00f2ff" fill="none" stroke-width="2">
              <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="10s" repeatCount="indefinite"/>
            </polygon>
            <circle cx="50" cy="50" r="20" fill="#00f2ff">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
        <h2>领航平台</h2>
        <p class="sub-text">SHANG BEN DASHUJU</p>
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
        <span>STATUS: <b style="color:#0f0">NORMAL</b></span>
        <span>LATENCY: 12ms</span>
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
  // 模拟登录加载效果
  const btn = document.querySelector('.tech-btn');
  btn.classList.add('loading');
  btn.innerHTML = 'VERIFYING...';
  
  setTimeout(() => {
    alert('权限验证通过 | Access Granted');
    btn.classList.remove('loading');
    btn.innerHTML = '<span class="btn-text">INITIALIZE LINK</span><div class="btn-glitch"></div>';
  }, 1500);
};
</script>

<style scoped>
/* 核心配色变量 
  Cyan (青色) 是科技感的主色调
*/
.tech-login-container {
  --primary-color: #00f2ff;
  --secondary-color: #0077ff;
  --bg-color: #020b16;
  --glass-bg: rgba(2, 11, 22, 0.7);
  
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: var(--bg-color);
  overflow: hidden;
  font-family: 'Segoe UI', 'Roboto', sans-serif;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* --- 背景动画层 (最关键的科技感来源) --- */
.bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  perspective: 1000px; /* 开启3D透视 */
  z-index: 0;
}

/* 移动网格地板 */
.grid-floor {
  position: absolute;
  bottom: -50%;
  left: -50%;
  width: 200%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 242, 255, 0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 242, 255, 0.3) 1px, transparent 1px);
  background-size: 50px 50px;
  transform: rotateX(60deg); /* 压扁形成3D地板感 */
  animation: gridMove 5s linear infinite;
  mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 60%); /* 远处淡出 */
}

@keyframes gridMove {
  0% { transform: rotateX(60deg) translateY(0); }
  100% { transform: rotateX(60deg) translateY(50px); }
}

/* 地平线光晕 */
.horizon-glow {
  position: absolute;
  top: 40%;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--primary-color);
  box-shadow: 0 0 40px 10px var(--primary-color);
  opacity: 0.5;
  z-index: 1;
}

/* 旋转装饰圈 */
.decor-circle {
  position: absolute;
  border: 1px dashed var(--primary-color);
  border-radius: 50%;
  opacity: 0.2;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.circle-1 {
  width: 600px;
  height: 600px;
  animation: spin 20s linear infinite;
}

.circle-2 {
  width: 800px;
  height: 800px;
  border: 1px solid var(--secondary-color);
  border-left-color: transparent;
  border-right-color: transparent;
  animation: spin 30s linear infinite reverse;
}

@keyframes spin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* 全屏扫描线 */
.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
  opacity: 0.3;
  animation: scan 6s linear infinite;
  z-index: 2;
}

@keyframes scan {
  0% { top: -10%; }
  100% { top: 110%; }
}

/* --- 登录主体框 --- */
.login-box {
  position: relative;
  width: 400px;
  padding: 50px 40px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px); /* 毛玻璃 */
  border: 1px solid rgba(0, 242, 255, 0.2);
  z-index: 10;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
}

/* 角落装饰标记 (HUD风格) */
.corner-mark {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid var(--primary-color);
  transition: 0.3s;
}
.top-left { top: -1px; left: -1px; border-right: 0; border-bottom: 0; }
.top-right { top: -1px; right: -1px; border-left: 0; border-bottom: 0; }
.bottom-left { bottom: -1px; left: -1px; border-right: 0; border-top: 0; }
.bottom-right { bottom: -1px; right: -1px; border-left: 0; border-top: 0; }

.login-box:hover .corner-mark {
  width: 30px;
  height: 30px;
  box-shadow: 0 0 10px var(--primary-color);
}

/* 头部样式 */
.header {
  text-align: center;
  margin-bottom: 40px;
}
.logo-symbol {
  width: 60px;
  height: 60px;
  margin: 0 auto 15px;
}
.header h2 {
  margin: 0;
  font-size: 24px;
  letter-spacing: 4px;
  color: var(--primary-color);
  text-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
}
.sub-text {
  font-size: 10px;
  color: #668;
  letter-spacing: 2px;
}

/* 输入框动效 */
.input-wrapper {
  position: relative;
  margin-bottom: 30px;
}
.input-wrapper input {
  width: 100%;
  padding: 10px 5px;
  background: transparent;
  border: none;
  border-bottom: 1px solid #334;
  color: #fff;
  font-size: 16px;
  outline: none;
  transition: 0.3s;
}
.input-wrapper label {
  position: absolute;
  left: 5px;
  top: 10px;
  color: #556;
  pointer-events: none;
  transition: 0.3s;
  font-size: 14px;
}
/* 聚焦动画 */
.input-wrapper input:focus ~ label,
.input-wrapper input:not(:placeholder-shown) ~ label {
  top: -15px;
  color: var(--primary-color);
  font-size: 12px;
}
.input-border {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary-color);
  transition: 0.4s;
  box-shadow: 0 0 10px var(--primary-color);
}
.input-wrapper input:focus ~ .input-border,
.input-wrapper input:not(:placeholder-shown) ~ .input-border {
  width: 100%;
}

/* 按钮样式 */
.tech-btn {
  position: relative;
  width: 100%;
  padding: 15px;
  background: rgba(0, 242, 255, 0.1);
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  font-size: 16px;
  letter-spacing: 2px;
  font-weight: bold;
  cursor: pointer;
  overflow: hidden;
  transition: 0.3s;
  text-transform: uppercase;
}
.tech-btn:hover {
  background: var(--primary-color);
  color: #000;
  box-shadow: 0 0 20px var(--primary-color);
}
/* 按钮故障风扫光 */
.btn-glitch {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
  transform: skewX(-20deg);
  transition: 0.5s;
}
.tech-btn:hover .btn-glitch {
  left: 150%;
  transition: 0.5s;
}

/* 底部状态栏 */
.system-status {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #445;
  font-family: monospace;
}
</style>