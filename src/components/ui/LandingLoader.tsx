'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Terminal, Cpu, ShieldCheck } from 'lucide-react'

interface LandingLoaderProps {
    onComplete: () => void
}

const statusMessages = [
    "Initializing Core Systems...",
    "Loading Data Models...",
    "Verifying Identity Graph...",
    "Activating Neural Engine...",
    "Ready."
]

export default function LandingLoader({ onComplete }: LandingLoaderProps) {
    const [statusIndex, setStatusIndex] = useState(0)

    // Cycle status messages
    useEffect(() => {
        const interval = setInterval(() => {
            setStatusIndex(prev => {
                if (prev < statusMessages.length - 1) return prev + 1
                return prev
            })
        }, 400)

        // Force complete after 2.5s
        const timer = setTimeout(() => {
            onComplete()
        }, 2500)

        return () => {
            clearInterval(interval)
            clearTimeout(timer)
        }
    }, [onComplete])

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden selection:bg-cyan-500/30">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

            {/* Scanning Line */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-[10px] w-full"
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 2, ease: "linear", repeat: 0 }}
            />

            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* Logo / Icon Animation */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                    className="relative"
                >
                    <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10" />
                        <Sparkles className="w-8 h-8 text-cyan-400" />
                    </div>
                </motion.div>

                {/* Main Text Stagger */}
                <div className="overflow-hidden">
                    <motion.h1
                        className="text-4xl md:text-6xl font-black tracking-tighter text-white"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    >
                        MDF <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">SIMULATOR</span>
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
                        <Cpu className="w-3 h-3" /> CORE-V2
                    </motion.div>
                    <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                        className="flex items-center gap-1.5 text-purple-500 font-mono border border-purple-500/20 px-2 py-1 rounded"
                    >
                        <ShieldCheck className="w-3 h-3" /> SECURE
                    </motion.div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 w-full origin-left transform scale-x-0 animate-[progress_2.5s_ease-in-out_forwards]" style={{ animationFillMode: 'forwards' }} />
            <style jsx>{`
                @keyframes progress {
                    0% { transform: scaleX(0); }
                    100% { transform: scaleX(1); }
                }
            `}</style>
        </div>
    )
}
