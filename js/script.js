document.addEventListener("DOMContentLoaded", () => {
  const isDevMode = false;

  console.log(isDevMode);

  const canvas = document.querySelector("canvas.webgl");

  const debugBtn0 = document.querySelector(".debug-btn.debug-btn-0");
  const deviceBtnKRLight1 = document.querySelector(".device-btn[data-room='kitchen'].bulb-1 .device-btn-item.action");
  const deviceBtnKRLight2 = document.querySelector(".device-btn[data-room='kitchen'].bulb-2 .device-btn-item.action");
  const deviceBtnBRLight1 = document.querySelector(".device-btn[data-room='bedroom'].bulb-1 .device-btn-item.action");
  const deviceBtnBRLight2 = document.querySelector(".device-btn[data-room='bedroom'].bulb-2 .device-btn-item.action");
  const deviceBtnLRLight1 = document.querySelector(
    ".device-btn[data-room='livingroom'].bulb-1 .device-btn-item.action"
  );
  const deviceBtnLRLight2 = document.querySelector(
    ".device-btn[data-room='livingroom'].bulb-2 .device-btn-item.action"
  );
  const deviceBtnBRCurtains = document.querySelector(
    ".device-btn[data-room='bedroom'].curtains .device-btn-item.action"
  );
  const deviceBtnKRCleaner = document.querySelector(".device-btn[data-room='kitchen'].cleaner .device-btn-item.action");
  const deviceBtnLRTVStation = document.querySelector(".device-btn[data-room='livingroom'].tv .device-btn-item.action");
  const deviceBtnLRCond = document.querySelector(".device-btn[data-room='livingroom'].cond .device-btn-item.action");
  const deviceBtnLRTape = document.querySelector(".device-btn[data-room='livingroom'].tape .device-btn-item.action");
  const deviceBtnKRTape = document.querySelector(".device-btn[data-room='kitchen'].tape .device-btn-item.action");
  const deviceBtnBRTape = document.querySelector(".device-btn[data-room='bedroom'].tape .device-btn-item.action");
  const deviceBtnsHund = [
    document.querySelector(".device-btn[data-room='bedroom'].humd .device-btn-item.action"),
    document.querySelector(".device-btn[data-room='livingroom'].humd .device-btn-item.action"),
  ];
  const phoneIconBtn = document.querySelector(".phone-icon");

  const audioHumd = document.querySelector("audio#humd");
  const audioBg = document.querySelector("audio#bg-mus");
  const bgMusicBtn = document.querySelector(".bg-music-icon");

  const loader = document.querySelector(".loader");

  const firsgTouchScreen = document.querySelector(".first-touch");

  canvas.addEventListener("click", () => {
    firsgTouchScreen.classList.add("hidden");
  });

  const phone = document.querySelector(".phone");
  const appRoomsItems = document.querySelectorAll(".room-item");
  const appDevicesItems = document.querySelectorAll(".device-btn");
  const appDevicesInfoBtns = document.querySelectorAll(".device-btn-item.info");

  let infoObject;

  const infoBox = document.querySelector(".info-box");
  const infoBoxCloseBtn = document.querySelector(".info-box-close");

  const roomLights = {
    global: null,
    kitchen: {
      spotLight1: null,
      spotLight2: null,
      spotLight3: null,
      rectLight: null,
    },
    bedroom: {
      spotLight1: null,
      spotLight2: null,
      rectLight: null,
    },
    livingroom: {
      spotLight1: null,
      spotLight2: null,
      spotLight3: null,
      rectLight: null,
    },
  };

  const scene = new THREE.Scene();

  let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor("#966463");

  let controls;

  const textureLoader = new THREE.TextureLoader();

  const axesHelper = new THREE.AxesHelper(5);
  if (isDevMode) {
    scene.add(axesHelper);
  }

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("./../assets/draco/");

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  roomLights.global = new THREE.AmbientLight(0xffffff, 1);
  scene.add(roomLights.global);

  gltfLoader.load(
    "./../assets/models/room/3d-room.gltf",
    function (gltf) {
      const modelCamera = gltf.scene.getObjectByName("RS_Camera");
      if (modelCamera && modelCamera.isCamera) {
        updateCamera(modelCamera);
      }

      updateMaterials(gltf.scene);

      setLights();

      initEventListeners();

      scene.add(gltf.scene);

      loader.classList.add("hidden");
    },
    undefined,
    function (error) {
      console.error("Ошибка загрузки модели:", error);
    }
  );

  function updateCamera(modelCamera) {
    camera.fov = modelCamera.fov;

    camera.position.copy(modelCamera.position);
    camera.rotation.copy(modelCamera.rotation);
    camera.updateProjectionMatrix();

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.y = 2.5;
    controls.enableDamping = isDevMode ? false : true;
    controls.dampingFactor = 0.01;
    controls.rotateSpeed = isDevMode ? 0.5 : 0.4;
    controls.zoomSpeed = isDevMode ? 0.8 : 0.15;
    controls.panSpeed = isDevMode ? 0.8 : 0;

    controls.minPolarAngle = isDevMode ? -Infinity : Math.PI / 40;
    controls.maxPolarAngle = isDevMode ? Infinity : Math.PI / 2;
    controls.enablePan = isDevMode ? true : false;
    controls.minAzimuthAngle = isDevMode ? -Infinity : -Math.PI / 40;
    controls.maxAzimuthAngle = isDevMode ? Infinity : Math.PI / 2;

    controls.minDistance = isDevMode ? 0 : 50;
    controls.maxDistance = isDevMode ? 200 : 80;
    controls.update();
  }

  function updateMaterials(scene) {
    const alphaTexturePlant = textureLoader.load("./../assets/textures/plant_alpha_texture.png", (loadedTexture) => {
      loadedTexture.flipY = false;
      loadedTexture.encoding = THREE.sRGBEncoding;
    });

    const alphaTextureCleanerShadow = textureLoader.load(
      "./../assets/textures/cleaner-shadow-texture-alpha.png",
      (loadedTexture) => {
        loadedTexture.flipY = false;
        loadedTexture.encoding = THREE.sRGBEncoding;
      }
    );

    const alphaTextureBedLight = textureLoader.load("./../assets/textures/light-texture-1.png", (loadedTexture) => {
      loadedTexture.flipY = false;
      loadedTexture.encoding = THREE.sRGBEncoding;
    });

    scene.traverse((child) => {
      if (child.name === "plant_lv" || child.name === "plant_br" || child.name === "plant_kt") {
        child.material.alphaMap = alphaTexturePlant;
        child.material.opacity = 1;
        child.material.transparent = true;
        child.material.needsUpdate = true;
      }

      if (child.name === "curtains_lv" || child.name === "curtain_right_br" || child.name === "curtain_left_br") {
        child.material.transparent = true;
        child.material.opacity = 0.8;
        child.material.needsUpdate = true;
      }

      if (child.name === "cleaner_robot_shadow_kt") {
        child.material.alphaMap = alphaTextureCleanerShadow;
        child.material.transparent = true;
        child.material.needsUpdate = true;
      }

      if (child.name === "bed_emissive_br") {
        child.material.alphaMap = alphaTextureBedLight;
        child.material.opacity = 0;
        child.material.transparent = true;
        child.material.color.set(0x000000);
        child.material.emissive.set("#fff3e4");
        child.material.emissiveIntensity = 0;
        child.material.needsUpdate = true;
      }
    });
  }

  function initEventListeners() {
    if (isDevMode) {
      debugBtn0.addEventListener("click", () => {
        turnOffLight(roomLights.global, 1, debugBtn0);
      });
    } else {
      debugBtn0.style.display = "none";
    }

    deviceBtnKRLight1.addEventListener("click", () => {
      turnOffLight(roomLights.kitchen.spotLight1, 4, deviceBtnKRLight1);
      turnOffLight(roomLights.kitchen.spotLight2, 4, deviceBtnKRLight1);
    });

    deviceBtnKRLight2.addEventListener("click", () => {
      turnOffLight(roomLights.kitchen.spotLight3, 9, deviceBtnKRLight2);
    });

    deviceBtnBRLight1.addEventListener("click", () => {
      turnOffLight(roomLights.bedroom.spotLight1, 7, deviceBtnBRLight1);
    });

    deviceBtnBRLight2.addEventListener("click", () => {
      turnOffLight(roomLights.bedroom.spotLight2, 7, deviceBtnBRLight2);
    });

    deviceBtnLRLight1.addEventListener("click", () => {
      turnOffLight(roomLights.livingroom.spotLight1, 12, deviceBtnLRLight1);
      turnOffLight(roomLights.livingroom.spotLight2, 12, deviceBtnLRLight1);
    });

    deviceBtnLRLight2.addEventListener("click", () => {
      turnOffLight(roomLights.livingroom.spotLight3, 10, deviceBtnLRLight2);
    });

    deviceBtnBRCurtains.addEventListener("click", () => {
      const curtainRight = scene.getObjectByName("curtain_right_br");
      const curtainLeft = scene.getObjectByName("curtain_left_br");

      let xValue;

      if (curtainLeft.scale.x === 1 || curtainLeft.scale.x === 1.955) {
        xValue = 0.3;
      } else {
        xValue = 1.955;
      }

      deviceBtnBRCurtains.classList.add("busy");

      curtainsGSAPAnimation(curtainRight, xValue);
      curtainsGSAPAnimation(curtainLeft, xValue);
    });

    deviceBtnKRCleaner.addEventListener("click", () => {
      const foundCleaner = scene.getObjectByName("cleaner_robot_kt");

      const timelineCleaner = gsap.timeline();

      deviceBtnKRCleaner.classList.add("busy");

      timelineCleaner
        .to(foundCleaner.position, { y: -105, duration: 1.5, ease: "power1.inOut" })
        .to(foundCleaner.rotation, { z: -0.5 * Math.PI, duration: 1.5, ease: "power1.inOut" }, "+=0.15")
        .to(foundCleaner.position, { x: -60, duration: 2, ease: "power1.inOut" }, "+=0.15")
        .to(foundCleaner.rotation, { z: -Math.PI, duration: 1.5, ease: "power1.inOut" }, "+=0.15")
        .to(foundCleaner.position, { y: 280, duration: 4, ease: "power1.inOut" }, "+=0.15")
        .to(foundCleaner.rotation, { z: -1.5 * Math.PI, duration: 1.5, ease: "power1.inOut" }, "+=0.15")
        .to(foundCleaner.position, { x: 620, duration: 6, ease: "power1.inOut" }, "+=0.15")
        .to(foundCleaner.rotation, { z: -2 * Math.PI, duration: 1.5, ease: "power1.inOut" }, "+=0.15")
        .to(foundCleaner.position, { y: -100, duration: 4, ease: "power1.inOut" }, "+=0.15")
        .to(foundCleaner.rotation, { z: -2.5 * Math.PI, duration: 1.5, ease: "power1.inOut" }, "+=0.15")
        .to(foundCleaner.position, { x: 58, duration: 6, ease: "power1.inOut" }, "+=0.15")
        .to(foundCleaner.rotation, { z: -3 * Math.PI, duration: 1.5, ease: "power1.inOut" }, "+=0.15")
        .to(foundCleaner.position, { y: -162, duration: 4, ease: "power1.inOut" }, "+=0.15")
        .eventCallback("onComplete", () => {
          deviceBtnKRCleaner.classList.remove("busy");
        });
    });

    deviceBtnLRTVStation.addEventListener("click", () => {
      const tvScreen = scene.getObjectByName("tv_screen_lv");
      tvScreen.visible = !tvScreen.visible;
      deviceBtnLRTVStation.classList.toggle("active");
    });

    deviceBtnLRCond.addEventListener("click", () => {
      const conditionerPart = scene.getObjectByName("conditioner_moving_part_lv");

      const rotationValue = conditionerPart.rotation.x === 0 ? Math.PI / 2 : 0;

      deviceBtnLRCond.classList.add("busy");

      gsap.to(conditionerPart.rotation, {
        x: rotationValue,
        duration: 2,
        onComplete: () => {
          deviceBtnLRCond.classList.remove("busy");
        },
      });
    });

    deviceBtnLRTape.addEventListener("click", () => {
      turnOffLight(roomLights.livingroom.rectLight, 4, deviceBtnLRTape);
    });

    deviceBtnKRTape.addEventListener("click", () => {
      turnOffLight(roomLights.kitchen.rectLight, 4, deviceBtnKRTape);
    });

    deviceBtnBRTape.addEventListener("click", () => {
      const bedLight = scene.getObjectByName("bed_emissive_br");

      if (bedLight.material.opacity === 0) {
        bedLight.material.emissiveIntensity = 1;
        bedLight.material.opacity = 1;
        deviceBtnBRTape.classList.add("active");
      } else {
        bedLight.material.emissiveIntensity = 0;
        bedLight.material.opacity = 0;
        deviceBtnBRTape.classList.remove("active");
      }
    });

    phoneIconBtn.addEventListener("click", () => {
      phone.classList.toggle("active");
    });

    appDevicesInfoBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const objectNameBtn = btn.getAttribute("data-info-btn");

        const productInfo = searchProductInfo(objectNameBtn);
        updateInfoBoxMarkUp(productInfo);

        scene.traverse((object) => {
          if (object.isMesh && object.name !== objectNameBtn) {
            object.material.color.setRGB(0.01, 0.01, 0.01);
            object.material.needsUpdate = true;
          } else if (object.isMesh) {
            object.material.color.setRGB(1, 1, 1);
          }
        });

        infoObject = scene.getObjectByName(objectNameBtn);

        updateInfoBox(infoObject);
      });
    });

    deviceBtnsHund.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.classList.toggle("active");

        if (btn.classList.contains("active")) {
          playMusic(audioHumd);
        }
      });
    });

    bgMusicBtn.addEventListener("click", () => {
      if (!audioBg.paused) {
        audioBg.pause();
      } else {
        playMusic(audioBg);
      }
    });
  }

  function setLights() {
    setLightKitchen();
    setLightBedroom();
    setLightLivingRoom();
  }

  function setLightLivingRoom() {
    const spotLight12Settings = [0xffffff, 0, 4, 0.7, 1, 1];

    roomLights.livingroom.spotLight1 = new THREE.SpotLight(...spotLight12Settings);
    roomLights.livingroom.spotLight1.position.set(0.67, 2, -2.65);
    roomLights.livingroom.spotLight1.target.position.set(0.67, -10, 8);
    roomLights.livingroom.spotLight1.target.updateMatrixWorld();
    scene.add(roomLights.livingroom.spotLight1);

    roomLights.livingroom.spotLight2 = new THREE.SpotLight(...spotLight12Settings);
    roomLights.livingroom.spotLight2.position.set(4.05, 2, -2.65);
    roomLights.livingroom.spotLight2.target.position.set(4.05, -10, 8);
    roomLights.livingroom.spotLight2.target.updateMatrixWorld();
    scene.add(roomLights.livingroom.spotLight2);

    roomLights.livingroom.spotLight3 = new THREE.SpotLight(0xffffff, 0, 4, 1.15, 1, 1);
    roomLights.livingroom.spotLight3.position.set(0.8, 1.5, 1.315);
    roomLights.livingroom.spotLight3.target.position.set(0.8, -10, 1.315);
    roomLights.livingroom.spotLight3.target.updateMatrixWorld();
    scene.add(roomLights.livingroom.spotLight3);

    roomLights.livingroom.rectLight = new THREE.RectAreaLight(0xffffff, 0, 2.2, 0.6);
    roomLights.livingroom.rectLight.position.set(2.34, 0.4, -2.51);
    roomLights.livingroom.rectLight.rotation.set(0, 0, 0);
    scene.add(roomLights.livingroom.rectLight);
  }

  function setLightBedroom() {
    roomLights.bedroom.spotLight1 = new THREE.SpotLight(0xffffff, 0, 3, 1.4, 0.5, 1);
    roomLights.bedroom.spotLight1.position.set(-3.94, 5, -1.35);
    roomLights.bedroom.spotLight1.target.position.set(-3.94, -10, 1);
    roomLights.bedroom.spotLight1.target.updateMatrixWorld();
    scene.add(roomLights.bedroom.spotLight1);

    roomLights.bedroom.spotLight2 = new THREE.SpotLight(0xffffff, 0, 3, 1, 1, 0.5);
    roomLights.bedroom.spotLight2.position.set(-0.45, 3.8, -0.1);
    roomLights.bedroom.spotLight2.target.position.set(-10, -10, 5);
    roomLights.bedroom.spotLight2.target.updateMatrixWorld();
    scene.add(roomLights.bedroom.spotLight2);
  }

  function setLightKitchen() {
    const spotLight12Settings = [0xffffff, 0, 4, 1.3, 1, 1];

    roomLights.kitchen.spotLight1 = new THREE.SpotLight(...spotLight12Settings);
    roomLights.kitchen.spotLight1.position.set(-2.4, 1.7, -0.3);
    roomLights.kitchen.spotLight1.target.position.set(-2.4, -10, -0.3);
    roomLights.kitchen.spotLight1.target.updateMatrixWorld();
    scene.add(roomLights.kitchen.spotLight1);

    roomLights.kitchen.spotLight2 = new THREE.SpotLight(...spotLight12Settings);
    roomLights.kitchen.spotLight2.position.set(-2.4, 1.7, 0.4);
    roomLights.kitchen.spotLight2.target.position.set(-2.4, -10, 0.4);
    roomLights.kitchen.spotLight2.target.updateMatrixWorld();
    scene.add(roomLights.kitchen.spotLight2);

    roomLights.kitchen.spotLight3 = new THREE.SpotLight(0xffffff, 0, 4.5, 1.7, 1, 1);
    roomLights.kitchen.spotLight3.position.set(-2.4, 2.8, 0.02);
    roomLights.kitchen.spotLight3.target.position.set(-2.4, -10, 0.02);
    roomLights.kitchen.spotLight3.target.updateMatrixWorld();
    scene.add(roomLights.kitchen.spotLight3);

    roomLights.kitchen.rectLight = new THREE.RectAreaLight(0xffffff, 0, 3.15, 0.3);
    roomLights.kitchen.rectLight.position.set(-4.6, 1.32, -1.1);
    roomLights.kitchen.rectLight.rotation.set(-0.5 * Math.PI, 0, 0.5 * Math.PI);
    scene.add(roomLights.kitchen.rectLight);
  }

  function turnOffLight(light, maxValue, btn) {
    if (light.intensity === 0) {
      light.intensity = maxValue;
      btn.classList.add("active");
    } else {
      light.intensity = 0;
      btn.classList.remove("active");
    }
  }

  function curtainsGSAPAnimation(curtain, xValue) {
    gsap.to(curtain.scale, {
      x: xValue,
      duration: 2,
      ease: "power1.inOut",
      onComplete: () => {
        deviceBtnBRCurtains.classList.remove("busy");
      },
    });
  }

  function updateInfoBox(object) {
    const vector = new THREE.Vector3();
    object.updateMatrixWorld();
    vector.setFromMatrixPosition(object.matrixWorld);
    vector.project(camera);

    const widthHalf = 0.5 * renderer.getContext().canvas.width;
    const heightHalf = 0.5 * renderer.getContext().canvas.height;
    vector.x = vector.x * widthHalf + widthHalf;
    vector.y = -(vector.y * heightHalf) + heightHalf;

    infoBox.style.left = vector.x + "px";
    infoBox.style.top = vector.y + "px";
    infoBox.style.display = "block";
  }

  function searchProductInfo(key) {
    for (let index = 0; index < devices.length; index++) {
      const arrKeys = devices[index].deviceKey;
      const result = arrKeys.find((k) => k === key);
      if (result) {
        return devices[index];
        break;
      }
    }
  }

  function updateInfoBoxMarkUp(data) {
    const devicesName = document.querySelector(".info-box-name");
    const deviceDescr = document.querySelector(".info-box-about");
    const deviceUrl = document.querySelector(".info-box-url");

    devicesName.textContent = data.productName;
    deviceDescr.textContent = data.productDescr;
    deviceUrl.href = data.deviceUrl;
  }

  infoBoxCloseBtn.addEventListener("click", () => {
    infoBox.style.left = null;
    infoBox.style.top = null;
    infoBox.style.display = null;
    infoObject = null;

    scene.traverse((object) => {
      if (object.isMesh) {
        if (object.name === "tv_screen_lv") {
          object.material.color.setRGB(0.01, 0.01, 0.01);
        } else {
          object.material.color.setRGB(1, 1, 1);
        }
        object.material.needsUpdate = true;
      }
    });
  });

  appRoomsItems.forEach((item) => {
    item.addEventListener("click", () => {
      appRoomsItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      const roomType = item.getAttribute("data-room");

      appDevicesItems.forEach((device) => {
        if (roomType !== "all") {
          device.style.display = null;
          const deviceRoom = device.getAttribute("data-room");
          if (deviceRoom !== roomType) {
            device.style.display = "none";
          }
        } else {
          device.style.display = null;
        }
      });
    });
  });

  function playMusic(audio) {
    audio.currentTime = 0;
    audio.play();
  }

  function animate() {
    requestAnimationFrame(animate);
    if (controls) {
      controls.update();
    }

    if (infoObject) {
      updateInfoBox(infoObject);
    }

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener("resize", function () {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
});
