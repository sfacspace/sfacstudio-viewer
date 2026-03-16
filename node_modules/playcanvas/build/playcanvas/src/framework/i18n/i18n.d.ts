/**
 * @import { AppBase } from '../app-base.js'
 */
/**
 * Handles localization. Responsible for loading localization assets and returning translations for
 * a certain key. Can also handle plural forms. To override its default behavior define a different
 * implementation for {@link I18n#getText} and {@link I18n#getPluralText}.
 */
export class I18n extends EventHandler {
    /**
     * Fired when when the locale is changed.
     *
     * @event
     * @example
     * app.i18n.on('change', (newLocale, oldLocale) => {
     *    console.log(`Locale changed from ${oldLocale} to ${newLocale}`);
     * });
     */
    static EVENT_CHANGE: string;
    /**
     * Returns the first available locale based on the desired locale specified. First tries to
     * find the desired locale and then tries to find an alternative locale based on the language.
     *
     * @param {string} desiredLocale - The desired locale e.g. en-US.
     * @param {object} availableLocales - A dictionary where each key is an available locale.
     * @returns {string} The locale found or if no locale is available returns the default en-US
     * locale.
     * @example
     * // With a defined dictionary of locales
     * const availableLocales = { en: 'en-US', fr: 'fr-FR' };
     * const locale = pc.I18n.getText('en-US', availableLocales);
     * // returns 'en'
     * @ignore
     */
    static findAvailableLocale(desiredLocale: string, availableLocales: object): string;
    /**
     * Create a new I18n instance.
     *
     * @param {AppBase} app - The application.
     */
    constructor(app: AppBase);
    /**
     * Sets the current locale. For example, "en-US". Changing the locale will raise an event which
     * will cause localized Text Elements to change language to the new locale.
     *
     * @type {string}
     */
    set locale(value: string);
    /**
     * Gets the current locale.
     *
     * @type {string}
     */
    get locale(): string;
    _translations: {};
    _availableLangs: {};
    _app: AppBase;
    _assets: any[];
    _parser: I18nParser;
    /**
     * Sets the array of asset ids or assets that contain localization data in the expected format.
     * I18n will automatically load translations from these assets as the assets are loaded and it
     * will also automatically unload translations if the assets get removed or unloaded at runtime.
     *
     * @type {number[]|Asset[]}
     */
    set assets(value: number[] | Asset[]);
    /**
     * Gets the array of asset ids that contain localization data in the expected format.
     *
     * @type {number[]|Asset[]}
     */
    get assets(): number[] | Asset[];
    _locale: any;
    _lang: any;
    _pluralFn: any;
    /**
     * Returns the first available locale based on the desired locale specified. First tries to
     * find the desired locale in the loaded translations and then tries to find an alternative
     * locale based on the language.
     *
     * @param {string} desiredLocale - The desired locale e.g. en-US.
     * @returns {string} The locale found or if no locale is available returns the default en-US
     * locale.
     * @example
     * const locale = this.app.i18n.getText('en-US');
     */
    findAvailableLocale(desiredLocale: string): string;
    /**
     * Returns the translation for the specified key and locale. If the locale is not specified it
     * will use the current locale.
     *
     * @param {string} key - The localization key.
     * @param {string} [locale] - The desired locale.
     * @returns {string} The translated text. If no translations are found at all for the locale
     * then it will return the en-US translation. If no translation exists for that key then it will
     * return the localization key.
     * @example
     * const localized = this.app.i18n.getText('localization-key');
     * const localizedFrench = this.app.i18n.getText('localization-key', 'fr-FR');
     */
    getText(key: string, locale?: string): string;
    /**
     * Returns the pluralized translation for the specified key, number n and locale. If the locale
     * is not specified it will use the current locale.
     *
     * @param {string} key - The localization key.
     * @param {number} n - The number used to determine which plural form to use. E.g. For the
     * phrase "5 Apples" n equals 5.
     * @param {string} [locale] - The desired locale.
     * @returns {string} The translated text. If no translations are found at all for the locale
     * then it will return the en-US translation. If no translation exists for that key then it
     * will return the localization key.
     * @example
     * // manually replace {number} in the resulting translation with our number
     * const localized = this.app.i18n.getPluralText('{number} apples', number).replace("{number}", number);
     */
    getPluralText(key: string, n: number, locale?: string): string;
    /**
     * Adds localization data. If the locale and key for a translation already exists it will be
     * overwritten.
     *
     * @param {object} data - The localization data. See example for the expected format of the
     * data.
     * @example
     * this.app.i18n.addData({
     *     header: {
     *         version: 1
     *     },
     *     data: [{
     *         info: {
     *             locale: 'en-US'
     *         },
     *         messages: {
     *             "key": "translation",
     *             // The number of plural forms depends on the locale. See the manual for more information.
     *             "plural_key": ["one item", "more than one items"]
     *         }
     *     }, {
     *         info: {
     *             locale: 'fr-FR'
     *         },
     *         messages: {
     *             // ...
     *         }
     *     }]
     * });
     */
    addData(data: object): void;
    /**
     * Removes localization data.
     *
     * @param {object} data - The localization data. The data is expected to be in the same format
     * as {@link I18n#addData}.
     */
    removeData(data: object): void;
    /**
     * Frees up memory.
     */
    destroy(): void;
    _findFallbackLocale(locale: any, lang: any): any;
    _onAssetAdd(asset: any): void;
    _onAssetLoad(asset: any): void;
    _onAssetChange(asset: any): void;
    _onAssetRemove(asset: any): void;
    _onAssetUnload(asset: any): void;
}
import { EventHandler } from '../../core/event-handler.js';
import type { AppBase } from '../app-base.js';
import { I18nParser } from './i18n-parser.js';
import { Asset } from '../asset/asset.js';
