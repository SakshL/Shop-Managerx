const { linguist, languages } = require('@sourcebin/linguist');

/**
 * Turns a language id or language string to language id
 * @param {string|number} item language string or id
 * @return {number|undefined} Language id or undefined if invalid language
 */
module.exports = (item) => {
    if (item == undefined) return undefined;

    if (typeof item === 'number')
        return Object.values(languages).includes(item) ? item : undefined;

    item = item.toLowerCase();

    for (const [name, value] of Object.entries(languages)) {
        if (name.toLowerCase() == item) return value;
    }

    for (const { name, aliases } of Object.values(linguist)) {
        if (name == item || (aliases || []).includes(item))
            return languages[name];
    }

    return undefined;
};
