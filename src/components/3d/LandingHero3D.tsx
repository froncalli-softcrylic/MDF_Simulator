'use client'

import React, { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Float, MeshDistortMaterial, Environment } from '@react-three/drei'
import * as THREE from 'three'

// Background dust particles
function DataParticles(props: any) {
    const ref = useRef<THREE.Points>(null!)

    const [positions] = useMemo(() => {
        const count = 300
        const positions = new Float32Array(count * 3)

        for (let i = 0; i < count; i++) {
            const r = 6 + Math.random() * 8 // Wider spread
            const theta = 2 * Math.PI * Math.random()
            const phi = Math.acos(2 * Math.random() - 1)

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            positions[i * 3 + 2] = r * Math.cos(phi)
        }
        return [positions]
    }, [])

    useFrame((state, delta) => {
        if (!ref.current) return
        ref.current.rotation.x -= delta / 30
        ref.current.rotation.y -= delta / 40
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
                    color="#88c0d0"
                    size={0.06}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.4}
                />
            </Points>
        </group>
    )
}

// The initial small spheres that merge
function IntroBubbles({ startAnimation }: { startAnimation: boolean }) {
    const count = 60
    const groupRef = useRef<THREE.Group>(null!)
    const startTimeRef = useRef<number | null>(null)

    // Rainbow palette for small spheres
    const rainbowColors = [
        '#ef4444', // red
        '#f97316', // orange
        '#eab308', // yellow
        '#22c55e', // green
        '#3b82f6', // blue
        '#a855f7', // purple
        '#ec4899', // pink
    ]

    const data = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            // Start position (scattered)
            startPos: new THREE.Vector3(
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 8
            ),
            // Speed factor
            speed: 0.5 + Math.random() * 0.5,
            scale: 0.2 + Math.random() * 0.3,
            // Random rainbow color
            color: rainbowColors[Math.floor(Math.random() * rainbowColors.length)]
        }))
    }, [])

    useFrame((state) => {
        if (!groupRef.current) return

        // Wait for start signal
        if (!startAnimation) {
            startTimeRef.current = null
            return
        }

        // Initialize start time
        if (startTimeRef.current === null) {
            startTimeRef.current = state.clock.elapsedTime
        }

        const t = state.clock.elapsedTime - startTimeRef.current
        const duration = 5.0 // Merge duration

        // Hide after merge complete plus a bit
        if (t > duration + 1) {
            groupRef.current.visible = false
            return
        }

        // Animate each child (instance-like) manually for control
        groupRef.current.children.forEach((child, i) => {
            const { startPos, speed, scale } = data[i]

            // Progress 0 -> 1
            // Use easeInQuad for "sucking in" effect
            let progress = Math.min(t * 0.5 * speed, 1)
            progress = progress * progress // Ease in

            // Lerp from start to center (0,0,0)
            child.position.lerpVectors(startPos, new THREE.Vector3(0, 0, 0), progress)

            // Scale down as they hit the center (to disappear into the big one)
            const proximity = child.position.length()
            if (proximity < 0.5) {
                child.scale.setScalar(Math.max(0, scale * proximity * 2))
            }
        })
    })

    return (
        <group ref={groupRef}>
            {data.map((d, i) => (
                <mesh key={i} scale={d.scale}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshStandardMaterial
                        color={d.color}
                        roughness={0.1}
                        metalness={0.1}
                        transparent
                        opacity={0.9}
                    />
                </mesh>
            ))}
        </group>
    )
}

// The main giant bubble that appears
function DataCore({ startAnimation }: { startAnimation: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null!)
    const materialRef = useRef<any>(null!) // MeshDistortMaterial ref
    const startTimeRef = useRef<number | null>(null)

    useFrame((state) => {
        if (!meshRef.current) return

        if (!startAnimation) {
            meshRef.current.scale.setScalar(0)
            startTimeRef.current = null
            return
        }

        if (startTimeRef.current === null) {
            startTimeRef.current = state.clock.elapsedTime
        }

        const t = state.clock.elapsedTime - startTimeRef.current

        // 1. Scale Animation (Start appearing: 4.0s -> 5.5s)
        const scaleStart = 4.0
        const scaleEnd = 5.5

        if (t < scaleStart) {
            meshRef.current.scale.setScalar(0)
        } else {
            let p = Math.min((t - scaleStart) / (scaleEnd - scaleStart), 1)
            // BackOut easing
            const c1 = 1.70158;
            const c3 = c1 + 1;
            const ease = 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
            meshRef.current.scale.setScalar(ease * 2.5)
        }

        // 2. Color Transition (Gray -> Rainbow Cycle)
        // Start color transition after fully formed (5.5s)
        if (t > 5.5 && materialRef.current) {
            // Cycle duration for one full rainbow loop
            const cycleDuration = 10
            // Time since transition start
            const cTime = t - 5.5

            // Simple HSL cycle: Hue iterates 0 -> 1 over cycleDuration
            // We start from 0 (red) but let's lerp into it
            const hue = (cTime % cycleDuration) / cycleDuration

            // If just started (< 1s), lerp from Gray to the Color
            const fadeTime = 2.0
            if (cTime < fadeTime) {
                const targetColor = new THREE.Color().setHSL(hue, 0.8, 0.5)
                const grayColor = new THREE.Color('#94a3b8') // Slate-400 equivalent

                // Smooth blend
                const blend = cTime / fadeTime
                materialRef.current.color.lerpColors(grayColor, targetColor, blend * 0.1) // Slow blend
                // Actually lerpColors modifies in place, let's be safer
                const finalColor = grayColor.clone().lerp(targetColor, blend)
                materialRef.current.color.copy(finalColor)
            } else {
                // Full rainbow cycle mode
                materialRef.current.color.setHSL(hue, 0.8, 0.6)
            }
        } else if (materialRef.current) {
            // Default Gray before transition
            materialRef.current.color.set('#94a3b8')
        }
    })

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef} scale={0}>
                <icosahedronGeometry args={[1, 15]} />
                <MeshDistortMaterial
                    ref={materialRef}
                    color="#94a3b8" // Start gray
                    envMapIntensity={0.4}
                    clearcoat={0.2}
                    clearcoatRoughness={0}
                    metalness={0.1}
                    distort={0.4}
                    speed={2}
                />
            </mesh>
        </Float>
    )
}

function Rig() {
    useFrame((state) => {
        state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 0 + state.pointer.x * 0.5, 0.05)
        state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 0 + state.pointer.y * 0.5, 0.05)
        state.camera.lookAt(0, 0, 0)
    })
    return null
}

export default function LandingHero3D({ startAnimation = true }: { startAnimation?: boolean }) {
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
                    <IntroBubbles startAnimation={startAnimation} />
                    <DataCore startAnimation={startAnimation} />
                    <DataParticles />
                    <Environment preset="city" />
                </React.Suspense>

                <Rig />
            </Canvas>
        </div>
    )
}
