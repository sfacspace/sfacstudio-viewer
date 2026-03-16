/**
 * Wraps a source of asset data.
 *
 * @ignore
 */
export class AssetFile {
    constructor(url?: string, filename?: string, hash?: any, size?: any, opt?: any, contents?: any);
    url: string;
    filename: string;
    hash: any;
    size: any;
    opt: any;
    contents: any;
    equals(other: any): boolean;
}
