<!-- src/components/map/chinaMap.vue -->
<script setup lang="ts">
  import * as echarts from 'echarts';
  import { nextTick, onMounted, ref, watch } from 'vue';
  import chinaGeoJson from '@/data/chinaMap.json'; // 中国地图 GeoJSON
  import 'echarts-gl'; // 引入 echarts-gl 实现 3D 效果

  const props = withDefaults(
    defineProps<{
      mapData?: Array<{
        areaName: string;
        allName: string;
        quantity: number;
        areaCode: string | number;
      }>;
    }>(),
    {
      // 提供默认测试数据
      mapData: () => [
        { areaName: '北京市', allName: '北京市', quantity: 100, areaCode: '110000' },
        { areaName: '上海市', allName: '上海市', quantity: 80, areaCode: '310000' },
        { areaName: '广东省', allName: '广东省', quantity: 120, areaCode: '440000' },
        { areaName: '黑龙江省', allName: '黑龙江省', quantity: 60, areaCode: '230000' },
        { areaName: '新疆维吾尔自治区', allName: '新疆维吾尔自治区', quantity: 70, areaCode: '650000' },
        { areaName: '西藏自治区', allName: '西藏自治区', quantity: 40, areaCode: '540000' },
      ],
    },
  );

  const chartRef = ref<HTMLElement | null>(null);
  let chart: echarts.ECharts | null = null;
  // 飞线数据
  const generateLinesData = () => {
    if (!props.mapData || props.mapData.length < 2) return [];

    const cityCoords: Record<string, [number, number]> = {
      '110000': [116.405285, 39.904989], // 北京
      '310000': [121.472641, 31.231706], // 上海
      '440000': [113.280661, 23.125178], // 广东(广州)
      '230000': [126.642464, 45.756967], // 黑龙江(哈尔滨)
      '650000': [87.617733, 43.792818], // 新疆(乌鲁木齐)
      '540000': [91.132212, 29.660361], // 西藏(拉萨)
    };

    const lines = [];

    // 北京的编码
    const beijingCode = '110000';
    const beijingCoord = cityCoords[beijingCode];

    // 查找北京数据
    const beijingCity = props.mapData.find(city => String(city.areaCode) === String(beijingCode));

    // 如果没有北京数据则返回空数组
    if (!beijingCity || !beijingCoord) return [];

    // 从北京飞向其他所有城市的飞线
    for (const city of props.mapData) {
      const cityCode = String(city.areaCode);

      // 跳过北京自身
      if (cityCode === beijingCode) continue;

      const targetCoord = cityCoords[cityCode];

      // 只有当目标城市坐标存在时才创建飞线
      if (targetCoord) {
        lines.push({
          coords: [
            [beijingCoord[0], beijingCoord[1]], // 起点：北京
            [targetCoord[0], targetCoord[1]], // 终点：目标城市
          ],
          value: city.quantity || 0,
          name: `${beijingCity.areaName} → ${city.areaName}`,
        });
      }
    }

    return lines;
  };

  // 生成地图数据，支持数量映射颜色
  const generateMapData = () => {
    if (!props.mapData || props.mapData.length === 0) return [];

    // 自定义颜色方案 - 可以根据喜好调整
    const colors = [
      '#FFECEC',
      '#FFD9D9',
      '#FFC6C6',
      '#FFB3B3',
      '#FF9F9F',
      '#FF8C8C',
      '#FF7979',
      '#FF6666',
      '#FF5353',
      '#FF4040',
      '#FF2D2D',
      '#FF1A1A',
      '#FF0000',
    ];

    const nonZeroData = props.mapData.filter(item => item.quantity > 0);
    const sortedData = [...nonZeroData].sort((a, b) => a.quantity - b.quantity);

    return props.mapData
      .map(region => {
        let colorIndex = 0;
        if (region.quantity > 0) {
          const sortedIndex = sortedData.findIndex(item => item.areaCode === region.areaCode);
          colorIndex = Math.min(Math.floor((sortedIndex / sortedData.length) * colors.length), colors.length - 1);
        }

        // 获取区域名称 - 更安全的查找方式
        let regionName = '-';
        const feature = chinaGeoJson.features.find((item: any) => {
          // 确保类型匹配
          return String(item.properties.adcode) === String(region.areaCode);
        });

        if (feature) {
          regionName = feature.properties.name || '-';
        }

        return {
          name: regionName,
          value: region.quantity || 0,
          allName: region.areaName || '-',
          tradeBidsectionCount: region.quantity || 0,
          tradeProjectCount: region.quantity || 0,
          itemStyle: {
            color: region.quantity !== 0 ? 'red' : '#CCCCCC',
            opacity: 0.8,
          },
          emphasis: {
            label: {
              show: true,
              color: '#FFFFFF',
            },
            itemStyle: {
              color: region.quantity !== 0 ? colors[colorIndex] : '#CCCCCC',
              opacity: 1,
            },
          },
        };
      })
      .filter(item => item.name !== '-'); // 过滤掉找不到对应地理信息的数据
  };

  // 生成柱状图数据
  const generateBarData = () => {
    if (!props.mapData || props.mapData.length === 0) return [];

    // 获取各地区的中心坐标
    const geoCoordMap: Record<string, [number, number]> = {};
    chinaGeoJson.features.forEach((feature: any) => {
      const name = feature.properties.name;
      const center = feature.properties.center;
      if (name && center) {
        geoCoordMap[name] = center;
      }
    });

    const result = [];

    for (const region of props.mapData) {
      // 获取区域名称
      const feature = chinaGeoJson.features.find(
        (item: any) => String(item.properties.adcode) === String(region.areaCode),
      );

      if (!feature) continue; // 跳过找不到的区域

      const regionName = feature.properties.name || '-';

      // 获取坐标
      const coord = geoCoordMap[regionName];
      if (!coord) continue; // 跳过没有坐标的区域

      result.push({
        name: regionName,
        value: [...coord, region.quantity || 0], // [经度, 纬度, 数值]
        quantity: region.quantity || 0,
        allName: region.areaName || '-',
      });
    }
    return result;
  };

  const initChart = () => {
    if (!chartRef.value || !props.mapData) return;

    if (!chart) {
      chart = echarts.init(chartRef.value);
      echarts.registerMap('chinaMap', chinaGeoJson as any);
    }

    const mapData = generateMapData();
    const linesData = generateLinesData();
    const barData = generateBarData();

    // 添加数据验证
    if (mapData.length === 0 || barData.length === 0) {
      console.warn('地图数据为空，跳过渲染');
      return;
    }
    const option = {
      tooltip: {
        trigger: 'item',
        position(point: any, params: any, dom: any, rect: any, size: any) {
          let x = 0;
          let y = 0;
          const pointX = point[0];
          const pointY = point[1];
          const boxWidth = size.contentSize[0];
          const boxHeight = size.contentSize[1];

          if (boxWidth > pointX) {
            x = pointX + 10;
          } else {
            x = pointX - boxWidth - 10;
          }

          if (boxHeight > pointY) {
            y = 5;
          } else {
            y = pointY - boxHeight;
          }
          return [x, y];
        },
        show: true,
        enterable: true,
        textStyle: {
          fontSize: 13,
          color: '#fff',
        },
        backgroundColor: 'rgba(0,2,89,0.8)',
        formatter(params: any) {
          let tipHtml = '';
          if (params.seriesType === 'bar3D') {
            tipHtml = `
            <div class="ui-map-img">
              <div class='ui-maptxt'>${params.name}</div>
              <div class='ui-mapNum'>数据:${params.data.quantity || 0}</div>
            </div>
          `;
          } else {
            tipHtml = `
            <div class="ui-map-img">
              <div class='ui-maptxt'>${params.name}</div>
              <div class='ui-mapNum'>数据1:${params.data.tradeBidsectionCount || 0}</div>
              <div class='ui-mapNum'>数据2:${params.data.tradeProjectCount || 0}</div>
            </div>
          `;
          }
          return tipHtml;
        },
      },
      visualMap: {
        show: false,
        min: 0,
        max: Math.max(...mapData.map(item => item.value)),
        inRange: {
          color: ['#E1EAFF', '#1E62FF'],
        },
      },
      // 添加 geo3D 配置，这是飞线显示的关键
      geo3D: {
        map: 'chinaMap',
        boxWidth: 150,
        boxHeight: 15,
        boxDepth: 150,
        regionHeight: 5,
        shading: 'lambert',
        light: {
          main: {
            intensity: 1,
            shadow: true,
          },
        },
        viewControl: {
          projection: 'perspective',
          autoRotate: false,
          distance: 150,
          alpha: 45,
          beta: 0,
        },
        itemStyle: {
          color: '#3F79FF',
          opacity: 0.8,
          borderWidth: 1,
          borderColor: '#fff',
        },
        emphasis: {
          label: {
            show: true,
            color: '#FFFFFF',
          },
          itemStyle: {
            color: '#598BFF',
            opacity: 1,
          },
        },
        regions: [
          {
            name: '川',
            itemStyle: {
              areaColor: 'red',
              borderWidth: 1,
              borderColor: '#000',
            },
          },
          {
            name: '藏',
            itemStyle: {
              areaColor: 'blue',
              borderWidth: 1,
              borderColor: '#000',
            },
          },
        ],
      },
      series: [
        // 先绘制飞线系列，确保不会被地图遮挡
        {
          name: '飞线',
          type: 'lines3D',
          coordinateSystem: 'geo3D', // 指定使用 geo3D 坐标系
          effect: {
            show: true,
            period: 4, // 增加周期使动画更慢
            trailWidth: 4, // 增加轨迹宽度
            trailLength: 0.6,
            trailOpacity: 1,
            spotIntensity: 3,
          },
          lineStyle: {
            width: 5, // 增加线宽
            color: 'green',
            // opacity: 1,
            opacity: 0.1, //尾迹线条透明度
            curveness: 0.3, //尾迹线条曲直度
          },
          data: [
            {
              coords: [
                [118.8062, 31.9208],
                [119.4543, 25.9222],
              ],
              lineStyle: { color: 'red' },
            },
            {
              coords: [
                [127.9688, 45.368],
                [119.4543, 25.9222],
              ],
              lineStyle: { color: '#4fb6d2' },
            },
            {
              coords: [
                [110.3467, 41.4899],
                [119.4543, 25.9222],
              ],
              lineStyle: { color: '#52b9c7' },
            },
            {
              coords: [
                [125.8154, 44.2584],
                [119.4543, 25.9222],
              ],
              lineStyle: { color: '#5abead' },
            },
            {
              coords: [
                [116.4551, 40.2539],
                [119.4543, 25.9222],
              ],
              lineStyle: { color: '#f34e2b' },
            },
            {
              coords: [
                [123.1238, 42.1216],
                [119.4543, 25.9222],
              ],
              lineStyle: { color: '#f56321' },
            },
            {
              coords: [
                [114.4995, 38.1006],
                [119.4543, 25.9222],
              ],
              lineStyle: { color: '#f56f1c' },
            },
            {
              coords: [
                [117.4219, 39.4189],
                [119.4543, 25.9222],
              ],
              lineStyle: { color: '#f58414' },
            },
            {
              coords: [
                [112.3352, 37.9413],
                [119.4543, 25.9222],
              ],
              lineStyle: { color: '#f58f0e' },
            },
            {
              coords: [
                [109.1162, 34.2004],
                [119.4543, 25.9222],
              ],
              lineStyle: { color: '#f5a305' },
            },
            {
              coords: [
                [103.5901, 36.3043],
                [119.4543, 25.9222],
              ],
              lineStyle: { color: '#e7ab0b' },
            },
            {
              coords: [
                [106.3586, 38.1775],
                [119.4543, 25.9222],
              ],
              lineStyle: { color: '#dfae10' },
            },
            {
              coords: [
                [101.4038, 36.8207],
                [119.4543, 25.9222],
              ],
              lineStyle: { color: '#d5b314' },
            },
            {
              coords: [
                [103.9526, 30.7617],
                [119.4543, 25.9222],
              ],
              lineStyle: { color: '#c1bb1f' },
            },
            {
              coords: [
                [108.384366, 30.439702],
                [119.4543, 25.9222],
              ],
              lineStyle: { color: '#b9be23' },
            },
            {
              coords: [
                [113.0823, 28.2568],
                [119.4543, 25.9222],
              ],
              lineStyle: { color: '#a6c62c' },
            },
            {
              coords: [
                [102.9199, 25.46639],
                [119.4543, 25.9222],
              ],
              lineStyle: { color: '#96cc34' },
            },
          ],
          // blendMode: 'lighter',
          // data: linesData,
          zlevel: 10, // 提高层级确保在最上层
        },
        {
          name: '中国数据3D',
          type: 'map3D',
          map: 'chinaMap',
          boxWidth: 150,
          boxHeight: 15,
          boxDepth: 150,
          regionHeight: 5,
          distance: 100,
          orthographic: false,
          viewControl: {
            projection: 'perspective',
            autoRotate: false,
            distance: 150,
            alpha: 45,
            beta: 0,
            center: [0, 0, 0],
          },
          itemStyle: {
            color: '#3F79FF',
            opacity: 0.8,
            borderWidth: 1,
            borderColor: '#fff',
          },
          emphasis: {
            label: {
              show: true,
              color: '#FFFFFF',
            },
            itemStyle: {
              color: '#598BFF',
              opacity: 1,
            },
          },
          label: {
            show: false,
            formatter: '{b}',
            textStyle: {
              color: '#fff',
              fontSize: 12,
            },
          },
          data: mapData,
          zlevel: 1, // 较低层级
        },
        // 添加柱状图系列
        {
          name: '数据柱状图',
          type: 'bar3D',
          coordinateSystem: 'geo3D',
          shading: 'lambert',
          barSize: [2, 2],
          minHeight: 0,
          maxHeight: 25,
          itemStyle: {
            color(params: any) {
              // 根据数据值返回不同颜色
              const value = params.value[2]; // 第三个值是数量
              if (value > 100) return '#FF4040'; // 红色 - 高
              if (value > 80) return '#FF8C00'; // 橙色 - 中高
              if (value > 60) return '#FFD700'; // 金色 - 中
              if (value > 40) return '#90EE90'; // 浅绿 - 中低
              if (value > 0) return '#00FF00'; // 绿色 - 低
              return '#CCCCCC'; // 灰色 - 无数据
            },
            opacity: 1,
          },
          label: {
            show: false,
            formatter: '{b}',
          },
          emphasis: {
            label: {
              show: true,
              formatter: '{b}\n{c}',
              textStyle: {
                color: '#fff',
                fontSize: 12,
              },
            },
            itemStyle: {
              color(params: any) {
                // 悬停时的高亮颜色
                const value = params.value[2];
                if (value > 100) return '#FF6347'; // Tomato red
                if (value > 80) return '#FFA500'; // Orange
                if (value > 60) return '#FFD700'; // Gold
                if (value > 40) return '#32CD32'; // LimeGreen
                if (value > 0) return '#00FA9A'; // MediumSpringGreen
                return '#AAAAAA';
              },
              opacity: 1,
            },
          },
          data: barData,
          zlevel: 5,
        },
      ],
    };

    chart.setOption(option, true);

    chart.on('click', params => {
      console.log('点击了:', params.name);
    });
  };

  watch(
    () => props.mapData,
    newValue => {
      nextTick(() => {
        if (chart && props.mapData) {
          initChart();
        }
      });
    },
    { deep: true, immediate: true },
  );

  onMounted(() => {
    initChart();
  });
</script>

<template>
  <div class="map-container">
    <div ref="chartRef" class="chart" />
    <div class="left-tooltip">
      <div class="tooltip-line" />
      <div class="tooltip-label">
        <div class="tooltip-label-item">高</div>
        <div class="tooltip-label-item">低</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .map-container {
    width: 100%;
    height: 100%;
    min-height: 600px;
    box-sizing: border-box;
    position: relative;
    //   background-image: url('@/assets/image/map_indexBG.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }

  .chart {
    width: 100%;
    height: 100%;
    min-height: 500px;
  }

  .left-tooltip {
    display: flex;
    position: absolute;
    left: 0;
    bottom: 0;

    .tooltip-line {
      width: 10px;
      height: 114px;
      border-radius: 6px;
      background: linear-gradient(180deg, #1e62ff 0%, #e1eaff 100%);
    }

    .tooltip-label {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      margin-left: 8px;
      color: #3d3d3d;
      font-size: 14px;
    }
  }
</style>
