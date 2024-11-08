import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Sphere, useTexture, Stars, Html } from '@react-three/drei'
import { useSpring, a } from '@react-spring/three'
import * as THREE from 'three'
import './App.css'

interface PlanetData {
  name: string;
  texture: string;
  size: number;
  description: string;
  diameter: string;
  dayLength: string;
  yearLength: string;
}

const planets: PlanetData[] = [
  { name: 'Mercury', texture: 'mercury.jpeg', size: 0.383, description: 'The smallest planet in our solar system and closest to the Sun', diameter: '4,879 km', dayLength: '59 Earth days', yearLength: '88 Earth days' },
  { name: 'Venus', texture: 'venus.jpeg', size: 0.949, description: 'Often called Earth\'s twin because of their similar size and structure', diameter: '12,104 km', dayLength: '243 Earth days', yearLength: '225 Earth days' },
  { name: 'Earth', texture: 'earth.jpeg', size: 1, description: 'Our home planet and the only known place in the universe confirmed to host life', diameter: '12,742 km', dayLength: '24 hours', yearLength: '365.25 days' },
  { name: 'Mars', texture: 'mars.jpeg', size: 0.532, description: 'The Red Planet, known for its reddish appearance due to iron oxide on its surface', diameter: '6,779 km', dayLength: '24.6 hours', yearLength: '687 Earth days' },
  { name: 'Jupiter', texture: 'jupiter.jpeg', size: 11.21, description: 'The largest planet in our solar system, a gas giant with a Great Red Spot', diameter: '139,820 km', dayLength: '9.93 hours', yearLength: '11.86 Earth years' },
  { name: 'Saturn', texture: 'saturn.jpeg', size: 9.45, description: 'Known for its prominent ring system, composed mainly of ice particles', diameter: '116,460 km', dayLength: '10.7 hours', yearLength: '29.46 Earth years' },
  { name: 'Uranus', texture: 'uranus.jpeg', size: 4.01, description: 'An ice giant with a tilted rotation axis, causing extreme seasons', diameter: '50,724 km', dayLength: '17.24 hours', yearLength: '84 Earth years' },
  { name: 'Neptune', texture: 'neptune.jpeg', size: 3.88, description: 'The windiest planet in our solar system, with dark spots and blue color', diameter: '49,244 km', dayLength: '16.11 hours', yearLength: '164.79 Earth years' }
]

interface PlanetProps {
  texture: string;
  size: number;
  visible: boolean;
  planetData: PlanetData;
}

function Planet({ texture, size, visible, planetData }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const ringRef = useRef<THREE.Mesh>(null!)
  const { viewport } = useThree()
  const planetTexture = useTexture(`/src/textures/${texture}`)
  const [hovered, setHovered] = useState(false)

  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.1
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.05
    }
  })

  const baseSize = Math.min(viewport.width, viewport.height) / 8
  const scaledSize = baseSize * Math.pow(size, 1/3)  // Cube root for more reasonable scaling

  const { scale, opacity } = useSpring({
    scale: visible ? 1 : 0,
    opacity: visible ? 1 : 0,
    config: { mass: 1, tension: 280, friction: 60 }
  })

  return (
    <a.group
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <a.mesh ref={meshRef}>
        <sphereGeometry args={[scaledSize, 64, 64]} />
        <a.meshStandardMaterial map={planetTexture} transparent opacity={opacity} />
      </a.mesh>
      {planetData.name === 'Saturn' && (
        <a.mesh ref={ringRef} rotation-x={Math.PI / 2}>
          <ringGeometry args={[scaledSize * 1.2, scaledSize * 1.8, 64]} />
          <a.meshBasicMaterial color="#FFFFFF" transparent opacity={opacity.to(o => o * 0.2)} side={THREE.DoubleSide} />
        </a.mesh>
      )}
      {visible && (
        <Html position={[scaledSize * 1.5, 0, 0]}>
          <div className={`planet-info ${hovered ? 'visible' : ''}`}>
            <h2>{planetData.name}</h2>
            <p>{planetData.description}</p>
            <ul>
              <li><strong>Diameter:</strong> {planetData.diameter}</li>
              <li><strong>Day Length:</strong> {planetData.dayLength}</li>
              <li><strong>Year Length:</strong> {planetData.yearLength}</li>
            </ul>
          </div>
        </Html>
      )}
    </a.group>
  )
}

function Sunlight() {
  return (
    <directionalLight position={[5, 3, 5]} intensity={1} color="#ffffff" />
  )
}

function App() {
  const [currentPlanet, setCurrentPlanet] = useState(0)

  const changePlanet = useCallback((newDirection: number) => {
    setCurrentPlanet((prev) => (prev + newDirection + planets.length) % planets.length)
  }, [])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      changePlanet(1)
    } else if (event.key === 'ArrowLeft') {
      changePlanet(-1)
    }
  }, [changePlanet])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  const arrowButtonStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)',
    zIndex: 1000,
  };

  return (
    <div className="app-container">
      <Canvas camera={{ position: [0, 0, 20] }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.2} />
        <Sunlight />
        <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade />
        {planets.map((planet, index) => (
          <Planet
            key={planet.name}
            texture={planet.texture}
            size={planet.size}
            visible={index === currentPlanet}
            planetData={planet}
          />
        ))}
        <OrbitControls enableZoom={true} minDistance={5} maxDistance={50} />
      </Canvas>
      <button
        onClick={() => changePlanet(-1)}
        style={{
          ...arrowButtonStyle,
          left: '20px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.1)';
        }}
      >
        &#8592;
      </button>
      <button
        onClick={() => changePlanet(1)}
        style={{
          ...arrowButtonStyle,
          right: '20px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.1)';
        }}
      >
        &#8594;
      </button>
      <div className="instruction">
        Use arrow keys or buttons to switch planets. Scroll to zoom in/out.
      </div>
      <div className="planet-title">
        {planets[currentPlanet].name}
      </div>
    </div>
  )
}

export default App
