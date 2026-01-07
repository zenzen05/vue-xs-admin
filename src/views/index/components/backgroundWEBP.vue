<template>
    <div class="login-container">
        <div class="bg-layer">
            <img src="@/assets/image/动图背景.webp" alt="background" class="bg-image" />
            <div class="bg-mask"></div>
        </div>

        <div class="login-content">
            <h1>SYSTEM LOGIN</h1>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: #000;
    /* 动图加载出来前的底色 */
}

.bg-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.bg-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* 关键：保证图片铺满且不比例失调 */
    display: block;
}

/* 遮罩层：防止背景太亮影响文字阅读 */
.bg-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    /* 30%透明度的黑 */
    z-index: 1;
}

.login-content {
    position: relative;
    z-index: 2;
    /* 放在最上层 */
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #fff;
}
</style>