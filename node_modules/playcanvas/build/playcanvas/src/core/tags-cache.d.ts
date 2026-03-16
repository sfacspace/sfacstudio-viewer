export class TagsCache {
    constructor(key?: any);
    _index: {};
    _key: any;
    addItem(item: any): void;
    removeItem(item: any): void;
    add(tag: any, item: any): void;
    remove(tag: any, item: any): void;
    find(args: any): any[];
}
