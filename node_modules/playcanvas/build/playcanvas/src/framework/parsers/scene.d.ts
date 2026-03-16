export class SceneParser {
    constructor(app: any, isTemplate: any);
    _app: any;
    _isTemplate: any;
    parse(data: any): Entity;
    _createEntity(data: any, compressed: any): Entity;
    _setPosRotScale(entity: any, data: any, compressed: any): void;
    _openComponentData(entity: any, entities: any): any;
}
import { Entity } from '../entity.js';
