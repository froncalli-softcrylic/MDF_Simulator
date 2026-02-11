'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Terminal, Cpu, Database, Network } from 'lucide-react'

interface SimulatorCinematicLoaderProps {
    onComplete?: () => void
}

const statusMessages = [
    "Initializing Physics Engine...",
    "Loading Node Catalog...",
    "Hydrating Graph State...",
    "Optimizing Layout...",
    "Ready."
]

export default function SimulatorCinematicLoader({ onComplete }: SimulatorCinematicLoaderProps) {
    const [statusIndex, setStatusIndex] = useState(0)

    // Cycle status messages
    useEffect(() => {
        const interval = setInterval(() => {
            setStatusIndex(prev => {
                if (prev < statusMessages.length - 1) return prev + 1
                return prev
            })
        }, 600) // Slightly slower to match the 3.5s parent timer

        // Force complete after 3.5s (matching SimulatorCanvas timer)
        const timer = setTimeout(() => {
            if (onComplete) onComplete()
        }, 3200)

        return () => {
            clearInterval(interval)
            clearTimeout(timer)
        }
    }, [onComplete])

    return (
        <motion.div
            className="absolute inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
        >
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

            {/* Scanning Line */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-[10px] w-full"
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 2, ease: "linear", repeat: Infinity }}
            />

            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* Logo / Icon Animation */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                    className="relative"
                >
                    <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10" />
                        <Network className="w-8 h-8 text-purple-400" />
                    </div>
                </motion.div>

                {/* Main Text Stagger */}
                <div className="overflow-hidden flex flex-col items-center gap-2">
                    <motion.h1
                        className="text-2xl md:text-3xl font-black tracking-tighter text-white text-center"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    >
                        MARKETING DATA FOUNDATION <br />
                        <span className="text-sm font-normal text-slate-400 mt-2 block tracking-widest uppercase">by Softcrylic</span>
                    </motion.h1>
                </div>

                {/* Status Console */}
                <motion.div
                    className="h-6 flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <Terminal className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-mono text-slate-400 min-w-[200px]">
                        {statusMessages[statusIndex]}
                        <span className="animate-blink">_</span>
                    </span>
                </motion.div>

                {/* Tech Badges cycling */}
                <div className="flex gap-4 mt-8 opacity-50">
                    <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex items-center gap-1.5 text-xs text-cyan-500 font-mono border border-cyan-500/20 px-2 py-1 rounded"
                    >
                        <Database className="w-3 h-3" /> GRAPH
                    </motion.div>
                    <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                        className="flex items-center gap-1.5 text-purple-500 font-mono border border-purple-500/20 px-2 py-1 rounded"
                    >
                        <Cpu className="w-3 h-3" /> ENGINE
                    </motion.div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 w-full origin-left transform scale-x-0 animate-[progress_3.2s_ease-in-out_forwards]" style={{ animationFillMode: 'forwards' }} />
            <style jsx>{`
                @keyframes progress {
                    0% { transform: scaleX(0); }
                    100% { transform: scaleX(1); }
                }
            `}</style>
        </motion.div>
    )
}
