// Type declarations for modules without bundled types

declare module '@xyflow/react' {
    export * from '@xyflow/react/dist/esm/index'
}

declare module 'elkjs/lib/elk.bundled.js' {
    export default class ELK {
        layout(graph: any): Promise<any>
    }
}
