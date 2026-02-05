'use client'

// Profile Selector - Dropdown to switch between demo profiles
// Changes the active profile and regenerates the diagram

import { useProfileStore } from '@/store/profile-store'
import { useCanvasStore } from '@/store/canvas-store'
import { generateDefaultDiagramForProfile } from '@/lib/diagram-generator'
import { profileOptions } from '@/data/demo-profiles'
import { DemoProfile } from '@/types'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Profile colors for visual distinction
const profileColors: Record<DemoProfile, string> = {
    adobe_summit: 'bg-red-500',
    preferred_stack: 'bg-cyan-500',
    google_cloud: 'bg-blue-500',
    salesforce: 'bg-sky-500',
    generic: 'bg-slate-500'
}

interface ProfileSelectorProps {
    className?: string
    showLabel?: boolean
    regenerateOnChange?: boolean
}

export default function ProfileSelector({
    className,
    showLabel = false,
    regenerateOnChange = true
}: ProfileSelectorProps) {
    const { activeProfile, setActiveProfile } = useProfileStore()
    const { loadGraph } = useCanvasStore()

    const handleProfileChange = (value: DemoProfile) => {
        setActiveProfile(value)

        // Optionally regenerate diagram with new profile
        if (regenerateOnChange) {
            const graph = generateDefaultDiagramForProfile(value)
            loadGraph(graph)
        }
    }

    const currentProfile = profileOptions.find(p => p.id === activeProfile)

    return (
        <div className={cn('flex items-center gap-2', className)}>
            {showLabel && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">Profile:</span>
            )}
            <Select value={activeProfile} onValueChange={handleProfileChange}>
                <SelectTrigger className="w-[160px] h-8 text-xs">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            'w-2 h-2 rounded-full',
                            profileColors[activeProfile]
                        )} />
                        <SelectValue placeholder="Select profile" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {profileOptions.map((profile) => (
                        <SelectItem
                            key={profile.id}
                            value={profile.id}
                            className="text-xs"
                        >
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    'w-2 h-2 rounded-full',
                                    profileColors[profile.id]
                                )} />
                                <span>{profile.name}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
