/**
 * @packageDocumentation
 * @module Utils
 */
/**
 * Check if `site` is a supported site (and check if it's an alias and return the sites's true name)
 *
 * @param  {String} domain The site to resolveSite
 * @return {String?} null if site is not supported, the site otherwise
 */
export declare function resolveSite(domain: string): string | null;
/**
 * Parses xml to json, which can be used with js
 *
 * @private
 * @param  {String} xml The xml to convert to json
 * @return {Object[]} A Promise with an array of objects created from the xml
 */
export declare function jsonfy(xml: string): object[];
/**
 * Yay fisher-bates
 * Taken from http://stackoverflow.com/a/2450976
 *
 * @private
 * @param  {Array} array Array of something
 * @return {Array}       Shuffled array of something
 */
export declare function shuffle<T>(array: T[]): T[];
/**
 * Generate a random int between [min, max]
 *
 * @private
 * @param {Number} min The minimum (inclusive)
 * @param {Number} max The maximum (inclusive)
 */
export declare function randInt(min: number, max: number): number;
/**
 * Performs some basic search validation
 *
 * @private
 * @param {String} site The site to resolve
 * @param {Number|String} limit The limit for the amount of images to fetch
 */
export declare function validateSearchParams(site: string, limit: number | string): {
    site: string;
    limit: number;
};
/**
 * Finds the matching strings between two arrays
 *
 * @private
 * @param {String[]} arr1 The first array
 * @param {String[]} arr2 The second array
 * @return {String[]} The shared strings between the arrays
 */
export declare function compareArrays(arr1: string[], arr2: string[]): string[];
