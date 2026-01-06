<template>
  <div ref="container" style="width: 100vw; height: 100vh"></div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const container = ref(null);
let scene, camera, renderer, controls;
const mapDepth = 10;
// 示例数据数组
const valueArray = [150, 320, 480, 620, 750, 890, 120, 280, 430, 560];
var provincePositions = [];
// 定义蓝色系颜色数组
const blueColors = [
  new THREE.Color(173 / 255, 216 / 255, 230 / 255), // 浅蓝色 (LightBlue)
  new THREE.Color(135 / 255, 206 / 255, 250 / 255), // 淡蓝色 (LightSkyBlue)
  new THREE.Color(30 / 255, 144 / 255, 255 / 255), // 道奇蓝 (DodgerBlue)
  new THREE.Color(65 / 255, 105 / 255, 225 / 255), // 皇家蓝 (RoyalBlue)
];

onMounted(() => {
  // 初始化 Three.js 场景
  scene = new THREE.Scene();
  scene.background = null;
  // // 创建纹理加载器
  // const loader = new THREE.TextureLoader();
  // // 加载背景图片
  // const backgroundTexture = loader.load(
  //   "/bg_main.png",
  //   undefined,
  //   undefined,
  //   (err) => {
  //     console.error("背景图片加载失败:", err);
  //   }
  // );
  // // 设置场景背景为图片纹理
  // scene.background = backgroundTexture;

  // 相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.set(0, 350, 300);

  // 渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.value.appendChild(renderer.domElement);

  // 控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 2);
  scene.add(ambientLight);
  // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  // directionalLight.position.set(100, 200, 100);
  // scene.add(directionalLight);
  // const pointLight = new THREE.PointLight(0x00ffff, 0.5, 1000);
  // pointLight.position.set(0, 350, 300);
  // scene.add(pointLight);

  function createGradientTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)"); // 顶部不透明白色
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.7)"); // 半透明白色
    gradient.addColorStop(1, "rgba(0, 0, 255, 0.5)"); // 底部半透明蓝色

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // 加载 GeoJSON 数据并创建可视化元素
  loadGeoDataAndCreateColumns(createGradientTexture());

  // 动画循环
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    scene.children.forEach((child) => {
      if (child.userData && child.userData.isRipple) {
        const time = Date.now() * 0.001 - (child.userData.delay || 0);
        // 同时改变x和y方向的缩放
        child.scale.set(
          1 + Math.sin(time) * 0.5,
          1 + Math.sin(time) * 0.5, // 添加y方向的缩放
          1 + Math.sin(time) * 0.5
        );
      }
      // 飞线动画效果
      if (child.userData && child.userData.isFlyLine) {
        const time = Date.now() * 0.001 - (child.userData.delay || 0);
        child.material.color.setHSL((time % 1) / 10, 0.5, 0.5);
      }
    });

    renderer.render(scene, camera);
  }
  animate();

  // 窗口自适应
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
//创建波纹
const createMultiLayerRipple = (position) => {
  const rippleLayers = [];

  // 创建3层波纹
  for (let i = 0; i < 3; i++) {
    const innerRadius = 2 + i * 2; // 内半径，每层增加2单位
    const outerRadius = 3 + i * 2; // 外半径，每层增加3单位
    const segments = 100; // 段数

    // 使用 RingGeometry 创建空心圆环
    const rippleGeometry = new THREE.RingGeometry(
      innerRadius, // 内半径
      outerRadius, // 外半径
      segments // 分段数
    );

    const rippleMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      // transparent: true,
      // opacity: 0.6 , // 逐渐变淡
      // side: THREE.DoubleSide,
      // blending: THREE.AdditiveBlending,
    });

    const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
    ripple.position.set(position.x, mapDepth, position.z);
    ripple.rotation.x = -Math.PI / 2;

    // 设置不同的动画延迟
    ripple.userData = {
      isRipple: true,
      delay: i * 0.1,
    };

    scene.add(ripple);
    rippleLayers.push(ripple);
  }

  return rippleLayers;
};
// 创建省份间飞线的函数
function createFlyLinesBetweenProvinces() {
  if (provincePositions.length > 1) {
    // 创建省份之间的飞线
    for (let i = 0; i < Math.min(provincePositions.length - 1, 30); i++) {
      const startProvince = provincePositions[i];
      const endProvince = provincePositions[(i + 1) % provincePositions.length];

      // 创建飞线
      const flyLine = createFlyLine(
        startProvince.position,
        endProvince.position
      );

      scene.add(flyLine);
    }
  }
}

// 创建飞线的函数
function createFlyLine(startPos, endPos, color = 0x00ffff) {
  // 创建曲线路径
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(startPos.x, startPos.y, startPos.z),
    new THREE.Vector3(
      (startPos.x + endPos.x) / 2,
      Math.max(startPos.y, endPos.y) + 100, // 弧线高度
      (startPos.z + endPos.z) / 2
    ),
    new THREE.Vector3(endPos.x, endPos.y, endPos.z)
  );

  // 创建线条几何体
  const points = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  // 创建材质
  const material = new THREE.LineBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.8,
    linewidth: 2,
  });

  // 创建飞线对象
  const flyLine = new THREE.Line(geometry, material);

  // 添加自定义属性用于动画控制
  flyLine.userData = {
    isFlyLine: true,
    curve: curve,
    startTime: Date.now(),
  };

  return flyLine;
}
// 加载真实的 GeoJSON 数据并创建可视化
async function loadGeoDataAndCreateColumns(gradientTexture) {
  try {
    // 加载 json 文件
    const response = await fetch("/china.json");
    const geoData = await response.json();

    // 创建基础平面作为地图背景
    // const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
    // const planeMaterial = new THREE.MeshBasicMaterial({
    //   color: "0x0066cc",
    //   transparent: true,
    //   opacity: 0.1,
    //   side: THREE.DoubleSide,
    // });
    // const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // plane.rotation.x = -Math.PI / 2;
    // scene.add(plane);

    // 处理每个省份特征
    geoData.features.forEach((feature, index) => {
      if (feature.geometry.type === "MultiPolygon") {
        // 获取当前值和颜色
        const value = valueArray[index % valueArray.length];
        const color = blueColors[index % blueColors.length];

        // 计算整个省份的中心点
        let allCoords = [];
        feature.geometry.coordinates.forEach((polygon) => {
          allCoords = allCoords.concat(polygon[0]);
        });

        // 计算中心点
        let centerX = 0,
          centerZ = 0;
        allCoords.forEach((coord) => {
          centerX += coord[0];
          centerZ += coord[1];
        });
        centerX /= allCoords.length;
        centerZ /= allCoords.length;

        // 为每个 MultiPolygon 创建可视化
        feature.geometry.coordinates.forEach((polygon, polyIndex) => {
          // 获取多边形的外环坐标
          const coordinates = polygon[0];

          // 创建省份多边形
          const shape = new THREE.Shape();
          coordinates.forEach((coord, i) => {
            const x = (coord[0] - 105) * 10; // 经度偏移并缩放
            const z = (coord[1] - 35) * 10; // 纬度偏移并缩放
            if (i === 0) {
              shape.moveTo(x, z);
            } else {
              shape.lineTo(x, z);
            }
          });

          // 创建挤出设置
          const extrudeSettings = {
            steps: 1,
            depth: mapDepth,
            bevelEnabled: false,
          };

          // 创建省份几何体
          const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
          const material = new THREE.MeshPhongMaterial({
            color: "#289be1",
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            //添加边缘发光效果
            emissive: 0xffffff,
            emissiveIntensity: 0.01,
            // //增加深度感
            // shininess: 50,
          });
          const provinceMesh = new THREE.Mesh(geometry, material);
          provinceMesh.position.y = 0;
          provinceMesh.rotation.x = -Math.PI / 2;
          scene.add(provinceMesh);
          // 创建线框几何体
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xefffff,
            linewidth: 2,
          });
          const topEdges = new THREE.EdgesGeometry(
            new THREE.ExtrudeGeometry(shape, { depth: 0.01 })
          );
          const topWireframe = new THREE.LineSegments(topEdges, lineMaterial);
          topWireframe.position.set(0, mapDepth + 0.01, 0); // 稍微抬高避免 z-fighting
          topWireframe.rotation.x = -Math.PI / 2;
          scene.add(topWireframe);
          const bottomWireframe = topWireframe.clone();
          // bottomWireframe.position.y = 0;
          // scene.add(bottomWireframe);
        });

        // 仅为整个省份创建一个柱状图（而不是每个子区域一个）
        const barGeometry = new THREE.CylinderGeometry(3, 3, value / 10);
        const barMaterial = new THREE.MeshPhongMaterial({
          map: gradientTexture,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
        });

        const bar = new THREE.Mesh(barGeometry, barMaterial);
        // 保存位置信息供后续使用
        const provincePosition = {
          x: (centerX - 105) * 10,
          y: mapDepth,
          z: -(centerZ - 35) * 10,
        };
        bar.position.set(
          provincePosition.x, // 经度偏移并缩放
          value / 20 + mapDepth, // 高度的一半（因为原点在底部）
          provincePosition.z // 纬度偏移并缩放
        );
        //添加波纹效果
        createMultiLayerRipple(bar.position);
        scene.add(bar);
        // 存储位置信息
        provincePositions.push({
          position: provincePosition,
          name: feature.properties.name || "未知区域",
          value: value,
        });
        // 添加省份名称标签
        // const canvas = document.createElement('canvas');
        // const context = canvas.getContext('2d');
        // canvas.width = 256;
        // canvas.height = 128;
        // context.fillStyle = 'rgba(255, 255, 255, 0.9)';
        // context.font = '24px Arial';
        // context.fillText(feature.properties.name || "未知区域", 50, 50);

        // const texture = new THREE.CanvasTexture(canvas);
        // const labelMaterial = new THREE.SpriteMaterial({ map: texture });
        // const label = new THREE.Sprite(labelMaterial);
        // label.position.set(
        //   (centerX - 105) * 10,
        //   value / 10 + 20,
        //   (centerZ - 35) * 10
        // );
        // label.scale.set(50, 25, 1);
        // scene.add(label);
      }
    });
    // 在处理完所有省份后，添加飞线
    createFlyLinesBetweenProvinces();
  } catch (error) {
    console.error("加载GeoJSON数据失败:", error);
  }
}
</script>
