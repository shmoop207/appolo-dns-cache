import dns = require('dns');
import util = require('util');
import {Cache} from 'appolo-cache';
import {LookupAddress, LookupAllOptions, LookupOneOptions, LookupOptions, MxRecord, SrvRecord} from "dns";
import {IOptions} from "./IOptions";

export class DnsCache {

    private readonly _cache: Cache<string, any>;
    private readonly _originDns: Partial<typeof dns>;
    private readonly _callbacks: { [index: string]: Function[] } = {};

    private readonly Defaults: Partial<IOptions> = {
        override: false,
        maxItems: 1000,
        ttl: 10000
    };

    constructor(private _options: IOptions = {}) {

        this._options = Object.assign({}, this.Defaults, _options || {});

        this._cache = new Cache({maxAge: this._options.ttl, maxSize: this._options.maxItems});

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



        Object.keys(this._originDns).forEach((key: string) => {
            dns[key] = this[key].bind(this);
        });
    }

    public reverse(ip: string, callback: (err: NodeJS.ErrnoException | null, hostnames: string[]) => void): void {
        this._run("reverse", Array.from(arguments))
    }

    public resolveCname(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void {
        this._run("resolveCname", Array.from(arguments))
    }

    public resolveNs(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void {
        this._run("resolveNs", Array.from(arguments))
    }

    public resolveSrv(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: SrvRecord[]) => void): void {
        this._run("resolveSrv", Array.from(arguments))
    }

    public resolveTxt(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: string[][]) => void): void {
        this._run("resolveTxt", Array.from(arguments))
    }

    public resolveMx(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: MxRecord[]) => void): void {
        this._run("resolveMx", Array.from(arguments))

    }

    public resolve6(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void {
        this._run("resolve6", Array.from(arguments))
    }

    public resolve4(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void {
        this._run("resolve4", Array.from(arguments))
    }

    public resolve(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void {
        this._run("resolve", Array.from(arguments))

    }

    public lookup(hostname: string, family: number, callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void): void {
        this._run("lookup", Array.from(arguments))
    }

    private _run(name: keyof typeof dns, args: any[]): void {

        let callback = args.pop();

        let key = JSON.stringify(args);

        let item = this._cache.get(key);

        if (item) {
            return callback(null, ...JSON.parse(item))
        }

        let callbackKey = name + key;

        let callbacks = this._callbacks[callbackKey] || (this._callbacks[callbackKey] = []);

        callbacks.push(callback);

        if (callbacks.length > 1) {
            return;
        }

        this._originDns[name as string](...args, this._dnsCb.bind(this, key, callbackKey, callbacks));
    }

    private _dnsCb(key: string, callbackKey: string, callbacks: Function[], err: Error, ...rest: any[]) {

        if (!err) {
            this._cache.set(key, JSON.stringify(rest))
        }

        delete this._callbacks[callbackKey];

        for (let i = 0, len = callbacks.length; i < len; i++) {
            callbacks[i](err, ...rest)
        }


    }


}
