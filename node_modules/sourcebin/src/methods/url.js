const { resolveKey } = require('../util');

/**
 * Url data
 * @typedef UrlData
 * @property {string} key bin key
 * @property {string} url bin url
 * @property {string} short bin short url
 */

/**
 * Get url and short url from key
 * @typedef UrlMethod
 * @param {string} key sourcebin key or url
 * @return {UrlData}
 */

/**
 * Get url and short url from key
 * @method UrlMethod Get url and short url from key
 */
module.exports = (key) => {
    key = resolveKey(key);
    if (!key) throw new SyntaxError('Expected a valid bin key or url');

    return {
        key,
        url: `https://sourceb.in/${key}`,
        short: `http://srcb.in/${key}`,
    };
};
