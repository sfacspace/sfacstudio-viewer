export class StandardMaterialValidator {
    removeInvalid: boolean;
    valid: boolean;
    enumValidators: {
        occludeSpecular: (value: any) => boolean;
        cull: (value: any) => boolean;
        blendType: (value: any) => boolean;
        depthFunc: (value: any) => boolean;
    };
    setInvalid(key: any, data: any): void;
    validate(data: any): boolean;
    _createEnumValidator(values: any): (value: any) => boolean;
}
