import { motion } from 'framer-motion'

const logos = [
    {
        name: 'Snowflake',
        path: (
            <path d="M12 2L14.5 6.5L12 11L9.5 6.5L12 2M12 22L9.5 17.5L12 13L14.5 17.5L12 22M2 12L6.5 9.5L11 12L6.5 14.5L2 12M22 12L17.5 14.5L13 12L17.5 9.5L22 12M5.5 5.5L8.5 8.5M18.5 18.5L15.5 15.5M5.5 18.5L8.5 15.5M18.5 5.5L15.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ),
        viewBox: "0 0 24 24"
    },
    {
        name: 'Databricks',
        path: (
            <path d="M12 2L2 7V17L12 22L22 17V7L12 2M12 12L17 9.5M12 12L7 9.5M12 12V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ),
        viewBox: "0 0 24 24"
    },
    {
        name: 'AWS',
        path: (
            <path d="M4 16C4 16 5 18 8 18C11 18 12 16 12 16M12 16V14M16 16C16 16 17 18 20 18C23 18 24 16 24 16M4 8C4 8 5 6 8 6C11 6 12 8 12 8M16 8C16 8 17 6 20 6C23 6 24 8 24 8M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ),
        viewBox: "0 0 24 24"
    },
    {
        name: 'Azure',
        path: (
            <path d="M4 4L10 20L20 4H14L10 14L6 4H4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ),
        viewBox: "0 0 24 24"
    },
    {
        name: 'GCP',
        path: (
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12H12V16H18C17.1 18.5 14.8 20 12 20C9.6 20 7.5 18.8 6.3 16.9L9.1 14.1C9.6 15.2 10.7 16 12 16C13.6 16 15 14.9 15.6 13.5L12 13.5V10.5H20.8C21.6 12.6 21 15 19.4 16.6C17.5 18.7 14.9 20 12 20C7.6 20 4 16.4 4 12C4 7.6 7.6 4 12 4C14.2 4 16.2 4.8 17.7 6.2L20.5 3.4C18.3 1.3 15.3 0 12 0L12 2Z" stroke="currentColor" strokeWidth="0" fill="currentColor" />
        ),
        viewBox: "0 0 24 24"
    }
]

export default function HyperscalerLogos() {
    return (
        <div className="w-full py-12 border-y border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden relative z-10">
            <div className="container mx-auto px-4">
                <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">
                    Compatible with Modern Data Stacks
                </p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    {logos.map((logo, i) => (
                        <motion.div
                            key={logo.name}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-2 group"
                            title={logo.name}
                        >
                            <svg
                                viewBox={logo.viewBox}
                                className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors"
                                fill="none"
                            >
                                {logo.path}
                            </svg>
                            <span className="text-lg font-bold text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">
                                {logo.name}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
