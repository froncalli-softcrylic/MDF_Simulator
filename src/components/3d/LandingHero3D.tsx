'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Float, Sphere, MeshDistortMaterial, Environment } from '@react-three/drei'
import * as THREE from 'three'

function DataParticles(props: any) {
    const ref = useRef<THREE.Points>(null!)

    // Generate random points on a sphere
    const [positions, floatData] = useMemo(() => {
        const count = 300 // Number of data points
        const positions = new Float32Array(count * 3)
        const floatData = new Float32Array(count * 3) // For random movement

        for (let i = 0; i < count; i++) {
            const r = 4 + Math.random() * 5 // Radius from center
            const theta = 2 * Math.PI * Math.random()
            const phi = Math.acos(2 * Math.random() - 1)

            const x = r * Math.sin(phi) * Math.cos(theta)
            const y = r * Math.sin(phi) * Math.sin(theta)
            const z = r * Math.cos(phi)

            positions[i * 3] = x
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = z

            // Random float speeds
            floatData[i * 3] = (Math.random() - 0.5) * 0.02
            floatData[i * 3 + 1] = (Math.random() - 0.5) * 0.02
            floatData[i * 3 + 2] = (Math.random() - 0.5) * 0.02
        }
        return [positions, floatData]
    }, [])

    useFrame((state, delta) => {
        if (!ref.current) return

        // Rotate the entire cloud slowly
        ref.current.rotation.x -= delta / 20
        ref.current.rotation.y -= delta / 25

        // "Breathe" or float individual particles (simplified by just rotating the group for performance)
        // For more complex interactive movement, we'd update the positions array buffer here
    })

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} stride={3} frustumCulled={false} {...props}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={positions.length / 3}
                        array={positions}
                        itemSize={3}
                        args={[positions, 3]}
                    />
                </bufferGeometry>
                <PointMaterial
                    transparent
                    color="#88c0d0" // Cyan-ish data color
                    size={0.08}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.6}
                />
            </Points>
        </group>
    )
}

function DataCore() {
    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh scale={2.5}>
                <icosahedronGeometry args={[1, 15]} /> {/* High detail sphere */}
                <MeshDistortMaterial
                    color="#5e81ac"
                    envMapIntensity={0.4}
                    clearcoat={0.1}
                    clearcoatRoughness={0}
                    metalness={0.1}
                    distort={0.4} // Wobbly effect
                    speed={2} // Animation speed
                />
            </mesh>
        </Float>
    )
}

function Rig() {
    useFrame((state) => {
        // Parallax effect: Camera moves slightly with mouse
        state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 1 + state.pointer.x * 0.5, 0.05)
        state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 1 + state.pointer.y * 0.5, 0.05)
        state.camera.lookAt(0, 0, 0)
    })
    return null
}

export default function LandingHero3D() {
    return (
        <div className="absolute inset-0 z-0 h-screen w-full pointer-events-none">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 2]}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#d08770" />

                <React.Suspense fallback={null}>
                    <DataCore />
                    <DataParticles />
                    <Environment preset="city" />
                </React.Suspense>

                <Rig />
            </Canvas>
        </div>
    )
}
