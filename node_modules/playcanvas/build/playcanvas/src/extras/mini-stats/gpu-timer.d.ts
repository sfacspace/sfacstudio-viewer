export class GpuTimer {
    constructor(device: any);
    device: any;
    enabled: boolean;
    unitsName: string;
    decimalPlaces: number;
    _timings: any[];
    get timings(): any[];
}
