export class Markup {
    static evaluate(symbols: any): {
        symbols: any;
        tags: any;
    } | {
        symbols: any[];
        tags: {}[];
    };
}
