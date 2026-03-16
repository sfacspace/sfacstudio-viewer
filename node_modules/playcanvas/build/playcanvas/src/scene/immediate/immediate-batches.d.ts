export class ImmediateBatches {
    constructor(device: any);
    device: any;
    map: Map<any, any>;
    getBatch(material: any, layer: any): any;
    onPreRender(visibleList: any, transparent: any): void;
    clear(): void;
}
