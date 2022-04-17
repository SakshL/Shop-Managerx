const { linguist } = require('@sourcebin/linguist');

/**
 * Class representing a file
 * @param {string} key valid key of bin
 * @param {number} index index of the file
 * @param {Object} data file data
 * @param {string} data.name file name
 * @param {string} data.content file content
 * @param {number} data.languageId language id
 */
class File {
    constructor(key, index, data) {
        this.raw = `https://cdn.sourceb.in/bins/${key}/${index}`;

        this.name = data.name;
        this.content = data.content;

        this.languageId = data.languageId;
        this.language = linguist[data.languageId];
    }
}

module.exports = File;
