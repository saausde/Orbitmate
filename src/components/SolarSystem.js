import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const SolarSystem = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(5, 3, 23);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // 조명
    const ambientLight = new THREE.AmbientLight(0xffffff, 3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 300);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    const loader = new GLTFLoader();
    let sunModel = null;
    const sunRotationSpeed = -0.002;

    // 🌞 태양
    loader.load(
      "/models_LowPloy/Sun_lowPoly.glb",
      (gltf) => {
        const sun = gltf.scene;
        sun.scale.set(2.4, 2.4, 2.4);
        sun.position.set(0, 0, 0);
        scene.add(sun);
        sunModel = sun;
      },
      undefined,
      (error) => console.error("Failed to load Sun model:", error)
    );

    // 🪐 행성 정의 (각각 Y 위치도 추가)
    const planetConfigs = [
      {
        name: "Mercury",
        distance: 5,
        path: "/models_LowPloy/Planet_lowPloy2.glb",
        scale: 0.2,
        speed: 0.02,
        y: -0.3,
      },
      {
        name: "Venus",
        distance: 6.3,
        path: "/models_LowPloy/venus_lowPoly.glb",
        scale: 0.3,
        speed: 0.015,
        y: -0.3,
      },
      {
        name: "Earth",
        distance: 8,
        path: "/models_LowPloy/Satellite orbiting Earth_lowPloy.glb",
        scale: 0.003,
        speed: 0.03,
        y: 0.4,
      },
      {
        name: "Mars",
        distance: 10.5,
        path: "/models_LowPloy/mars_lowPoly.glb",
        scale: 0.2,
        speed: 0.01,
        y: 0.4,
      },
      {
        name: "Jupiter",
        distance: 12.4,
        path: "/models_LowPloy/Jupiter_lowPloy.glb",
        scale: 0.02,
        speed: 0.05,
        y: -2,
      },
      {
        name: "Saturn",
        distance: 16,
        path: "/models_LowPloy/Saturn_lowPloy.glb",
        scale: 1.5,
        speed: 0.0000000000003,
        y: 0.6,
      },
      {
        name: "Uranus",
        distance: 18,
        path: "/models_LowPloy/Uranus_lowPloy2.glb",
        scale: 1.5,
        speed: 0.006,
        y: 1.3,
      },
      {
        name: "Neptune",
        distance: 15,
        path: "/models_LowPloy/Neptune_lowPoly.glb",
        scale: 1,
        speed: 0.005,
        y: 0.5,
      },
    ];

    const planetModels = [];

    planetConfigs.forEach(({ name, distance, path, scale, y }) => {
      loader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(scale, scale, scale);
          model.position.y = y; // Y축 위치 반영
          scene.add(model);
          planetModels.push({
            model,
            distance,
            speed: 0.0007 + Math.random() * 0.005,
          });
        },
        undefined,
        (error) => console.error(`Failed to load ${name}:`, error)
      );
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const animate = () => {
      requestAnimationFrame(animate);

      planetModels.forEach(({ model, distance, speed }, i) => {
        const angle = Date.now() * 0.0001 * (i + 1);
        model.position.x = Math.cos(angle * speed * 100) * distance;
        model.position.z = Math.sin(angle * speed * 100) * distance;
        model.rotation.y += -0.005;
      });

      if (sunModel) {
        sunModel.rotation.y += sunRotationSpeed;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      controls.dispose();
      while (mount.firstChild) {
        mount.removeChild(mount.firstChild);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100vw",
        height: "107vh",
        position: "absolute",
        top: "-7%",
        left: 0,
        backgroundColor: "transparent",
      }}
    />
  );
};

export default SolarSystem;
