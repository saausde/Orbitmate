// src/components/PlanetScene.js
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";

function PlanetModel() {
  const { scene } = useGLTF("/models/planet.glb");
  return <primitive object={scene} scale={0.8} />;
}

export default function PlanetScene() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "black" }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 2]} />
        <PlanetModel />
        <OrbitControls autoRotate enableZoom={false} />
      </Canvas>
    </div>
  );
}
