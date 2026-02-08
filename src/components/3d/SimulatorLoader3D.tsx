'use client'

import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, Text } from '@react-three/drei'
import * as THREE from 'three'

// --- 3D Components ---

function PipelineNode({ position, color, delay, scale = 1 }: { position: [number, number, number], color: string, delay: number, scale?: number }) {
    const mesh = useRef<THREE.Mesh>(null!)
    const [visible, setVisible] = useState(false)

    useFrame((state) => {
        const elapsed = state.clock.elapsedTime
        if (elapsed > delay) {
            if (!visible) setVisible(true)
            // Scale up bounce effect
            const progress = Math.min((elapsed - delay) * 2, 1) // 0.5s to full scale
            const ease = 1 + Math.sin(Math.PI * progress) * 0.2 // slight bounce
            const currentScale = progress * (progress >= 1 ? 1 : ease) * scale
            mesh.current.scale.setScalar(currentScale)
        }
    })

    return (
        <group position={position}>
            <mesh ref={mesh} scale={[0, 0, 0]}>
                <boxGeometry args={[0.6, 0.6, 0.6]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
            </mesh>
        </group>
    )
}

function DataStream({ start, end, delay, color }: { start: [number, number, number], end: [number, number, number], delay: number, color: string }) {
    const ref = useRef<THREE.Group>(null!)
    const [active, setActive] = useState(false)

    useFrame((state) => {
        if (state.clock.elapsedTime > delay) {
            if (!active) setActive(true)
        }
    })

    if (!active) return null

    // Calculate length and rotation
    const startVec = new THREE.Vector3(...start)
    const endVec = new THREE.Vector3(...end)
    const direction = endVec.clone().sub(startVec)
    const length = direction.length()
    const midPoint = startVec.clone().add(direction.multiplyScalar(0.5))

    // LookAt rotation logic simplified:
    // Cylinder default is Y axis. We need to rotate it to match direction.
    // Ideally we put it in a group and lookAt, or use quaternion. 
    // Simplified: Just render small particles moving along the path.

    return (
        <group>
            {/* Static rail */}
            <mesh position={midPoint.toArray()} rotation={[0, 0, Math.PI / 2]} scale={[length, 0.05, 0.05]}>
                <cylinderGeometry args={[1, 1, 1, 8]} />
                <meshBasicMaterial color={color} transparent opacity={0.2} />
            </mesh>
            {/* Moving packets */}
            <MovingPacket start={start} end={end} color={color} offset={0} speed={2} />
            <MovingPacket start={start} end={end} color={color} offset={0.5} speed={2} />
        </group>
    )
}

function MovingPacket({ start, end, color, offset, speed }: any) {
    const mesh = useRef<THREE.Mesh>(null!)
    const startVec = useMemo(() => new THREE.Vector3(...start), [start])
    const endVec = useMemo(() => new THREE.Vector3(...end), [end])

    useFrame((state) => {
        const t = (state.clock.elapsedTime * speed + offset) % 1
        const pos = new THREE.Vector3().lerpVectors(startVec, endVec, t)
        mesh.current.position.copy(pos)
    })

    return (
        <mesh ref={mesh}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color={color} />
        </mesh>
    )
}

function CentralHub({ delay }: { delay: number }) {
    const group = useRef<THREE.Group>(null!)
    const [visible, setVisible] = useState(false)

    useFrame((state) => {
        const elapsed = state.clock.elapsedTime
        if (elapsed > delay) {
            if (!visible) setVisible(true)
            group.current.rotation.y += 0.02

            // Pulse scale
            const scale = 1 + Math.sin(elapsed * 3) * 0.05
            group.current.scale.setScalar(scale)
        } else {
            group.current.scale.setScalar(0)
        }
    })

    return (
        <group ref={group}>
            <mesh>
                <octahedronGeometry args={[1.2, 0]} />
                <meshStandardMaterial color="#88c0d0" wireframe transparent opacity={0.5} />
            </mesh>
            <mesh>
                <dodecahedronGeometry args={[0.8, 0]} />
                <meshStandardMaterial color="#5e81ac" roughness={0.1} metalness={0.8} />
            </mesh>
        </group>
    )
}

function PipelineScene() {
    // Sequence:
    // 0.0s: Start
    // 0.5s: Sources appear (Left)
    // 1.0s: Stream to Hub
    // 1.5s: Hub Activates (Center)
    // 2.0s: Stream to Dest
    // 2.5s: Destinations appear (Right)

    const sourceColor = "#a3be8c" // Green
    const hubColor = "#88c0d0"    // Blue
    const destColor = "#b48ead"   // Purple

    return (
        <group position={[0, 0, 0]}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>

                {/* Sources - Left */}
                <PipelineNode position={[-4, 1, 0]} color={sourceColor} delay={0.2} />
                <PipelineNode position={[-4, 0, 0]} color={sourceColor} delay={0.4} />
                <PipelineNode position={[-4, -1, 0]} color={sourceColor} delay={0.6} />

                {/* Streams Left -> Center */}
                <DataStream start={[-3.5, 1, 0]} end={[-1.5, 0, 0]} delay={0.8} color={sourceColor} />
                <DataStream start={[-3.5, 0, 0]} end={[-1.5, 0, 0]} delay={0.9} color={sourceColor} />
                <DataStream start={[-3.5, -1, 0]} end={[-1.5, 0, 0]} delay={1.0} color={sourceColor} />

                {/* Center Hub - Identity/Transform */}
                <CentralHub delay={1.2} />

                {/* Streams Center -> Right */}
                <DataStream start={[1.5, 0, 0]} end={[3.5, 1, 0]} delay={2.0} color={destColor} />
                <DataStream start={[1.5, 0, 0]} end={[3.5, 0, 0]} delay={2.1} color={destColor} />
                <DataStream start={[1.5, 0, 0]} end={[3.5, -1, 0]} delay={2.2} color={destColor} />

                {/* Destinations - Right */}
                <PipelineNode position={[4, 1, 0]} color={destColor} delay={2.3} />
                <PipelineNode position={[4, 0, 0]} color={destColor} delay={2.4} />
                <PipelineNode position={[4, -1, 0]} color={destColor} delay={2.5} />

            </Float>
        </group>
    )
}

// --- Main Text Logic ---

const LOADING_PHASES = [
    { time: 0, text: "INITIALIZING ENVIRONMENT" },
    { time: 500, text: "CONNECTING DATA SOURCES" },
    { time: 1500, text: "RESOLVING IDENTITY GRAPH" },
    { time: 2200, text: "ACTIVATING CHANNELS" },
    { time: 2800, text: "READY" }
]

export default function SimulatorLoader3D({
    isVisible,
    onLoadingComplete
}: {
    isVisible: boolean,
    onLoadingComplete?: () => void
}) {
    const [loadingText, setLoadingText] = useState(LOADING_PHASES[0].text)

    // Sync Text with Animation
    useEffect(() => {
        if (!isVisible) return

        const timers = LOADING_PHASES.map(phase =>
            setTimeout(() => setLoadingText(phase.text), phase.time)
        )

        return () => timers.forEach(clearTimeout)
    }, [isVisible])

    if (!isVisible) return null

    return (
        <div className="absolute inset-0 z-50 bg-slate-950 flex items-center justify-center transition-opacity duration-700">
            {/* 3D Scene */}
            <div className="w-full h-full absolute inset-0">
                <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <pointLight position={[-10, -5, -10]} color="#d08770" intensity={0.5} />

                    <PipelineScene />
                    <Environment preset="city" />
                </Canvas>
            </div>

            {/* Text Overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-6 mt-48">
                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-[0.2em] uppercase font-mono">
                        {loadingText}
                    </h2>
                    <div className="flex gap-1.5 mt-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:150ms]" />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse [animation-delay:300ms]" />
                    </div>
                </div>
            </div>
        </div>
    )
}
