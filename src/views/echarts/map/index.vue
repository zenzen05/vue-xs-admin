<script setup>
  import { ref } from 'vue';
  // import MapboxMap from './components/MapboxMap.vue';
  // import CesiumMap from '../components/map.vue';
  import ThreejsMap from './components/chinaMap.vue';
  // import CesiumMap from '../components/CesiumMap.vue';
</script>

<template>
  <div class="app-container">
    <!-- <CesiumMap class="map-container"></CesiumMap> -->
    <ThreejsMap class="map-container" />
  </div>
</template>
<style>
  .app-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    /* background-image: url("/bg_main.png"); */
    /* background-size: cover;
    background-repeat: no-repeat; */
  }
</style>
