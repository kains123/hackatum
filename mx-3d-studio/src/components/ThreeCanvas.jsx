import React, { Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useLoader } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  Html,
  useProgress,
} from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

function SceneLoader() {
  const { active, progress } = useProgress();

  if (!active) return null;

  return (
    <Html center>
      <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 px-4 py-2 text-xs font-medium text-slate-100 shadow-lg backdrop-blur">
        Loading {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

function PlaceholderModel() {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.1} roughness={0.5} />
      </mesh>
    </group>
  );
}

function ObjModel({ url }) {
  const obj = useLoader(OBJLoader, url);

  const centered = useMemo(() => {
    const clone = obj.clone(true);

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);

    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const scale = 1.5 / maxAxis; // scale so largest dimension ≈1.5 units
    clone.scale.setScalar(scale);

    // recenter to origin
    box.setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return clone;
  }, [obj]);

  return <primitive object={centered} />;
}

export function ThreeCanvas({ objUrl, modelName }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.6, 4], fov: 50 }}
      className="h-full w-full"
    >
      <Suspense fallback={null}>
        <color attach="background" args={['#020617']} />

        {/* Lights */}
        <ambientLight intensity={0.45} />
        <directionalLight
          castShadow
          intensity={1.1}
          position={[4, 6, 4]}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight intensity={0.4} position={[-3, 3, -3]} />

        {/* Ground */}
        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -1.1, 0]}
        >
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#020617" roughness={1} />
        </mesh>

        {/* Grid helper */}
        <gridHelper
          args={[20, 40, new THREE.Color('#1e293b'), new THREE.Color('#020617')]}
          position={[0, -1, 0]}
        />

        {/* Model / placeholder */}
        {objUrl ? <ObjModel url={objUrl} /> : <PlaceholderModel />}

        {/* Label in 3D space when a model is loaded */}
        {objUrl && modelName && (
          <Html position={[0, 1.4, 0]} center>
            <div className="rounded-full bg-slate-900/90 px-3 py-1 text-xs font-medium text-slate-100 shadow border border-slate-700/80 backdrop-blur">
              {modelName}
            </div>
          </Html>
        )}

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.7}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={1.5}
          maxDistance={10}
        />

        {/* Subtle env map; can remove if you need max perf */}
        <Environment preset="city" />
        <SceneLoader />
      </Suspense>
    </Canvas>
  );
}
