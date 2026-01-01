'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Application Error:', error)
    }, [error])

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-6 bg-slate-950 text-white p-4">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-red-400">Application Error</h2>
                <p className="text-slate-400">Something went wrong while loading the application.</p>
            </div>

            <div className="bg-slate-900 border border-red-900/30 p-4 rounded-lg max-w-lg w-full overflow-auto font-mono text-xs text-red-200 shadow-xl">
                {error.message || "Unknown error occurred"}
                {error.digest && <div className="mt-2 text-slate-500">Digest: {error.digest}</div>}
            </div>

            <div className="flex gap-4">
                <Button
                    onClick={() => reset()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                    Try Again
                </Button>
                <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="border-slate-700 hover:bg-slate-800"
                >
                    Reload Page
                </Button>
            </div>
        </div>
    )
}
