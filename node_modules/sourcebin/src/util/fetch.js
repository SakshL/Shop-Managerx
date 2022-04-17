const { version } = require('../../package.json');
const got = require('got');

/**
 * Makes a request
 * @param {string} url url to make request to
 * @param {Object} [options] fetch options
 * @return {Promise<Object|undefined>} The requested data or response
 */
module.exports = async (url, options = {}) => {
    return got(url, {
        json: options.data,
        responseType: 'json',

        ...options,

        headers: {
            ...options.headers,
            'User-Agent': `Sourcebin/${version} https://www.npmjs.com/package/sourcebin`,
        },
    })
        .then((res) => ({ data: res.body }))
        .catch((error) => {
            const { body } = error.response;

            if (typeof body == 'object' && body.message)
                error.message = body.message;

            return { error };
        });
};
