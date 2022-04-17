var SapphireAsyncQueue = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __reExport = (target, module, copyDefault, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
    }
    return target;
  };
  var __toCommonJS = /* @__PURE__ */ ((cache) => {
    return (module, temp) => {
      return cache && cache.get(module) || (temp = __reExport(__markAsModule({}), module, 1), cache && cache.set(module, temp), temp);
    };
  })(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    AsyncQueue: () => AsyncQueue
  });

  // src/lib/AsyncQueue.ts
  var AsyncQueue = class {
    constructor() {
      __publicField(this, "promises", []);
    }
    get remaining() {
      return this.promises.length;
    }
    wait() {
      const next = this.promises.length ? this.promises[this.promises.length - 1].promise : Promise.resolve();
      let resolve;
      const promise = new Promise((res) => {
        resolve = res;
      });
      this.promises.push({
        resolve,
        promise
      });
      return next;
    }
    shift() {
      const deferred = this.promises.shift();
      if (typeof deferred !== "undefined")
        deferred.resolve();
    }
  };
  __name(AsyncQueue, "AsyncQueue");
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=index.global.js.map