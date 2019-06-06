"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dnsCache_1 = require("./lib/dnsCache");
exports.DnsCache = dnsCache_1.DnsCache;
function dnsCache(options) {
    return new dnsCache_1.DnsCache(options);
}
exports.dnsCache = dnsCache;
//# sourceMappingURL=index.js.map