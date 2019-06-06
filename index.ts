import {DnsCache} from "./lib/dnsCache"
import {IOptions} from "./lib/IOptions";

export {DnsCache}

export function dnsCache(options?: IOptions): DnsCache {
    return new DnsCache(options)
}
