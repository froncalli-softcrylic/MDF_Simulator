"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface CheckboxProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
    ({ className, checked = false, onCheckedChange, ...props }, ref) => {
        return (
            <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                ref={ref}
                className={cn(
                    "peer h-5 w-5 shrink-0 rounded-md border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground transition-colors",
                    checked && "bg-primary text-primary-foreground",
                    className
                )}
                onClick={() => onCheckedChange?.(!checked)}
                data-state={checked ? "checked" : "unchecked"}
                {...props}
            >
                {checked && <Check className="h-4 w-4 mx-auto" />}
            </button>
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
