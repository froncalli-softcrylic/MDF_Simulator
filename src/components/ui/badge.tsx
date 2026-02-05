import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground",
                // MDF-specific variants
                source: "border-transparent bg-[hsl(var(--mdf-source))] text-white",
                ingestion: "border-transparent bg-[hsl(var(--mdf-ingestion))] text-white",
                processing: "border-transparent bg-[hsl(var(--mdf-processing))] text-white",
                storage: "border-transparent bg-[hsl(var(--mdf-storage))] text-white",
                identity: "border-transparent bg-[hsl(var(--mdf-identity))] text-white",
                governance: "border-transparent bg-[hsl(var(--mdf-governance))] text-black",
                analytics: "border-transparent bg-[hsl(var(--mdf-analytics))] text-white",
                activation: "border-transparent bg-[hsl(var(--mdf-activation))] text-white",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
