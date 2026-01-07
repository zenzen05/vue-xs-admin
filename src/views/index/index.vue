<script setup lang="ts">
import { ref } from 'vue';
import NeuralBg from '@/components/ui/bg-neural/NeuralBg.vue';
import loadingLight from './components/loadingLight.vue';
import threeLine from './components/threeLine.vue';
import backgroundThree from './components/backgroundThree.vue';
import backgroundLogin from './components/backgroundLogin.vue';
import videoCard from './components/videoCard.vue';
defineOptions({
  name: 'RtWelcome',
});
const tabList = ref([{ name: '首页' }, { name: '动图' }, { name: '背景' }, { name: '最后页' }]);
const activeIndex = ref<number | null>(1);
// -----------------------方法--------------------------
const changeTab = (index: number) => {
  activeIndex.value = index;
};
</script>

<template>
  <div class="body-content">
    <div class="top-naveTab">
      <div v-if="activeIndex == 0" class="backNeura">
        <div class="relative flex h-96 min-h-96 w-full items-center justify-center text-xl">
          <NeuralBg class="custom-size" />
        </div>
        <div class="title-first">样式示例</div>
      </div>
      <div v-if="activeIndex == 1" class="video-content">
        <videoCard />
        <loadingLight style="margin-top: 30px" />
      </div>
      <threeLine v-if="activeIndex == 2" />
      <backgroundLogin v-if="activeIndex == 3" />
      <div class="btn-content-top">
        <button v-for="(item, index) in tabList" :key="index" :class="{ active: activeIndex === index }"
          :style="{ background: activeIndex == 1 ? 'rgba(167, 139, 250, 0.8)' : '' }" @click="changeTab(index)">
          <span class="transition" />
          <span class="gradient" />
          <span class="label">{{ item.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.body-content {
  background-color: #12161e;
  height: 100%;
  width: 100%;
  position: relative;
  z-index: 3;
}

.top-naveTab {
  position: relative;

  .video-content {
    position: absolute;
    left: 25%;
    top: 100px;
  }
}

.video-content {
  width: calc(50% - 60px);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-first {
  position: absolute;
  font-size: 25px;
  color: white;
  left: 45%;
}

.backNeura {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-size {
  width: 100%;
  height: 80vh;
}

.btn-content-top {
  position: absolute;
  top: 20px;
  left: 20%;
  display: flex;
  justify-content: space-between;
  width: 60%;
}

button {
  font-size: 17px;
  padding: 1em 2.7em;
  font-weight: 500;
  background: transparent;
  color: white;
  border: none;
  position: relative;
  overflow: hidden;
  border-radius: 0.6em;
  cursor: pointer;
}

.gradient {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  border-radius: 0.6em;
  margin-top: -0.25em;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3));
}

.label {
  position: relative;
  top: -1px;
}

.transition {
  transition: all 500ms cubic-bezier(0, 0, 0.2, 1);
  background:
    radial-gradient(46.6% 37.99% at 80.03% 84.83%, #1dd6ff 0, rgba(29, 214, 255, 0.2) 70%, rgba(16, 22, 33, 0) 90%),
    radial-gradient(46.6% 50.99% at 18.1% 9.03%, #0075ff 0, rgba(0, 117, 255, 0.2) 70%, rgba(16, 22, 33, 0) 90%),
    rgba(85, 134, 255, 0.2);
  border-radius: 9999px;
  width: 0;
  height: 0;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

button:hover .transition {
  width: 14em;
  height: 14em;
}

button:active {
  transform: scale(0.97);
}

button.active {
  background:
    radial-gradient(46.6% 37.99% at 80.03% 84.83%, #1dd6ff 0, rgba(29, 214, 255, 0.2) 70%, rgba(16, 22, 33, 0) 90%),
    radial-gradient(46.6% 50.99% at 18.1% 9.03%, #0075ff 0, rgba(0, 117, 255, 0.2) 70%, rgba(16, 22, 33, 0) 90%),
    rgba(85, 134, 255, 0.2);
}
</style>
