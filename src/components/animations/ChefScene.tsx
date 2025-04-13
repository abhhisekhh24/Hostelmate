
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ChefCharacter } from './ChefCharacter';

export default function ChefScene() {
  return (
    <div className="w-full h-[150px] relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Suspense fallback={null}>
          <ChefCharacter position={[0, 0, 0]} />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center text-xl font-bold text-mess-600 dark:text-mess-400">
        Hi! Welcome Back!
      </div>
    </div>
  );
}
