const { validateFile, fetch, resolveLanguageId } = require('../util');
const get = require('./get.js');

/**
 * File Data Object
 * @typedef {Object} FileObject
 * @property {string} [title] file title
 * @property {string} content file content
 * @property {number|string} language language or language id
 */

/**
 * Create a bin
 * @typedef CreateMethod
 * @param {FileObject} files bin files
 * @param {Object} [options] bin options
 * @param {string} [options.title] bin title
 * @param {string} [options.description] bin description
 * @return {Promise<SourceBin>}
 */

/**
 * Create a bin
 * @typedef CreateMethod create a bin
 */
module.exports = async (files = [], options = {}) => {
    if (!Array.isArray(files) || files.length == 0)
        throw new SyntaxError('Please give a array of files');

    if (files.length > 1)
        throw new CreateError(
            'Having multiple files in one bin is only for pro users, authentication is not currently supported via this wrapper',
        );

    for (const file of files) {
        const valid = validateFile(file);
        if (valid != true) throw valid;

        if (file.language) {
            file.languageId = resolveLanguageId(file.language);
        }

        delete file.language;
    }

    const res = await fetch('https://sourceb.in/api/bins/', {
        method: 'POST',
        data: {
            files,
            title: options.title,
            description: options.description,
        },
    });

    if (res.error) throw new CreateError(res.error.message);

    const Bin = await get(res.data.key);
    if (!Bin) throw new CreateError('There was a error getting your bin');

    return Bin;
};

class CreateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CreateError';
    }
}
