<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';

  // 定义组件属性
  interface Props {
    title?: string;
    subtitle?: string;
    framerLink?: string;
    linkText?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    title: 'Tubes',
    subtitle: 'Cursor',
    framerLink: 'https://www.framer.com/@kevin-levron/',
    linkText: 'Framer Component',
  });

  // 引用canvas元素
  const canvasRef = ref<HTMLCanvasElement | null>(null);

  // 初始化画布
  const initCanvas = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 这里可以添加您的绘图逻辑
    drawScene(ctx);
  };

  // 绘制场景
  const drawScene = (ctx: CanvasRenderingContext2D) => {
    // 示例绘制逻辑 - 可根据实际需求修改
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  // 窗口大小调整处理
  const handleResize = () => {
    initCanvas();
  };

  onMounted(() => {
    initCanvas();
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
</script>

<template>
  <div id="app">
    <canvas id="canvas" ref="canvasRef" />
    <div class="hero">
      <h1>{{ title }}</h1>
      <h2>{{ subtitle }}</h2>
      <a target="_blank" :href="framerLink">{{ linkText }}</a>
    </div>
  </div>
</template>

<style scoped>
  #app {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  #canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .hero {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 10;
  }

  .hero h1 {
    font-size: 4rem;
    margin-bottom: 1rem;
    color: white;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .hero h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .hero a {
    color: #fff;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  .hero a:hover {
    background-color: rgba(255, 255, 255, 0.1);
    text-decoration: none;
  }
</style>
