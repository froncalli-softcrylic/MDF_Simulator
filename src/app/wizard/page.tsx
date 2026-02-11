'use client'

// Intake Wizard - Multi-step form for gathering requirements

import { useRouter } from 'next/navigation'
import { useProfileStore } from '@/store/profile-store'
import { cloudProviders, tools, painPoints, goals } from '@/data/wizard-options'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
    ArrowRight, ArrowLeft, Cloud, Wrench, AlertTriangle, Target, Sparkles
} from 'lucide-react'

const steps = [
    { id: 'cloud', title: 'Cloud Platform', icon: Cloud },
    { id: 'tools', title: 'Current Tools', icon: Wrench },
    { id: 'painPoints', title: 'Pain Points', icon: AlertTriangle },
    { id: 'goals', title: 'Goals', icon: Target }
]

export default function WizardPage() {
    const router = useRouter()
    const {
        wizardStep,
        setWizardStep,
        nextStep,
        prevStep,
        draftCloud,
        draftTools,
        draftPainPoints,
        draftGoals,
        setCloud,
        toggleTool,
        togglePainPoint,
        toggleGoal,
        finalizeWizard
    } = useProfileStore()

    const progress = ((wizardStep + 1) / steps.length) * 100

    const handleSubmit = async () => {
        const wizardData = finalizeWizard()

        // Create project with wizard data
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wizardData })
            })

            if (response.ok) {
                const { projectId } = await response.json()
                router.push(`/simulator/${projectId}`)
            } else {
                // Fallback to new project without persistence
                router.push('/simulator/new?fromWizard=true')
            }
        } catch (error) {
            // Fallback to new project without persistence
            router.push('/simulator/new?fromWizard=true')
        }
    }

    const canProceed = () => {
        switch (wizardStep) {
            case 0: return !!draftCloud
            case 1: return draftTools.length > 0
            case 2: return draftPainPoints.length > 0
            case 3: return draftGoals.length > 0
            default: return false
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            {/* Header */}
            <header className="border-b bg-background/80 backdrop-blur">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="font-bold text-lg">Marketing Data Foundation — Intake Wizard</h1>
                    <Badge variant="outline">Step {wizardStep + 1} of {steps.length}</Badge>
                </div>
            </header>

            {/* Progress */}
            <div className="container mx-auto px-4 py-6">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between mt-2">
                    {steps.map((step, i) => (
                        <button
                            key={step.id}
                            onClick={() => i < wizardStep && setWizardStep(i)}
                            className={cn(
                                'flex items-center gap-1.5 text-xs transition-colors',
                                i <= wizardStep ? 'text-primary' : 'text-muted-foreground',
                                i < wizardStep && 'cursor-pointer hover:text-primary/80'
                            )}
                        >
                            <step.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{step.title}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    {/* Step 0: Cloud */}
                    {wizardStep === 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>What cloud platform do you use?</CardTitle>
                                <CardDescription>
                                    Select your primary cloud provider for data infrastructure.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3">
                                    {cloudProviders.map((provider) => (
                                        <button
                                            key={provider.id}
                                            onClick={() => setCloud(provider.id as any)}
                                            className={cn(
                                                'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                                                draftCloud === provider.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-muted hover:border-muted-foreground/50'
                                            )}
                                        >
                                            <Cloud className={cn(
                                                'w-6 h-6',
                                                draftCloud === provider.id ? 'text-primary' : 'text-muted-foreground'
                                            )} />
                                            <span className="font-medium">{provider.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 1: Tools */}
                    {wizardStep === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>What tools are you currently using?</CardTitle>
                                <CardDescription>
                                    Select all that apply. This helps us recommend the right architecture.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {tools.map((tool) => (
                                        <button
                                            key={tool.id}
                                            onClick={() => toggleTool(tool.id as any)}
                                            className={cn(
                                                'flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left',
                                                draftTools.includes(tool.id as any)
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-muted hover:border-muted-foreground/50'
                                            )}
                                        >
                                            <Checkbox checked={draftTools.includes(tool.id as any)} />
                                            <div>
                                                <div className="font-medium text-sm">{tool.name}</div>
                                                <div className="text-xs text-muted-foreground">{tool.category}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Pain Points */}
                    {wizardStep === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>What challenges are you facing?</CardTitle>
                                <CardDescription>
                                    Select the pain points that resonate most with your situation.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3">
                                    {painPoints.map((point) => (
                                        <button
                                            key={point.id}
                                            onClick={() => togglePainPoint(point.id as any)}
                                            className={cn(
                                                'flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left',
                                                draftPainPoints.includes(point.id as any)
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-muted hover:border-muted-foreground/50'
                                            )}
                                        >
                                            <Checkbox checked={draftPainPoints.includes(point.id as any)} />
                                            <div>
                                                <div className="font-medium">{point.name}</div>
                                                <div className="text-sm text-muted-foreground">{point.description}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Goals */}
                    {wizardStep === 3 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>What are your primary goals?</CardTitle>
                                <CardDescription>
                                    Select the outcomes you&apos;re hoping to achieve.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3">
                                    {goals.map((goal) => (
                                        <button
                                            key={goal.id}
                                            onClick={() => toggleGoal(goal.id as any)}
                                            className={cn(
                                                'flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left',
                                                draftGoals.includes(goal.id as any)
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-muted hover:border-muted-foreground/50'
                                            )}
                                        >
                                            <Checkbox checked={draftGoals.includes(goal.id as any)} />
                                            <div>
                                                <div className="font-medium">{goal.name}</div>
                                                <div className="text-sm text-muted-foreground">{goal.description}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={wizardStep === 0}
                            className="gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>

                        {wizardStep < steps.length - 1 ? (
                            <Button
                                onClick={nextStep}
                                disabled={!canProceed()}
                                className="gap-2"
                            >
                                Next
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={!canProceed()}
                                className="gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Generate MDF
                            </Button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
