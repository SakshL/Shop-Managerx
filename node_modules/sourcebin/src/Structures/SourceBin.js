const File = require('./File.js');

/**
 * File Data Object
 * @typedef {Object} FileObject
 * @property {string} [name] file name
 * @property {string} content file content
 * @property {number} languageId language id
 */

/**
 * Class representing a bin
 * @class SourceBin
 * @param {string} key bin key
 * @param {Object} data bin data
 * @param {string} [data.title] bin title
 * @param {string} [data.description] bin description
 * @param {string} [data.hits] bin views
 * @param {string} [data.views] bin views
 * @param {string} data.created bin created date
 * @param {Array<FileObject>} data.files bin files
 */
class SourceBin {
    constructor(key, data) {
        this.key = key;

        this.url = `https://sourceb.in/${key}`;
        this.short = `https://srcb.in/${key}`;

        this.title = data.title;
        this.description = data.description;
        this.views = data.hits || data.views;

        this.created = data.created;
        this.timestamp = new Date(data.created).getTime();

        this.files = [];
        for (let i = 0; i < data.files.length; i++) {
            const file = new File(key, i, data.files[i]);
            this.files.push(file);
        }
    }
}

module.exports = SourceBin;
