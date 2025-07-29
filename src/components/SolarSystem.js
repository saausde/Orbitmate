import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const SolarSystem = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 이전에 있던 canvas 제거 (마운트될 때도 한번)
    if (mountRef.current) {
      while (mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(5, 10, 20);

    // 배경 투명하게
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // 조명
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.2, 300);
    pointLight.position.set(0, 10, 0); // 태양 위쪽으로 살짝 올림
    scene.add(pointLight);

    // 태양
    const loader = new GLTFLoader();
    loader.load(
      "/models/sun2.glb",
      (gltf) => {
        const sun = gltf.scene;
        sun.scale.set(0.1, 0.1, 0.1);
        sun.position.set(0, 0, 0);
        scene.add(sun);
      },
      undefined,
      (error) => {
        console.error("Failed to load Sun model:", error);
      }
    );
    // 행성들 설정
    const planetConfigs = [
      {
        name: "Mercury",
        distance: 5,
        path: "/models/mercury2.glb",
        scale: 0.03,
      },
      { name: "Venus", distance: 7, path: "/models/venus.glb", scale: 0.5 },
      { name: "Earth", distance: 9, path: "/models/earth.glb", scale: 0.6 },
      { name: "Mars", distance: 11, path: "/models/mars.glb", scale: 0.4 },
      {
        name: "Jupiter",
        distance: 13,
        path: "/models/jupiter1.glb",
        scale: 0.8,
      },
      {
        name: "Saturn",
        distance: 13.5,
        path: "/models/saturn.glb",
        scale: 0.0005,
      },
      { name: "Uranus", distance: 38, path: "/models/uranus.glb", scale: 0.8 },
      {
        name: "Neptune",
        distance: 16,
        path: "/models/neptune2.glb",
        scale: 0.5,
      },
    ];

    const planetModels = [];

    planetConfigs.forEach(({ name, distance, path, scale }, index) => {
      loader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(scale, scale, scale);
          scene.add(model);
          planetModels.push({
            model,
            distance,
            speed: 0.01 + Math.random() * 0.01,
          });
        },
        undefined,
        (error) => {
          console.error(`Failed to load ${name}:`, error);
        }
      );
    });

    // 카메라 컨트롤
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 애니메이션 루프
    const animate = () => {
      requestAnimationFrame(animate);

      planetModels.forEach(({ model, distance, speed }, i) => {
        const angle = Date.now() * 0.0001 * (i + 1);
        model.position.x = Math.cos(angle * speed * 100) * distance;
        model.position.z = Math.sin(angle * speed * 100) * distance;
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 클린업
    return () => {
      if (mountRef.current) {
        while (mountRef.current.firstChild) {
          mountRef.current.removeChild(mountRef.current.firstChild);
        }
      }
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "transparent",
        position: "absolute", // 위치 조정 가능하게 만듦
        top: "-7%", // 위쪽에 붙이기
      }}
    />
  );
};

export default SolarSystem;
