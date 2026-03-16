/**
 * Convert incoming JSON data into a {@link StandardMaterial}.
 *
 * @ignore
 */
export class JsonStandardMaterialParser {
    _validator: StandardMaterialValidator;
    parse(input: any): StandardMaterial;
    /**
     * Initialize material properties from the material data block e.g. Loading from server.
     *
     * @param {StandardMaterial} material - The material to be initialized.
     * @param {object} data - The data block that is used to initialize.
     */
    initialize(material: StandardMaterial, data: object): void;
    migrate(data: any): any;
    _validate(data: any): any;
}
import { StandardMaterialValidator } from '../../../scene/materials/standard-material-validator.js';
import { StandardMaterial } from '../../../scene/materials/standard-material.js';
