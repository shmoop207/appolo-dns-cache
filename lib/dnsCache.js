"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dns = require("dns");
const appolo_cache_1 = require("appolo-cache");
class DnsCache {
    constructor(_options = {}) {
        this._options = _options;
        this._callbacks = {};
        this.Defaults = {
            override: false,
            maxItems: 1000,
            ttl: 10000
        };
        this._options = Object.assign({}, this.Defaults, _options || {});
        this._cache = new appolo_cache_1.Cache({ maxAge: this._options.ttl, maxSize: this._options.maxItems });
        this._originDns = {
            lookup: dns.lookup,
            resolve: dns.resolve,
            resolve4: dns.resolve4,
            resolve6: dns.resolve6,
            resolveMx: dns.resolveMx,
            resolveTxt: dns.resolveTxt,
            resolveSrv: dns.resolveSrv,
            resolveNs: dns.resolveNs,
            resolveCname: dns.resolveCname,
            reverse: dns.reverse
        };
        Object.keys(this._originDns).forEach((key) => {
            dns[key] = this[key].bind(this);
        });
    }
    reverse(ip, callback) {
        this._run("reverse", Array.from(arguments));
    }
    resolveCname(hostname, callback) {
        this._run("resolveCname", Array.from(arguments));
    }
    resolveNs(hostname, callback) {
        this._run("resolveNs", Array.from(arguments));
    }
    resolveSrv(hostname, callback) {
        this._run("resolveSrv", Array.from(arguments));
    }
    resolveTxt(hostname, callback) {
        this._run("resolveTxt", Array.from(arguments));
    }
    resolveMx(hostname, callback) {
        this._run("resolveMx", Array.from(arguments));
    }
    resolve6(hostname, callback) {
        this._run("resolve6", Array.from(arguments));
    }
    resolve4(hostname, callback) {
        this._run("resolve4", Array.from(arguments));
    }
    resolve(hostname, callback) {
        this._run("resolve", Array.from(arguments));
    }
    lookup(hostname, family, callback) {
        this._run("lookup", Array.from(arguments));
    }
    _run(name, args) {
        let callback = args.pop();
        let key = JSON.stringify(args);
        let item = this._cache.get(key);
        if (item) {
            return callback(null, ...JSON.parse(item));
        }
        let callbackKey = name + key;
        let callbacks = this._callbacks[callbackKey] || (this._callbacks[callbackKey] = []);
        callbacks.push(callback);
        if (callbacks.length > 1) {
            return;
        }
        this._originDns[name](...args, this._dnsCb.bind(this, key, callbackKey, callbacks));
    }
    _dnsCb(key, callbackKey, callbacks, err, ...rest) {
        if (!err) {
            this._cache.set(key, JSON.stringify(rest));
        }
        delete this._callbacks[callbackKey];
        for (let i = 0, len = callbacks.length; i < len; i++) {
            callbacks[i](err, ...rest);
        }
    }
}
exports.DnsCache = DnsCache;
//# sourceMappingURL=dnsCache.js.map