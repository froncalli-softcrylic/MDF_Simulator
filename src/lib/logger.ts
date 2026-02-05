// Logger utility - respects NODE_ENV to prevent console logging in production
// Use this instead of console.log throughout the codebase

const isDev = process.env.NODE_ENV === 'development'

export const logger = {
    /**
     * Debug-level logging - only shown in development
     * Use for detailed debugging information
     */
    debug: (...args: unknown[]) => {
        if (isDev) console.log('[DEBUG]', ...args)
    },

    /**
     * Info-level logging - only shown in development
     * Use for general informational messages
     */
    info: (...args: unknown[]) => {
        if (isDev) console.info('[INFO]', ...args)
    },

    /**
     * Warn-level logging - always shown
     * Use for warnings that don't break functionality
     */
    warn: (...args: unknown[]) => {
        console.warn('[WARN]', ...args)
    },

    /**
     * Error-level logging - always shown
     * Use for errors and exceptions
     */
    error: (...args: unknown[]) => {
        console.error('[ERROR]', ...args)
    },
}
