var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

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
export {
  AsyncQueue
};
//# sourceMappingURL=index.mjs.map