
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';

export function ChefCharacter(props: { position?: [number, number, number] }) {
  const group = useRef<Group>(null);
  
  // Simple animation for the chef
  useFrame((state) => {
    if (group.current) {
      // Gentle bobbing motion
      const t = state.clock.getElapsedTime();
      group.current.position.y = Math.sin(t * 1.5) * 0.1 + props.position?.[1] || 0;
      // Gentle rotation
      group.current.rotation.y = Math.sin(t * 0.5) * 0.3;
    }
  });

  return (
    <group ref={group} position={props.position || [0, 0, 0]} scale={[0.6, 0.6, 0.6]}>
      {/* Simple chef geometry since we don't have a GLTF model */}
      <group>
        {/* Chef's body - white coat */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.5, 0.7, 1.2, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Chef's head */}
        <mesh position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#f8d9b4" />
        </mesh>
        
        {/* Chef's hat */}
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.5, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 1.9, 0]}>
          <sphereGeometry args={[0.42, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Chef's eyes */}
        <mesh position={[0.15, 1.1, 0.3]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[-0.15, 1.1, 0.3]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        
        {/* Chef's mouth - smiling */}
        <mesh position={[0, 0.9, 0.3]}>
          <torusGeometry args={[0.2, 0.04, 16, 32, Math.PI]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
        
        {/* Chef's arms */}
        <mesh position={[0.6, 0.2, 0]} rotation={[0, 0, Math.PI * 0.15]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.6, 0.2, 0]} rotation={[0, 0, -Math.PI * 0.15]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
      
      {/* Speech bubble saying "Hi!" */}
      <group position={[0.8, 1.5, 0]}>
        <mesh>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.3, -0.3, 0]} rotation={[0, 0, Math.PI * 0.25]}>
          <coneGeometry args={[0.2, 0.4, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Text "Hi!" */}
        <mesh position={[0, 0, 0.41]}>
          <planeGeometry args={[0.6, 0.2]} />
          <meshBasicMaterial 
            color="#000000" 
            transparent 
            opacity={0.8} 
            depthTest={false}
          />
        </mesh>
      </group>
    </group>
  );
}
