<script setup>
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
  import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
  import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
  import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
  import { onMounted, onUnmounted, ref } from 'vue';

  const container = ref(null);
  let scene, camera, renderer, labelRenderer, controls, composer;
  let raycaster, mouse;
  let infoCard;

  const movingParticles = [];
  const lightColumns = [];
  const ripples = [];
  const provinceMeshes = [];

  const mapDepth = 15;
  const valueArray = [150, 320, 480, 620, 750, 890, 120, 280, 430, 560];

  let targetPosition = null;
  const provincePositions = [];

  // --- Shader (保持不变) ---\\\
  const topVertexShader = `
  varying vec3 vPosition;
  void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
  const topFragmentShader = `
  varying vec3 vPosition;
  uniform vec2 uCenter; 
  void main() {
    float dist = distance(vPosition.xy, uCenter);
    float radius = 70.0;
    float alpha = smoothstep(0.0, radius, dist);
    vec3 colorEdge = vec3(0.0, 0.25, 0.6); 
    vec3 colorCenter = vec3(0.0, 0.1, 0.3);
    vec3 finalColor = mix(colorCenter, colorEdge, alpha);
    gl_FragColor = vec4(finalColor, 0.5);
  }
`;
  const sideVertexShader = `
  varying vec3 vPosition;
  void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
  const sideFragmentShader = `
  varying vec3 vPosition;
  uniform float uDepth; 
  void main() {
    float h = vPosition.z / uDepth;
    vec3 color = vec3(0.0, 0.3, 0.5);
    float alpha = pow(h, 2.5); 
    gl_FragColor = vec4(color, alpha * 0.8); 
  }
`;

  onUnmounted(() => {
    if (renderer) renderer.dispose();
    if (composer) composer.dispose();
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onWindowResize);
  });

  onMounted(() => {
    initScene();
    const columnTexture = createLightColumnTexture();
    loadGeoDataAndCreateColumns(columnTexture);
    createInfoCard();
    animate();
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
  });

  function initScene() {
    scene = new THREE.Scene();
    scene.fog = null;
    scene.background = null;

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 300, 400);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.value.appendChild(renderer.domElement);

    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    container.value.appendChild(labelRenderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2(-1, -1);

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.strength = 0.5;
    bloomPass.radius = 0.3;
    bloomPass.threshold = 0.6;

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
  }

  function createInfoCard() {
    const div = document.createElement('div');
    div.className = 'info-card';
    div.innerHTML = `
    <div class="card-title"></div>
    <div class="card-value"></div>
  `;
    div.style.opacity = '0';
    infoCard = new CSS2DObject(div);
    scene.add(infoCard);
  }

  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  function createLightColumnTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
    gradient.addColorStop(0.2, 'rgba(0, 255, 255, 0.1)');
    gradient.addColorStop(0.6, 'rgba(0, 255, 255, 0.6)');
    gradient.addColorStop(1, 'rgba(200, 255, 255, 1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  async function loadGeoDataAndCreateColumns(columnTexture) {
    try {
      const response = await fetch('/china.json');
      const geoData = await response.json();

      geoData.features.forEach((feature, index) => {
        const polygons =
          feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates : [feature.geometry.coordinates];

        // 1. 寻找“最大板块”来定位光柱 (修复位置偏移)
        let mainPolygon = polygons[0];
        let maxPointsCount = 0;
        polygons.forEach(poly => {
          if (poly[0].length > maxPointsCount) {
            maxPointsCount = poly[0].length;
            mainPolygon = poly;
          }
        });

        let mainSumX = 0;
        let mainSumY = 0;
        const mainRing = mainPolygon[0];
        mainRing.forEach(coord => {
          mainSumX += coord[0];
          mainSumY += coord[1];
        });
        const centerX = mainSumX / mainRing.length;
        const centerY = mainSumY / mainRing.length;

        const shapeCenterX = (centerX - 105) * 10;
        const shapeCenterY = (centerY - 35) * 10;
        const worldPos = new THREE.Vector3(shapeCenterX, mapDepth, -shapeCenterY);

        const provinceName = feature.properties.name || '未知区域';
        const provinceValue = valueArray[index % valueArray.length];

        if (provinceName.includes('辽')) {
          targetPosition = worldPos.clone();
        } else {
          provincePositions.push(worldPos);
        }

        // 2. 创建光柱
        const barHeight = provinceValue / 15 + 5;
        const barGeo = new THREE.CylinderGeometry(1.0, 1.0, barHeight, 6);
        const barMat = new THREE.MeshBasicMaterial({
          map: columnTexture,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
          color: 0x00ffff,
        });
        const bar = new THREE.Mesh(barGeo, barMat);
        const barBaseY = mapDepth + barHeight / 2;
        bar.position.set(worldPos.x, barBaseY, worldPos.z);

        // 【关键】把初始Y值记录在 bar 的 userData 里
        bar.userData.baseY = barBaseY;
        bar.userData.height = barHeight;

        scene.add(bar);
        lightColumns.push(bar);

        // 3. 绘制 Mesh
        const currentFeatureMeshes = []; // 临时数组

        polygons.forEach(polygon => {
          const coordinates = polygon[0];
          const shape = new THREE.Shape();

          let localSumX = 0;
          let localSumY = 0;
          coordinates.forEach((coord, i) => {
            const x = (coord[0] - 105) * 10;
            const y = (coord[1] - 35) * 10;
            localSumX += x;
            localSumY += y;
            if (i === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
          });
          const localCenterX = localSumX / coordinates.length;
          const localCenterY = localSumY / coordinates.length;

          const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: mapDepth,
            bevelEnabled: false,
          });

          const topMaterial = new THREE.ShaderMaterial({
            uniforms: { uCenter: { value: new THREE.Vector2(localCenterX, localCenterY) } },
            vertexShader: topVertexShader,
            fragmentShader: topFragmentShader,
            transparent: true,
            opacity: 0.5,
          });

          const sideMaterial = new THREE.ShaderMaterial({
            uniforms: { uDepth: { value: mapDepth } },
            vertexShader: sideVertexShader,
            fragmentShader: sideFragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });

          const mesh = new THREE.Mesh(geometry, [topMaterial, sideMaterial]);
          mesh.rotation.x = -Math.PI / 2;

          mesh.userData.name = provinceName;
          mesh.userData.value = provinceValue;

          provinceMeshes.push(mesh);
          currentFeatureMeshes.push(mesh);
          scene.add(mesh);

          const points = shape.getPoints();
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xcfffff,
            transparent: true,
            opacity: 0.8,
            linewidth: 2,
          });
          const borderLine = new THREE.LineLoop(lineGeometry, lineMaterial);
          borderLine.rotation.x = -Math.PI / 2;
          borderLine.position.y = mapDepth + 0.05;
          scene.add(borderLine);

          mesh.userData.border = borderLine;
        });

        // 4. 统一绑定
        currentFeatureMeshes.forEach(mesh => {
          mesh.userData.bar = bar; // 所有 Mesh 都指向同一个 Bar
        });

        createRipple(worldPos.x, mapDepth + 0.2, worldPos.z);
      });

      createConvergenceFlyLines();
    } catch (error) {
      console.error('加载 GeoJSON 出错:', error);
    }
  }

  function createRipple(x, y, z) {
    const geometry = new THREE.RingGeometry(0.8, 1.2, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);
    ripples.push({ mesh, scale: 0, maxScale: 5, speed: 0.1 });
  }
  // 飞线函数
  function createConvergenceFlyLines() {
    if (!targetPosition) return;
    const maxLines = 30;
    const startPoints = [];
    for (let i = 0; i < maxLines; i++) {
      const p = provincePositions[Math.floor(Math.random() * provincePositions.length)];
      if (p) startPoints.push(p);
    }

    startPoints.forEach(startPos => {
      const mid = startPos.clone().add(targetPosition).multiplyScalar(0.5);
      mid.y += startPos.distanceTo(targetPosition) * 0.4 + 10;
      const curve = new THREE.QuadraticBezierCurve3(startPos, mid, targetPosition);

      const tubeGeo = new THREE.TubeGeometry(curve, 40, 0.4, 4, false);
      // 飞线样式
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 'green',
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      });
      const trackLine = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(trackLine);

      const ballGeo = new THREE.SphereGeometry(1.0, 8, 8);
      const ballMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        blending: THREE.AdditiveBlending,
      });
      const ball = new THREE.Mesh(ballGeo, ballMat);
      scene.add(ball);

      movingParticles.push({
        mesh: ball,
        curve,
        progress: Math.random(),
        speed: 0.003,
      });
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(provinceMeshes);
    let activeMesh = null;
    if (intersects.length > 0) {
      activeMesh = intersects[0].object;
    }

    // 1. 获取当前需要高亮的光柱
    let activeBar = null;
    if (activeMesh && activeMesh.userData.bar) {
      activeBar = activeMesh.userData.bar;
    }

    // 2. 遍历所有 Mesh：处理 Mesh 自身的升降 (不处理光柱)
    provinceMeshes.forEach(mesh => {
      let targetY = 0;
      if (mesh === activeMesh) {
        targetY = 10; // 悬浮抬起
      }
      // 平滑移动 Mesh
      mesh.position.y += (targetY - mesh.position.y) * 0.1;
      // 同步 Border
      if (mesh.userData.border) {
        mesh.userData.border.position.y = mapDepth + 0.05 + mesh.position.y;
      }
    });

    // 3. 【核心修复】单独遍历所有光柱：处理光柱的变色和升降
    //    这样就不会因为多个 Mesh 的循环导致冲突
    lightColumns.forEach(bar => {
      // 基础动画：纹理流动
      if (bar.material.map) bar.material.map.offset.y -= 0.001;

      let targetBarY = bar.userData.baseY; // 默认为基础高度
      let targetColor = 0x00ffff; // 默认为青色

      // 如果这个光柱是当前激活的
      if (bar === activeBar) {
        targetBarY = bar.userData.baseY + 10; // 抬起
        targetColor = 0xffaa00; // 金色

        // 更新信息卡片位置和内容
        if (infoCard) {
          // 卡片位置 = Bar当前位置 + Bar一半高度 + 偏移
          const topY = bar.position.y + bar.userData.height / 2;
          infoCard.position.set(bar.position.x, topY + 20, bar.position.z);

          const div = infoCard.element;
          // 找到对应的数据 (从 activeMesh 拿)
          div.querySelector('.card-title').innerText = activeMesh.userData.name;
          div.querySelector('.card-value').innerText = `数值: ${activeMesh.userData.value}`;
          div.style.opacity = '1';
        }
      }

      // 执行光柱的平滑移动和变色
      bar.position.y += (targetBarY - bar.position.y) * 0.1;
      bar.material.color.setHex(targetColor);
    });

    // 如果没有激活的 Mesh，隐藏卡片
    if (!activeMesh && infoCard) {
      infoCard.element.style.opacity = '0';
    }

    // 4. 其他粒子动画
    movingParticles.forEach(item => {
      item.progress += item.speed;
      if (item.progress > 1) item.progress = 0;
      item.mesh.position.copy(item.curve.getPointAt(item.progress));
    });

    ripples.forEach(item => {
      item.scale += item.speed;
      item.mesh.scale.set(item.scale, item.scale, 1);
      const opacity = (1 - item.scale / item.maxScale) * 0.5;
      item.mesh.material.opacity = Math.max(0, opacity);
      if (item.scale >= item.maxScale) item.scale = 0;
    });

    if (composer) composer.render();
    else renderer.render(scene, camera);
    if (labelRenderer) labelRenderer.render(scene, camera);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    if (labelRenderer) labelRenderer.setSize(window.innerWidth, window.innerHeight);
  }
</script>

<template>
  <div style="position: relative; width: 100vw; height: 100vh; overflow: hidden; background: transparent">
    <div ref="container" style="width: 100%; height: 100%" />
  </div>
</template>

<style>
  .info-card {
    pointer-events: none;
    background: rgba(0, 20, 40, 0.85);
    border: 1px solid #00ffff;
    border-radius: 4px;
    padding: 8px 16px;
    color: #fff;
    font-family: 'Arial', sans-serif;
    text-align: center;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    backdrop-filter: blur(4px);
    transform: translate(-50%, -100%);
    transition: opacity 0.2s;
  }

  .card-title {
    font-size: 14px;
    font-weight: bold;
    color: #00ffff;
    margin-bottom: 4px;
  }

  .card-value {
    font-size: 12px;
    color: #ffaa00;
  }

  /* :global(body) {
  margin: 0;
  overflow: hidden;
  background: transparent;
} */
</style>
