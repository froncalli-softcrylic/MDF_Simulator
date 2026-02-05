# MDF Simulator

Interactive Marketing Data Foundation simulator for B2B prospects to visualize unified customer data architectures through drag-and-drop data-flow diagrams.

![MDF Simulator Preview](https://via.placeholder.com/800x450.png?text=MDF+Simulator+Preview)

## Features

- **Intake Wizard**: Guided questionnaire to generate tailored MDF architecture
- **Drag & Drop Canvas**: React Flow-based interactive diagram builder
- **25+ Node Types**: Data sources, ingestion, processing, storage, identity graph, governance, analytics, activation
- **Demo Profiles**: Adobe Summit and Preferred Stack configurations
- **Value Overlays**: Highlight nodes by capabilities (Activation, Measurement, Identity, Governance)
- **Real-time Validation**: Rules engine with errors, warnings, and recommendations
- **Lead Capture**: Gate on save/export/share for lead generation
- **Auto Layout**: ELK.js-powered automatic graph organization
- **Share Links**: Read-only shareable diagrams

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Canvas**: React Flow
- **State**: Zustand
- **Styling**: Tailwind CSS + shadcn/ui
- **Layout**: ELK.js
- **Database**: PostgreSQL + Prisma (optional for MVP)
- **Export**: html-to-image

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
cd MDF_simulator

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Optional: Database Setup

For persistence (projects, leads):

```bash
# Start PostgreSQL (Docker)
docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mdf_simulator postgres

# Generate Prisma client
npm run db:generate

# Push schema
npm run db:push
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── simulator/         # Canvas page
│   ├── wizard/            # Intake wizard
│   └── share/             # Read-only share view
├── components/
│   ├── canvas/            # React Flow components
│   ├── modals/            # Lead capture modal
│   └── ui/                # shadcn/ui components
├── data/
│   ├── node-catalog.ts    # Node definitions
│   ├── demo-profiles.ts   # Profile configurations
│   └── templates.ts       # Starter templates
├── lib/
│   ├── validation-engine.ts
│   ├── diagram-generator.ts
│   └── layout-engine.ts
├── store/                 # Zustand stores
└── types/                 # TypeScript types
```

## Adding Content

### Adding a New Node Type

Edit `src/data/node-catalog.ts`:

```typescript
{
  id: 'my_new_node',
  name: 'My New Node',
  category: 'processing',
  icon: 'layers',
  vendorProfileAvailability: ['generic'],
  description: 'Description here.',
  whyItMatters: ['Point 1', 'Point 2'],
  inputs: [{ id: 'in', name: 'Input', type: 'batch' }],
  outputs: [{ id: 'out', name: 'Output', type: 'batch' }],
  prerequisites: [],
  enables: ['measurement'],
  recommendedNext: ['some_other_node'],
  proofPoints: []
}
```

### Adding a Validation Rule

Edit `src/lib/validation-engine.ts` and add a new rule function:

```typescript
function checkMyRule(ctx: ValidationContext): ValidationResult[] {
  const results: ValidationResult[] = []
  // Your validation logic
  return results
}
```

Then add it to the `validateGraph` function.

### Adding a Demo Profile

Edit `src/data/demo-profiles.ts`:

```typescript
my_profile: {
  id: 'my_profile',
  name: 'My Profile',
  description: 'Custom profile description',
  emphasizedNodes: ['node_id_1', 'node_id_2'],
  hiddenNodes: [],
  templates: ['retail_mdf'],
  defaultCopy: {
    heroTitle: 'Title',
    heroSubtitle: 'Subtitle'
  }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `REDIS_URL` | Redis URL for rate limiting | `redis://localhost:6379` |
| `NEXT_PUBLIC_APP_URL` | Public app URL | `http://localhost:3000` |

## Deployment

The app is optimized for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## License

Proprietary - Internal use only

---

Built with ❤️ for unified customer data
