const resolveLanguageId = require('./resolveLanguageId.js');

/**
 * Validate a file object
 * @param {Object} file file object
 * @param {string} file.name file name
 * @param {string} file.content file content
 * @param {string|number} file.language file language string or id
 * @return {true|TypeError|SyntaxError} True if valid file or error if not
 */
module.exports = ({ name, content, language } = {}) => {
    if (name && typeof name != 'string')
        return new TypeError(
            `Expected type string for file.name, found ${typeof name}`,
        );

    if (!content || typeof content != 'string' || content.trim() == '')
        return new TypeError('Expected to recieve a valid item for content');

    if (language && !resolveLanguageId(language))
        return new SyntaxError('Invalid language given');

    return true;
};
