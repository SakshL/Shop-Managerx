/**
 * @packageDocumentation
 * @module Constants
 */
import { RequestInit } from 'node-fetch';
import Site from './structures/Site';
import SiteInfo from './structures/SiteInfo';
export interface SMap<V> {
    [key: string]: V;
}
/**
 * A map of site url/{@link SiteInfo}
 */
export declare const sites: SMap<SiteInfo>;
/**
 * Custom error type for when the boorus error or for user-side error, not my code (probably)
 * <p>The name of the error is 'BooruError'
 * @type {Error}
 */
export declare class BooruError extends Error {
    constructor(message: string | Error);
}
/**
 * The user-agent to use for searches
 * @private
 */
export declare const USER_AGENT = "booru (https://github.com/AtoraSuunva/booru)";
/**
 * Create a full uri to search with
 *
 * @private
 * @param {string} domain The domain to search
 * @param {Site} site The site to search
 * @param {string[]} [tags=[]] The tags to search for
 * @param {number} [limit=100] The limit for images to return
 * @param {number} [page=0] The page to get
 */
export declare function searchURI(site: Site, tags: string[] | undefined, limit: number | undefined, page: number): string;
/**
 * The default options to use for requests
 * <p>I could document this better but meh
 *
 * @private
 */
export declare const defaultOptions: RequestInit;
