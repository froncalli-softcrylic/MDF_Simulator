// Type declarations for modules without bundled types

declare module 'elkjs/lib/elk.bundled.js' {
    export default class ELK {
        layout(graph: any): Promise<any>
    }
}
