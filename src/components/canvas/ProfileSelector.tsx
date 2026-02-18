'use client'

// Profile Selector - Dropdown to switch between demo profiles
// Changes the active profile and regenerates the diagram

import { useProfileStore } from '@/store/profile-store'
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
const profileColors: Partial<Record<DemoProfile, string>> = {
    adobe_summit: 'bg-red-500',
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

    const handleProfileChange = async (value: DemoProfile) => {
        // Just set the profile — page.tsx useEffect handles save/restore of canvas state
        setActiveProfile(value)
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
                            profileColors[activeProfile] || 'bg-slate-500'
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
                                    profileColors[profile.id] || 'bg-slate-500'
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
