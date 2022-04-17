"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

/**
 * Module dependencies.
 */
// eslint-disable-next-line node/no-deprecated-api
var _require = require('url'),
    parse = _require.parse,
    format = _require.format,
    resolve = _require.resolve;

var Stream = require('stream');

var https = require('https');

var http = require('http');

var fs = require('fs');

var zlib = require('zlib');

var util = require('util');

var qs = require('qs');

var mime = require('mime');

var methods = require('methods');

var FormData = require('form-data');

var formidable = require('formidable');

var debug = require('debug')('superagent');

var CookieJar = require('cookiejar');

var semverGte = require('semver/functions/gte');

var safeStringify = require('fast-safe-stringify');

var utils = require('../utils');

var RequestBase = require('../request-base');

var _require2 = require('./unzip'),
    unzip = _require2.unzip;

var Response = require('./response');

var mixin = utils.mixin,
    hasOwn = utils.hasOwn;
var http2;
if (semverGte(process.version, 'v10.10.0')) http2 = require('./http2wrapper');

function request(method, url) {
  // callback
  if (typeof url === 'function') {
    return new exports.Request('GET', method).end(url);
  } // url first


  if (arguments.length === 1) {
    return new exports.Request('GET', method);
  }

  return new exports.Request(method, url);
}

module.exports = request;
exports = module.exports;
/**
 * Expose `Request`.
 */

exports.Request = Request;
/**
 * Expose the agent function
 */

exports.agent = require('./agent');
/**
 * Noop.
 */

function noop() {}
/**
 * Expose `Response`.
 */


exports.Response = Response;
/**
 * Define "form" mime type.
 */

mime.define({
  'application/x-www-form-urlencoded': ['form', 'urlencoded', 'form-data']
}, true);
/**
 * Protocol map.
 */

exports.protocols = {
  'http:': http,
  'https:': https,
  'http2:': http2
};
/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

exports.serialize = {
  'application/x-www-form-urlencoded': qs.stringify,
  'application/json': safeStringify
};
/**
 * Default parsers.
 *
 *     superagent.parse['application/xml'] = function(res, fn){
 *       fn(null, res);
 *     };
 *
 */

exports.parse = require('./parsers');
/**
 * Default buffering map. Can be used to set certain
 * response types to buffer/not buffer.
 *
 *     superagent.buffer['application/xml'] = true;
 */

exports.buffer = {};
/**
 * Initialize internal header tracking properties on a request instance.
 *
 * @param {Object} req the instance
 * @api private
 */

function _initHeaders(request_) {
  request_._header = {// coerces header names to lowercase
  };
  request_.header = {// preserves header name case
  };
}
/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String|Object} url
 * @api public
 */


function Request(method, url) {
  Stream.call(this);
  if (typeof url !== 'string') url = format(url);
  this._enableHttp2 = Boolean(process.env.HTTP2_TEST); // internal only

  this._agent = false;
  this._formData = null;
  this.method = method;
  this.url = url;

  _initHeaders(this);

  this.writable = true;
  this._redirects = 0;
  this.redirects(method === 'HEAD' ? 0 : 5);
  this.cookies = '';
  this.qs = {};
  this._query = [];
  this.qsRaw = this._query; // Unused, for backwards compatibility only

  this._redirectList = [];
  this._streamRequest = false;
  this._lookup = undefined;
  this.once('end', this.clearTimeout.bind(this));
}
/**
 * Inherit from `Stream` (which inherits from `EventEmitter`).
 * Mixin `RequestBase`.
 */


util.inherits(Request, Stream);
mixin(Request.prototype, RequestBase.prototype);
/**
 * Enable or Disable http2.
 *
 * Enable http2.
 *
 * ``` js
 * request.get('http://localhost/')
 *   .http2()
 *   .end(callback);
 *
 * request.get('http://localhost/')
 *   .http2(true)
 *   .end(callback);
 * ```
 *
 * Disable http2.
 *
 * ``` js
 * request = request.http2();
 * request.get('http://localhost/')
 *   .http2(false)
 *   .end(callback);
 * ```
 *
 * @param {Boolean} enable
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.http2 = function (bool) {
  if (exports.protocols['http2:'] === undefined) {
    throw new Error('superagent: this version of Node.js does not support http2');
  }

  this._enableHttp2 = bool === undefined ? true : bool;
  return this;
};
/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `options` (or filename).
 *
 * ``` js
 * request.post('http://localhost/upload')
 *   .attach('field', Buffer.from('<b>Hello world</b>'), 'hello.html')
 *   .end(callback);
 * ```
 *
 * A filename may also be used:
 *
 * ``` js
 * request.post('http://localhost/upload')
 *   .attach('files', 'image.jpg')
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {String|fs.ReadStream|Buffer} file
 * @param {String|Object} options
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.attach = function (field, file, options) {
  var _this = this;

  if (file) {
    if (this._data) {
      throw new Error("superagent can't mix .send() and .attach()");
    }

    var o = options || {};

    if (typeof options === 'string') {
      o = {
        filename: options
      };
    }

    if (typeof file === 'string') {
      if (!o.filename) o.filename = file;
      debug('creating `fs.ReadStream` instance for file: %s', file);
      file = fs.createReadStream(file);
      file.on('error', function (error) {
        var formData = _this._getFormData();

        formData.emit('error', error);
      });
    } else if (!o.filename && file.path) {
      o.filename = file.path;
    }

    this._getFormData().append(field, file, o);
  }

  return this;
};

Request.prototype._getFormData = function () {
  var _this2 = this;

  if (!this._formData) {
    this._formData = new FormData();

    this._formData.on('error', function (error) {
      debug('FormData error', error);

      if (_this2.called) {
        // The request has already finished and the callback was called.
        // Silently ignore the error.
        return;
      }

      _this2.callback(error);

      _this2.abort();
    });
  }

  return this._formData;
};
/**
 * Gets/sets the `Agent` to use for this HTTP request. The default (if this
 * function is not called) is to opt out of connection pooling (`agent: false`).
 *
 * @param {http.Agent} agent
 * @return {http.Agent}
 * @api public
 */


Request.prototype.agent = function (agent) {
  if (arguments.length === 0) return this._agent;
  this._agent = agent;
  return this;
};
/**
 * Gets/sets the `lookup` function to use custom DNS resolver.
 *
 * @param {Function} lookup
 * @return {Function}
 * @api public
 */


Request.prototype.lookup = function (lookup) {
  if (arguments.length === 0) return this._lookup;
  this._lookup = lookup;
  return this;
};
/**
 * Set _Content-Type_ response header passed through `mime.getType()`.
 *
 * Examples:
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('json')
 *        .send(jsonstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/json')
 *        .send(jsonstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.type = function (type) {
  return this.set('Content-Type', type.includes('/') ? type : mime.getType(type));
};
/**
 * Set _Accept_ response header passed through `mime.getType()`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.accept = function (type) {
  return this.set('Accept', type.includes('/') ? type : mime.getType(type));
};
/**
 * Add query-string `val`.
 *
 * Examples:
 *
 *   request.get('/shoes')
 *     .query('size=10')
 *     .query({ color: 'blue' })
 *
 * @param {Object|String} val
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.query = function (value) {
  if (typeof value === 'string') {
    this._query.push(value);
  } else {
    Object.assign(this.qs, value);
  }

  return this;
};
/**
 * Write raw `data` / `encoding` to the socket.
 *
 * @param {Buffer|String} data
 * @param {String} encoding
 * @return {Boolean}
 * @api public
 */


Request.prototype.write = function (data, encoding) {
  var request_ = this.request();

  if (!this._streamRequest) {
    this._streamRequest = true;
  }

  return request_.write(data, encoding);
};
/**
 * Pipe the request body to `stream`.
 *
 * @param {Stream} stream
 * @param {Object} options
 * @return {Stream}
 * @api public
 */


Request.prototype.pipe = function (stream, options) {
  this.piped = true; // HACK...

  this.buffer(false);
  this.end();
  return this._pipeContinue(stream, options);
};

Request.prototype._pipeContinue = function (stream, options) {
  var _this3 = this;

  this.req.once('response', function (res) {
    // redirect
    if (isRedirect(res.statusCode) && _this3._redirects++ !== _this3._maxRedirects) {
      return _this3._redirect(res) === _this3 ? _this3._pipeContinue(stream, options) : undefined;
    }

    _this3.res = res;

    _this3._emitResponse();

    if (_this3._aborted) return;

    if (_this3._shouldUnzip(res)) {
      var unzipObject = zlib.createUnzip();
      unzipObject.on('error', function (error) {
        if (error && error.code === 'Z_BUF_ERROR') {
          // unexpected end of file is ignored by browsers and curl
          stream.emit('end');
          return;
        }

        stream.emit('error', error);
      });
      res.pipe(unzipObject).pipe(stream, options);
    } else {
      res.pipe(stream, options);
    }

    res.once('end', function () {
      _this3.emit('end');
    });
  });
  return stream;
};
/**
 * Enable / disable buffering.
 *
 * @return {Boolean} [val]
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.buffer = function (value) {
  this._buffer = value !== false;
  return this;
};
/**
 * Redirect to `url
 *
 * @param {IncomingMessage} res
 * @return {Request} for chaining
 * @api private
 */


Request.prototype._redirect = function (res) {
  var url = res.headers.location;

  if (!url) {
    return this.callback(new Error('No location header for redirect'), res);
  }

  debug('redirect %s -> %s', this.url, url); // location

  url = resolve(this.url, url); // ensure the response is being consumed
  // this is required for Node v0.10+

  res.resume();
  var headers = this.req.getHeaders ? this.req.getHeaders() : this.req._headers;
  var changesOrigin = parse(url).host !== parse(this.url).host; // implementation of 302 following defacto standard

  if (res.statusCode === 301 || res.statusCode === 302) {
    // strip Content-* related fields
    // in case of POST etc
    headers = utils.cleanHeader(headers, changesOrigin); // force GET

    this.method = this.method === 'HEAD' ? 'HEAD' : 'GET'; // clear data

    this._data = null;
  } // 303 is always GET


  if (res.statusCode === 303) {
    // strip Content-* related fields
    // in case of POST etc
    headers = utils.cleanHeader(headers, changesOrigin); // force method

    this.method = 'GET'; // clear data

    this._data = null;
  } // 307 preserves method
  // 308 preserves method


  delete headers.host;
  delete this.req;
  delete this._formData; // remove all add header except User-Agent

  _initHeaders(this); // redirect


  this._endCalled = false;
  this.url = url;
  this.qs = {};
  this._query.length = 0;
  this.set(headers);
  this.emit('redirect', res);

  this._redirectList.push(this.url);

  this.end(this._callback);
  return this;
};
/**
 * Set Authorization field value with `user` and `pass`.
 *
 * Examples:
 *
 *   .auth('tobi', 'learnboost')
 *   .auth('tobi:learnboost')
 *   .auth('tobi')
 *   .auth(accessToken, { type: 'bearer' })
 *
 * @param {String} user
 * @param {String} [pass]
 * @param {Object} [options] options with authorization type 'basic' or 'bearer' ('basic' is default)
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.auth = function (user, pass, options) {
  if (arguments.length === 1) pass = '';

  if (_typeof(pass) === 'object' && pass !== null) {
    // pass is optional and can be replaced with options
    options = pass;
    pass = '';
  }

  if (!options) {
    options = {
      type: 'basic'
    };
  }

  var encoder = function encoder(string) {
    return Buffer.from(string).toString('base64');
  };

  return this._auth(user, pass, options, encoder);
};
/**
 * Set the certificate authority option for https request.
 *
 * @param {Buffer | Array} cert
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.ca = function (cert) {
  this._ca = cert;
  return this;
};
/**
 * Set the client certificate key option for https request.
 *
 * @param {Buffer | String} cert
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.key = function (cert) {
  this._key = cert;
  return this;
};
/**
 * Set the key, certificate, and CA certs of the client in PFX or PKCS12 format.
 *
 * @param {Buffer | String} cert
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.pfx = function (cert) {
  if (_typeof(cert) === 'object' && !Buffer.isBuffer(cert)) {
    this._pfx = cert.pfx;
    this._passphrase = cert.passphrase;
  } else {
    this._pfx = cert;
  }

  return this;
};
/**
 * Set the client certificate option for https request.
 *
 * @param {Buffer | String} cert
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.cert = function (cert) {
  this._cert = cert;
  return this;
};
/**
 * Do not reject expired or invalid TLS certs.
 * sets `rejectUnauthorized=true`. Be warned that this allows MITM attacks.
 *
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.disableTLSCerts = function () {
  this._disableTLSCerts = true;
  return this;
};
/**
 * Return an http[s] request.
 *
 * @return {OutgoingMessage}
 * @api private
 */
// eslint-disable-next-line complexity


Request.prototype.request = function () {
  var _this4 = this;

  if (this.req) return this.req;
  var options = {};

  try {
    var query = qs.stringify(this.qs, {
      indices: false,
      strictNullHandling: true
    });

    if (query) {
      this.qs = {};

      this._query.push(query);
    }

    this._finalizeQueryString();
  } catch (err) {
    return this.emit('error', err);
  }

  var url = this.url;
  var retries = this._retries; // Capture backticks as-is from the final query string built above.
  // Note: this'll only find backticks entered in req.query(String)
  // calls, because qs.stringify unconditionally encodes backticks.

  var queryStringBackticks;

  if (url.includes('`')) {
    var queryStartIndex = url.indexOf('?');

    if (queryStartIndex !== -1) {
      var queryString = url.slice(queryStartIndex + 1);
      queryStringBackticks = queryString.match(/`|%60/g);
    }
  } // default to http://


  if (url.indexOf('http') !== 0) url = "http://".concat(url);
  url = parse(url); // See https://github.com/visionmedia/superagent/issues/1367

  if (queryStringBackticks) {
    var i = 0;
    url.query = url.query.replace(/%60/g, function () {
      return queryStringBackticks[i++];
    });
    url.search = "?".concat(url.query);
    url.path = url.pathname + url.search;
  } // support unix sockets


  if (/^https?\+unix:/.test(url.protocol) === true) {
    // get the protocol
    url.protocol = "".concat(url.protocol.split('+')[0], ":"); // get the socket, path

    var unixParts = url.path.match(/^([^/]+)(.+)$/);
    options.socketPath = unixParts[1].replace(/%2F/g, '/');
    url.path = unixParts[2];
  } // Override IP address of a hostname


  if (this._connectOverride) {
    var _url = url,
        hostname = _url.hostname;
    var match = hostname in this._connectOverride ? this._connectOverride[hostname] : this._connectOverride['*'];

    if (match) {
      // backup the real host
      if (!this._header.host) {
        this.set('host', url.host);
      }

      var newHost;
      var newPort;

      if (_typeof(match) === 'object') {
        newHost = match.host;
        newPort = match.port;
      } else {
        newHost = match;
        newPort = url.port;
      } // wrap [ipv6]


      url.host = /:/.test(newHost) ? "[".concat(newHost, "]") : newHost;

      if (newPort) {
        url.host += ":".concat(newPort);
        url.port = newPort;
      }

      url.hostname = newHost;
    }
  } // options


  options.method = this.method;
  options.port = url.port;
  options.path = url.path;
  options.host = url.hostname;
  options.ca = this._ca;
  options.key = this._key;
  options.pfx = this._pfx;
  options.cert = this._cert;
  options.passphrase = this._passphrase;
  options.agent = this._agent;
  options.lookup = this._lookup;
  options.rejectUnauthorized = typeof this._disableTLSCerts === 'boolean' ? !this._disableTLSCerts : process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0'; // Allows request.get('https://1.2.3.4/').set('Host', 'example.com')

  if (this._header.host) {
    options.servername = this._header.host.replace(/:\d+$/, '');
  }

  if (this._trustLocalhost && /^(?:localhost|127\.0\.0\.\d+|(0*:)+:0*1)$/.test(url.hostname)) {
    options.rejectUnauthorized = false;
  } // initiate request


  var mod = this._enableHttp2 ? exports.protocols['http2:'].setProtocol(url.protocol) : exports.protocols[url.protocol]; // request

  this.req = mod.request(options);
  var req = this.req; // set tcp no delay

  req.setNoDelay(true);

  if (options.method !== 'HEAD') {
    req.setHeader('Accept-Encoding', 'gzip, deflate');
  }

  this.protocol = url.protocol;
  this.host = url.host; // expose events

  req.once('drain', function () {
    _this4.emit('drain');
  });
  req.on('error', function (error) {
    // flag abortion here for out timeouts
    // because node will emit a faux-error "socket hang up"
    // when request is aborted before a connection is made
    if (_this4._aborted) return; // if not the same, we are in the **old** (cancelled) request,
    // so need to continue (same as for above)

    if (_this4._retries !== retries) return; // if we've received a response then we don't want to let
    // an error in the request blow up the response

    if (_this4.response) return;

    _this4.callback(error);
  }); // auth

  if (url.auth) {
    var auth = url.auth.split(':');
    this.auth(auth[0], auth[1]);
  }

  if (this.username && this.password) {
    this.auth(this.username, this.password);
  }

  for (var key in this.header) {
    if (hasOwn(this.header, key)) req.setHeader(key, this.header[key]);
  } // add cookies


  if (this.cookies) {
    if (hasOwn(this._header, 'cookie')) {
      // merge
      var temporaryJar = new CookieJar.CookieJar();
      temporaryJar.setCookies(this._header.cookie.split(';'));
      temporaryJar.setCookies(this.cookies.split(';'));
      req.setHeader('Cookie', temporaryJar.getCookies(CookieJar.CookieAccessInfo.All).toValueString());
    } else {
      req.setHeader('Cookie', this.cookies);
    }
  }

  return req;
};
/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */


Request.prototype.callback = function (error, res) {
  if (this._shouldRetry(error, res)) {
    return this._retry();
  } // Avoid the error which is emitted from 'socket hang up' to cause the fn undefined error on JS runtime.


  var fn = this._callback || noop;
  this.clearTimeout();
  if (this.called) return console.warn('superagent: double callback bug');
  this.called = true;

  if (!error) {
    try {
      if (!this._isResponseOK(res)) {
        var message = 'Unsuccessful HTTP response';

        if (res) {
          message = http.STATUS_CODES[res.status] || message;
        }

        error = new Error(message);
        error.status = res ? res.status : undefined;
      }
    } catch (error_) {
      error = error_;
    }
  } // It's important that the callback is called outside try/catch
  // to avoid double callback


  if (!error) {
    return fn(null, res);
  }

  error.response = res;
  if (this._maxRetries) error.retries = this._retries - 1; // only emit error event if there is a listener
  // otherwise we assume the callback to `.end()` will get the error

  if (error && this.listeners('error').length > 0) {
    this.emit('error', error);
  }

  fn(error, res);
};
/**
 * Check if `obj` is a host object,
 *
 * @param {Object} obj host object
 * @return {Boolean} is a host object
 * @api private
 */


Request.prototype._isHost = function (object) {
  return Buffer.isBuffer(object) || object instanceof Stream || object instanceof FormData;
};
/**
 * Initiate request, invoking callback `fn(err, res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */


Request.prototype._emitResponse = function (body, files) {
  var response = new Response(this);
  this.response = response;
  response.redirects = this._redirectList;

  if (undefined !== body) {
    response.body = body;
  }

  response.files = files;

  if (this._endCalled) {
    response.pipe = function () {
      throw new Error("end() has already been called, so it's too late to start piping");
    };
  }

  this.emit('response', response);
  return response;
};

Request.prototype.end = function (fn) {
  this.request();
  debug('%s %s', this.method, this.url);

  if (this._endCalled) {
    throw new Error('.end() was called twice. This is not supported in superagent');
  }

  this._endCalled = true; // store callback

  this._callback = fn || noop;

  this._end();
};

Request.prototype._end = function () {
  var _this5 = this;

  if (this._aborted) return this.callback(new Error('The request has been aborted even before .end() was called'));
  var data = this._data;
  var req = this.req;
  var method = this.method;

  this._setTimeouts(); // body


  if (method !== 'HEAD' && !req._headerSent) {
    // serialize stuff
    if (typeof data !== 'string') {
      var contentType = req.getHeader('Content-Type'); // Parse out just the content type from the header (ignore the charset)

      if (contentType) contentType = contentType.split(';')[0];
      var serialize = this._serializer || exports.serialize[contentType];

      if (!serialize && isJSON(contentType)) {
        serialize = exports.serialize['application/json'];
      }

      if (serialize) data = serialize(data);
    } // content-length


    if (data && !req.getHeader('Content-Length')) {
      req.setHeader('Content-Length', Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data));
    }
  } // response
  // eslint-disable-next-line complexity


  req.once('response', function (res) {
    debug('%s %s -> %s', _this5.method, _this5.url, res.statusCode);

    if (_this5._responseTimeoutTimer) {
      clearTimeout(_this5._responseTimeoutTimer);
    }

    if (_this5.piped) {
      return;
    }

    var max = _this5._maxRedirects;
    var mime = utils.type(res.headers['content-type'] || '') || 'text/plain';
    var type = mime.split('/')[0];
    if (type) type = type.toLowerCase().trim();
    var multipart = type === 'multipart';
    var redirect = isRedirect(res.statusCode);
    var responseType = _this5._responseType;
    _this5.res = res; // redirect

    if (redirect && _this5._redirects++ !== max) {
      return _this5._redirect(res);
    }

    if (_this5.method === 'HEAD') {
      _this5.emit('end');

      _this5.callback(null, _this5._emitResponse());

      return;
    } // zlib support


    if (_this5._shouldUnzip(res)) {
      unzip(req, res);
    }

    var buffer = _this5._buffer;

    if (buffer === undefined && mime in exports.buffer) {
      buffer = Boolean(exports.buffer[mime]);
    }

    var parser = _this5._parser;

    if (undefined === buffer && parser) {
      console.warn("A custom superagent parser has been set, but buffering strategy for the parser hasn't been configured. Call `req.buffer(true or false)` or set `superagent.buffer[mime] = true or false`");
      buffer = true;
    }

    if (!parser) {
      if (responseType) {
        parser = exports.parse.image; // It's actually a generic Buffer

        buffer = true;
      } else if (multipart) {
        var form = formidable();
        parser = form.parse.bind(form);
        buffer = true;
      } else if (isImageOrVideo(mime)) {
        parser = exports.parse.image;
        buffer = true; // For backwards-compatibility buffering default is ad-hoc MIME-dependent
      } else if (exports.parse[mime]) {
        parser = exports.parse[mime];
      } else if (type === 'text') {
        parser = exports.parse.text;
        buffer = buffer !== false; // everyone wants their own white-labeled json
      } else if (isJSON(mime)) {
        parser = exports.parse['application/json'];
        buffer = buffer !== false;
      } else if (buffer) {
        parser = exports.parse.text;
      } else if (undefined === buffer) {
        parser = exports.parse.image; // It's actually a generic Buffer

        buffer = true;
      }
    } // by default only buffer text/*, json and messed up thing from hell


    if (undefined === buffer && isText(mime) || isJSON(mime)) {
      buffer = true;
    }

    _this5._resBuffered = buffer;
    var parserHandlesEnd = false;

    if (buffer) {
      // Protectiona against zip bombs and other nuisance
      var responseBytesLeft = _this5._maxResponseSize || 200000000;
      res.on('data', function (buf) {
        responseBytesLeft -= buf.byteLength || buf.length > 0 ? buf.length : 0;

        if (responseBytesLeft < 0) {
          // This will propagate through error event
          var error = new Error('Maximum response size reached');
          error.code = 'ETOOLARGE'; // Parsers aren't required to observe error event,
          // so would incorrectly report success

          parserHandlesEnd = false; // Will not emit error event

          res.destroy(error); // so we do callback now

          _this5.callback(error, null);
        }
      });
    }

    if (parser) {
      try {
        // Unbuffered parsers are supposed to emit response early,
        // which is weird BTW, because response.body won't be there.
        parserHandlesEnd = buffer;
        parser(res, function (error, object, files) {
          if (_this5.timedout) {
            // Timeout has already handled all callbacks
            return;
          } // Intentional (non-timeout) abort is supposed to preserve partial response,
          // even if it doesn't parse.


          if (error && !_this5._aborted) {
            return _this5.callback(error);
          }

          if (parserHandlesEnd) {
            _this5.emit('end');

            _this5.callback(null, _this5._emitResponse(object, files));
          }
        });
      } catch (err) {
        _this5.callback(err);

        return;
      }
    }

    _this5.res = res; // unbuffered

    if (!buffer) {
      debug('unbuffered %s %s', _this5.method, _this5.url);

      _this5.callback(null, _this5._emitResponse());

      if (multipart) return; // allow multipart to handle end event

      res.once('end', function () {
        debug('end %s %s', _this5.method, _this5.url);

        _this5.emit('end');
      });
      return;
    } // terminating events


    res.once('error', function (error) {
      parserHandlesEnd = false;

      _this5.callback(error, null);
    });
    if (!parserHandlesEnd) res.once('end', function () {
      debug('end %s %s', _this5.method, _this5.url); // TODO: unless buffering emit earlier to stream

      _this5.emit('end');

      _this5.callback(null, _this5._emitResponse());
    });
  });
  this.emit('request', this);

  var getProgressMonitor = function getProgressMonitor() {
    var lengthComputable = true;
    var total = req.getHeader('Content-Length');
    var loaded = 0;
    var progress = new Stream.Transform();

    progress._transform = function (chunk, encoding, cb) {
      loaded += chunk.length;

      _this5.emit('progress', {
        direction: 'upload',
        lengthComputable: lengthComputable,
        loaded: loaded,
        total: total
      });

      cb(null, chunk);
    };

    return progress;
  };

  var bufferToChunks = function bufferToChunks(buffer) {
    var chunkSize = 16 * 1024; // default highWaterMark value

    var chunking = new Stream.Readable();
    var totalLength = buffer.length;
    var remainder = totalLength % chunkSize;
    var cutoff = totalLength - remainder;

    for (var i = 0; i < cutoff; i += chunkSize) {
      var chunk = buffer.slice(i, i + chunkSize);
      chunking.push(chunk);
    }

    if (remainder > 0) {
      var remainderBuffer = buffer.slice(-remainder);
      chunking.push(remainderBuffer);
    }

    chunking.push(null); // no more data

    return chunking;
  }; // if a FormData instance got created, then we send that as the request body


  var formData = this._formData;

  if (formData) {
    // set headers
    var headers = formData.getHeaders();

    for (var i in headers) {
      if (hasOwn(headers, i)) {
        debug('setting FormData header: "%s: %s"', i, headers[i]);
        req.setHeader(i, headers[i]);
      }
    } // attempt to get "Content-Length" header


    formData.getLength(function (error, length) {
      // TODO: Add chunked encoding when no length (if err)
      if (error) debug('formData.getLength had error', error, length);
      debug('got FormData Content-Length: %s', length);

      if (typeof length === 'number') {
        req.setHeader('Content-Length', length);
      }

      formData.pipe(getProgressMonitor()).pipe(req);
    });
  } else if (Buffer.isBuffer(data)) {
    bufferToChunks(data).pipe(getProgressMonitor()).pipe(req);
  } else {
    req.end(data);
  }
}; // Check whether response has a non-0-sized gzip-encoded body


Request.prototype._shouldUnzip = function (res) {
  if (res.statusCode === 204 || res.statusCode === 304) {
    // These aren't supposed to have any body
    return false;
  } // header content is a string, and distinction between 0 and no information is crucial


  if (res.headers['content-length'] === '0') {
    // We know that the body is empty (unfortunately, this check does not cover chunked encoding)
    return false;
  } // console.log(res);


  return /^\s*(?:deflate|gzip)\s*$/.test(res.headers['content-encoding']);
};
/**
 * Overrides DNS for selected hostnames. Takes object mapping hostnames to IP addresses.
 *
 * When making a request to a URL with a hostname exactly matching a key in the object,
 * use the given IP address to connect, instead of using DNS to resolve the hostname.
 *
 * A special host `*` matches every hostname (keep redirects in mind!)
 *
 *      request.connect({
 *        'test.example.com': '127.0.0.1',
 *        'ipv6.example.com': '::1',
 *      })
 */


Request.prototype.connect = function (connectOverride) {
  if (typeof connectOverride === 'string') {
    this._connectOverride = {
      '*': connectOverride
    };
  } else if (_typeof(connectOverride) === 'object') {
    this._connectOverride = connectOverride;
  } else {
    this._connectOverride = undefined;
  }

  return this;
};

Request.prototype.trustLocalhost = function (toggle) {
  this._trustLocalhost = toggle === undefined ? true : toggle;
  return this;
}; // generate HTTP verb methods


if (!methods.includes('del')) {
  // create a copy so we don't cause conflicts with
  // other packages using the methods package and
  // npm 3.x
  methods = _toConsumableArray(methods);
  methods.push('del');
}

var _iterator = _createForOfIteratorHelper(methods),
    _step;

try {
  var _loop = function _loop() {
    var method = _step.value;
    var name = method;
    method = method === 'del' ? 'delete' : method;
    method = method.toUpperCase();

    request[name] = function (url, data, fn) {
      var request_ = request(method, url);

      if (typeof data === 'function') {
        fn = data;
        data = null;
      }

      if (data) {
        if (method === 'GET' || method === 'HEAD') {
          request_.query(data);
        } else {
          request_.send(data);
        }
      }

      if (fn) request_.end(fn);
      return request_;
    };
  };

  for (_iterator.s(); !(_step = _iterator.n()).done;) {
    _loop();
  }
  /**
   * Check if `mime` is text and should be buffered.
   *
   * @param {String} mime
   * @return {Boolean}
   * @api public
   */

} catch (err) {
  _iterator.e(err);
} finally {
  _iterator.f();
}

function isText(mime) {
  var parts = mime.split('/');
  var type = parts[0];
  if (type) type = type.toLowerCase().trim();
  var subtype = parts[1];
  if (subtype) subtype = subtype.toLowerCase().trim();
  return type === 'text' || subtype === 'x-www-form-urlencoded';
}

function isImageOrVideo(mime) {
  var type = mime.split('/')[0];
  if (type) type = type.toLowerCase().trim();
  return type === 'image' || type === 'video';
}
/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */


function isJSON(mime) {
  // should match /json or +json
  // but not /json-seq
  return /[/+]json($|[^-\w])/i.test(mime);
}
/**
 * Check if we should follow the redirect `code`.
 *
 * @param {Number} code
 * @return {Boolean}
 * @api private
 */


function isRedirect(code) {
  return [301, 302, 303, 305, 307, 308].includes(code);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL2luZGV4LmpzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJwYXJzZSIsImZvcm1hdCIsInJlc29sdmUiLCJTdHJlYW0iLCJodHRwcyIsImh0dHAiLCJmcyIsInpsaWIiLCJ1dGlsIiwicXMiLCJtaW1lIiwibWV0aG9kcyIsIkZvcm1EYXRhIiwiZm9ybWlkYWJsZSIsImRlYnVnIiwiQ29va2llSmFyIiwic2VtdmVyR3RlIiwic2FmZVN0cmluZ2lmeSIsInV0aWxzIiwiUmVxdWVzdEJhc2UiLCJ1bnppcCIsIlJlc3BvbnNlIiwibWl4aW4iLCJoYXNPd24iLCJodHRwMiIsInByb2Nlc3MiLCJ2ZXJzaW9uIiwicmVxdWVzdCIsIm1ldGhvZCIsInVybCIsImV4cG9ydHMiLCJSZXF1ZXN0IiwiZW5kIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwibW9kdWxlIiwiYWdlbnQiLCJub29wIiwiZGVmaW5lIiwicHJvdG9jb2xzIiwic2VyaWFsaXplIiwic3RyaW5naWZ5IiwiYnVmZmVyIiwiX2luaXRIZWFkZXJzIiwicmVxdWVzdF8iLCJfaGVhZGVyIiwiaGVhZGVyIiwiY2FsbCIsIl9lbmFibGVIdHRwMiIsIkJvb2xlYW4iLCJlbnYiLCJIVFRQMl9URVNUIiwiX2FnZW50IiwiX2Zvcm1EYXRhIiwid3JpdGFibGUiLCJfcmVkaXJlY3RzIiwicmVkaXJlY3RzIiwiY29va2llcyIsIl9xdWVyeSIsInFzUmF3IiwiX3JlZGlyZWN0TGlzdCIsIl9zdHJlYW1SZXF1ZXN0IiwiX2xvb2t1cCIsInVuZGVmaW5lZCIsIm9uY2UiLCJjbGVhclRpbWVvdXQiLCJiaW5kIiwiaW5oZXJpdHMiLCJwcm90b3R5cGUiLCJib29sIiwiRXJyb3IiLCJhdHRhY2giLCJmaWVsZCIsImZpbGUiLCJvcHRpb25zIiwiX2RhdGEiLCJvIiwiZmlsZW5hbWUiLCJjcmVhdGVSZWFkU3RyZWFtIiwib24iLCJlcnJvciIsImZvcm1EYXRhIiwiX2dldEZvcm1EYXRhIiwiZW1pdCIsInBhdGgiLCJhcHBlbmQiLCJjYWxsZWQiLCJjYWxsYmFjayIsImFib3J0IiwibG9va3VwIiwidHlwZSIsInNldCIsImluY2x1ZGVzIiwiZ2V0VHlwZSIsImFjY2VwdCIsInF1ZXJ5IiwidmFsdWUiLCJwdXNoIiwiT2JqZWN0IiwiYXNzaWduIiwid3JpdGUiLCJkYXRhIiwiZW5jb2RpbmciLCJwaXBlIiwic3RyZWFtIiwicGlwZWQiLCJfcGlwZUNvbnRpbnVlIiwicmVxIiwicmVzIiwiaXNSZWRpcmVjdCIsInN0YXR1c0NvZGUiLCJfbWF4UmVkaXJlY3RzIiwiX3JlZGlyZWN0IiwiX2VtaXRSZXNwb25zZSIsIl9hYm9ydGVkIiwiX3Nob3VsZFVuemlwIiwidW56aXBPYmplY3QiLCJjcmVhdGVVbnppcCIsImNvZGUiLCJfYnVmZmVyIiwiaGVhZGVycyIsImxvY2F0aW9uIiwicmVzdW1lIiwiZ2V0SGVhZGVycyIsIl9oZWFkZXJzIiwiY2hhbmdlc09yaWdpbiIsImhvc3QiLCJjbGVhbkhlYWRlciIsIl9lbmRDYWxsZWQiLCJfY2FsbGJhY2siLCJhdXRoIiwidXNlciIsInBhc3MiLCJlbmNvZGVyIiwic3RyaW5nIiwiQnVmZmVyIiwiZnJvbSIsInRvU3RyaW5nIiwiX2F1dGgiLCJjYSIsImNlcnQiLCJfY2EiLCJrZXkiLCJfa2V5IiwicGZ4IiwiaXNCdWZmZXIiLCJfcGZ4IiwiX3Bhc3NwaHJhc2UiLCJwYXNzcGhyYXNlIiwiX2NlcnQiLCJkaXNhYmxlVExTQ2VydHMiLCJfZGlzYWJsZVRMU0NlcnRzIiwiaW5kaWNlcyIsInN0cmljdE51bGxIYW5kbGluZyIsIl9maW5hbGl6ZVF1ZXJ5U3RyaW5nIiwiZXJyIiwicmV0cmllcyIsIl9yZXRyaWVzIiwicXVlcnlTdHJpbmdCYWNrdGlja3MiLCJxdWVyeVN0YXJ0SW5kZXgiLCJpbmRleE9mIiwicXVlcnlTdHJpbmciLCJzbGljZSIsIm1hdGNoIiwiaSIsInJlcGxhY2UiLCJzZWFyY2giLCJwYXRobmFtZSIsInRlc3QiLCJwcm90b2NvbCIsInNwbGl0IiwidW5peFBhcnRzIiwic29ja2V0UGF0aCIsIl9jb25uZWN0T3ZlcnJpZGUiLCJob3N0bmFtZSIsIm5ld0hvc3QiLCJuZXdQb3J0IiwicG9ydCIsInJlamVjdFVuYXV0aG9yaXplZCIsIk5PREVfVExTX1JFSkVDVF9VTkFVVEhPUklaRUQiLCJzZXJ2ZXJuYW1lIiwiX3RydXN0TG9jYWxob3N0IiwibW9kIiwic2V0UHJvdG9jb2wiLCJzZXROb0RlbGF5Iiwic2V0SGVhZGVyIiwicmVzcG9uc2UiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwidGVtcG9yYXJ5SmFyIiwic2V0Q29va2llcyIsImNvb2tpZSIsImdldENvb2tpZXMiLCJDb29raWVBY2Nlc3NJbmZvIiwiQWxsIiwidG9WYWx1ZVN0cmluZyIsIl9zaG91bGRSZXRyeSIsIl9yZXRyeSIsImZuIiwiY29uc29sZSIsIndhcm4iLCJfaXNSZXNwb25zZU9LIiwibWVzc2FnZSIsIlNUQVRVU19DT0RFUyIsInN0YXR1cyIsImVycm9yXyIsIl9tYXhSZXRyaWVzIiwibGlzdGVuZXJzIiwiX2lzSG9zdCIsIm9iamVjdCIsImJvZHkiLCJmaWxlcyIsIl9lbmQiLCJfc2V0VGltZW91dHMiLCJfaGVhZGVyU2VudCIsImNvbnRlbnRUeXBlIiwiZ2V0SGVhZGVyIiwiX3NlcmlhbGl6ZXIiLCJpc0pTT04iLCJieXRlTGVuZ3RoIiwiX3Jlc3BvbnNlVGltZW91dFRpbWVyIiwibWF4IiwidG9Mb3dlckNhc2UiLCJ0cmltIiwibXVsdGlwYXJ0IiwicmVkaXJlY3QiLCJyZXNwb25zZVR5cGUiLCJfcmVzcG9uc2VUeXBlIiwicGFyc2VyIiwiX3BhcnNlciIsImltYWdlIiwiZm9ybSIsImlzSW1hZ2VPclZpZGVvIiwidGV4dCIsImlzVGV4dCIsIl9yZXNCdWZmZXJlZCIsInBhcnNlckhhbmRsZXNFbmQiLCJyZXNwb25zZUJ5dGVzTGVmdCIsIl9tYXhSZXNwb25zZVNpemUiLCJidWYiLCJkZXN0cm95IiwidGltZWRvdXQiLCJnZXRQcm9ncmVzc01vbml0b3IiLCJsZW5ndGhDb21wdXRhYmxlIiwidG90YWwiLCJsb2FkZWQiLCJwcm9ncmVzcyIsIlRyYW5zZm9ybSIsIl90cmFuc2Zvcm0iLCJjaHVuayIsImNiIiwiZGlyZWN0aW9uIiwiYnVmZmVyVG9DaHVua3MiLCJjaHVua1NpemUiLCJjaHVua2luZyIsIlJlYWRhYmxlIiwidG90YWxMZW5ndGgiLCJyZW1haW5kZXIiLCJjdXRvZmYiLCJyZW1haW5kZXJCdWZmZXIiLCJnZXRMZW5ndGgiLCJjb25uZWN0IiwiY29ubmVjdE92ZXJyaWRlIiwidHJ1c3RMb2NhbGhvc3QiLCJ0b2dnbGUiLCJuYW1lIiwidG9VcHBlckNhc2UiLCJzZW5kIiwicGFydHMiLCJzdWJ0eXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFFQTtBQUNBLGVBQW1DQSxPQUFPLENBQUMsS0FBRCxDQUExQztBQUFBLElBQVFDLEtBQVIsWUFBUUEsS0FBUjtBQUFBLElBQWVDLE1BQWYsWUFBZUEsTUFBZjtBQUFBLElBQXVCQyxPQUF2QixZQUF1QkEsT0FBdkI7O0FBQ0EsSUFBTUMsTUFBTSxHQUFHSixPQUFPLENBQUMsUUFBRCxDQUF0Qjs7QUFDQSxJQUFNSyxLQUFLLEdBQUdMLE9BQU8sQ0FBQyxPQUFELENBQXJCOztBQUNBLElBQU1NLElBQUksR0FBR04sT0FBTyxDQUFDLE1BQUQsQ0FBcEI7O0FBQ0EsSUFBTU8sRUFBRSxHQUFHUCxPQUFPLENBQUMsSUFBRCxDQUFsQjs7QUFDQSxJQUFNUSxJQUFJLEdBQUdSLE9BQU8sQ0FBQyxNQUFELENBQXBCOztBQUNBLElBQU1TLElBQUksR0FBR1QsT0FBTyxDQUFDLE1BQUQsQ0FBcEI7O0FBQ0EsSUFBTVUsRUFBRSxHQUFHVixPQUFPLENBQUMsSUFBRCxDQUFsQjs7QUFDQSxJQUFNVyxJQUFJLEdBQUdYLE9BQU8sQ0FBQyxNQUFELENBQXBCOztBQUNBLElBQUlZLE9BQU8sR0FBR1osT0FBTyxDQUFDLFNBQUQsQ0FBckI7O0FBQ0EsSUFBTWEsUUFBUSxHQUFHYixPQUFPLENBQUMsV0FBRCxDQUF4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QixFQUFWO0FBRWIsU0FBT3JJLElBQUksS0FBSyxNQUFULElBQW1CbUwsT0FBTyxLQUFLLHVCQUF0QztBQUNEOztBQUVELFNBQVNyQyxjQUFULENBQXdCOU4sSUFBeEIsRUFBOEI7QUFDNUIsTUFBSWdGLElBQUksR0FBR2hGLElBQUksQ0FBQ2dLLEtBQUwsQ0FBVyxHQUFYLEVBQWdCLENBQWhCLENBQVg7QUFDQSxNQUFJaEYsSUFBSixFQUFVQSxJQUFJLEdBQUdBLElBQUksQ0FBQ29JLFdBQUwsR0FBbUJDLElBQW5CLEVBQVA7QUFFVixTQUFPckksSUFBSSxLQUFLLE9BQVQsSUFBb0JBLElBQUksS0FBSyxPQUFwQztBQUNEO0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBLFNBQVNnSSxNQUFULENBQWdCaE4sSUFBaEIsRUFBc0I7QUFDcEI7QUFDQTtBQUNBLFNBQU8sc0JBQXNCOEosSUFBdEIsQ0FBMkI5SixJQUEzQixDQUFQO0FBQ0Q7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUEsU0FBU21HLFVBQVQsQ0FBb0JTLElBQXBCLEVBQTBCO0FBQ3hCLFNBQU8sQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0IxQixRQUEvQixDQUF3QzBCLElBQXhDLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm9kZS9uby1kZXByZWNhdGVkLWFwaVxuY29uc3QgeyBwYXJzZSwgZm9ybWF0LCByZXNvbHZlIH0gPSByZXF1aXJlKCd1cmwnKTtcbmNvbnN0IFN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuY29uc3QgaHR0cHMgPSByZXF1aXJlKCdodHRwcycpO1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2h0dHAnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHpsaWIgPSByZXF1aXJlKCd6bGliJyk7XG5jb25zdCB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuY29uc3QgcXMgPSByZXF1aXJlKCdxcycpO1xuY29uc3QgbWltZSA9IHJlcXVpcmUoJ21pbWUnKTtcbmxldCBtZXRob2RzID0gcmVxdWlyZSgnbWV0aG9kcycpO1xuY29uc3QgRm9ybURhdGEgPSByZXF1aXJlKCdmb3JtLWRhdGEnKTtcbmNvbnN0IGZvcm1pZGFibGUgPSByZXF1aXJlKCdmb3JtaWRhYmxlJyk7XG5jb25zdCBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ3N1cGVyYWdlbnQnKTtcbmNvbnN0IENvb2tpZUphciA9IHJlcXVpcmUoJ2Nvb2tpZWphcicpO1xuY29uc3Qgc2VtdmVyR3RlID0gcmVxdWlyZSgnc2VtdmVyL2Z1bmN0aW9ucy9ndGUnKTtcbmNvbnN0IHNhZmVTdHJpbmdpZnkgPSByZXF1aXJlKCdmYXN0LXNhZmUtc3RyaW5naWZ5Jyk7XG5cbmNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbmNvbnN0IFJlcXVlc3RCYXNlID0gcmVxdWlyZSgnLi4vcmVxdWVzdC1iYXNlJyk7XG5jb25zdCB7IHVuemlwIH0gPSByZXF1aXJlKCcuL3VuemlwJyk7XG5jb25zdCBSZXNwb25zZSA9IHJlcXVpcmUoJy4vcmVzcG9uc2UnKTtcblxuY29uc3QgeyBtaXhpbiwgaGFzT3duIH0gPSB1dGlscztcblxubGV0IGh0dHAyO1xuXG5pZiAoc2VtdmVyR3RlKHByb2Nlc3MudmVyc2lvbiwgJ3YxMC4xMC4wJykpIGh0dHAyID0gcmVxdWlyZSgnLi9odHRwMndyYXBwZXInKTtcblxuZnVuY3Rpb24gcmVxdWVzdChtZXRob2QsIHVybCkge1xuICAvLyBjYWxsYmFja1xuICBpZiAodHlwZW9mIHVybCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBuZXcgZXhwb3J0cy5SZXF1ZXN0KCdHRVQnLCBtZXRob2QpLmVuZCh1cmwpO1xuICB9XG5cbiAgLy8gdXJsIGZpcnN0XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIG5ldyBleHBvcnRzLlJlcXVlc3QoJ0dFVCcsIG1ldGhvZCk7XG4gIH1cblxuICByZXR1cm4gbmV3IGV4cG9ydHMuUmVxdWVzdChtZXRob2QsIHVybCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWVzdDtcbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cztcblxuLyoqXG4gKiBFeHBvc2UgYFJlcXVlc3RgLlxuICovXG5cbmV4cG9ydHMuUmVxdWVzdCA9IFJlcXVlc3Q7XG5cbi8qKlxuICogRXhwb3NlIHRoZSBhZ2VudCBmdW5jdGlvblxuICovXG5cbmV4cG9ydHMuYWdlbnQgPSByZXF1aXJlKCcuL2FnZW50Jyk7XG5cbi8qKlxuICogTm9vcC5cbiAqL1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuLyoqXG4gKiBFeHBvc2UgYFJlc3BvbnNlYC5cbiAqL1xuXG5leHBvcnRzLlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbi8qKlxuICogRGVmaW5lIFwiZm9ybVwiIG1pbWUgdHlwZS5cbiAqL1xuXG5taW1lLmRlZmluZShcbiAge1xuICAgICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBbJ2Zvcm0nLCAndXJsZW5jb2RlZCcsICdmb3JtLWRhdGEnXVxuICB9LFxuICB0cnVlXG4pO1xuXG4vKipcbiAqIFByb3RvY29sIG1hcC5cbiAqL1xuXG5leHBvcnRzLnByb3RvY29scyA9IHtcbiAgJ2h0dHA6JzogaHR0cCxcbiAgJ2h0dHBzOic6IGh0dHBzLFxuICAnaHR0cDI6JzogaHR0cDJcbn07XG5cbi8qKlxuICogRGVmYXVsdCBzZXJpYWxpemF0aW9uIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC5zZXJpYWxpemVbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24ob2JqKXtcbiAqICAgICAgIHJldHVybiAnZ2VuZXJhdGVkIHhtbCBoZXJlJztcbiAqICAgICB9O1xuICpcbiAqL1xuXG5leHBvcnRzLnNlcmlhbGl6ZSA9IHtcbiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHFzLnN0cmluZ2lmeSxcbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiBzYWZlU3RyaW5naWZ5XG59O1xuXG4vKipcbiAqIERlZmF1bHQgcGFyc2Vycy5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC5wYXJzZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihyZXMsIGZuKXtcbiAqICAgICAgIGZuKG51bGwsIHJlcyk7XG4gKiAgICAgfTtcbiAqXG4gKi9cblxuZXhwb3J0cy5wYXJzZSA9IHJlcXVpcmUoJy4vcGFyc2VycycpO1xuXG4vKipcbiAqIERlZmF1bHQgYnVmZmVyaW5nIG1hcC4gQ2FuIGJlIHVzZWQgdG8gc2V0IGNlcnRhaW5cbiAqIHJlc3BvbnNlIHR5cGVzIHRvIGJ1ZmZlci9ub3QgYnVmZmVyLlxuICpcbiAqICAgICBzdXBlcmFnZW50LmJ1ZmZlclsnYXBwbGljYXRpb24veG1sJ10gPSB0cnVlO1xuICovXG5leHBvcnRzLmJ1ZmZlciA9IHt9O1xuXG4vKipcbiAqIEluaXRpYWxpemUgaW50ZXJuYWwgaGVhZGVyIHRyYWNraW5nIHByb3BlcnRpZXMgb24gYSByZXF1ZXN0IGluc3RhbmNlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSByZXEgdGhlIGluc3RhbmNlXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX2luaXRIZWFkZXJzKHJlcXVlc3RfKSB7XG4gIHJlcXVlc3RfLl9oZWFkZXIgPSB7XG4gICAgLy8gY29lcmNlcyBoZWFkZXIgbmFtZXMgdG8gbG93ZXJjYXNlXG4gIH07XG4gIHJlcXVlc3RfLmhlYWRlciA9IHtcbiAgICAvLyBwcmVzZXJ2ZXMgaGVhZGVyIG5hbWUgY2FzZVxuICB9O1xufVxuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlcXVlc3RgIHdpdGggdGhlIGdpdmVuIGBtZXRob2RgIGFuZCBgdXJsYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IHVybFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBSZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIFN0cmVhbS5jYWxsKHRoaXMpO1xuICBpZiAodHlwZW9mIHVybCAhPT0gJ3N0cmluZycpIHVybCA9IGZvcm1hdCh1cmwpO1xuICB0aGlzLl9lbmFibGVIdHRwMiA9IEJvb2xlYW4ocHJvY2Vzcy5lbnYuSFRUUDJfVEVTVCk7IC8vIGludGVybmFsIG9ubHlcbiAgdGhpcy5fYWdlbnQgPSBmYWxzZTtcbiAgdGhpcy5fZm9ybURhdGEgPSBudWxsO1xuICB0aGlzLm1ldGhvZCA9IG1ldGhvZDtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIF9pbml0SGVhZGVycyh0aGlzKTtcbiAgdGhpcy53cml0YWJsZSA9IHRydWU7XG4gIHRoaXMuX3JlZGlyZWN0cyA9IDA7XG4gIHRoaXMucmVkaXJlY3RzKG1ldGhvZCA9PT0gJ0hFQUQnID8gMCA6IDUpO1xuICB0aGlzLmNvb2tpZXMgPSAnJztcbiAgdGhpcy5xcyA9IHt9O1xuICB0aGlzLl9xdWVyeSA9IFtdO1xuICB0aGlzLnFzUmF3ID0gdGhpcy5fcXVlcnk7IC8vIFVudXNlZCwgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IG9ubHlcbiAgdGhpcy5fcmVkaXJlY3RMaXN0ID0gW107XG4gIHRoaXMuX3N0cmVhbVJlcXVlc3QgPSBmYWxzZTtcbiAgdGhpcy5fbG9va3VwID0gdW5kZWZpbmVkO1xuICB0aGlzLm9uY2UoJ2VuZCcsIHRoaXMuY2xlYXJUaW1lb3V0LmJpbmQodGhpcykpO1xufVxuXG4vKipcbiAqIEluaGVyaXQgZnJvbSBgU3RyZWFtYCAod2hpY2ggaW5oZXJpdHMgZnJvbSBgRXZlbnRFbWl0dGVyYCkuXG4gKiBNaXhpbiBgUmVxdWVzdEJhc2VgLlxuICovXG51dGlsLmluaGVyaXRzKFJlcXVlc3QsIFN0cmVhbSk7XG5cbm1peGluKFJlcXVlc3QucHJvdG90eXBlLCBSZXF1ZXN0QmFzZS5wcm90b3R5cGUpO1xuXG4vKipcbiAqIEVuYWJsZSBvciBEaXNhYmxlIGh0dHAyLlxuICpcbiAqIEVuYWJsZSBodHRwMi5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QuZ2V0KCdodHRwOi8vbG9jYWxob3N0LycpXG4gKiAgIC5odHRwMigpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIHJlcXVlc3QuZ2V0KCdodHRwOi8vbG9jYWxob3N0LycpXG4gKiAgIC5odHRwMih0cnVlKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIERpc2FibGUgaHR0cDIuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0ID0gcmVxdWVzdC5odHRwMigpO1xuICogcmVxdWVzdC5nZXQoJ2h0dHA6Ly9sb2NhbGhvc3QvJylcbiAqICAgLmh0dHAyKGZhbHNlKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZW5hYmxlXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuaHR0cDIgPSBmdW5jdGlvbiAoYm9vbCkge1xuICBpZiAoZXhwb3J0cy5wcm90b2NvbHNbJ2h0dHAyOiddID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnc3VwZXJhZ2VudDogdGhpcyB2ZXJzaW9uIG9mIE5vZGUuanMgZG9lcyBub3Qgc3VwcG9ydCBodHRwMidcbiAgICApO1xuICB9XG5cbiAgdGhpcy5fZW5hYmxlSHR0cDIgPSBib29sID09PSB1bmRlZmluZWQgPyB0cnVlIDogYm9vbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFF1ZXVlIHRoZSBnaXZlbiBgZmlsZWAgYXMgYW4gYXR0YWNobWVudCB0byB0aGUgc3BlY2lmaWVkIGBmaWVsZGAsXG4gKiB3aXRoIG9wdGlvbmFsIGBvcHRpb25zYCAob3IgZmlsZW5hbWUpLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCdodHRwOi8vbG9jYWxob3N0L3VwbG9hZCcpXG4gKiAgIC5hdHRhY2goJ2ZpZWxkJywgQnVmZmVyLmZyb20oJzxiPkhlbGxvIHdvcmxkPC9iPicpLCAnaGVsbG8uaHRtbCcpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQSBmaWxlbmFtZSBtYXkgYWxzbyBiZSB1c2VkOlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCdodHRwOi8vbG9jYWxob3N0L3VwbG9hZCcpXG4gKiAgIC5hdHRhY2goJ2ZpbGVzJywgJ2ltYWdlLmpwZycpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcGFyYW0ge1N0cmluZ3xmcy5SZWFkU3RyZWFtfEJ1ZmZlcn0gZmlsZVxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXR0YWNoID0gZnVuY3Rpb24gKGZpZWxkLCBmaWxlLCBvcHRpb25zKSB7XG4gIGlmIChmaWxlKSB7XG4gICAgaWYgKHRoaXMuX2RhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInN1cGVyYWdlbnQgY2FuJ3QgbWl4IC5zZW5kKCkgYW5kIC5hdHRhY2goKVwiKTtcbiAgICB9XG5cbiAgICBsZXQgbyA9IG9wdGlvbnMgfHwge307XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgICAgbyA9IHsgZmlsZW5hbWU6IG9wdGlvbnMgfTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGZpbGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoIW8uZmlsZW5hbWUpIG8uZmlsZW5hbWUgPSBmaWxlO1xuICAgICAgZGVidWcoJ2NyZWF0aW5nIGBmcy5SZWFkU3RyZWFtYCBpbnN0YW5jZSBmb3IgZmlsZTogJXMnLCBmaWxlKTtcbiAgICAgIGZpbGUgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGUpO1xuICAgICAgZmlsZS5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc3QgZm9ybURhdGEgPSB0aGlzLl9nZXRGb3JtRGF0YSgpO1xuICAgICAgICBmb3JtRGF0YS5lbWl0KCdlcnJvcicsIGVycm9yKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoIW8uZmlsZW5hbWUgJiYgZmlsZS5wYXRoKSB7XG4gICAgICBvLmZpbGVuYW1lID0gZmlsZS5wYXRoO1xuICAgIH1cblxuICAgIHRoaXMuX2dldEZvcm1EYXRhKCkuYXBwZW5kKGZpZWxkLCBmaWxlLCBvKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuX2dldEZvcm1EYXRhID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIXRoaXMuX2Zvcm1EYXRhKSB7XG4gICAgdGhpcy5fZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICB0aGlzLl9mb3JtRGF0YS5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgIGRlYnVnKCdGb3JtRGF0YSBlcnJvcicsIGVycm9yKTtcbiAgICAgIGlmICh0aGlzLmNhbGxlZCkge1xuICAgICAgICAvLyBUaGUgcmVxdWVzdCBoYXMgYWxyZWFkeSBmaW5pc2hlZCBhbmQgdGhlIGNhbGxiYWNrIHdhcyBjYWxsZWQuXG4gICAgICAgIC8vIFNpbGVudGx5IGlnbm9yZSB0aGUgZXJyb3IuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jYWxsYmFjayhlcnJvcik7XG4gICAgICB0aGlzLmFib3J0KCk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5fZm9ybURhdGE7XG59O1xuXG4vKipcbiAqIEdldHMvc2V0cyB0aGUgYEFnZW50YCB0byB1c2UgZm9yIHRoaXMgSFRUUCByZXF1ZXN0LiBUaGUgZGVmYXVsdCAoaWYgdGhpc1xuICogZnVuY3Rpb24gaXMgbm90IGNhbGxlZCkgaXMgdG8gb3B0IG91dCBvZiBjb25uZWN0aW9uIHBvb2xpbmcgKGBhZ2VudDogZmFsc2VgKS5cbiAqXG4gKiBAcGFyYW0ge2h0dHAuQWdlbnR9IGFnZW50XG4gKiBAcmV0dXJuIHtodHRwLkFnZW50fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hZ2VudCA9IGZ1bmN0aW9uIChhZ2VudCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRoaXMuX2FnZW50O1xuICB0aGlzLl9hZ2VudCA9IGFnZW50O1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogR2V0cy9zZXRzIHRoZSBgbG9va3VwYCBmdW5jdGlvbiB0byB1c2UgY3VzdG9tIEROUyByZXNvbHZlci5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsb29rdXBcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5sb29rdXAgPSBmdW5jdGlvbiAobG9va3VwKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdGhpcy5fbG9va3VwO1xuICB0aGlzLl9sb29rdXAgPSBsb29rdXA7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgX0NvbnRlbnQtVHlwZV8gcmVzcG9uc2UgaGVhZGVyIHBhc3NlZCB0aHJvdWdoIGBtaW1lLmdldFR5cGUoKWAuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCd4bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ2pzb24nKVxuICogICAgICAgIC5zZW5kKGpzb25zdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuc2VuZChqc29uc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudHlwZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gIHJldHVybiB0aGlzLnNldChcbiAgICAnQ29udGVudC1UeXBlJyxcbiAgICB0eXBlLmluY2x1ZGVzKCcvJykgPyB0eXBlIDogbWltZS5nZXRUeXBlKHR5cGUpXG4gICk7XG59O1xuXG4vKipcbiAqIFNldCBfQWNjZXB0XyByZXNwb25zZSBoZWFkZXIgcGFzc2VkIHRocm91Z2ggYG1pbWUuZ2V0VHlwZSgpYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMuanNvbiA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGFjY2VwdFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gIHJldHVybiB0aGlzLnNldCgnQWNjZXB0JywgdHlwZS5pbmNsdWRlcygnLycpID8gdHlwZSA6IG1pbWUuZ2V0VHlwZSh0eXBlKSk7XG59O1xuXG4vKipcbiAqIEFkZCBxdWVyeS1zdHJpbmcgYHZhbGAuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICByZXF1ZXN0LmdldCgnL3Nob2VzJylcbiAqICAgICAucXVlcnkoJ3NpemU9MTAnKVxuICogICAgIC5xdWVyeSh7IGNvbG9yOiAnYmx1ZScgfSlcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnF1ZXJ5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgdGhpcy5fcXVlcnkucHVzaCh2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLnFzLCB2YWx1ZSk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogV3JpdGUgcmF3IGBkYXRhYCAvIGBlbmNvZGluZ2AgdG8gdGhlIHNvY2tldC5cbiAqXG4gKiBAcGFyYW0ge0J1ZmZlcnxTdHJpbmd9IGRhdGFcbiAqIEBwYXJhbSB7U3RyaW5nfSBlbmNvZGluZ1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoZGF0YSwgZW5jb2RpbmcpIHtcbiAgY29uc3QgcmVxdWVzdF8gPSB0aGlzLnJlcXVlc3QoKTtcbiAgaWYgKCF0aGlzLl9zdHJlYW1SZXF1ZXN0KSB7XG4gICAgdGhpcy5fc3RyZWFtUmVxdWVzdCA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gcmVxdWVzdF8ud3JpdGUoZGF0YSwgZW5jb2RpbmcpO1xufTtcblxuLyoqXG4gKiBQaXBlIHRoZSByZXF1ZXN0IGJvZHkgdG8gYHN0cmVhbWAuXG4gKlxuICogQHBhcmFtIHtTdHJlYW19IHN0cmVhbVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1N0cmVhbX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUucGlwZSA9IGZ1bmN0aW9uIChzdHJlYW0sIG9wdGlvbnMpIHtcbiAgdGhpcy5waXBlZCA9IHRydWU7IC8vIEhBQ0suLi5cbiAgdGhpcy5idWZmZXIoZmFsc2UpO1xuICB0aGlzLmVuZCgpO1xuICByZXR1cm4gdGhpcy5fcGlwZUNvbnRpbnVlKHN0cmVhbSwgb3B0aW9ucyk7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5fcGlwZUNvbnRpbnVlID0gZnVuY3Rpb24gKHN0cmVhbSwgb3B0aW9ucykge1xuICB0aGlzLnJlcS5vbmNlKCdyZXNwb25zZScsIChyZXMpID0+IHtcbiAgICAvLyByZWRpcmVjdFxuICAgIGlmIChcbiAgICAgIGlzUmVkaXJlY3QocmVzLnN0YXR1c0NvZGUpICYmXG4gICAgICB0aGlzLl9yZWRpcmVjdHMrKyAhPT0gdGhpcy5fbWF4UmVkaXJlY3RzXG4gICAgKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVkaXJlY3QocmVzKSA9PT0gdGhpc1xuICAgICAgICA/IHRoaXMuX3BpcGVDb250aW51ZShzdHJlYW0sIG9wdGlvbnMpXG4gICAgICAgIDogdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHRoaXMucmVzID0gcmVzO1xuICAgIHRoaXMuX2VtaXRSZXNwb25zZSgpO1xuICAgIGlmICh0aGlzLl9hYm9ydGVkKSByZXR1cm47XG5cbiAgICBpZiAodGhpcy5fc2hvdWxkVW56aXAocmVzKSkge1xuICAgICAgY29uc3QgdW56aXBPYmplY3QgPSB6bGliLmNyZWF0ZVVuemlwKCk7XG4gICAgICB1bnppcE9iamVjdC5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgICAgaWYgKGVycm9yICYmIGVycm9yLmNvZGUgPT09ICdaX0JVRl9FUlJPUicpIHtcbiAgICAgICAgICAvLyB1bmV4cGVjdGVkIGVuZCBvZiBmaWxlIGlzIGlnbm9yZWQgYnkgYnJvd3NlcnMgYW5kIGN1cmxcbiAgICAgICAgICBzdHJlYW0uZW1pdCgnZW5kJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RyZWFtLmVtaXQoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgfSk7XG4gICAgICByZXMucGlwZSh1bnppcE9iamVjdCkucGlwZShzdHJlYW0sIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXMucGlwZShzdHJlYW0sIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHJlcy5vbmNlKCdlbmQnLCAoKSA9PiB7XG4gICAgICB0aGlzLmVtaXQoJ2VuZCcpO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIHN0cmVhbTtcbn07XG5cbi8qKlxuICogRW5hYmxlIC8gZGlzYWJsZSBidWZmZXJpbmcuXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn0gW3ZhbF1cbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5idWZmZXIgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdGhpcy5fYnVmZmVyID0gdmFsdWUgIT09IGZhbHNlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVkaXJlY3QgdG8gYHVybFxuICpcbiAqIEBwYXJhbSB7SW5jb21pbmdNZXNzYWdlfSByZXNcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuX3JlZGlyZWN0ID0gZnVuY3Rpb24gKHJlcykge1xuICBsZXQgdXJsID0gcmVzLmhlYWRlcnMubG9jYXRpb247XG4gIGlmICghdXJsKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2sobmV3IEVycm9yKCdObyBsb2NhdGlvbiBoZWFkZXIgZm9yIHJlZGlyZWN0JyksIHJlcyk7XG4gIH1cblxuICBkZWJ1ZygncmVkaXJlY3QgJXMgLT4gJXMnLCB0aGlzLnVybCwgdXJsKTtcblxuICAvLyBsb2NhdGlvblxuICB1cmwgPSByZXNvbHZlKHRoaXMudXJsLCB1cmwpO1xuXG4gIC8vIGVuc3VyZSB0aGUgcmVzcG9uc2UgaXMgYmVpbmcgY29uc3VtZWRcbiAgLy8gdGhpcyBpcyByZXF1aXJlZCBmb3IgTm9kZSB2MC4xMCtcbiAgcmVzLnJlc3VtZSgpO1xuXG4gIGxldCBoZWFkZXJzID0gdGhpcy5yZXEuZ2V0SGVhZGVycyA/IHRoaXMucmVxLmdldEhlYWRlcnMoKSA6IHRoaXMucmVxLl9oZWFkZXJzO1xuXG4gIGNvbnN0IGNoYW5nZXNPcmlnaW4gPSBwYXJzZSh1cmwpLmhvc3QgIT09IHBhcnNlKHRoaXMudXJsKS5ob3N0O1xuXG4gIC8vIGltcGxlbWVudGF0aW9uIG9mIDMwMiBmb2xsb3dpbmcgZGVmYWN0byBzdGFuZGFyZFxuICBpZiAocmVzLnN0YXR1c0NvZGUgPT09IDMwMSB8fCByZXMuc3RhdHVzQ29kZSA9PT0gMzAyKSB7XG4gICAgLy8gc3RyaXAgQ29udGVudC0qIHJlbGF0ZWQgZmllbGRzXG4gICAgLy8gaW4gY2FzZSBvZiBQT1NUIGV0Y1xuICAgIGhlYWRlcnMgPSB1dGlscy5jbGVhbkhlYWRlcihoZWFkZXJzLCBjaGFuZ2VzT3JpZ2luKTtcblxuICAgIC8vIGZvcmNlIEdFVFxuICAgIHRoaXMubWV0aG9kID0gdGhpcy5tZXRob2QgPT09ICdIRUFEJyA/ICdIRUFEJyA6ICdHRVQnO1xuXG4gICAgLy8gY2xlYXIgZGF0YVxuICAgIHRoaXMuX2RhdGEgPSBudWxsO1xuICB9XG5cbiAgLy8gMzAzIGlzIGFsd2F5cyBHRVRcbiAgaWYgKHJlcy5zdGF0dXNDb2RlID09PSAzMDMpIHtcbiAgICAvLyBzdHJpcCBDb250ZW50LSogcmVsYXRlZCBmaWVsZHNcbiAgICAvLyBpbiBjYXNlIG9mIFBPU1QgZXRjXG4gICAgaGVhZGVycyA9IHV0aWxzLmNsZWFuSGVhZGVyKGhlYWRlcnMsIGNoYW5nZXNPcmlnaW4pO1xuXG4gICAgLy8gZm9yY2UgbWV0aG9kXG4gICAgdGhpcy5tZXRob2QgPSAnR0VUJztcblxuICAgIC8vIGNsZWFyIGRhdGFcbiAgICB0aGlzLl9kYXRhID0gbnVsbDtcbiAgfVxuXG4gIC8vIDMwNyBwcmVzZXJ2ZXMgbWV0aG9kXG4gIC8vIDMwOCBwcmVzZXJ2ZXMgbWV0aG9kXG4gIGRlbGV0ZSBoZWFkZXJzLmhvc3Q7XG5cbiAgZGVsZXRlIHRoaXMucmVxO1xuICBkZWxldGUgdGhpcy5fZm9ybURhdGE7XG5cbiAgLy8gcmVtb3ZlIGFsbCBhZGQgaGVhZGVyIGV4Y2VwdCBVc2VyLUFnZW50XG4gIF9pbml0SGVhZGVycyh0aGlzKTtcblxuICAvLyByZWRpcmVjdFxuICB0aGlzLl9lbmRDYWxsZWQgPSBmYWxzZTtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMucXMgPSB7fTtcbiAgdGhpcy5fcXVlcnkubGVuZ3RoID0gMDtcbiAgdGhpcy5zZXQoaGVhZGVycyk7XG4gIHRoaXMuZW1pdCgncmVkaXJlY3QnLCByZXMpO1xuICB0aGlzLl9yZWRpcmVjdExpc3QucHVzaCh0aGlzLnVybCk7XG4gIHRoaXMuZW5kKHRoaXMuX2NhbGxiYWNrKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBdXRob3JpemF0aW9uIGZpZWxkIHZhbHVlIHdpdGggYHVzZXJgIGFuZCBgcGFzc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAuYXV0aCgndG9iaScsICdsZWFybmJvb3N0JylcbiAqICAgLmF1dGgoJ3RvYmk6bGVhcm5ib29zdCcpXG4gKiAgIC5hdXRoKCd0b2JpJylcbiAqICAgLmF1dGgoYWNjZXNzVG9rZW4sIHsgdHlwZTogJ2JlYXJlcicgfSlcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlclxuICogQHBhcmFtIHtTdHJpbmd9IFtwYXNzXVxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBvcHRpb25zIHdpdGggYXV0aG9yaXphdGlvbiB0eXBlICdiYXNpYycgb3IgJ2JlYXJlcicgKCdiYXNpYycgaXMgZGVmYXVsdClcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdXRoID0gZnVuY3Rpb24gKHVzZXIsIHBhc3MsIG9wdGlvbnMpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHBhc3MgPSAnJztcbiAgaWYgKHR5cGVvZiBwYXNzID09PSAnb2JqZWN0JyAmJiBwYXNzICE9PSBudWxsKSB7XG4gICAgLy8gcGFzcyBpcyBvcHRpb25hbCBhbmQgY2FuIGJlIHJlcGxhY2VkIHdpdGggb3B0aW9uc1xuICAgIG9wdGlvbnMgPSBwYXNzO1xuICAgIHBhc3MgPSAnJztcbiAgfVxuXG4gIGlmICghb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSB7IHR5cGU6ICdiYXNpYycgfTtcbiAgfVxuXG4gIGNvbnN0IGVuY29kZXIgPSAoc3RyaW5nKSA9PiBCdWZmZXIuZnJvbShzdHJpbmcpLnRvU3RyaW5nKCdiYXNlNjQnKTtcblxuICByZXR1cm4gdGhpcy5fYXV0aCh1c2VyLCBwYXNzLCBvcHRpb25zLCBlbmNvZGVyKTtcbn07XG5cbi8qKlxuICogU2V0IHRoZSBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkgb3B0aW9uIGZvciBodHRwcyByZXF1ZXN0LlxuICpcbiAqIEBwYXJhbSB7QnVmZmVyIHwgQXJyYXl9IGNlcnRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jYSA9IGZ1bmN0aW9uIChjZXJ0KSB7XG4gIHRoaXMuX2NhID0gY2VydDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgY2xpZW50IGNlcnRpZmljYXRlIGtleSBvcHRpb24gZm9yIGh0dHBzIHJlcXVlc3QuXG4gKlxuICogQHBhcmFtIHtCdWZmZXIgfCBTdHJpbmd9IGNlcnRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5rZXkgPSBmdW5jdGlvbiAoY2VydCkge1xuICB0aGlzLl9rZXkgPSBjZXJ0O1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IHRoZSBrZXksIGNlcnRpZmljYXRlLCBhbmQgQ0EgY2VydHMgb2YgdGhlIGNsaWVudCBpbiBQRlggb3IgUEtDUzEyIGZvcm1hdC5cbiAqXG4gKiBAcGFyYW0ge0J1ZmZlciB8IFN0cmluZ30gY2VydFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnBmeCA9IGZ1bmN0aW9uIChjZXJ0KSB7XG4gIGlmICh0eXBlb2YgY2VydCA9PT0gJ29iamVjdCcgJiYgIUJ1ZmZlci5pc0J1ZmZlcihjZXJ0KSkge1xuICAgIHRoaXMuX3BmeCA9IGNlcnQucGZ4O1xuICAgIHRoaXMuX3Bhc3NwaHJhc2UgPSBjZXJ0LnBhc3NwaHJhc2U7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fcGZ4ID0gY2VydDtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIGNsaWVudCBjZXJ0aWZpY2F0ZSBvcHRpb24gZm9yIGh0dHBzIHJlcXVlc3QuXG4gKlxuICogQHBhcmFtIHtCdWZmZXIgfCBTdHJpbmd9IGNlcnRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jZXJ0ID0gZnVuY3Rpb24gKGNlcnQpIHtcbiAgdGhpcy5fY2VydCA9IGNlcnQ7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEbyBub3QgcmVqZWN0IGV4cGlyZWQgb3IgaW52YWxpZCBUTFMgY2VydHMuXG4gKiBzZXRzIGByZWplY3RVbmF1dGhvcml6ZWQ9dHJ1ZWAuIEJlIHdhcm5lZCB0aGF0IHRoaXMgYWxsb3dzIE1JVE0gYXR0YWNrcy5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZGlzYWJsZVRMU0NlcnRzID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLl9kaXNhYmxlVExTQ2VydHMgPSB0cnVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGh0dHBbc10gcmVxdWVzdC5cbiAqXG4gKiBAcmV0dXJuIHtPdXRnb2luZ01lc3NhZ2V9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29tcGxleGl0eVxuUmVxdWVzdC5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMucmVxKSByZXR1cm4gdGhpcy5yZXE7XG5cbiAgY29uc3Qgb3B0aW9ucyA9IHt9O1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcXVlcnkgPSBxcy5zdHJpbmdpZnkodGhpcy5xcywge1xuICAgICAgaW5kaWNlczogZmFsc2UsXG4gICAgICBzdHJpY3ROdWxsSGFuZGxpbmc6IHRydWVcbiAgICB9KTtcbiAgICBpZiAocXVlcnkpIHtcbiAgICAgIHRoaXMucXMgPSB7fTtcbiAgICAgIHRoaXMuX3F1ZXJ5LnB1c2gocXVlcnkpO1xuICAgIH1cblxuICAgIHRoaXMuX2ZpbmFsaXplUXVlcnlTdHJpbmcoKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICB9XG5cbiAgbGV0IHsgdXJsIH0gPSB0aGlzO1xuICBjb25zdCByZXRyaWVzID0gdGhpcy5fcmV0cmllcztcblxuICAvLyBDYXB0dXJlIGJhY2t0aWNrcyBhcy1pcyBmcm9tIHRoZSBmaW5hbCBxdWVyeSBzdHJpbmcgYnVpbHQgYWJvdmUuXG4gIC8vIE5vdGU6IHRoaXMnbGwgb25seSBmaW5kIGJhY2t0aWNrcyBlbnRlcmVkIGluIHJlcS5xdWVyeShTdHJpbmcpXG4gIC8vIGNhbGxzLCBiZWNhdXNlIHFzLnN0cmluZ2lmeSB1bmNvbmRpdGlvbmFsbHkgZW5jb2RlcyBiYWNrdGlja3MuXG4gIGxldCBxdWVyeVN0cmluZ0JhY2t0aWNrcztcbiAgaWYgKHVybC5pbmNsdWRlcygnYCcpKSB7XG4gICAgY29uc3QgcXVlcnlTdGFydEluZGV4ID0gdXJsLmluZGV4T2YoJz8nKTtcblxuICAgIGlmIChxdWVyeVN0YXJ0SW5kZXggIT09IC0xKSB7XG4gICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHVybC5zbGljZShxdWVyeVN0YXJ0SW5kZXggKyAxKTtcbiAgICAgIHF1ZXJ5U3RyaW5nQmFja3RpY2tzID0gcXVlcnlTdHJpbmcubWF0Y2goL2B8JTYwL2cpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGRlZmF1bHQgdG8gaHR0cDovL1xuICBpZiAodXJsLmluZGV4T2YoJ2h0dHAnKSAhPT0gMCkgdXJsID0gYGh0dHA6Ly8ke3VybH1gO1xuICB1cmwgPSBwYXJzZSh1cmwpO1xuXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdmlzaW9ubWVkaWEvc3VwZXJhZ2VudC9pc3N1ZXMvMTM2N1xuICBpZiAocXVlcnlTdHJpbmdCYWNrdGlja3MpIHtcbiAgICBsZXQgaSA9IDA7XG4gICAgdXJsLnF1ZXJ5ID0gdXJsLnF1ZXJ5LnJlcGxhY2UoLyU2MC9nLCAoKSA9PiBxdWVyeVN0cmluZ0JhY2t0aWNrc1tpKytdKTtcbiAgICB1cmwuc2VhcmNoID0gYD8ke3VybC5xdWVyeX1gO1xuICAgIHVybC5wYXRoID0gdXJsLnBhdGhuYW1lICsgdXJsLnNlYXJjaDtcbiAgfVxuXG4gIC8vIHN1cHBvcnQgdW5peCBzb2NrZXRzXG4gIGlmICgvXmh0dHBzP1xcK3VuaXg6Ly50ZXN0KHVybC5wcm90b2NvbCkgPT09IHRydWUpIHtcbiAgICAvLyBnZXQgdGhlIHByb3RvY29sXG4gICAgdXJsLnByb3RvY29sID0gYCR7dXJsLnByb3RvY29sLnNwbGl0KCcrJylbMF19OmA7XG5cbiAgICAvLyBnZXQgdGhlIHNvY2tldCwgcGF0aFxuICAgIGNvbnN0IHVuaXhQYXJ0cyA9IHVybC5wYXRoLm1hdGNoKC9eKFteL10rKSguKykkLyk7XG4gICAgb3B0aW9ucy5zb2NrZXRQYXRoID0gdW5peFBhcnRzWzFdLnJlcGxhY2UoLyUyRi9nLCAnLycpO1xuICAgIHVybC5wYXRoID0gdW5peFBhcnRzWzJdO1xuICB9XG5cbiAgLy8gT3ZlcnJpZGUgSVAgYWRkcmVzcyBvZiBhIGhvc3RuYW1lXG4gIGlmICh0aGlzLl9jb25uZWN0T3ZlcnJpZGUpIHtcbiAgICBjb25zdCB7IGhvc3RuYW1lIH0gPSB1cmw7XG4gICAgY29uc3QgbWF0Y2ggPVxuICAgICAgaG9zdG5hbWUgaW4gdGhpcy5fY29ubmVjdE92ZXJyaWRlXG4gICAgICAgID8gdGhpcy5fY29ubmVjdE92ZXJyaWRlW2hvc3RuYW1lXVxuICAgICAgICA6IHRoaXMuX2Nvbm5lY3RPdmVycmlkZVsnKiddO1xuICAgIGlmIChtYXRjaCkge1xuICAgICAgLy8gYmFja3VwIHRoZSByZWFsIGhvc3RcbiAgICAgIGlmICghdGhpcy5faGVhZGVyLmhvc3QpIHtcbiAgICAgICAgdGhpcy5zZXQoJ2hvc3QnLCB1cmwuaG9zdCk7XG4gICAgICB9XG5cbiAgICAgIGxldCBuZXdIb3N0O1xuICAgICAgbGV0IG5ld1BvcnQ7XG5cbiAgICAgIGlmICh0eXBlb2YgbWF0Y2ggPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG5ld0hvc3QgPSBtYXRjaC5ob3N0O1xuICAgICAgICBuZXdQb3J0ID0gbWF0Y2gucG9ydDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld0hvc3QgPSBtYXRjaDtcbiAgICAgICAgbmV3UG9ydCA9IHVybC5wb3J0O1xuICAgICAgfVxuXG4gICAgICAvLyB3cmFwIFtpcHY2XVxuICAgICAgdXJsLmhvc3QgPSAvOi8udGVzdChuZXdIb3N0KSA/IGBbJHtuZXdIb3N0fV1gIDogbmV3SG9zdDtcbiAgICAgIGlmIChuZXdQb3J0KSB7XG4gICAgICAgIHVybC5ob3N0ICs9IGA6JHtuZXdQb3J0fWA7XG4gICAgICAgIHVybC5wb3J0ID0gbmV3UG9ydDtcbiAgICAgIH1cblxuICAgICAgdXJsLmhvc3RuYW1lID0gbmV3SG9zdDtcbiAgICB9XG4gIH1cblxuICAvLyBvcHRpb25zXG4gIG9wdGlvbnMubWV0aG9kID0gdGhpcy5tZXRob2Q7XG4gIG9wdGlvbnMucG9ydCA9IHVybC5wb3J0O1xuICBvcHRpb25zLnBhdGggPSB1cmwucGF0aDtcbiAgb3B0aW9ucy5ob3N0ID0gdXJsLmhvc3RuYW1lO1xuICBvcHRpb25zLmNhID0gdGhpcy5fY2E7XG4gIG9wdGlvbnMua2V5ID0gdGhpcy5fa2V5O1xuICBvcHRpb25zLnBmeCA9IHRoaXMuX3BmeDtcbiAgb3B0aW9ucy5jZXJ0ID0gdGhpcy5fY2VydDtcbiAgb3B0aW9ucy5wYXNzcGhyYXNlID0gdGhpcy5fcGFzc3BocmFzZTtcbiAgb3B0aW9ucy5hZ2VudCA9IHRoaXMuX2FnZW50O1xuICBvcHRpb25zLmxvb2t1cCA9IHRoaXMuX2xvb2t1cDtcbiAgb3B0aW9ucy5yZWplY3RVbmF1dGhvcml6ZWQgPVxuICAgIHR5cGVvZiB0aGlzLl9kaXNhYmxlVExTQ2VydHMgPT09ICdib29sZWFuJ1xuICAgICAgPyAhdGhpcy5fZGlzYWJsZVRMU0NlcnRzXG4gICAgICA6IHByb2Nlc3MuZW52Lk5PREVfVExTX1JFSkVDVF9VTkFVVEhPUklaRUQgIT09ICcwJztcblxuICAvLyBBbGxvd3MgcmVxdWVzdC5nZXQoJ2h0dHBzOi8vMS4yLjMuNC8nKS5zZXQoJ0hvc3QnLCAnZXhhbXBsZS5jb20nKVxuICBpZiAodGhpcy5faGVhZGVyLmhvc3QpIHtcbiAgICBvcHRpb25zLnNlcnZlcm5hbWUgPSB0aGlzLl9oZWFkZXIuaG9zdC5yZXBsYWNlKC86XFxkKyQvLCAnJyk7XG4gIH1cblxuICBpZiAoXG4gICAgdGhpcy5fdHJ1c3RMb2NhbGhvc3QgJiZcbiAgICAvXig/OmxvY2FsaG9zdHwxMjdcXC4wXFwuMFxcLlxcZCt8KDAqOikrOjAqMSkkLy50ZXN0KHVybC5ob3N0bmFtZSlcbiAgKSB7XG4gICAgb3B0aW9ucy5yZWplY3RVbmF1dGhvcml6ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIC8vIGluaXRpYXRlIHJlcXVlc3RcbiAgY29uc3QgbW9kID0gdGhpcy5fZW5hYmxlSHR0cDJcbiAgICA/IGV4cG9ydHMucHJvdG9jb2xzWydodHRwMjonXS5zZXRQcm90b2NvbCh1cmwucHJvdG9jb2wpXG4gICAgOiBleHBvcnRzLnByb3RvY29sc1t1cmwucHJvdG9jb2xdO1xuXG4gIC8vIHJlcXVlc3RcbiAgdGhpcy5yZXEgPSBtb2QucmVxdWVzdChvcHRpb25zKTtcbiAgY29uc3QgeyByZXEgfSA9IHRoaXM7XG5cbiAgLy8gc2V0IHRjcCBubyBkZWxheVxuICByZXEuc2V0Tm9EZWxheSh0cnVlKTtcblxuICBpZiAob3B0aW9ucy5tZXRob2QgIT09ICdIRUFEJykge1xuICAgIHJlcS5zZXRIZWFkZXIoJ0FjY2VwdC1FbmNvZGluZycsICdnemlwLCBkZWZsYXRlJyk7XG4gIH1cblxuICB0aGlzLnByb3RvY29sID0gdXJsLnByb3RvY29sO1xuICB0aGlzLmhvc3QgPSB1cmwuaG9zdDtcblxuICAvLyBleHBvc2UgZXZlbnRzXG4gIHJlcS5vbmNlKCdkcmFpbicsICgpID0+IHtcbiAgICB0aGlzLmVtaXQoJ2RyYWluJyk7XG4gIH0pO1xuXG4gIHJlcS5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAvLyBmbGFnIGFib3J0aW9uIGhlcmUgZm9yIG91dCB0aW1lb3V0c1xuICAgIC8vIGJlY2F1c2Ugbm9kZSB3aWxsIGVtaXQgYSBmYXV4LWVycm9yIFwic29ja2V0IGhhbmcgdXBcIlxuICAgIC8vIHdoZW4gcmVxdWVzdCBpcyBhYm9ydGVkIGJlZm9yZSBhIGNvbm5lY3Rpb24gaXMgbWFkZVxuICAgIGlmICh0aGlzLl9hYm9ydGVkKSByZXR1cm47XG4gICAgLy8gaWYgbm90IHRoZSBzYW1lLCB3ZSBhcmUgaW4gdGhlICoqb2xkKiogKGNhbmNlbGxlZCkgcmVxdWVzdCxcbiAgICAvLyBzbyBuZWVkIHRvIGNvbnRpbnVlIChzYW1lIGFzIGZvciBhYm92ZSlcbiAgICBpZiAodGhpcy5fcmV0cmllcyAhPT0gcmV0cmllcykgcmV0dXJuO1xuICAgIC8vIGlmIHdlJ3ZlIHJlY2VpdmVkIGEgcmVzcG9uc2UgdGhlbiB3ZSBkb24ndCB3YW50IHRvIGxldFxuICAgIC8vIGFuIGVycm9yIGluIHRoZSByZXF1ZXN0IGJsb3cgdXAgdGhlIHJlc3BvbnNlXG4gICAgaWYgKHRoaXMucmVzcG9uc2UpIHJldHVybjtcbiAgICB0aGlzLmNhbGxiYWNrKGVycm9yKTtcbiAgfSk7XG5cbiAgLy8gYXV0aFxuICBpZiAodXJsLmF1dGgpIHtcbiAgICBjb25zdCBhdXRoID0gdXJsLmF1dGguc3BsaXQoJzonKTtcbiAgICB0aGlzLmF1dGgoYXV0aFswXSwgYXV0aFsxXSk7XG4gIH1cblxuICBpZiAodGhpcy51c2VybmFtZSAmJiB0aGlzLnBhc3N3b3JkKSB7XG4gICAgdGhpcy5hdXRoKHRoaXMudXNlcm5hbWUsIHRoaXMucGFzc3dvcmQpO1xuICB9XG5cbiAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy5oZWFkZXIpIHtcbiAgICBpZiAoaGFzT3duKHRoaXMuaGVhZGVyLCBrZXkpKSByZXEuc2V0SGVhZGVyKGtleSwgdGhpcy5oZWFkZXJba2V5XSk7XG4gIH1cblxuICAvLyBhZGQgY29va2llc1xuICBpZiAodGhpcy5jb29raWVzKSB7XG4gICAgaWYgKGhhc093bih0aGlzLl9oZWFkZXIsICdjb29raWUnKSkge1xuICAgICAgLy8gbWVyZ2VcbiAgICAgIGNvbnN0IHRlbXBvcmFyeUphciA9IG5ldyBDb29raWVKYXIuQ29va2llSmFyKCk7XG4gICAgICB0ZW1wb3JhcnlKYXIuc2V0Q29va2llcyh0aGlzLl9oZWFkZXIuY29va2llLnNwbGl0KCc7JykpO1xuICAgICAgdGVtcG9yYXJ5SmFyLnNldENvb2tpZXModGhpcy5jb29raWVzLnNwbGl0KCc7JykpO1xuICAgICAgcmVxLnNldEhlYWRlcihcbiAgICAgICAgJ0Nvb2tpZScsXG4gICAgICAgIHRlbXBvcmFyeUphci5nZXRDb29raWVzKENvb2tpZUphci5Db29raWVBY2Nlc3NJbmZvLkFsbCkudG9WYWx1ZVN0cmluZygpXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXEuc2V0SGVhZGVyKCdDb29raWUnLCB0aGlzLmNvb2tpZXMpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEludm9rZSB0aGUgY2FsbGJhY2sgd2l0aCBgZXJyYCBhbmQgYHJlc2BcbiAqIGFuZCBoYW5kbGUgYXJpdHkgY2hlY2suXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyXG4gKiBAcGFyYW0ge1Jlc3BvbnNlfSByZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNhbGxiYWNrID0gZnVuY3Rpb24gKGVycm9yLCByZXMpIHtcbiAgaWYgKHRoaXMuX3Nob3VsZFJldHJ5KGVycm9yLCByZXMpKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JldHJ5KCk7XG4gIH1cblxuICAvLyBBdm9pZCB0aGUgZXJyb3Igd2hpY2ggaXMgZW1pdHRlZCBmcm9tICdzb2NrZXQgaGFuZyB1cCcgdG8gY2F1c2UgdGhlIGZuIHVuZGVmaW5lZCBlcnJvciBvbiBKUyBydW50aW1lLlxuICBjb25zdCBmbiA9IHRoaXMuX2NhbGxiYWNrIHx8IG5vb3A7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIGlmICh0aGlzLmNhbGxlZCkgcmV0dXJuIGNvbnNvbGUud2Fybignc3VwZXJhZ2VudDogZG91YmxlIGNhbGxiYWNrIGJ1ZycpO1xuICB0aGlzLmNhbGxlZCA9IHRydWU7XG5cbiAgaWYgKCFlcnJvcikge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIXRoaXMuX2lzUmVzcG9uc2VPSyhyZXMpKSB7XG4gICAgICAgIGxldCBtZXNzYWdlID0gJ1Vuc3VjY2Vzc2Z1bCBIVFRQIHJlc3BvbnNlJztcbiAgICAgICAgaWYgKHJlcykge1xuICAgICAgICAgIG1lc3NhZ2UgPSBodHRwLlNUQVRVU19DT0RFU1tyZXMuc3RhdHVzXSB8fCBtZXNzYWdlO1xuICAgICAgICB9XG5cbiAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgICAgIGVycm9yLnN0YXR1cyA9IHJlcyA/IHJlcy5zdGF0dXMgOiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3JfKSB7XG4gICAgICBlcnJvciA9IGVycm9yXztcbiAgICB9XG4gIH1cblxuICAvLyBJdCdzIGltcG9ydGFudCB0aGF0IHRoZSBjYWxsYmFjayBpcyBjYWxsZWQgb3V0c2lkZSB0cnkvY2F0Y2hcbiAgLy8gdG8gYXZvaWQgZG91YmxlIGNhbGxiYWNrXG4gIGlmICghZXJyb3IpIHtcbiAgICByZXR1cm4gZm4obnVsbCwgcmVzKTtcbiAgfVxuXG4gIGVycm9yLnJlc3BvbnNlID0gcmVzO1xuICBpZiAodGhpcy5fbWF4UmV0cmllcykgZXJyb3IucmV0cmllcyA9IHRoaXMuX3JldHJpZXMgLSAxO1xuXG4gIC8vIG9ubHkgZW1pdCBlcnJvciBldmVudCBpZiB0aGVyZSBpcyBhIGxpc3RlbmVyXG4gIC8vIG90aGVyd2lzZSB3ZSBhc3N1bWUgdGhlIGNhbGxiYWNrIHRvIGAuZW5kKClgIHdpbGwgZ2V0IHRoZSBlcnJvclxuICBpZiAoZXJyb3IgJiYgdGhpcy5saXN0ZW5lcnMoJ2Vycm9yJykubGVuZ3RoID4gMCkge1xuICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlcnJvcik7XG4gIH1cblxuICBmbihlcnJvciwgcmVzKTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYSBob3N0IG9iamVjdCxcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIGhvc3Qgb2JqZWN0XG4gKiBAcmV0dXJuIHtCb29sZWFufSBpcyBhIGhvc3Qgb2JqZWN0XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuUmVxdWVzdC5wcm90b3R5cGUuX2lzSG9zdCA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgcmV0dXJuIChcbiAgICBCdWZmZXIuaXNCdWZmZXIob2JqZWN0KSB8fFxuICAgIG9iamVjdCBpbnN0YW5jZW9mIFN0cmVhbSB8fFxuICAgIG9iamVjdCBpbnN0YW5jZW9mIEZvcm1EYXRhXG4gICk7XG59O1xuXG4vKipcbiAqIEluaXRpYXRlIHJlcXVlc3QsIGludm9raW5nIGNhbGxiYWNrIGBmbihlcnIsIHJlcylgXG4gKiB3aXRoIGFuIGluc3RhbmNlb2YgYFJlc3BvbnNlYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLl9lbWl0UmVzcG9uc2UgPSBmdW5jdGlvbiAoYm9keSwgZmlsZXMpIHtcbiAgY29uc3QgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UodGhpcyk7XG4gIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgcmVzcG9uc2UucmVkaXJlY3RzID0gdGhpcy5fcmVkaXJlY3RMaXN0O1xuICBpZiAodW5kZWZpbmVkICE9PSBib2R5KSB7XG4gICAgcmVzcG9uc2UuYm9keSA9IGJvZHk7XG4gIH1cblxuICByZXNwb25zZS5maWxlcyA9IGZpbGVzO1xuICBpZiAodGhpcy5fZW5kQ2FsbGVkKSB7XG4gICAgcmVzcG9uc2UucGlwZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgXCJlbmQoKSBoYXMgYWxyZWFkeSBiZWVuIGNhbGxlZCwgc28gaXQncyB0b28gbGF0ZSB0byBzdGFydCBwaXBpbmdcIlxuICAgICAgKTtcbiAgICB9O1xuICB9XG5cbiAgdGhpcy5lbWl0KCdyZXNwb25zZScsIHJlc3BvbnNlKTtcbiAgcmV0dXJuIHJlc3BvbnNlO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24gKGZuKSB7XG4gIHRoaXMucmVxdWVzdCgpO1xuICBkZWJ1ZygnJXMgJXMnLCB0aGlzLm1ldGhvZCwgdGhpcy51cmwpO1xuXG4gIGlmICh0aGlzLl9lbmRDYWxsZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnLmVuZCgpIHdhcyBjYWxsZWQgdHdpY2UuIFRoaXMgaXMgbm90IHN1cHBvcnRlZCBpbiBzdXBlcmFnZW50J1xuICAgICk7XG4gIH1cblxuICB0aGlzLl9lbmRDYWxsZWQgPSB0cnVlO1xuXG4gIC8vIHN0b3JlIGNhbGxiYWNrXG4gIHRoaXMuX2NhbGxiYWNrID0gZm4gfHwgbm9vcDtcblxuICB0aGlzLl9lbmQoKTtcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLl9lbmQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLl9hYm9ydGVkKVxuICAgIHJldHVybiB0aGlzLmNhbGxiYWNrKFxuICAgICAgbmV3IEVycm9yKCdUaGUgcmVxdWVzdCBoYXMgYmVlbiBhYm9ydGVkIGV2ZW4gYmVmb3JlIC5lbmQoKSB3YXMgY2FsbGVkJylcbiAgICApO1xuXG4gIGxldCBkYXRhID0gdGhpcy5fZGF0YTtcbiAgY29uc3QgeyByZXEgfSA9IHRoaXM7XG4gIGNvbnN0IHsgbWV0aG9kIH0gPSB0aGlzO1xuXG4gIHRoaXMuX3NldFRpbWVvdXRzKCk7XG5cbiAgLy8gYm9keVxuICBpZiAobWV0aG9kICE9PSAnSEVBRCcgJiYgIXJlcS5faGVhZGVyU2VudCkge1xuICAgIC8vIHNlcmlhbGl6ZSBzdHVmZlxuICAgIGlmICh0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGxldCBjb250ZW50VHlwZSA9IHJlcS5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuICAgICAgLy8gUGFyc2Ugb3V0IGp1c3QgdGhlIGNvbnRlbnQgdHlwZSBmcm9tIHRoZSBoZWFkZXIgKGlnbm9yZSB0aGUgY2hhcnNldClcbiAgICAgIGlmIChjb250ZW50VHlwZSkgY29udGVudFR5cGUgPSBjb250ZW50VHlwZS5zcGxpdCgnOycpWzBdO1xuICAgICAgbGV0IHNlcmlhbGl6ZSA9IHRoaXMuX3NlcmlhbGl6ZXIgfHwgZXhwb3J0cy5zZXJpYWxpemVbY29udGVudFR5cGVdO1xuICAgICAgaWYgKCFzZXJpYWxpemUgJiYgaXNKU09OKGNvbnRlbnRUeXBlKSkge1xuICAgICAgICBzZXJpYWxpemUgPSBleHBvcnRzLnNlcmlhbGl6ZVsnYXBwbGljYXRpb24vanNvbiddO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VyaWFsaXplKSBkYXRhID0gc2VyaWFsaXplKGRhdGEpO1xuICAgIH1cblxuICAgIC8vIGNvbnRlbnQtbGVuZ3RoXG4gICAgaWYgKGRhdGEgJiYgIXJlcS5nZXRIZWFkZXIoJ0NvbnRlbnQtTGVuZ3RoJykpIHtcbiAgICAgIHJlcS5zZXRIZWFkZXIoXG4gICAgICAgICdDb250ZW50LUxlbmd0aCcsXG4gICAgICAgIEJ1ZmZlci5pc0J1ZmZlcihkYXRhKSA/IGRhdGEubGVuZ3RoIDogQnVmZmVyLmJ5dGVMZW5ndGgoZGF0YSlcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLy8gcmVzcG9uc2VcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbXBsZXhpdHlcbiAgcmVxLm9uY2UoJ3Jlc3BvbnNlJywgKHJlcykgPT4ge1xuICAgIGRlYnVnKCclcyAlcyAtPiAlcycsIHRoaXMubWV0aG9kLCB0aGlzLnVybCwgcmVzLnN0YXR1c0NvZGUpO1xuXG4gICAgaWYgKHRoaXMuX3Jlc3BvbnNlVGltZW91dFRpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVzcG9uc2VUaW1lb3V0VGltZXIpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnBpcGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbWF4ID0gdGhpcy5fbWF4UmVkaXJlY3RzO1xuICAgIGNvbnN0IG1pbWUgPSB1dGlscy50eXBlKHJlcy5oZWFkZXJzWydjb250ZW50LXR5cGUnXSB8fCAnJykgfHwgJ3RleHQvcGxhaW4nO1xuICAgIGxldCB0eXBlID0gbWltZS5zcGxpdCgnLycpWzBdO1xuICAgIGlmICh0eXBlKSB0eXBlID0gdHlwZS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICBjb25zdCBtdWx0aXBhcnQgPSB0eXBlID09PSAnbXVsdGlwYXJ0JztcbiAgICBjb25zdCByZWRpcmVjdCA9IGlzUmVkaXJlY3QocmVzLnN0YXR1c0NvZGUpO1xuICAgIGNvbnN0IHJlc3BvbnNlVHlwZSA9IHRoaXMuX3Jlc3BvbnNlVHlwZTtcblxuICAgIHRoaXMucmVzID0gcmVzO1xuXG4gICAgLy8gcmVkaXJlY3RcbiAgICBpZiAocmVkaXJlY3QgJiYgdGhpcy5fcmVkaXJlY3RzKysgIT09IG1heCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlZGlyZWN0KHJlcyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubWV0aG9kID09PSAnSEVBRCcpIHtcbiAgICAgIHRoaXMuZW1pdCgnZW5kJyk7XG4gICAgICB0aGlzLmNhbGxiYWNrKG51bGwsIHRoaXMuX2VtaXRSZXNwb25zZSgpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyB6bGliIHN1cHBvcnRcbiAgICBpZiAodGhpcy5fc2hvdWxkVW56aXAocmVzKSkge1xuICAgICAgdW56aXAocmVxLCByZXMpO1xuICAgIH1cblxuICAgIGxldCBidWZmZXIgPSB0aGlzLl9idWZmZXI7XG4gICAgaWYgKGJ1ZmZlciA9PT0gdW5kZWZpbmVkICYmIG1pbWUgaW4gZXhwb3J0cy5idWZmZXIpIHtcbiAgICAgIGJ1ZmZlciA9IEJvb2xlYW4oZXhwb3J0cy5idWZmZXJbbWltZV0pO1xuICAgIH1cblxuICAgIGxldCBwYXJzZXIgPSB0aGlzLl9wYXJzZXI7XG4gICAgaWYgKHVuZGVmaW5lZCA9PT0gYnVmZmVyICYmIHBhcnNlcikge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBcIkEgY3VzdG9tIHN1cGVyYWdlbnQgcGFyc2VyIGhhcyBiZWVuIHNldCwgYnV0IGJ1ZmZlcmluZyBzdHJhdGVneSBmb3IgdGhlIHBhcnNlciBoYXNuJ3QgYmVlbiBjb25maWd1cmVkLiBDYWxsIGByZXEuYnVmZmVyKHRydWUgb3IgZmFsc2UpYCBvciBzZXQgYHN1cGVyYWdlbnQuYnVmZmVyW21pbWVdID0gdHJ1ZSBvciBmYWxzZWBcIlxuICAgICAgKTtcbiAgICAgIGJ1ZmZlciA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKCFwYXJzZXIpIHtcbiAgICAgIGlmIChyZXNwb25zZVR5cGUpIHtcbiAgICAgICAgcGFyc2VyID0gZXhwb3J0cy5wYXJzZS5pbWFnZTsgLy8gSXQncyBhY3R1YWxseSBhIGdlbmVyaWMgQnVmZmVyXG4gICAgICAgIGJ1ZmZlciA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKG11bHRpcGFydCkge1xuICAgICAgICBjb25zdCBmb3JtID0gZm9ybWlkYWJsZSgpO1xuICAgICAgICBwYXJzZXIgPSBmb3JtLnBhcnNlLmJpbmQoZm9ybSk7XG4gICAgICAgIGJ1ZmZlciA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKGlzSW1hZ2VPclZpZGVvKG1pbWUpKSB7XG4gICAgICAgIHBhcnNlciA9IGV4cG9ydHMucGFyc2UuaW1hZ2U7XG4gICAgICAgIGJ1ZmZlciA9IHRydWU7IC8vIEZvciBiYWNrd2FyZHMtY29tcGF0aWJpbGl0eSBidWZmZXJpbmcgZGVmYXVsdCBpcyBhZC1ob2MgTUlNRS1kZXBlbmRlbnRcbiAgICAgIH0gZWxzZSBpZiAoZXhwb3J0cy5wYXJzZVttaW1lXSkge1xuICAgICAgICBwYXJzZXIgPSBleHBvcnRzLnBhcnNlW21pbWVdO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgcGFyc2VyID0gZXhwb3J0cy5wYXJzZS50ZXh0O1xuICAgICAgICBidWZmZXIgPSBidWZmZXIgIT09IGZhbHNlO1xuXG4gICAgICAgIC8vIGV2ZXJ5b25lIHdhbnRzIHRoZWlyIG93biB3aGl0ZS1sYWJlbGVkIGpzb25cbiAgICAgIH0gZWxzZSBpZiAoaXNKU09OKG1pbWUpKSB7XG4gICAgICAgIHBhcnNlciA9IGV4cG9ydHMucGFyc2VbJ2FwcGxpY2F0aW9uL2pzb24nXTtcbiAgICAgICAgYnVmZmVyID0gYnVmZmVyICE9PSBmYWxzZTtcbiAgICAgIH0gZWxzZSBpZiAoYnVmZmVyKSB7XG4gICAgICAgIHBhcnNlciA9IGV4cG9ydHMucGFyc2UudGV4dDtcbiAgICAgIH0gZWxzZSBpZiAodW5kZWZpbmVkID09PSBidWZmZXIpIHtcbiAgICAgICAgcGFyc2VyID0gZXhwb3J0cy5wYXJzZS5pbWFnZTsgLy8gSXQncyBhY3R1YWxseSBhIGdlbmVyaWMgQnVmZmVyXG4gICAgICAgIGJ1ZmZlciA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gYnkgZGVmYXVsdCBvbmx5IGJ1ZmZlciB0ZXh0LyosIGpzb24gYW5kIG1lc3NlZCB1cCB0aGluZyBmcm9tIGhlbGxcbiAgICBpZiAoKHVuZGVmaW5lZCA9PT0gYnVmZmVyICYmIGlzVGV4dChtaW1lKSkgfHwgaXNKU09OKG1pbWUpKSB7XG4gICAgICBidWZmZXIgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuX3Jlc0J1ZmZlcmVkID0gYnVmZmVyO1xuICAgIGxldCBwYXJzZXJIYW5kbGVzRW5kID0gZmFsc2U7XG4gICAgaWYgKGJ1ZmZlcikge1xuICAgICAgLy8gUHJvdGVjdGlvbmEgYWdhaW5zdCB6aXAgYm9tYnMgYW5kIG90aGVyIG51aXNhbmNlXG4gICAgICBsZXQgcmVzcG9uc2VCeXRlc0xlZnQgPSB0aGlzLl9tYXhSZXNwb25zZVNpemUgfHwgMjAwXzAwMF8wMDA7XG4gICAgICByZXMub24oJ2RhdGEnLCAoYnVmKSA9PiB7XG4gICAgICAgIHJlc3BvbnNlQnl0ZXNMZWZ0IC09IGJ1Zi5ieXRlTGVuZ3RoIHx8IGJ1Zi5sZW5ndGggPiAwID8gYnVmLmxlbmd0aCA6IDA7XG4gICAgICAgIGlmIChyZXNwb25zZUJ5dGVzTGVmdCA8IDApIHtcbiAgICAgICAgICAvLyBUaGlzIHdpbGwgcHJvcGFnYXRlIHRocm91Z2ggZXJyb3IgZXZlbnRcbiAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcignTWF4aW11bSByZXNwb25zZSBzaXplIHJlYWNoZWQnKTtcbiAgICAgICAgICBlcnJvci5jb2RlID0gJ0VUT09MQVJHRSc7XG4gICAgICAgICAgLy8gUGFyc2VycyBhcmVuJ3QgcmVxdWlyZWQgdG8gb2JzZXJ2ZSBlcnJvciBldmVudCxcbiAgICAgICAgICAvLyBzbyB3b3VsZCBpbmNvcnJlY3RseSByZXBvcnQgc3VjY2Vzc1xuICAgICAgICAgIHBhcnNlckhhbmRsZXNFbmQgPSBmYWxzZTtcbiAgICAgICAgICAvLyBXaWxsIG5vdCBlbWl0IGVycm9yIGV2ZW50XG4gICAgICAgICAgcmVzLmRlc3Ryb3koZXJyb3IpO1xuICAgICAgICAgIC8vIHNvIHdlIGRvIGNhbGxiYWNrIG5vd1xuICAgICAgICAgIHRoaXMuY2FsbGJhY2soZXJyb3IsIG51bGwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAocGFyc2VyKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBVbmJ1ZmZlcmVkIHBhcnNlcnMgYXJlIHN1cHBvc2VkIHRvIGVtaXQgcmVzcG9uc2UgZWFybHksXG4gICAgICAgIC8vIHdoaWNoIGlzIHdlaXJkIEJUVywgYmVjYXVzZSByZXNwb25zZS5ib2R5IHdvbid0IGJlIHRoZXJlLlxuICAgICAgICBwYXJzZXJIYW5kbGVzRW5kID0gYnVmZmVyO1xuXG4gICAgICAgIHBhcnNlcihyZXMsIChlcnJvciwgb2JqZWN0LCBmaWxlcykgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLnRpbWVkb3V0KSB7XG4gICAgICAgICAgICAvLyBUaW1lb3V0IGhhcyBhbHJlYWR5IGhhbmRsZWQgYWxsIGNhbGxiYWNrc1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEludGVudGlvbmFsIChub24tdGltZW91dCkgYWJvcnQgaXMgc3VwcG9zZWQgdG8gcHJlc2VydmUgcGFydGlhbCByZXNwb25zZSxcbiAgICAgICAgICAvLyBldmVuIGlmIGl0IGRvZXNuJ3QgcGFyc2UuXG4gICAgICAgICAgaWYgKGVycm9yICYmICF0aGlzLl9hYm9ydGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYWxsYmFjayhlcnJvcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHBhcnNlckhhbmRsZXNFbmQpIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnZW5kJyk7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrKG51bGwsIHRoaXMuX2VtaXRSZXNwb25zZShvYmplY3QsIGZpbGVzKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aGlzLmNhbGxiYWNrKGVycik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnJlcyA9IHJlcztcblxuICAgIC8vIHVuYnVmZmVyZWRcbiAgICBpZiAoIWJ1ZmZlcikge1xuICAgICAgZGVidWcoJ3VuYnVmZmVyZWQgJXMgJXMnLCB0aGlzLm1ldGhvZCwgdGhpcy51cmwpO1xuICAgICAgdGhpcy5jYWxsYmFjayhudWxsLCB0aGlzLl9lbWl0UmVzcG9uc2UoKSk7XG4gICAgICBpZiAobXVsdGlwYXJ0KSByZXR1cm47IC8vIGFsbG93IG11bHRpcGFydCB0byBoYW5kbGUgZW5kIGV2ZW50XG4gICAgICByZXMub25jZSgnZW5kJywgKCkgPT4ge1xuICAgICAgICBkZWJ1ZygnZW5kICVzICVzJywgdGhpcy5tZXRob2QsIHRoaXMudXJsKTtcbiAgICAgICAgdGhpcy5lbWl0KCdlbmQnKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHRlcm1pbmF0aW5nIGV2ZW50c1xuICAgIHJlcy5vbmNlKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgcGFyc2VySGFuZGxlc0VuZCA9IGZhbHNlO1xuICAgICAgdGhpcy5jYWxsYmFjayhlcnJvciwgbnVsbCk7XG4gICAgfSk7XG4gICAgaWYgKCFwYXJzZXJIYW5kbGVzRW5kKVxuICAgICAgcmVzLm9uY2UoJ2VuZCcsICgpID0+IHtcbiAgICAgICAgZGVidWcoJ2VuZCAlcyAlcycsIHRoaXMubWV0aG9kLCB0aGlzLnVybCk7XG4gICAgICAgIC8vIFRPRE86IHVubGVzcyBidWZmZXJpbmcgZW1pdCBlYXJsaWVyIHRvIHN0cmVhbVxuICAgICAgICB0aGlzLmVtaXQoJ2VuZCcpO1xuICAgICAgICB0aGlzLmNhbGxiYWNrKG51bGwsIHRoaXMuX2VtaXRSZXNwb25zZSgpKTtcbiAgICAgIH0pO1xuICB9KTtcblxuICB0aGlzLmVtaXQoJ3JlcXVlc3QnLCB0aGlzKTtcblxuICBjb25zdCBnZXRQcm9ncmVzc01vbml0b3IgPSAoKSA9PiB7XG4gICAgY29uc3QgbGVuZ3RoQ29tcHV0YWJsZSA9IHRydWU7XG4gICAgY29uc3QgdG90YWwgPSByZXEuZ2V0SGVhZGVyKCdDb250ZW50LUxlbmd0aCcpO1xuICAgIGxldCBsb2FkZWQgPSAwO1xuXG4gICAgY29uc3QgcHJvZ3Jlc3MgPSBuZXcgU3RyZWFtLlRyYW5zZm9ybSgpO1xuICAgIHByb2dyZXNzLl90cmFuc2Zvcm0gPSAoY2h1bmssIGVuY29kaW5nLCBjYikgPT4ge1xuICAgICAgbG9hZGVkICs9IGNodW5rLmxlbmd0aDtcbiAgICAgIHRoaXMuZW1pdCgncHJvZ3Jlc3MnLCB7XG4gICAgICAgIGRpcmVjdGlvbjogJ3VwbG9hZCcsXG4gICAgICAgIGxlbmd0aENvbXB1dGFibGUsXG4gICAgICAgIGxvYWRlZCxcbiAgICAgICAgdG90YWxcbiAgICAgIH0pO1xuICAgICAgY2IobnVsbCwgY2h1bmspO1xuICAgIH07XG5cbiAgICByZXR1cm4gcHJvZ3Jlc3M7XG4gIH07XG5cbiAgY29uc3QgYnVmZmVyVG9DaHVua3MgPSAoYnVmZmVyKSA9PiB7XG4gICAgY29uc3QgY2h1bmtTaXplID0gMTYgKiAxMDI0OyAvLyBkZWZhdWx0IGhpZ2hXYXRlck1hcmsgdmFsdWVcbiAgICBjb25zdCBjaHVua2luZyA9IG5ldyBTdHJlYW0uUmVhZGFibGUoKTtcbiAgICBjb25zdCB0b3RhbExlbmd0aCA9IGJ1ZmZlci5sZW5ndGg7XG4gICAgY29uc3QgcmVtYWluZGVyID0gdG90YWxMZW5ndGggJSBjaHVua1NpemU7XG4gICAgY29uc3QgY3V0b2ZmID0gdG90YWxMZW5ndGggLSByZW1haW5kZXI7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGN1dG9mZjsgaSArPSBjaHVua1NpemUpIHtcbiAgICAgIGNvbnN0IGNodW5rID0gYnVmZmVyLnNsaWNlKGksIGkgKyBjaHVua1NpemUpO1xuICAgICAgY2h1bmtpbmcucHVzaChjaHVuayk7XG4gICAgfVxuXG4gICAgaWYgKHJlbWFpbmRlciA+IDApIHtcbiAgICAgIGNvbnN0IHJlbWFpbmRlckJ1ZmZlciA9IGJ1ZmZlci5zbGljZSgtcmVtYWluZGVyKTtcbiAgICAgIGNodW5raW5nLnB1c2gocmVtYWluZGVyQnVmZmVyKTtcbiAgICB9XG5cbiAgICBjaHVua2luZy5wdXNoKG51bGwpOyAvLyBubyBtb3JlIGRhdGFcblxuICAgIHJldHVybiBjaHVua2luZztcbiAgfTtcblxuICAvLyBpZiBhIEZvcm1EYXRhIGluc3RhbmNlIGdvdCBjcmVhdGVkLCB0aGVuIHdlIHNlbmQgdGhhdCBhcyB0aGUgcmVxdWVzdCBib2R5XG4gIGNvbnN0IGZvcm1EYXRhID0gdGhpcy5fZm9ybURhdGE7XG4gIGlmIChmb3JtRGF0YSkge1xuICAgIC8vIHNldCBoZWFkZXJzXG4gICAgY29uc3QgaGVhZGVycyA9IGZvcm1EYXRhLmdldEhlYWRlcnMoKTtcbiAgICBmb3IgKGNvbnN0IGkgaW4gaGVhZGVycykge1xuICAgICAgaWYgKGhhc093bihoZWFkZXJzLCBpKSkge1xuICAgICAgICBkZWJ1Zygnc2V0dGluZyBGb3JtRGF0YSBoZWFkZXI6IFwiJXM6ICVzXCInLCBpLCBoZWFkZXJzW2ldKTtcbiAgICAgICAgcmVxLnNldEhlYWRlcihpLCBoZWFkZXJzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBhdHRlbXB0IHRvIGdldCBcIkNvbnRlbnQtTGVuZ3RoXCIgaGVhZGVyXG4gICAgZm9ybURhdGEuZ2V0TGVuZ3RoKChlcnJvciwgbGVuZ3RoKSA9PiB7XG4gICAgICAvLyBUT0RPOiBBZGQgY2h1bmtlZCBlbmNvZGluZyB3aGVuIG5vIGxlbmd0aCAoaWYgZXJyKVxuICAgICAgaWYgKGVycm9yKSBkZWJ1ZygnZm9ybURhdGEuZ2V0TGVuZ3RoIGhhZCBlcnJvcicsIGVycm9yLCBsZW5ndGgpO1xuXG4gICAgICBkZWJ1ZygnZ290IEZvcm1EYXRhIENvbnRlbnQtTGVuZ3RoOiAlcycsIGxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcmVxLnNldEhlYWRlcignQ29udGVudC1MZW5ndGgnLCBsZW5ndGgpO1xuICAgICAgfVxuXG4gICAgICBmb3JtRGF0YS5waXBlKGdldFByb2dyZXNzTW9uaXRvcigpKS5waXBlKHJlcSk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoQnVmZmVyLmlzQnVmZmVyKGRhdGEpKSB7XG4gICAgYnVmZmVyVG9DaHVua3MoZGF0YSkucGlwZShnZXRQcm9ncmVzc01vbml0b3IoKSkucGlwZShyZXEpO1xuICB9IGVsc2Uge1xuICAgIHJlcS5lbmQoZGF0YSk7XG4gIH1cbn07XG5cbi8vIENoZWNrIHdoZXRoZXIgcmVzcG9uc2UgaGFzIGEgbm9uLTAtc2l6ZWQgZ3ppcC1lbmNvZGVkIGJvZHlcblJlcXVlc3QucHJvdG90eXBlLl9zaG91bGRVbnppcCA9IChyZXMpID0+IHtcbiAgaWYgKHJlcy5zdGF0dXNDb2RlID09PSAyMDQgfHwgcmVzLnN0YXR1c0NvZGUgPT09IDMwNCkge1xuICAgIC8vIFRoZXNlIGFyZW4ndCBzdXBwb3NlZCB0byBoYXZlIGFueSBib2R5XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gaGVhZGVyIGNvbnRlbnQgaXMgYSBzdHJpbmcsIGFuZCBkaXN0aW5jdGlvbiBiZXR3ZWVuIDAgYW5kIG5vIGluZm9ybWF0aW9uIGlzIGNydWNpYWxcbiAgaWYgKHJlcy5oZWFkZXJzWydjb250ZW50LWxlbmd0aCddID09PSAnMCcpIHtcbiAgICAvLyBXZSBrbm93IHRoYXQgdGhlIGJvZHkgaXMgZW1wdHkgKHVuZm9ydHVuYXRlbHksIHRoaXMgY2hlY2sgZG9lcyBub3QgY292ZXIgY2h1bmtlZCBlbmNvZGluZylcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBjb25zb2xlLmxvZyhyZXMpO1xuICByZXR1cm4gL15cXHMqKD86ZGVmbGF0ZXxnemlwKVxccyokLy50ZXN0KHJlcy5oZWFkZXJzWydjb250ZW50LWVuY29kaW5nJ10pO1xufTtcblxuLyoqXG4gKiBPdmVycmlkZXMgRE5TIGZvciBzZWxlY3RlZCBob3N0bmFtZXMuIFRha2VzIG9iamVjdCBtYXBwaW5nIGhvc3RuYW1lcyB0byBJUCBhZGRyZXNzZXMuXG4gKlxuICogV2hlbiBtYWtpbmcgYSByZXF1ZXN0IHRvIGEgVVJMIHdpdGggYSBob3N0bmFtZSBleGFjdGx5IG1hdGNoaW5nIGEga2V5IGluIHRoZSBvYmplY3QsXG4gKiB1c2UgdGhlIGdpdmVuIElQIGFkZHJlc3MgdG8gY29ubmVjdCwgaW5zdGVhZCBvZiB1c2luZyBETlMgdG8gcmVzb2x2ZSB0aGUgaG9zdG5hbWUuXG4gKlxuICogQSBzcGVjaWFsIGhvc3QgYCpgIG1hdGNoZXMgZXZlcnkgaG9zdG5hbWUgKGtlZXAgcmVkaXJlY3RzIGluIG1pbmQhKVxuICpcbiAqICAgICAgcmVxdWVzdC5jb25uZWN0KHtcbiAqICAgICAgICAndGVzdC5leGFtcGxlLmNvbSc6ICcxMjcuMC4wLjEnLFxuICogICAgICAgICdpcHY2LmV4YW1wbGUuY29tJzogJzo6MScsXG4gKiAgICAgIH0pXG4gKi9cblJlcXVlc3QucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbiAoY29ubmVjdE92ZXJyaWRlKSB7XG4gIGlmICh0eXBlb2YgY29ubmVjdE92ZXJyaWRlID09PSAnc3RyaW5nJykge1xuICAgIHRoaXMuX2Nvbm5lY3RPdmVycmlkZSA9IHsgJyonOiBjb25uZWN0T3ZlcnJpZGUgfTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgY29ubmVjdE92ZXJyaWRlID09PSAnb2JqZWN0Jykge1xuICAgIHRoaXMuX2Nvbm5lY3RPdmVycmlkZSA9IGNvbm5lY3RPdmVycmlkZTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9jb25uZWN0T3ZlcnJpZGUgPSB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLnRydXN0TG9jYWxob3N0ID0gZnVuY3Rpb24gKHRvZ2dsZSkge1xuICB0aGlzLl90cnVzdExvY2FsaG9zdCA9IHRvZ2dsZSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHRvZ2dsZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBnZW5lcmF0ZSBIVFRQIHZlcmIgbWV0aG9kc1xuaWYgKCFtZXRob2RzLmluY2x1ZGVzKCdkZWwnKSkge1xuICAvLyBjcmVhdGUgYSBjb3B5IHNvIHdlIGRvbid0IGNhdXNlIGNvbmZsaWN0cyB3aXRoXG4gIC8vIG90aGVyIHBhY2thZ2VzIHVzaW5nIHRoZSBtZXRob2RzIHBhY2thZ2UgYW5kXG4gIC8vIG5wbSAzLnhcbiAgbWV0aG9kcyA9IFsuLi5tZXRob2RzXTtcbiAgbWV0aG9kcy5wdXNoKCdkZWwnKTtcbn1cblxuZm9yIChsZXQgbWV0aG9kIG9mIG1ldGhvZHMpIHtcbiAgY29uc3QgbmFtZSA9IG1ldGhvZDtcbiAgbWV0aG9kID0gbWV0aG9kID09PSAnZGVsJyA/ICdkZWxldGUnIDogbWV0aG9kO1xuXG4gIG1ldGhvZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpO1xuICByZXF1ZXN0W25hbWVdID0gKHVybCwgZGF0YSwgZm4pID0+IHtcbiAgICBjb25zdCByZXF1ZXN0XyA9IHJlcXVlc3QobWV0aG9kLCB1cmwpO1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZm4gPSBkYXRhO1xuICAgICAgZGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKGRhdGEpIHtcbiAgICAgIGlmIChtZXRob2QgPT09ICdHRVQnIHx8IG1ldGhvZCA9PT0gJ0hFQUQnKSB7XG4gICAgICAgIHJlcXVlc3RfLnF1ZXJ5KGRhdGEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVxdWVzdF8uc2VuZChkYXRhKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZm4pIHJlcXVlc3RfLmVuZChmbik7XG4gICAgcmV0dXJuIHJlcXVlc3RfO1xuICB9O1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGBtaW1lYCBpcyB0ZXh0IGFuZCBzaG91bGQgYmUgYnVmZmVyZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1pbWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGlzVGV4dChtaW1lKSB7XG4gIGNvbnN0IHBhcnRzID0gbWltZS5zcGxpdCgnLycpO1xuICBsZXQgdHlwZSA9IHBhcnRzWzBdO1xuICBpZiAodHlwZSkgdHlwZSA9IHR5cGUudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gIGxldCBzdWJ0eXBlID0gcGFydHNbMV07XG4gIGlmIChzdWJ0eXBlKSBzdWJ0eXBlID0gc3VidHlwZS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcblxuICByZXR1cm4gdHlwZSA9PT0gJ3RleHQnIHx8IHN1YnR5cGUgPT09ICd4LXd3dy1mb3JtLXVybGVuY29kZWQnO1xufVxuXG5mdW5jdGlvbiBpc0ltYWdlT3JWaWRlbyhtaW1lKSB7XG4gIGxldCB0eXBlID0gbWltZS5zcGxpdCgnLycpWzBdO1xuICBpZiAodHlwZSkgdHlwZSA9IHR5cGUudG9Mb3dlckNhc2UoKS50cmltKCk7XG5cbiAgcmV0dXJuIHR5cGUgPT09ICdpbWFnZScgfHwgdHlwZSA9PT0gJ3ZpZGVvJztcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBgbWltZWAgaXMganNvbiBvciBoYXMgK2pzb24gc3RydWN0dXJlZCBzeW50YXggc3VmZml4LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtaW1lXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNKU09OKG1pbWUpIHtcbiAgLy8gc2hvdWxkIG1hdGNoIC9qc29uIG9yICtqc29uXG4gIC8vIGJ1dCBub3QgL2pzb24tc2VxXG4gIHJldHVybiAvWy8rXWpzb24oJHxbXi1cXHddKS9pLnRlc3QobWltZSk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgd2Ugc2hvdWxkIGZvbGxvdyB0aGUgcmVkaXJlY3QgYGNvZGVgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb2RlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNSZWRpcmVjdChjb2RlKSB7XG4gIHJldHVybiBbMzAxLCAzMDIsIDMwMywgMzA1LCAzMDcsIDMwOF0uaW5jbHVkZXMoY29kZSk7XG59XG4iXX0=