'use strict';

const request = require('request-promise-native');
const urlParse = require('url').URL;
const isUrl = require('is-url');

function CheckByRequest(url) {
  return new Promise(function (resolve, reject) {
    try {
      request({
        method: 'HEAD',
        uri: url,
        resolveWithFullResponse: true,
      })
      .then(function (respose) {
        resolve(respose);
      })
      .catch(function () {
        request({
          method: 'GET',
          uri: url,
          resolveWithFullResponse: true,
        })
        .then(function (respose) {
          resolve(respose);
        })
        .catch(function (err) {
          reject(err);
        });
      })
    } catch (err) {
      reject(err);
    }
  });
}

async function isImageURL (url) {
  return new Promise(function (resolve) {
    try {
      // When URL Not Exists
      if (!url) {
        return resolve(false);
      }

      // If url is not HTTP URL (Local Path)
      if (!isUrl(url)) {
        return resolve(false);
      }

      // Check for URL Pathname Exists
      var parsedURL = new urlParse(url);
      let pathname = parsedURL.pathname;
      if (!pathname) return resolve(false);

      // Check URL Content by Head Reuqest
      CheckByRequest(url)
        .then(function (res) {
          if (!res) return resolve(false);
          if (!(res.statusCode >= 200 && res.statusCode < 300)) return resolve(false);
    
          const headers = res.headers;
          if (!headers) return resolve(false);
          const contentType = headers['content-type'];
          if (!contentType) return resolve(false);
          return resolve(contentType.search(/^image\//) != -1);
        })
        .catch(function () {
          return resolve(false);
        })
    } catch (e) {
      return resolve(false);
    }
  });
};

exports.default = isImageURL;