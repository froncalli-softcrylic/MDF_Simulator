import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Settings, ArrowRight } from 'lucide-react'

interface MdfConfigToastProps {
    visible: boolean
    onConfigure: () => void
    onDismiss?: () => void
}

export function MdfConfigToast({ visible, onConfigure, onDismiss }: MdfConfigToastProps) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    drag
                    dragMomentum={false}
                    whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 cursor-grab active:cursor-grabbing"
                >
                    <div className="bg-slate-900 border border-slate-700 text-slate-100 px-4 py-3 rounded-lg shadow-xl flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-full">
                                <Settings className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Configure MDF Hub</h4>
                                <p className="text-xs text-slate-400">Drill down to manage foundation components</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pl-4 border-l border-slate-700">
                            <Button
                                size="sm"
                                onClick={onConfigure}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
                            >
                                Configure
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                            {onDismiss && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onDismiss}
                                    className="text-slate-400 hover:text-slate-200"
                                >
                                    Dismiss
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
