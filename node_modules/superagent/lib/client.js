"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * Root reference for iframes.
 */
var root;

if (typeof window !== 'undefined') {
  // Browser window
  root = window;
} else if (typeof self === 'undefined') {
  // Other environments
  console.warn('Using browser-only version of superagent in non-browser environment');
  root = void 0;
} else {
  // Web Worker
  root = self;
}

var Emitter = require('component-emitter');

var safeStringify = require('fast-safe-stringify');

var qs = require('qs');

var RequestBase = require('./request-base');

var _require = require('./utils'),
    isObject = _require.isObject,
    mixin = _require.mixin,
    hasOwn = _require.hasOwn;

var ResponseBase = require('./response-base');

var Agent = require('./agent-base');
/**
 * Noop.
 */


function noop() {}
/**
 * Expose `request`.
 */


module.exports = function (method, url) {
  // callback
  if (typeof url === 'function') {
    return new exports.Request('GET', method).end(url);
  } // url first


  if (arguments.length === 1) {
    return new exports.Request('GET', method);
  }

  return new exports.Request(method, url);
};

exports = module.exports;
var request = exports;
exports.Request = Request;
/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest && (!root.location || root.location.protocol !== 'file:' || !root.ActiveXObject)) {
    return new XMLHttpRequest();
  }

  try {
    return new ActiveXObject('Microsoft.XMLHTTP');
  } catch (_unused) {
    /**/
  }

  try {
    return new ActiveXObject('Msxml2.XMLHTTP.6.0');
  } catch (_unused2) {
    /**/
  }

  try {
    return new ActiveXObject('Msxml2.XMLHTTP.3.0');
  } catch (_unused3) {
    /**/
  }

  try {
    return new ActiveXObject('Msxml2.XMLHTTP');
  } catch (_unused4) {
    /**/
  }

  throw new Error('Browser-only version of superagent could not find XHR');
};
/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */


var trim = ''.trim ? function (s) {
  return s.trim();
} : function (s) {
  return s.replace(/(^\s*|\s*$)/g, '');
};
/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(object) {
  if (!isObject(object)) return object;
  var pairs = [];

  for (var key in object) {
    if (hasOwn(object, key)) pushEncodedKeyValuePair(pairs, key, object[key]);
  }

  return pairs.join('&');
}
/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */


function pushEncodedKeyValuePair(pairs, key, value) {
  if (value === undefined) return;

  if (value === null) {
    pairs.push(encodeURI(key));
    return;
  }

  if (Array.isArray(value)) {
    var _iterator = _createForOfIteratorHelper(value),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var v = _step.value;
        pushEncodedKeyValuePair(pairs, key, v);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  } else if (isObject(value)) {
    for (var subkey in value) {
      if (hasOwn(value, subkey)) pushEncodedKeyValuePair(pairs, "".concat(key, "[").concat(subkey, "]"), value[subkey]);
    }
  } else {
    pairs.push(encodeURI(key) + '=' + encodeURIComponent(value));
  }
}
/**
 * Expose serialization method.
 */


request.serializeObject = serialize;
/**
 * Parse the given x-www-form-urlencoded `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseString(string_) {
  var object = {};
  var pairs = string_.split('&');
  var pair;
  var pos;

  for (var i = 0, length_ = pairs.length; i < length_; ++i) {
    pair = pairs[i];
    pos = pair.indexOf('=');

    if (pos === -1) {
      object[decodeURIComponent(pair)] = '';
    } else {
      object[decodeURIComponent(pair.slice(0, pos))] = decodeURIComponent(pair.slice(pos + 1));
    }
  }

  return object;
}
/**
 * Expose parser.
 */


request.parseString = parseString;
/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'text/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  form: 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};
/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

request.serialize = {
  'application/x-www-form-urlencoded': qs.stringify,
  'application/json': safeStringify
};
/**
 * Default parsers.
 *
 *     superagent.parse['application/xml'] = function(str){
 *       return { object parsed from str };
 *     };
 *
 */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};
/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(string_) {
  var lines = string_.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var value;

  for (var i = 0, length_ = lines.length; i < length_; ++i) {
    line = lines[i];
    index = line.indexOf(':');

    if (index === -1) {
      // could be empty line, just skip it
      continue;
    }

    field = line.slice(0, index).toLowerCase();
    value = trim(line.slice(index + 1));
    fields[field] = value;
  }

  return fields;
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
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */


function Response(request_) {
  this.req = request_;
  this.xhr = this.req.xhr; // responseText is accessible only if responseType is '' or 'text' and on older browsers

  this.text = this.req.method !== 'HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text') || typeof this.xhr.responseType === 'undefined' ? this.xhr.responseText : null;
  this.statusText = this.req.xhr.statusText;
  var status = this.xhr.status; // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request

  if (status === 1223) {
    status = 204;
  }

  this._setStatusProperties(status);

  this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  this.header = this.headers; // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.

  this.header['content-type'] = this.xhr.getResponseHeader('content-type');

  this._setHeaderProperties(this.header);

  if (this.text === null && request_._responseType) {
    this.body = this.xhr.response;
  } else {
    this.body = this.req.method === 'HEAD' ? null : this._parseBody(this.text ? this.text : this.xhr.response);
  }
}

mixin(Response.prototype, ResponseBase.prototype);
/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype._parseBody = function (string_) {
  var parse = request.parse[this.type];

  if (this.req._parser) {
    return this.req._parser(this, string_);
  }

  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }

  return parse && string_ && (string_.length > 0 || string_ instanceof Object) ? parse(string_) : null;
};
/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */


Response.prototype.toError = function () {
  var req = this.req;
  var method = req.method;
  var url = req.url;
  var message = "cannot ".concat(method, " ").concat(url, " (").concat(this.status, ")");
  var error = new Error(message);
  error.status = this.status;
  error.method = method;
  error.url = url;
  return error;
};
/**
 * Expose `Response`.
 */


request.Response = Response;
/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {}; // preserves header name case

  this._header = {}; // coerces header names to lowercase

  this.on('end', function () {
    var error = null;
    var res = null;

    try {
      res = new Response(self);
    } catch (error_) {
      error = new Error('Parser is unable to parse the response');
      error.parse = true;
      error.original = error_; // issue #675: return the raw response if the response parsing fails

      if (self.xhr) {
        // ie9 doesn't have 'response' property
        error.rawResponse = typeof self.xhr.responseType === 'undefined' ? self.xhr.responseText : self.xhr.response; // issue #876: return the http status code if the response parsing fails

        error.status = self.xhr.status ? self.xhr.status : null;
        error.statusCode = error.status; // backwards-compat only
      } else {
        error.rawResponse = null;
        error.status = null;
      }

      return self.callback(error);
    }

    self.emit('response', res);
    var new_error;

    try {
      if (!self._isResponseOK(res)) {
        new_error = new Error(res.statusText || res.text || 'Unsuccessful HTTP response');
      }
    } catch (err) {
      new_error = err; // ok() callback can throw
    } // #1000 don't catch errors from the callback to avoid double calling it


    if (new_error) {
      new_error.original = error;
      new_error.response = res;
      new_error.status = res.status;
      self.callback(new_error, res);
    } else {
      self.callback(null, res);
    }
  });
}
/**
 * Mixin `Emitter` and `RequestBase`.
 */
// eslint-disable-next-line new-cap


Emitter(Request.prototype);
mixin(Request.prototype, RequestBase.prototype);
/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function (type) {
  this.set('Content-Type', request.types[type] || type);
  return this;
};
/**
 * Set Accept to `type`, mapping values from `request.types`.
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
  this.set('Accept', request.types[type] || type);
  return this;
};
/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} [pass] optional in case of using 'bearer' as type
 * @param {Object} options with 'type' property 'auto', 'basic' or 'bearer' (default 'basic')
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
      type: typeof btoa === 'function' ? 'basic' : 'auto'
    };
  }

  var encoder = function encoder(string) {
    if (typeof btoa === 'function') {
      return btoa(string);
    }

    throw new Error('Cannot use basic auth, btoa is not a function');
  };

  return this._auth(user, pass, options, encoder);
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
  if (typeof value !== 'string') value = serialize(value);
  if (value) this._query.push(value);
  return this;
};
/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `options` (or filename).
 *
 * ``` js
 * request.post('/upload')
 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String|Object} options
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.attach = function (field, file, options) {
  if (file) {
    if (this._data) {
      throw new Error("superagent can't mix .send() and .attach()");
    }

    this._getFormData().append(field, file, options || file.name);
  }

  return this;
};

Request.prototype._getFormData = function () {
  if (!this._formData) {
    this._formData = new root.FormData();
  }

  return this._formData;
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
  }

  var fn = this._callback;
  this.clearTimeout();

  if (error) {
    if (this._maxRetries) error.retries = this._retries - 1;
    this.emit('error', error);
  }

  fn(error, res);
};
/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */


Request.prototype.crossDomainError = function () {
  var error = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  error.crossDomain = true;
  error.status = this.status;
  error.method = this.method;
  error.url = this.url;
  this.callback(error);
}; // This only warns, because the request is still likely to work


Request.prototype.agent = function () {
  console.warn('This is not supported in browser version of superagent');
  return this;
};

Request.prototype.ca = Request.prototype.agent;
Request.prototype.buffer = Request.prototype.ca; // This throws, because it can't send/receive data as expected

Request.prototype.write = function () {
  throw new Error('Streaming is not supported in browser version of superagent');
};

Request.prototype.pipe = Request.prototype.write;
/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * @param {Object} obj host object
 * @return {Boolean} is a host object
 * @api private
 */

Request.prototype._isHost = function (object) {
  // Native objects stringify to [object File], [object Blob], [object FormData], etc.
  return object && _typeof(object) === 'object' && !Array.isArray(object) && Object.prototype.toString.call(object) !== '[object Object]';
};
/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.end = function (fn) {
  if (this._endCalled) {
    console.warn('Warning: .end() was called twice. This is not supported in superagent');
  }

  this._endCalled = true; // store callback

  this._callback = fn || noop; // querystring

  this._finalizeQueryString();

  this._end();
};

Request.prototype._setUploadTimeout = function () {
  var self = this; // upload timeout it's wokrs only if deadline timeout is off

  if (this._uploadTimeout && !this._uploadTimeoutTimer) {
    this._uploadTimeoutTimer = setTimeout(function () {
      self._timeoutError('Upload timeout of ', self._uploadTimeout, 'ETIMEDOUT');
    }, this._uploadTimeout);
  }
}; // eslint-disable-next-line complexity


Request.prototype._end = function () {
  if (this._aborted) return this.callback(new Error('The request has been aborted even before .end() was called'));
  var self = this;
  this.xhr = request.getXHR();
  var xhr = this.xhr;
  var data = this._formData || this._data;

  this._setTimeouts(); // state change


  xhr.addEventListener('readystatechange', function () {
    var readyState = xhr.readyState;

    if (readyState >= 2 && self._responseTimeoutTimer) {
      clearTimeout(self._responseTimeoutTimer);
    }

    if (readyState !== 4) {
      return;
    } // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"


    var status;

    try {
      status = xhr.status;
    } catch (_unused5) {
      status = 0;
    }

    if (!status) {
      if (self.timedout || self._aborted) return;
      return self.crossDomainError();
    }

    self.emit('end');
  }); // progress

  var handleProgress = function handleProgress(direction, e) {
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;

      if (e.percent === 100) {
        clearTimeout(self._uploadTimeoutTimer);
      }
    }

    e.direction = direction;
    self.emit('progress', e);
  };

  if (this.hasListeners('progress')) {
    try {
      xhr.addEventListener('progress', handleProgress.bind(null, 'download'));

      if (xhr.upload) {
        xhr.upload.addEventListener('progress', handleProgress.bind(null, 'upload'));
      }
    } catch (_unused6) {// Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
      // Reported here:
      // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
    }
  }

  if (xhr.upload) {
    this._setUploadTimeout();
  } // initiate request


  try {
    if (this.username && this.password) {
      xhr.open(this.method, this.url, true, this.username, this.password);
    } else {
      xhr.open(this.method, this.url, true);
    }
  } catch (err) {
    // see #1149
    return this.callback(err);
  } // CORS


  if (this._withCredentials) xhr.withCredentials = true; // body

  if (!this._formData && this.method !== 'GET' && this.method !== 'HEAD' && typeof data !== 'string' && !this._isHost(data)) {
    // serialize stuff
    var contentType = this._header['content-type'];

    var _serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];

    if (!_serialize && isJSON(contentType)) {
      _serialize = request.serialize['application/json'];
    }

    if (_serialize) data = _serialize(data);
  } // set header fields


  for (var field in this.header) {
    if (this.header[field] === null) continue;
    if (hasOwn(this.header, field)) xhr.setRequestHeader(field, this.header[field]);
  }

  if (this._responseType) {
    xhr.responseType = this._responseType;
  } // send stuff


  this.emit('request', this); // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined

  xhr.send(typeof data === 'undefined' ? null : data);
};

request.agent = function () {
  return new Agent();
};

var _loop = function _loop() {
  var method = _arr[_i];

  Agent.prototype[method.toLowerCase()] = function (url, fn) {
    var request_ = new request.Request(method, url);

    this._setDefaults(request_);

    if (fn) {
      request_.end(fn);
    }

    return request_;
  };
};

for (var _i = 0, _arr = ['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE']; _i < _arr.length; _i++) {
  _loop();
}

Agent.prototype.del = Agent.prototype.delete;
/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.get = function (url, data, fn) {
  var request_ = request('GET', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.query(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.head = function (url, data, fn) {
  var request_ = request('HEAD', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.query(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * OPTIONS query to `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.options = function (url, data, fn) {
  var request_ = request('OPTIONS', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * DELETE `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


function del(url, data, fn) {
  var request_ = request('DELETE', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
}

request.del = del;
request.delete = del;
/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.patch = function (url, data, fn) {
  var request_ = request('PATCH', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.post = function (url, data, fn) {
  var request_ = request('POST', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.put = function (url, data, fn) {
  var request_ = request('PUT', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQuanMiXSwibmFtZXMiOlsicm9vdCIsIndpbmRvdyIsInNlbGYiLCJjb25zb2xlIiwid2FybiIsIkVtaXR0ZXIiLCJyZXF1aXJlIiwic2FmZVN0cmluZ2lmeSIsInFzIiwiUmVxdWVzdEJhc2UiLCJpc09iamVjdCIsIm1peGluIiwiaGFzT3duIiwiUmVzcG9uc2VCYXNlIiwiQWdlbnQiLCJub29wIiwibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGhvZCIsInVybCIsIlJlcXVlc3QiLCJlbmQiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJyZXF1ZXN0IiwiZ2V0WEhSIiwiWE1MSHR0cFJlcXVlc3QiLCJsb2NhdGlvbiIsInByb3RvY29sIiwiQWN0aXZlWE9iamVjdCIsIkVycm9yIiwidHJpbSIsInMiLCJyZXBsYWNlIiwic2VyaWFsaXplIiwib2JqZWN0IiwicGFpcnMiLCJrZXkiLCJwdXNoRW5jb2RlZEtleVZhbHVlUGFpciIsImpvaW4iLCJ2YWx1ZSIsInVuZGVmaW5lZCIsInB1c2giLCJlbmNvZGVVUkkiLCJBcnJheSIsImlzQXJyYXkiLCJ2Iiwic3Via2V5IiwiZW5jb2RlVVJJQ29tcG9uZW50Iiwic2VyaWFsaXplT2JqZWN0IiwicGFyc2VTdHJpbmciLCJzdHJpbmdfIiwic3BsaXQiLCJwYWlyIiwicG9zIiwiaSIsImxlbmd0aF8iLCJpbmRleE9mIiwiZGVjb2RlVVJJQ29tcG9uZW50Iiwic2xpY2UiLCJ0eXBlcyIsImh0bWwiLCJqc29uIiwieG1sIiwidXJsZW5jb2RlZCIsImZvcm0iLCJzdHJpbmdpZnkiLCJwYXJzZSIsIkpTT04iLCJwYXJzZUhlYWRlciIsImxpbmVzIiwiZmllbGRzIiwiaW5kZXgiLCJsaW5lIiwiZmllbGQiLCJ0b0xvd2VyQ2FzZSIsImlzSlNPTiIsIm1pbWUiLCJ0ZXN0IiwiUmVzcG9uc2UiLCJyZXF1ZXN0XyIsInJlcSIsInhociIsInRleHQiLCJyZXNwb25zZVR5cGUiLCJyZXNwb25zZVRleHQiLCJzdGF0dXNUZXh0Iiwic3RhdHVzIiwiX3NldFN0YXR1c1Byb3BlcnRpZXMiLCJoZWFkZXJzIiwiZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIiwiaGVhZGVyIiwiZ2V0UmVzcG9uc2VIZWFkZXIiLCJfc2V0SGVhZGVyUHJvcGVydGllcyIsIl9yZXNwb25zZVR5cGUiLCJib2R5IiwicmVzcG9uc2UiLCJfcGFyc2VCb2R5IiwicHJvdG90eXBlIiwidHlwZSIsIl9wYXJzZXIiLCJPYmplY3QiLCJ0b0Vycm9yIiwibWVzc2FnZSIsImVycm9yIiwiX3F1ZXJ5IiwiX2hlYWRlciIsIm9uIiwicmVzIiwiZXJyb3JfIiwib3JpZ2luYWwiLCJyYXdSZXNwb25zZSIsInN0YXR1c0NvZGUiLCJjYWxsYmFjayIsImVtaXQiLCJuZXdfZXJyb3IiLCJfaXNSZXNwb25zZU9LIiwiZXJyIiwic2V0IiwiYWNjZXB0IiwiYXV0aCIsInVzZXIiLCJwYXNzIiwib3B0aW9ucyIsImJ0b2EiLCJlbmNvZGVyIiwic3RyaW5nIiwiX2F1dGgiLCJxdWVyeSIsImF0dGFjaCIsImZpbGUiLCJfZGF0YSIsIl9nZXRGb3JtRGF0YSIsImFwcGVuZCIsIm5hbWUiLCJfZm9ybURhdGEiLCJGb3JtRGF0YSIsIl9zaG91bGRSZXRyeSIsIl9yZXRyeSIsImZuIiwiX2NhbGxiYWNrIiwiY2xlYXJUaW1lb3V0IiwiX21heFJldHJpZXMiLCJyZXRyaWVzIiwiX3JldHJpZXMiLCJjcm9zc0RvbWFpbkVycm9yIiwiY3Jvc3NEb21haW4iLCJhZ2VudCIsImNhIiwiYnVmZmVyIiwid3JpdGUiLCJwaXBlIiwiX2lzSG9zdCIsInRvU3RyaW5nIiwiY2FsbCIsIl9lbmRDYWxsZWQiLCJfZmluYWxpemVRdWVyeVN0cmluZyIsIl9lbmQiLCJfc2V0VXBsb2FkVGltZW91dCIsIl91cGxvYWRUaW1lb3V0IiwiX3VwbG9hZFRpbWVvdXRUaW1lciIsInNldFRpbWVvdXQiLCJfdGltZW91dEVycm9yIiwiX2Fib3J0ZWQiLCJkYXRhIiwiX3NldFRpbWVvdXRzIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlYWR5U3RhdGUiLCJfcmVzcG9uc2VUaW1lb3V0VGltZXIiLCJ0aW1lZG91dCIsImhhbmRsZVByb2dyZXNzIiwiZGlyZWN0aW9uIiwiZSIsInRvdGFsIiwicGVyY2VudCIsImxvYWRlZCIsImhhc0xpc3RlbmVycyIsImJpbmQiLCJ1cGxvYWQiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwib3BlbiIsIl93aXRoQ3JlZGVudGlhbHMiLCJ3aXRoQ3JlZGVudGlhbHMiLCJjb250ZW50VHlwZSIsIl9zZXJpYWxpemVyIiwic2V0UmVxdWVzdEhlYWRlciIsInNlbmQiLCJfc2V0RGVmYXVsdHMiLCJkZWwiLCJkZWxldGUiLCJnZXQiLCJoZWFkIiwicGF0Y2giLCJwb3N0IiwicHV0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBRUEsSUFBSUEsSUFBSjs7QUFDQSxJQUFJLE9BQU9DLE1BQVAsS0FBa0IsV0FBdEIsRUFBbUM7QUFDakM7QUFDQUQsRUFBQUEsSUFBSSxHQUFHQyxNQUFQO0FBQ0QsQ0FIRCxNQUdPLElBQUksT0FBT0MsSUFBUCxLQUFnQixXQUFwQixFQUFpQztBQUN0QztBQUNBQyxFQUFBQSxPQUFPLENBQUNDLElBQVIsQ0FDRSxxRUFERjtBQUdBSixFQUFBQSxJQUFJLFNBQUo7QUFDRCxDQU5NLE1BTUE7QUFDTDtBQUNBQSxFQUFBQSxJQUFJLEdBQUdFLElBQVA7QUFDRDs7QUFFRCxJQUFNRyxPQUFPLEdBQUdDLE9BQU8sQ0FBQyxtQkFBRCxDQUF2Qjs7QUFDQSxJQUFNQyxhQUFhLEdBQUdELE9BQU8sQ0FBQyxxQkFBRCxDQUE3Qjs7QUFDQSxJQUFNRSxFQUFFLEdBQUdGLE9BQU8sQ0FBQyxJQUFELENBQWxCOztBQUNBLElBQU1HLFdBQVcsR0FBR0gsT0FBTyxDQUFDLGdCQUFELENBQTNCOztBQUNBLGVBQW9DQSxPQUFPLENBQUMsU0FBRCxDQUEzQztBQUFBLElBQVFJLFFBQVIsWUFBUUEsUUFBUjtBQUFBLElBQWtCQyxLQUFsQixZQUFrQkEsS0FBbEI7QUFBQSxJ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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUF4RCxPQUFPLENBQUMySyxHQUFSLEdBQWMsVUFBQ2hMLEdBQUQsRUFBTWlKLElBQU4sRUFBWXpCLEVBQVosRUFBbUI7QUFDL0IsTUFBTTNELFFBQVEsR0FBR3hELE9BQU8sQ0FBQyxLQUFELEVBQVFMLEdBQVIsQ0FBeEI7O0FBQ0EsTUFBSSxPQUFPaUosSUFBUCxLQUFnQixVQUFwQixFQUFnQztBQUM5QnpCLElBQUFBLEVBQUUsR0FBR3lCLElBQUw7QUFDQUEsSUFBQUEsSUFBSSxHQUFHLElBQVA7QUFDRDs7QUFFRCxNQUFJQSxJQUFKLEVBQVVwRixRQUFRLENBQUMyRyxJQUFULENBQWN2QixJQUFkO0FBQ1YsTUFBSXpCLEVBQUosRUFBUTNELFFBQVEsQ0FBQzNELEdBQVQsQ0FBYXNILEVBQWI7QUFDUixTQUFPM0QsUUFBUDtBQUNELENBVkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFJvb3QgcmVmZXJlbmNlIGZvciBpZnJhbWVzLlxuICovXG5cbmxldCByb290O1xuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gIC8vIEJyb3dzZXIgd2luZG93XG4gIHJvb3QgPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBzZWxmID09PSAndW5kZWZpbmVkJykge1xuICAvLyBPdGhlciBlbnZpcm9ubWVudHNcbiAgY29uc29sZS53YXJuKFxuICAgICdVc2luZyBicm93c2VyLW9ubHkgdmVyc2lvbiBvZiBzdXBlcmFnZW50IGluIG5vbi1icm93c2VyIGVudmlyb25tZW50J1xuICApO1xuICByb290ID0gdGhpcztcbn0gZWxzZSB7XG4gIC8vIFdlYiBXb3JrZXJcbiAgcm9vdCA9IHNlbGY7XG59XG5cbmNvbnN0IEVtaXR0ZXIgPSByZXF1aXJlKCdjb21wb25lbnQtZW1pdHRlcicpO1xuY29uc3Qgc2FmZVN0cmluZ2lmeSA9IHJlcXVpcmUoJ2Zhc3Qtc2FmZS1zdHJpbmdpZnknKTtcbmNvbnN0IHFzID0gcmVxdWlyZSgncXMnKTtcbmNvbnN0IFJlcXVlc3RCYXNlID0gcmVxdWlyZSgnLi9yZXF1ZXN0LWJhc2UnKTtcbmNvbnN0IHsgaXNPYmplY3QsIG1peGluLCBoYXNPd24gfSA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbmNvbnN0IFJlc3BvbnNlQmFzZSA9IHJlcXVpcmUoJy4vcmVzcG9uc2UtYmFzZScpO1xuY29uc3QgQWdlbnQgPSByZXF1aXJlKCcuL2FnZW50LWJhc2UnKTtcblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4vKipcbiAqIEV4cG9zZSBgcmVxdWVzdGAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobWV0aG9kLCB1cmwpIHtcbiAgLy8gY2FsbGJhY2tcbiAgaWYgKHR5cGVvZiB1cmwgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gbmV3IGV4cG9ydHMuUmVxdWVzdCgnR0VUJywgbWV0aG9kKS5lbmQodXJsKTtcbiAgfVxuXG4gIC8vIHVybCBmaXJzdFxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBuZXcgZXhwb3J0cy5SZXF1ZXN0KCdHRVQnLCBtZXRob2QpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBleHBvcnRzLlJlcXVlc3QobWV0aG9kLCB1cmwpO1xufTtcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzO1xuXG5jb25zdCByZXF1ZXN0ID0gZXhwb3J0cztcblxuZXhwb3J0cy5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuLyoqXG4gKiBEZXRlcm1pbmUgWEhSLlxuICovXG5cbnJlcXVlc3QuZ2V0WEhSID0gKCkgPT4ge1xuICBpZiAoXG4gICAgcm9vdC5YTUxIdHRwUmVxdWVzdCAmJlxuICAgICghcm9vdC5sb2NhdGlvbiB8fFxuICAgICAgcm9vdC5sb2NhdGlvbi5wcm90b2NvbCAhPT0gJ2ZpbGU6JyB8fFxuICAgICAgIXJvb3QuQWN0aXZlWE9iamVjdClcbiAgKSB7XG4gICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7XG4gIH0gY2F0Y2ggey8qKi99XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjYuMCcpO1xuICB9IGNhdGNoIHsvKiovfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC4zLjAnKTtcbiAgfSBjYXRjaCB7LyoqL31cblxuICB0cnkge1xuICAgIHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAnKTtcbiAgfSBjYXRjaCB7LyoqL31cblxuICB0aHJvdyBuZXcgRXJyb3IoJ0Jyb3dzZXItb25seSB2ZXJzaW9uIG9mIHN1cGVyYWdlbnQgY291bGQgbm90IGZpbmQgWEhSJyk7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZSwgYWRkZWQgdG8gc3VwcG9ydCBJRS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuY29uc3QgdHJpbSA9ICcnLnRyaW0gPyAocykgPT4gcy50cmltKCkgOiAocykgPT4gcy5yZXBsYWNlKC8oXlxccyp8XFxzKiQpL2csICcnKTtcblxuLyoqXG4gKiBTZXJpYWxpemUgdGhlIGdpdmVuIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShvYmplY3QpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSByZXR1cm4gb2JqZWN0O1xuICBjb25zdCBwYWlycyA9IFtdO1xuICBmb3IgKGNvbnN0IGtleSBpbiBvYmplY3QpIHtcbiAgICBpZiAoaGFzT3duKG9iamVjdCwga2V5KSkgcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSwgb2JqZWN0W2tleV0pO1xuICB9XG5cbiAgcmV0dXJuIHBhaXJzLmpvaW4oJyYnKTtcbn1cblxuLyoqXG4gKiBIZWxwcyAnc2VyaWFsaXplJyB3aXRoIHNlcmlhbGl6aW5nIGFycmF5cy5cbiAqIE11dGF0ZXMgdGhlIHBhaXJzIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHBhaXJzXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqL1xuXG5mdW5jdGlvbiBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCB2YWx1ZSkge1xuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICBwYWlycy5wdXNoKGVuY29kZVVSSShrZXkpKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBmb3IgKGNvbnN0IHYgb2YgdmFsdWUpIHtcbiAgICAgIHB1c2hFbmNvZGVkS2V5VmFsdWVQYWlyKHBhaXJzLCBrZXksIHYpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICBmb3IgKGNvbnN0IHN1YmtleSBpbiB2YWx1ZSkge1xuICAgICAgaWYgKGhhc093bih2YWx1ZSwgc3Via2V5KSlcbiAgICAgICAgcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGAke2tleX1bJHtzdWJrZXl9XWAsIHZhbHVlW3N1YmtleV0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBwYWlycy5wdXNoKGVuY29kZVVSSShrZXkpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvc2Ugc2VyaWFsaXphdGlvbiBtZXRob2QuXG4gKi9cblxucmVxdWVzdC5zZXJpYWxpemVPYmplY3QgPSBzZXJpYWxpemU7XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIHgtd3d3LWZvcm0tdXJsZW5jb2RlZCBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZVN0cmluZyhzdHJpbmdfKSB7XG4gIGNvbnN0IG9iamVjdCA9IHt9O1xuICBjb25zdCBwYWlycyA9IHN0cmluZ18uc3BsaXQoJyYnKTtcbiAgbGV0IHBhaXI7XG4gIGxldCBwb3M7XG5cbiAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aF8gPSBwYWlycy5sZW5ndGg7IGkgPCBsZW5ndGhfOyArK2kpIHtcbiAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgcG9zID0gcGFpci5pbmRleE9mKCc9Jyk7XG4gICAgaWYgKHBvcyA9PT0gLTEpIHtcbiAgICAgIG9iamVjdFtkZWNvZGVVUklDb21wb25lbnQocGFpcildID0gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9iamVjdFtkZWNvZGVVUklDb21wb25lbnQocGFpci5zbGljZSgwLCBwb3MpKV0gPSBkZWNvZGVVUklDb21wb25lbnQoXG4gICAgICAgIHBhaXIuc2xpY2UocG9zICsgMSlcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxuLyoqXG4gKiBFeHBvc2UgcGFyc2VyLlxuICovXG5cbnJlcXVlc3QucGFyc2VTdHJpbmcgPSBwYXJzZVN0cmluZztcblxuLyoqXG4gKiBEZWZhdWx0IE1JTUUgdHlwZSBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICovXG5cbnJlcXVlc3QudHlwZXMgPSB7XG4gIGh0bWw6ICd0ZXh0L2h0bWwnLFxuICBqc29uOiAnYXBwbGljYXRpb24vanNvbicsXG4gIHhtbDogJ3RleHQveG1sJyxcbiAgdXJsZW5jb2RlZDogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gIGZvcm06ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAnZm9ybS1kYXRhJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbi8qKlxuICogRGVmYXVsdCBzZXJpYWxpemF0aW9uIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC5zZXJpYWxpemVbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24ob2JqKXtcbiAqICAgICAgIHJldHVybiAnZ2VuZXJhdGVkIHhtbCBoZXJlJztcbiAqICAgICB9O1xuICpcbiAqL1xuXG5yZXF1ZXN0LnNlcmlhbGl6ZSA9IHtcbiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHFzLnN0cmluZ2lmeSxcbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiBzYWZlU3RyaW5naWZ5XG59O1xuXG4vKipcbiAqIERlZmF1bHQgcGFyc2Vycy5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC5wYXJzZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihzdHIpe1xuICogICAgICAgcmV0dXJuIHsgb2JqZWN0IHBhcnNlZCBmcm9tIHN0ciB9O1xuICogICAgIH07XG4gKlxuICovXG5cbnJlcXVlc3QucGFyc2UgPSB7XG4gICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBwYXJzZVN0cmluZyxcbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnBhcnNlXG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBoZWFkZXIgYHN0cmAgaW50b1xuICogYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG1hcHBlZCBmaWVsZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2VIZWFkZXIoc3RyaW5nXykge1xuICBjb25zdCBsaW5lcyA9IHN0cmluZ18uc3BsaXQoL1xccj9cXG4vKTtcbiAgY29uc3QgZmllbGRzID0ge307XG4gIGxldCBpbmRleDtcbiAgbGV0IGxpbmU7XG4gIGxldCBmaWVsZDtcbiAgbGV0IHZhbHVlO1xuXG4gIGZvciAobGV0IGkgPSAwLCBsZW5ndGhfID0gbGluZXMubGVuZ3RoOyBpIDwgbGVuZ3RoXzsgKytpKSB7XG4gICAgbGluZSA9IGxpbmVzW2ldO1xuICAgIGluZGV4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgLy8gY291bGQgYmUgZW1wdHkgbGluZSwganVzdCBza2lwIGl0XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBmaWVsZCA9IGxpbmUuc2xpY2UoMCwgaW5kZXgpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsdWUgPSB0cmltKGxpbmUuc2xpY2UoaW5kZXggKyAxKSk7XG4gICAgZmllbGRzW2ZpZWxkXSA9IHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIGZpZWxkcztcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBgbWltZWAgaXMganNvbiBvciBoYXMgK2pzb24gc3RydWN0dXJlZCBzeW50YXggc3VmZml4LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtaW1lXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNKU09OKG1pbWUpIHtcbiAgLy8gc2hvdWxkIG1hdGNoIC9qc29uIG9yICtqc29uXG4gIC8vIGJ1dCBub3QgL2pzb24tc2VxXG4gIHJldHVybiAvWy8rXWpzb24oJHxbXi1cXHddKS9pLnRlc3QobWltZSk7XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVzcG9uc2VgIHdpdGggdGhlIGdpdmVuIGB4aHJgLlxuICpcbiAqICAtIHNldCBmbGFncyAoLm9rLCAuZXJyb3IsIGV0YylcbiAqICAtIHBhcnNlIGhlYWRlclxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICBBbGlhc2luZyBgc3VwZXJhZ2VudGAgYXMgYHJlcXVlc3RgIGlzIG5pY2U6XG4gKlxuICogICAgICByZXF1ZXN0ID0gc3VwZXJhZ2VudDtcbiAqXG4gKiAgV2UgY2FuIHVzZSB0aGUgcHJvbWlzZS1saWtlIEFQSSwgb3IgcGFzcyBjYWxsYmFja3M6XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnLycpLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICogICAgICByZXF1ZXN0LmdldCgnLycsIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIFNlbmRpbmcgZGF0YSBjYW4gYmUgY2hhaW5lZDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAuc2VuZCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5wb3N0KClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBPciBmdXJ0aGVyIHJlZHVjZWQgdG8gYSBzaW5nbGUgY2FsbCBmb3Igc2ltcGxlIGNhc2VzOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIEBwYXJhbSB7WE1MSFRUUFJlcXVlc3R9IHhoclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIFJlc3BvbnNlKHJlcXVlc3RfKSB7XG4gIHRoaXMucmVxID0gcmVxdWVzdF87XG4gIHRoaXMueGhyID0gdGhpcy5yZXEueGhyO1xuICAvLyByZXNwb25zZVRleHQgaXMgYWNjZXNzaWJsZSBvbmx5IGlmIHJlc3BvbnNlVHlwZSBpcyAnJyBvciAndGV4dCcgYW5kIG9uIG9sZGVyIGJyb3dzZXJzXG4gIHRoaXMudGV4dCA9XG4gICAgKHRoaXMucmVxLm1ldGhvZCAhPT0gJ0hFQUQnICYmXG4gICAgICAodGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAnJyB8fCB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JykpIHx8XG4gICAgdHlwZW9mIHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJ3VuZGVmaW5lZCdcbiAgICAgID8gdGhpcy54aHIucmVzcG9uc2VUZXh0XG4gICAgICA6IG51bGw7XG4gIHRoaXMuc3RhdHVzVGV4dCA9IHRoaXMucmVxLnhoci5zdGF0dXNUZXh0O1xuICBsZXQgeyBzdGF0dXMgfSA9IHRoaXMueGhyO1xuICAvLyBoYW5kbGUgSUU5IGJ1ZzogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDA0Njk3Mi9tc2llLXJldHVybnMtc3RhdHVzLWNvZGUtb2YtMTIyMy1mb3ItYWpheC1yZXF1ZXN0XG4gIGlmIChzdGF0dXMgPT09IDEyMjMpIHtcbiAgICBzdGF0dXMgPSAyMDQ7XG4gIH1cblxuICB0aGlzLl9zZXRTdGF0dXNQcm9wZXJ0aWVzKHN0YXR1cyk7XG4gIHRoaXMuaGVhZGVycyA9IHBhcnNlSGVhZGVyKHRoaXMueGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcbiAgdGhpcy5oZWFkZXIgPSB0aGlzLmhlYWRlcnM7XG4gIC8vIGdldEFsbFJlc3BvbnNlSGVhZGVycyBzb21ldGltZXMgZmFsc2VseSByZXR1cm5zIFwiXCIgZm9yIENPUlMgcmVxdWVzdHMsIGJ1dFxuICAvLyBnZXRSZXNwb25zZUhlYWRlciBzdGlsbCB3b3Jrcy4gc28gd2UgZ2V0IGNvbnRlbnQtdHlwZSBldmVuIGlmIGdldHRpbmdcbiAgLy8gb3RoZXIgaGVhZGVycyBmYWlscy5cbiAgdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddID0gdGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpO1xuICB0aGlzLl9zZXRIZWFkZXJQcm9wZXJ0aWVzKHRoaXMuaGVhZGVyKTtcblxuICBpZiAodGhpcy50ZXh0ID09PSBudWxsICYmIHJlcXVlc3RfLl9yZXNwb25zZVR5cGUpIHtcbiAgICB0aGlzLmJvZHkgPSB0aGlzLnhoci5yZXNwb25zZTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmJvZHkgPVxuICAgICAgdGhpcy5yZXEubWV0aG9kID09PSAnSEVBRCdcbiAgICAgICAgPyBudWxsXG4gICAgICAgIDogdGhpcy5fcGFyc2VCb2R5KHRoaXMudGV4dCA/IHRoaXMudGV4dCA6IHRoaXMueGhyLnJlc3BvbnNlKTtcbiAgfVxufVxuXG5taXhpbihSZXNwb25zZS5wcm90b3R5cGUsIFJlc3BvbnNlQmFzZS5wcm90b3R5cGUpO1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBib2R5IGBzdHJgLlxuICpcbiAqIFVzZWQgZm9yIGF1dG8tcGFyc2luZyBvZiBib2RpZXMuIFBhcnNlcnNcbiAqIGFyZSBkZWZpbmVkIG9uIHRoZSBgc3VwZXJhZ2VudC5wYXJzZWAgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLl9wYXJzZUJvZHkgPSBmdW5jdGlvbiAoc3RyaW5nXykge1xuICBsZXQgcGFyc2UgPSByZXF1ZXN0LnBhcnNlW3RoaXMudHlwZV07XG4gIGlmICh0aGlzLnJlcS5fcGFyc2VyKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxLl9wYXJzZXIodGhpcywgc3RyaW5nXyk7XG4gIH1cblxuICBpZiAoIXBhcnNlICYmIGlzSlNPTih0aGlzLnR5cGUpKSB7XG4gICAgcGFyc2UgPSByZXF1ZXN0LnBhcnNlWydhcHBsaWNhdGlvbi9qc29uJ107XG4gIH1cblxuICByZXR1cm4gcGFyc2UgJiYgc3RyaW5nXyAmJiAoc3RyaW5nXy5sZW5ndGggPiAwIHx8IHN0cmluZ18gaW5zdGFuY2VvZiBPYmplY3QpXG4gICAgPyBwYXJzZShzdHJpbmdfKVxuICAgIDogbnVsbDtcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGBFcnJvcmAgcmVwcmVzZW50YXRpdmUgb2YgdGhpcyByZXNwb25zZS5cbiAqXG4gKiBAcmV0dXJuIHtFcnJvcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnRvRXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHsgcmVxIH0gPSB0aGlzO1xuICBjb25zdCB7IG1ldGhvZCB9ID0gcmVxO1xuICBjb25zdCB7IHVybCB9ID0gcmVxO1xuXG4gIGNvbnN0IG1lc3NhZ2UgPSBgY2Fubm90ICR7bWV0aG9kfSAke3VybH0gKCR7dGhpcy5zdGF0dXN9KWA7XG4gIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICBlcnJvci5zdGF0dXMgPSB0aGlzLnN0YXR1cztcbiAgZXJyb3IubWV0aG9kID0gbWV0aG9kO1xuICBlcnJvci51cmwgPSB1cmw7XG5cbiAgcmV0dXJuIGVycm9yO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlc3BvbnNlYC5cbiAqL1xuXG5yZXF1ZXN0LlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVxdWVzdGAgd2l0aCB0aGUgZ2l2ZW4gYG1ldGhvZGAgYW5kIGB1cmxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdChtZXRob2QsIHVybCkge1xuICBjb25zdCBzZWxmID0gdGhpcztcbiAgdGhpcy5fcXVlcnkgPSB0aGlzLl9xdWVyeSB8fCBbXTtcbiAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmhlYWRlciA9IHt9OyAvLyBwcmVzZXJ2ZXMgaGVhZGVyIG5hbWUgY2FzZVxuICB0aGlzLl9oZWFkZXIgPSB7fTsgLy8gY29lcmNlcyBoZWFkZXIgbmFtZXMgdG8gbG93ZXJjYXNlXG4gIHRoaXMub24oJ2VuZCcsICgpID0+IHtcbiAgICBsZXQgZXJyb3IgPSBudWxsO1xuICAgIGxldCByZXMgPSBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJlcyA9IG5ldyBSZXNwb25zZShzZWxmKTtcbiAgICB9IGNhdGNoIChlcnJvcl8pIHtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKCdQYXJzZXIgaXMgdW5hYmxlIHRvIHBhcnNlIHRoZSByZXNwb25zZScpO1xuICAgICAgZXJyb3IucGFyc2UgPSB0cnVlO1xuICAgICAgZXJyb3Iub3JpZ2luYWwgPSBlcnJvcl87XG4gICAgICAvLyBpc3N1ZSAjNjc1OiByZXR1cm4gdGhlIHJhdyByZXNwb25zZSBpZiB0aGUgcmVzcG9uc2UgcGFyc2luZyBmYWlsc1xuICAgICAgaWYgKHNlbGYueGhyKSB7XG4gICAgICAgIC8vIGllOSBkb2Vzbid0IGhhdmUgJ3Jlc3BvbnNlJyBwcm9wZXJ0eVxuICAgICAgICBlcnJvci5yYXdSZXNwb25zZSA9XG4gICAgICAgICAgdHlwZW9mIHNlbGYueGhyLnJlc3BvbnNlVHlwZSA9PT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgID8gc2VsZi54aHIucmVzcG9uc2VUZXh0XG4gICAgICAgICAgICA6IHNlbGYueGhyLnJlc3BvbnNlO1xuICAgICAgICAvLyBpc3N1ZSAjODc2OiByZXR1cm4gdGhlIGh0dHAgc3RhdHVzIGNvZGUgaWYgdGhlIHJlc3BvbnNlIHBhcnNpbmcgZmFpbHNcbiAgICAgICAgZXJyb3Iuc3RhdHVzID0gc2VsZi54aHIuc3RhdHVzID8gc2VsZi54aHIuc3RhdHVzIDogbnVsbDtcbiAgICAgICAgZXJyb3Iuc3RhdHVzQ29kZSA9IGVycm9yLnN0YXR1czsgLy8gYmFja3dhcmRzLWNvbXBhdCBvbmx5XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlcnJvci5yYXdSZXNwb25zZSA9IG51bGw7XG4gICAgICAgIGVycm9yLnN0YXR1cyA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVycm9yKTtcbiAgICB9XG5cbiAgICBzZWxmLmVtaXQoJ3Jlc3BvbnNlJywgcmVzKTtcblxuICAgIGxldCBuZXdfZXJyb3I7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghc2VsZi5faXNSZXNwb25zZU9LKHJlcykpIHtcbiAgICAgICAgbmV3X2Vycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAgIHJlcy5zdGF0dXNUZXh0IHx8IHJlcy50ZXh0IHx8ICdVbnN1Y2Nlc3NmdWwgSFRUUCByZXNwb25zZSdcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIG5ld19lcnJvciA9IGVycjsgLy8gb2soKSBjYWxsYmFjayBjYW4gdGhyb3dcbiAgICB9XG5cbiAgICAvLyAjMTAwMCBkb24ndCBjYXRjaCBlcnJvcnMgZnJvbSB0aGUgY2FsbGJhY2sgdG8gYXZvaWQgZG91YmxlIGNhbGxpbmcgaXRcbiAgICBpZiAobmV3X2Vycm9yKSB7XG4gICAgICBuZXdfZXJyb3Iub3JpZ2luYWwgPSBlcnJvcjtcbiAgICAgIG5ld19lcnJvci5yZXNwb25zZSA9IHJlcztcbiAgICAgIG5ld19lcnJvci5zdGF0dXMgPSByZXMuc3RhdHVzO1xuICAgICAgc2VsZi5jYWxsYmFjayhuZXdfZXJyb3IsIHJlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYuY2FsbGJhY2sobnVsbCwgcmVzKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIE1peGluIGBFbWl0dGVyYCBhbmQgYFJlcXVlc3RCYXNlYC5cbiAqL1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbmV3LWNhcFxuRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbm1peGluKFJlcXVlc3QucHJvdG90eXBlLCBSZXF1ZXN0QmFzZS5wcm90b3R5cGUpO1xuXG4vKipcbiAqIFNldCBDb250ZW50LVR5cGUgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCd4bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudHlwZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gIHRoaXMuc2V0KCdDb250ZW50LVR5cGUnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEFjY2VwdCB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy5qc29uID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYWNjZXB0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgdGhpcy5zZXQoJ0FjY2VwdCcsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQXV0aG9yaXphdGlvbiBmaWVsZCB2YWx1ZSB3aXRoIGB1c2VyYCBhbmQgYHBhc3NgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gW3Bhc3NdIG9wdGlvbmFsIGluIGNhc2Ugb2YgdXNpbmcgJ2JlYXJlcicgYXMgdHlwZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgd2l0aCAndHlwZScgcHJvcGVydHkgJ2F1dG8nLCAnYmFzaWMnIG9yICdiZWFyZXInIChkZWZhdWx0ICdiYXNpYycpXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uICh1c2VyLCBwYXNzLCBvcHRpb25zKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSBwYXNzID0gJyc7XG4gIGlmICh0eXBlb2YgcGFzcyA9PT0gJ29iamVjdCcgJiYgcGFzcyAhPT0gbnVsbCkge1xuICAgIC8vIHBhc3MgaXMgb3B0aW9uYWwgYW5kIGNhbiBiZSByZXBsYWNlZCB3aXRoIG9wdGlvbnNcbiAgICBvcHRpb25zID0gcGFzcztcbiAgICBwYXNzID0gJyc7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0ge1xuICAgICAgdHlwZTogdHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicgPyAnYmFzaWMnIDogJ2F1dG8nXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IGVuY29kZXIgPSAoc3RyaW5nKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBidG9hID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gYnRvYShzdHJpbmcpO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHVzZSBiYXNpYyBhdXRoLCBidG9hIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG4gIH07XG5cbiAgcmV0dXJuIHRoaXMuX2F1dGgodXNlciwgcGFzcywgb3B0aW9ucywgZW5jb2Rlcik7XG59O1xuXG4vKipcbiAqIEFkZCBxdWVyeS1zdHJpbmcgYHZhbGAuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICByZXF1ZXN0LmdldCgnL3Nob2VzJylcbiAqICAgICAucXVlcnkoJ3NpemU9MTAnKVxuICogICAgIC5xdWVyeSh7IGNvbG9yOiAnYmx1ZScgfSlcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnF1ZXJ5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB2YWx1ZSA9IHNlcmlhbGl6ZSh2YWx1ZSk7XG4gIGlmICh2YWx1ZSkgdGhpcy5fcXVlcnkucHVzaCh2YWx1ZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBRdWV1ZSB0aGUgZ2l2ZW4gYGZpbGVgIGFzIGFuIGF0dGFjaG1lbnQgdG8gdGhlIHNwZWNpZmllZCBgZmllbGRgLFxuICogd2l0aCBvcHRpb25hbCBgb3B0aW9uc2AgKG9yIGZpbGVuYW1lKS5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5hdHRhY2goJ2NvbnRlbnQnLCBuZXcgQmxvYihbJzxhIGlkPVwiYVwiPjxiIGlkPVwiYlwiPmhleSE8L2I+PC9hPiddLCB7IHR5cGU6IFwidGV4dC9odG1sXCJ9KSlcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEBwYXJhbSB7QmxvYnxGaWxlfSBmaWxlXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdHRhY2ggPSBmdW5jdGlvbiAoZmllbGQsIGZpbGUsIG9wdGlvbnMpIHtcbiAgaWYgKGZpbGUpIHtcbiAgICBpZiAodGhpcy5fZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwic3VwZXJhZ2VudCBjYW4ndCBtaXggLnNlbmQoKSBhbmQgLmF0dGFjaCgpXCIpO1xuICAgIH1cblxuICAgIHRoaXMuX2dldEZvcm1EYXRhKCkuYXBwZW5kKGZpZWxkLCBmaWxlLCBvcHRpb25zIHx8IGZpbGUubmFtZSk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLl9nZXRGb3JtRGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkge1xuICAgIHRoaXMuX2Zvcm1EYXRhID0gbmV3IHJvb3QuRm9ybURhdGEoKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLl9mb3JtRGF0YTtcbn07XG5cbi8qKlxuICogSW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGBlcnJgIGFuZCBgcmVzYFxuICogYW5kIGhhbmRsZSBhcml0eSBjaGVjay5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbiAoZXJyb3IsIHJlcykge1xuICBpZiAodGhpcy5fc2hvdWxkUmV0cnkoZXJyb3IsIHJlcykpIHtcbiAgICByZXR1cm4gdGhpcy5fcmV0cnkoKTtcbiAgfVxuXG4gIGNvbnN0IGZuID0gdGhpcy5fY2FsbGJhY2s7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG5cbiAgaWYgKGVycm9yKSB7XG4gICAgaWYgKHRoaXMuX21heFJldHJpZXMpIGVycm9yLnJldHJpZXMgPSB0aGlzLl9yZXRyaWVzIC0gMTtcbiAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyb3IpO1xuICB9XG5cbiAgZm4oZXJyb3IsIHJlcyk7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHgtZG9tYWluIGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNyb3NzRG9tYWluRXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKFxuICAgICdSZXF1ZXN0IGhhcyBiZWVuIHRlcm1pbmF0ZWRcXG5Qb3NzaWJsZSBjYXVzZXM6IHRoZSBuZXR3b3JrIGlzIG9mZmxpbmUsIE9yaWdpbiBpcyBub3QgYWxsb3dlZCBieSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4sIHRoZSBwYWdlIGlzIGJlaW5nIHVubG9hZGVkLCBldGMuJ1xuICApO1xuICBlcnJvci5jcm9zc0RvbWFpbiA9IHRydWU7XG5cbiAgZXJyb3Iuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVycm9yLm1ldGhvZCA9IHRoaXMubWV0aG9kO1xuICBlcnJvci51cmwgPSB0aGlzLnVybDtcblxuICB0aGlzLmNhbGxiYWNrKGVycm9yKTtcbn07XG5cbi8vIFRoaXMgb25seSB3YXJucywgYmVjYXVzZSB0aGUgcmVxdWVzdCBpcyBzdGlsbCBsaWtlbHkgdG8gd29ya1xuUmVxdWVzdC5wcm90b3R5cGUuYWdlbnQgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnNvbGUud2FybignVGhpcyBpcyBub3Qgc3VwcG9ydGVkIGluIGJyb3dzZXIgdmVyc2lvbiBvZiBzdXBlcmFnZW50Jyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuY2EgPSBSZXF1ZXN0LnByb3RvdHlwZS5hZ2VudDtcblJlcXVlc3QucHJvdG90eXBlLmJ1ZmZlciA9IFJlcXVlc3QucHJvdG90eXBlLmNhO1xuXG4vLyBUaGlzIHRocm93cywgYmVjYXVzZSBpdCBjYW4ndCBzZW5kL3JlY2VpdmUgZGF0YSBhcyBleHBlY3RlZFxuUmVxdWVzdC5wcm90b3R5cGUud3JpdGUgPSAoKSA9PiB7XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAnU3RyZWFtaW5nIGlzIG5vdCBzdXBwb3J0ZWQgaW4gYnJvd3NlciB2ZXJzaW9uIG9mIHN1cGVyYWdlbnQnXG4gICk7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5waXBlID0gUmVxdWVzdC5wcm90b3R5cGUud3JpdGU7XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYSBob3N0IG9iamVjdCxcbiAqIHdlIGRvbid0IHdhbnQgdG8gc2VyaWFsaXplIHRoZXNlIDopXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBob3N0IG9iamVjdFxuICogQHJldHVybiB7Qm9vbGVhbn0gaXMgYSBob3N0IG9iamVjdFxuICogQGFwaSBwcml2YXRlXG4gKi9cblJlcXVlc3QucHJvdG90eXBlLl9pc0hvc3QgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gIC8vIE5hdGl2ZSBvYmplY3RzIHN0cmluZ2lmeSB0byBbb2JqZWN0IEZpbGVdLCBbb2JqZWN0IEJsb2JdLCBbb2JqZWN0IEZvcm1EYXRhXSwgZXRjLlxuICByZXR1cm4gKFxuICAgIG9iamVjdCAmJlxuICAgIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgIUFycmF5LmlzQXJyYXkob2JqZWN0KSAmJlxuICAgIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpICE9PSAnW29iamVjdCBPYmplY3RdJ1xuICApO1xufTtcblxuLyoqXG4gKiBJbml0aWF0ZSByZXF1ZXN0LCBpbnZva2luZyBjYWxsYmFjayBgZm4ocmVzKWBcbiAqIHdpdGggYW4gaW5zdGFuY2VvZiBgUmVzcG9uc2VgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24gKGZuKSB7XG4gIGlmICh0aGlzLl9lbmRDYWxsZWQpIHtcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICAnV2FybmluZzogLmVuZCgpIHdhcyBjYWxsZWQgdHdpY2UuIFRoaXMgaXMgbm90IHN1cHBvcnRlZCBpbiBzdXBlcmFnZW50J1xuICAgICk7XG4gIH1cblxuICB0aGlzLl9lbmRDYWxsZWQgPSB0cnVlO1xuXG4gIC8vIHN0b3JlIGNhbGxiYWNrXG4gIHRoaXMuX2NhbGxiYWNrID0gZm4gfHwgbm9vcDtcblxuICAvLyBxdWVyeXN0cmluZ1xuICB0aGlzLl9maW5hbGl6ZVF1ZXJ5U3RyaW5nKCk7XG5cbiAgdGhpcy5fZW5kKCk7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5fc2V0VXBsb2FkVGltZW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgLy8gdXBsb2FkIHRpbWVvdXQgaXQncyB3b2tycyBvbmx5IGlmIGRlYWRsaW5lIHRpbWVvdXQgaXMgb2ZmXG4gIGlmICh0aGlzLl91cGxvYWRUaW1lb3V0ICYmICF0aGlzLl91cGxvYWRUaW1lb3V0VGltZXIpIHtcbiAgICB0aGlzLl91cGxvYWRUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNlbGYuX3RpbWVvdXRFcnJvcihcbiAgICAgICAgJ1VwbG9hZCB0aW1lb3V0IG9mICcsXG4gICAgICAgIHNlbGYuX3VwbG9hZFRpbWVvdXQsXG4gICAgICAgICdFVElNRURPVVQnXG4gICAgICApO1xuICAgIH0sIHRoaXMuX3VwbG9hZFRpbWVvdXQpO1xuICB9XG59O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29tcGxleGl0eVxuUmVxdWVzdC5wcm90b3R5cGUuX2VuZCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuX2Fib3J0ZWQpXG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2soXG4gICAgICBuZXcgRXJyb3IoJ1RoZSByZXF1ZXN0IGhhcyBiZWVuIGFib3J0ZWQgZXZlbiBiZWZvcmUgLmVuZCgpIHdhcyBjYWxsZWQnKVxuICAgICk7XG5cbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gIHRoaXMueGhyID0gcmVxdWVzdC5nZXRYSFIoKTtcbiAgY29uc3QgeyB4aHIgfSA9IHRoaXM7XG4gIGxldCBkYXRhID0gdGhpcy5fZm9ybURhdGEgfHwgdGhpcy5fZGF0YTtcblxuICB0aGlzLl9zZXRUaW1lb3V0cygpO1xuXG4gIC8vIHN0YXRlIGNoYW5nZVxuICB4aHIuYWRkRXZlbnRMaXN0ZW5lcigncmVhZHlzdGF0ZWNoYW5nZScsICgpID0+IHtcbiAgICBjb25zdCB7IHJlYWR5U3RhdGUgfSA9IHhocjtcbiAgICBpZiAocmVhZHlTdGF0ZSA+PSAyICYmIHNlbGYuX3Jlc3BvbnNlVGltZW91dFRpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQoc2VsZi5fcmVzcG9uc2VUaW1lb3V0VGltZXIpO1xuICAgIH1cblxuICAgIGlmIChyZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSW4gSUU5LCByZWFkcyB0byBhbnkgcHJvcGVydHkgKGUuZy4gc3RhdHVzKSBvZmYgb2YgYW4gYWJvcnRlZCBYSFIgd2lsbFxuICAgIC8vIHJlc3VsdCBpbiB0aGUgZXJyb3IgXCJDb3VsZCBub3QgY29tcGxldGUgdGhlIG9wZXJhdGlvbiBkdWUgdG8gZXJyb3IgYzAwYzAyM2ZcIlxuICAgIGxldCBzdGF0dXM7XG4gICAgdHJ5IHtcbiAgICAgIHN0YXR1cyA9IHhoci5zdGF0dXM7XG4gICAgfSBjYXRjaCB7XG4gICAgICBzdGF0dXMgPSAwO1xuICAgIH1cblxuICAgIGlmICghc3RhdHVzKSB7XG4gICAgICBpZiAoc2VsZi50aW1lZG91dCB8fCBzZWxmLl9hYm9ydGVkKSByZXR1cm47XG4gICAgICByZXR1cm4gc2VsZi5jcm9zc0RvbWFpbkVycm9yKCk7XG4gICAgfVxuXG4gICAgc2VsZi5lbWl0KCdlbmQnKTtcbiAgfSk7XG5cbiAgLy8gcHJvZ3Jlc3NcbiAgY29uc3QgaGFuZGxlUHJvZ3Jlc3MgPSAoZGlyZWN0aW9uLCBlKSA9PiB7XG4gICAgaWYgKGUudG90YWwgPiAwKSB7XG4gICAgICBlLnBlcmNlbnQgPSAoZS5sb2FkZWQgLyBlLnRvdGFsKSAqIDEwMDtcblxuICAgICAgaWYgKGUucGVyY2VudCA9PT0gMTAwKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChzZWxmLl91cGxvYWRUaW1lb3V0VGltZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGUuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgIHNlbGYuZW1pdCgncHJvZ3Jlc3MnLCBlKTtcbiAgfTtcblxuICBpZiAodGhpcy5oYXNMaXN0ZW5lcnMoJ3Byb2dyZXNzJykpIHtcbiAgICB0cnkge1xuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgaGFuZGxlUHJvZ3Jlc3MuYmluZChudWxsLCAnZG93bmxvYWQnKSk7XG4gICAgICBpZiAoeGhyLnVwbG9hZCkge1xuICAgICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgJ3Byb2dyZXNzJyxcbiAgICAgICAgICBoYW5kbGVQcm9ncmVzcy5iaW5kKG51bGwsICd1cGxvYWQnKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gQWNjZXNzaW5nIHhoci51cGxvYWQgZmFpbHMgaW4gSUUgZnJvbSBhIHdlYiB3b3JrZXIsIHNvIGp1c3QgcHJldGVuZCBpdCBkb2Vzbid0IGV4aXN0LlxuICAgICAgLy8gUmVwb3J0ZWQgaGVyZTpcbiAgICAgIC8vIGh0dHBzOi8vY29ubmVjdC5taWNyb3NvZnQuY29tL0lFL2ZlZWRiYWNrL2RldGFpbHMvODM3MjQ1L3htbGh0dHByZXF1ZXN0LXVwbG9hZC10aHJvd3MtaW52YWxpZC1hcmd1bWVudC13aGVuLXVzZWQtZnJvbS13ZWItd29ya2VyLWNvbnRleHRcbiAgICB9XG4gIH1cblxuICBpZiAoeGhyLnVwbG9hZCkge1xuICAgIHRoaXMuX3NldFVwbG9hZFRpbWVvdXQoKTtcbiAgfVxuXG4gIC8vIGluaXRpYXRlIHJlcXVlc3RcbiAgdHJ5IHtcbiAgICBpZiAodGhpcy51c2VybmFtZSAmJiB0aGlzLnBhc3N3b3JkKSB7XG4gICAgICB4aHIub3Blbih0aGlzLm1ldGhvZCwgdGhpcy51cmwsIHRydWUsIHRoaXMudXNlcm5hbWUsIHRoaXMucGFzc3dvcmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB4aHIub3Blbih0aGlzLm1ldGhvZCwgdGhpcy51cmwsIHRydWUpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgLy8gc2VlICMxMTQ5XG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2soZXJyKTtcbiAgfVxuXG4gIC8vIENPUlNcbiAgaWYgKHRoaXMuX3dpdGhDcmVkZW50aWFscykgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG5cbiAgLy8gYm9keVxuICBpZiAoXG4gICAgIXRoaXMuX2Zvcm1EYXRhICYmXG4gICAgdGhpcy5tZXRob2QgIT09ICdHRVQnICYmXG4gICAgdGhpcy5tZXRob2QgIT09ICdIRUFEJyAmJlxuICAgIHR5cGVvZiBkYXRhICE9PSAnc3RyaW5nJyAmJlxuICAgICF0aGlzLl9pc0hvc3QoZGF0YSlcbiAgKSB7XG4gICAgLy8gc2VyaWFsaXplIHN0dWZmXG4gICAgY29uc3QgY29udGVudFR5cGUgPSB0aGlzLl9oZWFkZXJbJ2NvbnRlbnQtdHlwZSddO1xuICAgIGxldCBzZXJpYWxpemUgPVxuICAgICAgdGhpcy5fc2VyaWFsaXplciB8fFxuICAgICAgcmVxdWVzdC5zZXJpYWxpemVbY29udGVudFR5cGUgPyBjb250ZW50VHlwZS5zcGxpdCgnOycpWzBdIDogJyddO1xuICAgIGlmICghc2VyaWFsaXplICYmIGlzSlNPTihjb250ZW50VHlwZSkpIHtcbiAgICAgIHNlcmlhbGl6ZSA9IHJlcXVlc3Quc2VyaWFsaXplWydhcHBsaWNhdGlvbi9qc29uJ107XG4gICAgfVxuXG4gICAgaWYgKHNlcmlhbGl6ZSkgZGF0YSA9IHNlcmlhbGl6ZShkYXRhKTtcbiAgfVxuXG4gIC8vIHNldCBoZWFkZXIgZmllbGRzXG4gIGZvciAoY29uc3QgZmllbGQgaW4gdGhpcy5oZWFkZXIpIHtcbiAgICBpZiAodGhpcy5oZWFkZXJbZmllbGRdID09PSBudWxsKSBjb250aW51ZTtcblxuICAgIGlmIChoYXNPd24odGhpcy5oZWFkZXIsIGZpZWxkKSlcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGZpZWxkLCB0aGlzLmhlYWRlcltmaWVsZF0pO1xuICB9XG5cbiAgaWYgKHRoaXMuX3Jlc3BvbnNlVHlwZSkge1xuICAgIHhoci5yZXNwb25zZVR5cGUgPSB0aGlzLl9yZXNwb25zZVR5cGU7XG4gIH1cblxuICAvLyBzZW5kIHN0dWZmXG4gIHRoaXMuZW1pdCgncmVxdWVzdCcsIHRoaXMpO1xuXG4gIC8vIElFMTEgeGhyLnNlbmQodW5kZWZpbmVkKSBzZW5kcyAndW5kZWZpbmVkJyBzdHJpbmcgYXMgUE9TVCBwYXlsb2FkIChpbnN0ZWFkIG9mIG5vdGhpbmcpXG4gIC8vIFdlIG5lZWQgbnVsbCBoZXJlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gIHhoci5zZW5kKHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiBkYXRhKTtcbn07XG5cbnJlcXVlc3QuYWdlbnQgPSAoKSA9PiBuZXcgQWdlbnQoKTtcblxuZm9yIChjb25zdCBtZXRob2Qgb2YgWydHRVQnLCAnUE9TVCcsICdPUFRJT05TJywgJ1BBVENIJywgJ1BVVCcsICdERUxFVEUnXSkge1xuICBBZ2VudC5wcm90b3R5cGVbbWV0aG9kLnRvTG93ZXJDYXNlKCldID0gZnVuY3Rpb24gKHVybCwgZm4pIHtcbiAgICBjb25zdCByZXF1ZXN0XyA9IG5ldyByZXF1ZXN0LlJlcXVlc3QobWV0aG9kLCB1cmwpO1xuICAgIHRoaXMuX3NldERlZmF1bHRzKHJlcXVlc3RfKTtcbiAgICBpZiAoZm4pIHtcbiAgICAgIHJlcXVlc3RfLmVuZChmbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcXVlc3RfO1xuICB9O1xufVxuXG5BZ2VudC5wcm90b3R5cGUuZGVsID0gQWdlbnQucHJvdG90eXBlLmRlbGV0ZTtcblxuLyoqXG4gKiBHRVQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gW2RhdGFdIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmdldCA9ICh1cmwsIGRhdGEsIGZuKSA9PiB7XG4gIGNvbnN0IHJlcXVlc3RfID0gcmVxdWVzdCgnR0VUJywgdXJsKTtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZm4gPSBkYXRhO1xuICAgIGRhdGEgPSBudWxsO1xuICB9XG5cbiAgaWYgKGRhdGEpIHJlcXVlc3RfLnF1ZXJ5KGRhdGEpO1xuICBpZiAoZm4pIHJlcXVlc3RfLmVuZChmbik7XG4gIHJldHVybiByZXF1ZXN0Xztcbn07XG5cbi8qKlxuICogSEVBRCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBbZGF0YV0gb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuaGVhZCA9ICh1cmwsIGRhdGEsIGZuKSA9PiB7XG4gIGNvbnN0IHJlcXVlc3RfID0gcmVxdWVzdCgnSEVBRCcsIHVybCk7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gZGF0YTtcbiAgICBkYXRhID0gbnVsbDtcbiAgfVxuXG4gIGlmIChkYXRhKSByZXF1ZXN0Xy5xdWVyeShkYXRhKTtcbiAgaWYgKGZuKSByZXF1ZXN0Xy5lbmQoZm4pO1xuICByZXR1cm4gcmVxdWVzdF87XG59O1xuXG4vKipcbiAqIE9QVElPTlMgcXVlcnkgdG8gYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gW2RhdGFdIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0Lm9wdGlvbnMgPSAodXJsLCBkYXRhLCBmbikgPT4ge1xuICBjb25zdCByZXF1ZXN0XyA9IHJlcXVlc3QoJ09QVElPTlMnLCB1cmwpO1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IGRhdGE7XG4gICAgZGF0YSA9IG51bGw7XG4gIH1cblxuICBpZiAoZGF0YSkgcmVxdWVzdF8uc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXF1ZXN0Xy5lbmQoZm4pO1xuICByZXR1cm4gcmVxdWVzdF87XG59O1xuXG4vKipcbiAqIERFTEVURSBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IFtkYXRhXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGVsKHVybCwgZGF0YSwgZm4pIHtcbiAgY29uc3QgcmVxdWVzdF8gPSByZXF1ZXN0KCdERUxFVEUnLCB1cmwpO1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IGRhdGE7XG4gICAgZGF0YSA9IG51bGw7XG4gIH1cblxuICBpZiAoZGF0YSkgcmVxdWVzdF8uc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXF1ZXN0Xy5lbmQoZm4pO1xuICByZXR1cm4gcmVxdWVzdF87XG59XG5cbnJlcXVlc3QuZGVsID0gZGVsO1xucmVxdWVzdC5kZWxldGUgPSBkZWw7XG5cbi8qKlxuICogUEFUQ0ggYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBbZGF0YV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucGF0Y2ggPSAodXJsLCBkYXRhLCBmbikgPT4ge1xuICBjb25zdCByZXF1ZXN0XyA9IHJlcXVlc3QoJ1BBVENIJywgdXJsKTtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZm4gPSBkYXRhO1xuICAgIGRhdGEgPSBudWxsO1xuICB9XG5cbiAgaWYgKGRhdGEpIHJlcXVlc3RfLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxdWVzdF8uZW5kKGZuKTtcbiAgcmV0dXJuIHJlcXVlc3RfO1xufTtcblxuLyoqXG4gKiBQT1NUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gW2RhdGFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBvc3QgPSAodXJsLCBkYXRhLCBmbikgPT4ge1xuICBjb25zdCByZXF1ZXN0XyA9IHJlcXVlc3QoJ1BPU1QnLCB1cmwpO1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IGRhdGE7XG4gICAgZGF0YSA9IG51bGw7XG4gIH1cblxuICBpZiAoZGF0YSkgcmVxdWVzdF8uc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXF1ZXN0Xy5lbmQoZm4pO1xuICByZXR1cm4gcmVxdWVzdF87XG59O1xuXG4vKipcbiAqIFBVVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IFtkYXRhXSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wdXQgPSAodXJsLCBkYXRhLCBmbikgPT4ge1xuICBjb25zdCByZXF1ZXN0XyA9IHJlcXVlc3QoJ1BVVCcsIHVybCk7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gZGF0YTtcbiAgICBkYXRhID0gbnVsbDtcbiAgfVxuXG4gIGlmIChkYXRhKSByZXF1ZXN0Xy5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcXVlc3RfLmVuZChmbik7XG4gIHJldHVybiByZXF1ZXN0Xztcbn07XG4iXX0=