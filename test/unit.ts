"use strict";
import chai = require('chai');
import dns = require('dns');
import spy = require('sinon');
import sinonChai = require('sinon-chai');
import request = require('request');
import {dnsCache} from "../index";

chai.use(sinonChai);

let should = chai.should();

describe("Dns Cache", function () {


    it.only("should cache resolve", (done) => {

        let dnsCached = dnsCache({override: true});

        let stub = spy.spy((dnsCached as any)._cache, "get");

        dns.lookup("yahoo.com", function (err, result) {
            dns.lookup("yahoo.com", function (err, result) {


                stub.should.have.been.calledTwice;
                should.not.exist(stub.returnValues[0]);
                stub.returnValues[1].should.be.ok;

                done()
            })
        })
    });

    it("should cache dns with request", (done) => {

        dnsCache({override: true});

        request.head("http://yahoo.com", (err, res) => {

            should.not.exist(err);

            done();
        })
    });

});
