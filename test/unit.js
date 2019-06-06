"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const dns = require("dns");
const spy = require("sinon");
const sinonChai = require("sinon-chai");
const request = require("request");
const index_1 = require("../index");
chai.use(sinonChai);
let should = chai.should();
describe("Dns Cache", function () {
    it.only("should cache resolve", (done) => {
        let dnsCached = index_1.dnsCache({ override: true });
        let stub = spy.spy(dnsCached._cache, "get");
        dns.lookup("yahoo.com", function (err, result) {
            dns.lookup("yahoo.com", function (err, result) {
                stub.should.have.been.calledTwice;
                should.not.exist(stub.returnValues[0]);
                stub.returnValues[1].should.be.ok;
                done();
            });
        });
    });
    it("should cache dns with request", (done) => {
        index_1.dnsCache({ override: true });
        request.head("http://yahoo.com", (err, res) => {
            should.not.exist(err);
            done();
        });
    });
});
//# sourceMappingURL=unit.js.map