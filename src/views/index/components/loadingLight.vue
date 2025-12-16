<script setup lang="ts">
  import { ref } from 'vue';
  defineOptions({
    name: 'RtWelcome',
  });
</script>

<template>
  <div class="body-content">
    <div class="card">
      <div class="loader-wrapper">
        <span class="loader-letter">卡</span>
        <span class="loader-letter">片</span>
        <span class="loader-letter">和</span>
        <span class="loader-letter">加</span>
        <span class="loader-letter">载</span>
        <span class="loader-letter">.</span>
        <span class="loader-letter">.</span>
        <span class="loader-letter">.</span>
        <div class="loader" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  /* From Uiverse.io by dexter-st */
  .loader-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 180px;
    height: 180px;
    font-family: 'Inter', sans-serif;
    font-size: 1.2em;
    font-weight: 300;
    color: white;
    border-radius: 50%;
    background-color: transparent;
    user-select: none;
  }

  .loader {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    background-color: transparent;
    animation: loader-rotate 2s linear infinite;
    z-index: 0;
  }

  @keyframes loader-rotate {
    0% {
      transform: rotate(90deg);
      box-shadow:
        0 10px 20px 0 #fff inset,
        0 20px 30px 0 #ad5fff inset,
        0 60px 60px 0 #471eec inset;
    }

    50% {
      transform: rotate(270deg);
      box-shadow:
        0 10px 20px 0 #fff inset,
        0 20px 10px 0 #d60a47 inset,
        0 40px 60px 0 #311e80 inset;
    }

    100% {
      transform: rotate(450deg);
      box-shadow:
        0 10px 20px 0 #fff inset,
        0 20px 30px 0 #ad5fff inset,
        0 60px 60px 0 #471eec inset;
    }
  }

  .loader-letter {
    display: inline-block;
    opacity: 0.4;
    transform: translateY(0);
    animation: loader-letter-anim 2s infinite;
    z-index: 1;
    border-radius: 50ch;
    border: none;
  }

  .loader-letter:nth-child(1) {
    animation-delay: 0s;
  }

  .loader-letter:nth-child(2) {
    animation-delay: 0.1s;
  }

  .loader-letter:nth-child(3) {
    animation-delay: 0.2s;
  }

  .loader-letter:nth-child(4) {
    animation-delay: 0.3s;
  }

  .loader-letter:nth-child(5) {
    animation-delay: 0.4s;
  }

  .loader-letter:nth-child(6) {
    animation-delay: 0.5s;
  }

  .loader-letter:nth-child(7) {
    animation-delay: 0.6s;
  }

  .loader-letter:nth-child(8) {
    animation-delay: 0.7s;
  }

  @keyframes loader-letter-anim {
    0%,
    100% {
      opacity: 0.4;
      transform: translateY(0);
    }

    20% {
      opacity: 1;
      transform: scale(1.15);
    }

    40% {
      opacity: 0.7;
      transform: translateY(0);
    }
  }

  // ------------------------------旋转card---------------------------
  .card {
    position: relative;
    width: 254px;
    height: 254px;
    background-color: #000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 12px;
    gap: 12px;
    border-radius: 8px;
    cursor: pointer;
  }

  .card::before {
    content: '';
    position: absolute;
    inset: 0;
    left: -5px;
    margin: auto;
    width: 264px;
    height: 264px;
    border-radius: 10px;
    background: linear-gradient(-45deg, #e81cff 0%, #40c9ff 100%);
    z-index: -5;
    pointer-events: none;
    transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .card::after {
    content: '';
    z-index: -1;
    position: absolute;
    inset: 0;
    background: linear-gradient(-45deg, #fc00ff 0%, #00dbde 100%);
    transform: translate3d(0, 0, 0) scale(0.95);
    filter: blur(20px);
  }

  .card:hover::after {
    filter: blur(30px);
  }

  .card:hover::before {
    transform: rotate(-90deg) scaleX(1) scaleY(1);
  }
</style>
