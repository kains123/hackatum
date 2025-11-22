import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  Html,
  useProgress,
} from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

// import { useMxConsole } from '../hooks/useMxConsole.js';
// --- 로더 UI 컴포넌트 ---
function SceneLoader() {

  const { active, progress } = useProgress();

  if (!active) return null;

  return (
    <Html center>
      <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 px-4 py-2 text-xs font-medium text-slate-100 shadow-lg backdrop-blur">
        로딩 중 {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

// --- 플레이스홀더 모델 컴포넌트 ---
function PlaceholderModel() {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.1} roughness={0.5} color="#4f46e5" />
      </mesh>
    </group>
  );
}

// --- OBJ 모델 컴포넌트 ---
// 'rotation' prop을 받아 모델의 방향을 제어합니다.
function ObjModel({ url, rotation, activeEvent }) {
  const obj = useLoader(OBJLoader, url);

  const centered = useMemo(() => {
    const clone = obj.clone(true);

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);

    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const scale = 1.5 / maxAxis; 
    clone.scale.setScalar(scale);

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

  // 회전 값 적용:
  return <primitive object={centered} rotation={rotation} scale={zoom} />
}

// --- 메인 캔버스 컴포넌트 ---
export function ThreeCanvas({ objUrl, modelName, activeEvent }) {
  // const mx = useMxConsole();
  // 1. 회전 상태 및 값 관리
  const [rotationY, setRotationY] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(0); 
  const [isRotating, setIsRotating] = useState(false); // 회전 여부 상태

  // 2. 키보드 이벤트 리스너 (R 키를 누르면 회전 토글)
  useEffect(() => {
    // const evt = mx.activeEvent;
    if (!!activeEvent) {
      console.log("hi useEffect():", activeEvent.value)
      if (!!activeEvent && activeEvent.type == "pressCount") {
        setRotationY(activeEvent.value)
      } else if (!!activeEvent && activeEvent.type == "zoom") {
        setZoomLevel(activeEvent.value)
      } 
      
    }
  }, [activeEvent]);

  // 3. 회전 로직 제어 컴포넌트
 //const RotateController = () => {
   // if (!!activeEvent && activeEvent.type == "pressCount") {
     //   console.log(activeEvent.type)
       // console.log(activeEvent.value + "active rotation")
      //  console.log(typeof activeEvent.value)
        // isRotating이 true일 때만 Y축 회전 값을 업데이트
      //  setRotationY(activeEvent.value); // 0.5는 회전 속도입니다.
     // }
   // return null;
  //};


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
        
        {/* 모델 / 플레이스홀더 */}
         {!!activeEvent ? 
        (<group rotation={[0, activeEvent.value, 0]}>
          {objUrl 
            ? <ObjModel url={objUrl} rotation={[0, activeEvent.value, 0]} activeEvent={activeEvent} /> 
            : <PlaceholderModel />
          }
        </group>):(<group rotation={[0, rotationY, 0]}>
          {objUrl 
            ? <ObjModel url={objUrl} rotation={[0, rotationY, 0]} activeEvent={activeEvent}/> 
            : <PlaceholderModel />
          }
        </group>)}
      

        {/* 모델이 로드되었을 때 3D 공간의 라벨 */}
        {objUrl && (
          <Html position={[0, 1.4, 0]} center>
            <div className="rounded-full bg-slate-900/90 px-3 py-1 text-xs font-medium text-slate-100 shadow border border-slate-700/80 backdrop-blur">
              모델 이름: {modelName || "이름 없음"} | 회전 상태: {isRotating ? "회전 중 (R: 멈춤)" : "정지 (R: 시작)"}
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

        <Environment preset="city" />
        <SceneLoader />
      </Suspense>
    </Canvas>
  );
}