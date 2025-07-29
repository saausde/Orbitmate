import React, { useEffect, useRef } from "react";
import * as THREE from "three"; //Three.js전체를 불러옴
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"; //마우스로 3D 카메라를 회전/이동하게 해줌
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"; //glb 파일 로드할수있게 해주는것

const SolarSystem = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    //사용자 화면에 맞추는 용도 즉 client.width, height를 읽어서 저장
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // 씬, 카메라, 렌더러 설정
    const scene = new THREE.Scene(); //이곳이 공간
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000); //화면에서 보이는 시점
    camera.position.set(5, 3, 23); //카메라 위치

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); //실제로 브라우저에서 구현하는 곳
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // 투명
    mount.appendChild(renderer.domElement);

    // 조명
    const ambientLight = new THREE.AmbientLight(0xffffff, 2); //전체적으로 밝게
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.2, 300);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    const loader = new GLTFLoader(); //glb를 로더할수있는 loader 생성
    let sunModel = null;
    const sunRotationSpeed = -0.002; //태양 도는 속도
    // 태양
    loader.load(
      "/models/sun2.glb",
      (gltf) => {
        const sun = gltf.scene;
        sun.scale.set(0.1, 0.1, 0.1);
        sun.position.set(0, 0, 0);
        scene.add(sun);
        sunModel = sun; // 태양 모델 저장
      },
      undefined,
      (error) => console.error("Failed to load Sun model:", error)
    );

    // 행성 정보 정의
    const planetConfigs = [
      {
        name: "Mercury",
        distance: 5,
        path: "/models/mercury2.glb",
        scale: 0.03,
        speed: 0.02,
      },
      {
        name: "Venus",
        distance: 7,
        path: "/models/venus.glb",
        scale: 0.5,
        speed: 0.015,
      },
      {
        name: "Earth",
        distance: 8,
        path: "/models/earth4.glb",
        scale: 0.6,
        speed: 0.03,
      },
      {
        name: "Mars",
        distance: 10,
        path: "/models/mars3.glb",
        scale: 0.004,
        speed: 0.01,
      },
      {
        name: "Jupiter",
        distance: 11.5,
        path: "/models/jupiter1.glb",
        scale: 1,
        speed: 0.05,
      },
      {
        name: "Saturn",
        distance: 15,
        path: "/models/saturn.glb",
        scale: 0.001,
        speed: 0.0000000000003,
      },
      {
        name: "Uranus",
        distance: 18,
        path: "/models/uranus2.glb",
        scale: 0.0008,
        speed: 0.006,
      },
      {
        name: "Neptune",
        distance: 19,
        path: "/models/neptune2.glb",
        scale: 0.3,
        speed: 0.005,
      },
    ];

    const planetModels = [];

    planetConfigs.forEach(({ name, distance, path, scale }, index) => {
      loader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(scale, scale, scale);
          scene.add(model); //각각 지정한 행성들의 값을 여기서 로드해서 공간으로 보낸다
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

    // 카메라 컨트롤
    const controls = new OrbitControls(camera, renderer.domElement); //마우스로 카메라를 회전할수있게해줌
    controls.enableDamping = true;

    // 애니메이션 루프
    const animate = () => {
      requestAnimationFrame(animate); // 매 프레임마다 animate()를 다시 호출해서 끊임없이 움직이게함

      //이제 여기서 모든 행성의 값을 계산함
      planetModels.forEach(({ model, distance, speed }, i) => {
        const angle = Date.now() * 0.0001 * (i + 1); //실제 현재 시간을 가져와서 값이 점점 커지며 계속 돌게됨
        model.position.x = Math.cos(angle * speed * 100) * distance;
        model.position.z = Math.sin(angle * speed * 100) * distance;

        //행성 자전
        model.rotation.y += -0.005;
      });

      // 태양 자전 애니메이션
      if (sunModel) {
        sunModel.rotation.y += sunRotationSpeed; // y축 기준으로 천천히 돌기
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    //여기서 반응형 설정
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
