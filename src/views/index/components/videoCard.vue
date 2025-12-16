<script setup lang="ts">
  import { ref } from 'vue';
  defineOptions({
    name: 'RtWelcome',
  });
  const isHovering = ref(false);

  const handleMouseEnter = () => {
    isHovering.value = true;
  };

  const handleMouseLeave = () => {
    isHovering.value = false;
  };
</script>

<template>
  <div class="body-content">
    <div class="top-content">
      <div class="card">
        <div class="card-inner">
          <div class="card-front">
            <p>打开看看</p>
          </div>
          <div class="card-back">
            <div class="item-video" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
              <img
                v-show="!isHovering"
                alt="bot"
                src="https://360humi-public-obs.360humi.com/a-360humi-staticimg-reserve/cutehand/diantou.png"
                class="image"
              />
              <!-- 鼠标移入时显示招手图片 -->
              <img
                v-show="isHovering"
                alt="bot"
                src="https://360humi-public-obs.360humi.com/a-360humi-staticimg-reserve/cutehand/zhaoshou.png"
                class="image"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .image {
    // width: 100%;
    // height: 100%;
    object-fit: cover;
    transition: opacity 0.3s ease;
  }
  .card {
    width: 300px;
    height: 200px;
    perspective: 1000px;
  }

  .card-inner {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.999s;
  }

  .card:hover .card-inner {
    transform: rotateY(180deg);
  }

  .card-front,
  .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
  }

  .card-front {
    background-color: #6a2c70;
    color: #fff;
    display: flex;
    align-items: center;
    border: 10px solid #6a2c70;
    border-radius: 10px;
    justify-content: center;
    font-size: 24px;
    transform: rotateY(0deg);
  }

  .card-back {
    background-color: #f08a5d;
    color: #fff;
    display: flex;
    align-items: center;
    border: 10px solid #f08a5d;
    border-radius: 10px;
    justify-content: center;
    font-size: 24px;
    transform: rotateY(180deg);
  }
</style>
