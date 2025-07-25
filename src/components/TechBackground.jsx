// import React from 'react';
import React, { useState, useRef, useMemo } from 'react';
// import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { Text, Environment, Float, MeshDistortMaterial, Line, Points } from '@react-three/drei';

// Digital Point Component
const DigitalPoint = ({ position, size, speed, color, index }) => {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);
  
  const { scale } = useSpring({
    scale: hovered ? 1.4 : 1,
    config: { mass: 1, tension: 280, friction: 60 }
  });
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    mesh.current.position.y = position[1] + Math.sin(t + index * 1000) * 0.2;
    mesh.current.position.x = position[0] + Math.cos(t + index * 1000) * 0.2;
  });
  
  return (
    <animated.mesh 
      ref={mesh} 
      position={position} 
      scale={scale} 
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </animated.mesh>
  );
};

// Digital Grid Network
const DigitalGridNetwork = ({ count = 50, spacing = 10, colors }) => {
  const points = [];
  const connections = [];
  
  // Create grid of points
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * spacing;
    const y = (Math.random() - 0.5) * spacing;
    const z = (Math.random() - 0.5) * spacing - 5; // Push back in z-direction
    points.push([x, y, z]);
  }
  
  // Create connections between nearby points
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const distance = Math.sqrt(
        Math.pow(points[i][0] - points[j][0], 2) +
        Math.pow(points[i][1] - points[j][1], 2) +
        Math.pow(points[i][2] - points[j][2], 2)
      );
      
      if (distance < 3) {
        connections.push({
          start: points[i],
          end: points[j],
          opacity: 1 - distance / 3 // Fade based on distance
        });
      }
    }
  }
  
  return (
    <group>
      {points.map((point, i) => (
        <DigitalPoint 
          key={i} 
          position={point} 
          size={0.05} 
          speed={(i % 3 + 1) * 0.2} 
          color={colors[i % colors.length]} 
          index={i}
        />
      ))}
      
      {connections.map((connection, i) => (
        <Line
          key={i}
          points={[connection.start, connection.end]}
          color={colors[i % colors.length]}
          lineWidth={1}
          transparent
          opacity={connection.opacity * 0.3}
        />
      ))}
    </group>
  );
};

// Floating Particles Background - Optimized version
const FloatingParticles = ({ count = 5000, size = 0.05, color }) => {
  const mesh = useRef();
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Vastly increased the spread range from 20 to 60
      let x = (Math.random() - 0.5) * 60;  // Wider x-axis spread
      let y = (Math.random() - 0.5) * 40;  // Wider y-axis spread
      let z = (Math.random() - 0.5) * 40 - 10;  // Wider z-axis spread with offset
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    
    return positions;
  }, [count]);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });
  
  return (
    <Points ref={mesh} positions={particlePositions} stride={3} frustumCulled={false}>
      <pointsMaterial 
        size={size} 
        color={color} 
        transparent 
        opacity={0.8}
        sizeAttenuation 
        depthWrite={false}
      />
    </Points>
  );
};

// Main 3D Background Component - optimized
const TechBackground = ({ darkMode }) => {
  const colors = ['#3b82f6', '#60a5fa', '#2563eb', '#1d4ed8'];
  
  return (
    <div className="absolute inset-0 z-0">
      <Canvas 
        camera={{ position: [0, 0, 15], fov: 60 }} // Adjusted camera position and FOV
        gl={{ powerPreference: "high-performance", antialias: false }}
      >
        <color attach="background" args={["#000"]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 10]} intensity={0.4} color="#fff" />
        
        <Float
          speed={1.5}
          rotationIntensity={0.2}
          floatIntensity={0.2}
        >
          <DigitalGridNetwork count={40} spacing={20} colors={colors} /> {/* Increased spacing */}
        </Float>
        
        <FloatingParticles count={5000} size={0.05} color="#60a5fa" /> {/* Increased count */}
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default TechBackground;