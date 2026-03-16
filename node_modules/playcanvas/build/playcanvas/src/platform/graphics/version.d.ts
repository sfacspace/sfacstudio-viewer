export class Version {
    globalId: number;
    revision: number;
    equals(other: any): boolean;
    copy(other: any): void;
    reset(): void;
}
