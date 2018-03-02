global.config = require('../config/'+(process.env.NODE_ENV || "dev")+'.js')
var assert = require('assert');
const index = require('../index.js')


const WebSocketClient = require('rpc-websockets').Client;
const abi = require('ethereumjs-abi');

const offering_data = 'ew0KICAidGVtcGxhdGVWZXJzaW9uIiA6IDIsDQogICJhZ2VudFB1YmxpY0tleSIgOiAiTURSaE16UmlPVGxtTWpKak56a3dZelJsTXpaaU1tSXpZekpqTXpWaE16WmtZakEyTWpJMlpUUXhZelk1TW1aak9ESmlPR0kxTm1Gak1XTTFOREJqTldKa05XSTRaR1ZqTlRJek5XRXdabUU0TnpJeU5EYzJZemMzTURsak1ESTFOVGxsTTJGaE56TmhZVEF6T1RFNFltRXlaRFE1TW1WbFlUYzFZV0psWVRJek5RPT0iLA0KICAic2VydmljZU5hbWUiIDogIlZQTiIsDQogICJjb3VudHJ5IiA6ICJVUyIsDQogICJzZXJ2aWNlU3VwcGx5IiA6IDUsDQogICJzZXJ2aWNlVW5pdCIgOiAiTUIiLA0KICAic2VydmljZVVuaXQiIDogMC4wMDAwMDAyLA0KICAibWluVW5pdHMiIDogMTAwLA0KICAibWF4VW5pdHMiIDogMTAwMDAsDQogICJiaWxsaW5nSW50ZXJ2YWwiIDogNTAsDQogICJtYXhCaWxsaW5nVW5pdExhZyIgOiAxMCwNCiAgIm1heEluYWN0aXZlVGltZSIgOiAyLA0KICAiZnJlZUludGVydmFscyIgOiAwLjIsDQogICJtaW5Eb3dubG9hZE1icHMiIDogMC41LA0KICAibWluVXBsb2FkTWJwcyI6IDAuNSwNCiAgInByb3RvY29sIjogInRjcCIsDQogICJ1dWlkIiA6ICJlYTg2NGJlNi1kYjQyLTQzZTItYmZmYS1hYTQ0YWNlNTczZjAiLA0KICAic2lnbmF0dXJlIiA6ICJNVWhhZDJ0cWEyVmhiMXBtVkZOaFNuaEVkelpoUzJ0NGNEUTFZV2RFYVVWNlRrZDVhbVoyWkVOdVdWbE9Wa05GTUhCc2NVdExjbTVPV0d0aFVYSmlZbEJ1UkdVeWNqVTVhbHBLVTFkc2FXTk1ObGxOYVM5NllVZzJWbWg1YTNGQ2NGRlhRV3R3U0VFck5HWjRlWFZwUVdOVGVscEJWVXM1UVQwPSINCn0';
const offering_hash = abi.soliditySHA3(['string'],[new Buffer(offering_data, 'base64').toString()]).toString('hex');

describe("Test functions SOMC wesocket server", function(){

    after(async () => {
       index.server.close();
       index.offerings.o.db.connector.close();
    })

    it("Save new offering", async () => {
        const ws = new WebSocketClient('ws://'+config.ws.host+':'+config.ws.port);
        await new Promise((resolve, reject) => {
            ws.on('open', () => {
                resolve();
            })
        })

        await ws.call('newOffering',{
            "hash" : offering_hash,
            "data" : offering_data
        }).then(function(result){
            assert.equal(result, true);
        })
        ws.close();
    })

    it("Get exist offering", async () => {
        const ws = new WebSocketClient('ws://'+config.ws.host+':'+config.ws.port);
        await new Promise((resolve, reject) => {
            ws.on('open', () => {
                resolve();
            })
        })

        await ws.call('getOfferings',{
            "hashes":[offering_hash]
        }).then(function(result){
            assert.equal(Array.isArray(result) && result[0].hash==offering_hash, true);
        })
        ws.close();
    })

    it("Get not exist offering", async () => {
        const ws = new WebSocketClient('ws://'+config.ws.host+':'+config.ws.port);
        await new Promise((resolve, reject) => {
            ws.on('open', () => {
                resolve();
            })
        })
        await ws.call('getOfferings',{
            "hashes":[offering_hash+'1']
        }).then(function(result){
            assert.equal(Array.isArray(result) && result.length==0, true);
        })
        ws.close();
    })


    /*it("Subscribe to channel and receive notification by agent", async () => {
        const ws = new WebSocketClient('ws://'+config.ws.host+':'+config.ws.port);
        await new Promise((resolve, reject) => {
            ws.on('open', () => {
                resolve();
            })
        })
        const ws1 = new WebSocketClient('ws://'+config.ws.host+':'+config.ws.port);
        await new Promise((resolve, reject) => {
            ws1.on('open', () => {
                resolve();
            })
        })
        const offering_hash = abi.soliditySHA3(['string'],[offering_data]).toString('hex');

        //Subcribe by agent
        await ws.call('subscribe',{
            "type": "agent",
            "offering_hash" : offering_hash
        }).then(function(result){
            assert.equal(result, true);
        });

        //Listen RPC call auth_info by agent
        const p = new Promise((resolver)=> {
            ws.on('auth_info',function(params){
                    resolver(params);
            })
        })

        //Sent auth_info by client
        await ws1.call('auth_info',{
            "template_version" : 3,
            "offering_hash" : offering_hash ,
            "state_channel" : "4598dec954ca4356b95d927a8404aea69b881169b7fc3a69c506471f625254ds",
            "client_public_key" : "MDRhMzRiOTlmMjJjNzkwYzRlMzZiMmIzYzJjMzVhMzZkYjA2MjI2ZTQxYzY5MmZjODJiOGI1NmFjMWM1NDBjNWJkNWI4ZGVjNTIzNWEwZmE4NzIyNDc2Yzc3MDljMDI1NTllM2FhNzNhYTAzOTE4YmEyZDQ5MmVlYTc1YWJlYTIzNQ==",
            "password": "MDhjNTZiOTlmMjJjNzkwYzRlMzZiMmIzYzJjMzVhMzZkYjA2MjI2ZTQxYzY5MmZjODJiOGI1NmFjMWM1NDBjNWJkNWI4ZGVjNTIzNWEwZmE4NzIyNDc2Yzc3MDljMDI1NTllM2FhNzNhYTAzOTE4YmEyZDQ5MmVlYTc1YTU2NTQ=",
            "signature": "MUhad2tqa2Vhb1pmVFNhSnhEdzZhS2t4cDQ1YWdEaUV6Tkd5amZ2ZENuWVlOVkNFMHBscUtLcm5OWGthUXJiYlBuRGUycjU5alpKU1dsaWNMNllNaS96YUg2Vmh5a3FCcFFXQWtwSEErNGZ4eXVpQWNTelpBVUs5QT0="
        }).then(function(result){
            assert.equal(result, true);
        });

        await p.then((params) => {
            assert.equal(params && params.offering_hash==offering_hash, true)
        });
        ws.close();
        ws1.close();
    })*/

    it("Subscribe to channel and receive notification by client", async () => {
        const ws = new WebSocketClient('ws://'+config.ws.host+':'+config.ws.port);
        await new Promise((resolve, reject) => {
            ws.on('open', () => {
                resolve();
            })
        })
        const ws1 = new WebSocketClient('ws://'+config.ws.host+':'+config.ws.port);
        await new Promise((resolve, reject) => {
            ws1.on('open', () => {
                resolve();
            })
        })

        const state_channel = '4598dec954ca4356b95d927a8404aea69b881169b7fc3a69c506471f625254ds';
        //Subcribe by client
        await ws.call('subscribe',{
            "type": "client",
            "state_channel" : state_channel
        }).then(function(result){
            assert.equal(result, true);
        });


        //Listen RPC call connection_info by client
        const p = new Promise((resolver)=> {
            ws.on('connectionInfo',function(params){
                resolver(params);
            })
        })

        //Sent state_channel by agent
        await ws1.call('connectionInfo',{
            "template_version" : 2,
            "offering_hash" : offering_hash,
            "state_channel" : state_channel,
            "dns" : "MDRhMzRiOTlmMjJjNzkwYzRlMzZiMmIzYzJjMzVhMzZkYjA2MjI2ZTQxYzY5MmZjODJiOGI1NmFjMWM1NDBjNWJkNWI4ZGVjNTIzNWEwZmE4NzIyNDc2Yzc3MDljMDI1NTllM2FhNzNhYTAzOTE4YmEyZDQ5MmVlYTc1YWJlYTIzNQ==",
            "ipv4": "NjJkMmY4NjBkZDRhNjIwMzhlYzE5YWEyNGM4YWFjMDdhYmZjNDUyOGMwYzBkMjk1MDJmYWU5YjExMjhjZjFhMTYyZDJmODYwZGQ0YTYyMDM4ZWMxOWFhMjRjOGFhYzA3YWJmYzQ1MjhjMGMwZDI5NTAyZmFlOWIxMTI4Y2YxYTE=",
            "ipv6": "MDhjNTZiOTlmMjJjNzkwYzRlMzZiMmIzYzJjMzVhMzZkYjA2MjI2ZTQxYzY5MmZjODJiOGI1NmFjMWM1NDBjNWJkNWI4ZGVjNTIzNWEwZmE4NzIyNDc2Yzc3MDljMDI1NTllM2FhNzNhYTAzOTE4YmEyZDQ5MmVlYTc1YTU2NTQ=",
            "signature": "MUhad2tqa2Vhb1pmVFNhSnhEdzZhS2t4cDQ1YWdEaUV6Tkd5amZ2ZENuWVlOVkNFMHBscUtLcm5OWGthUXJiYlBuRGUycjU5alpKU1dsaWNMNllNaS96YUg2Vmh5a3FCcFFXQWtwSEErNGZ4eXVpQWNTelpBVUs5QT0="
        }).then(function(result){
            assert.equal(result, true);
        });

        await p.then((params) => {
            assert.equal(params && params.state_channel==state_channel, true)
        });
        ws.close();
        ws1.close();
    })

    /*it("Subscribe to channel and receive old notification by agent", async () => {
        const ws = new WebSocketClient('ws://'+config.ws.host+':'+config.ws.port);
        await new Promise((resolve, reject) => {
            ws.on('open', () => {
                resolve();
            })
        })
        const offering_hash = abi.soliditySHA3(['string'],[offering_data]).toString('hex');
        //Listen RPC call auth_info by agent
        const p = new Promise((resolver)=> {
            ws.on('auth_info',function(params){
                resolver(params);
            })
        })

        ws.call('subscribe',{
            "type": "agent",
            "offering_hash" : offering_hash
        }).then(function(result){
            assert.equal(result, true);
        });

        await p.then((params) => {
            assert.equal(params && params.offering_hash==offering_hash, true)
        });
        ws.close();
    });*/

    it("Subscribe to channel and receive old notification by client", async () => {
        const ws = new WebSocketClient('ws://'+config.ws.host+':'+config.ws.port);
        await new Promise((resolve, reject) => {
            ws.on('open', () => {
                resolve();
            })
        })

        const ws1 = new WebSocketClient('ws://'+config.ws.host+':'+config.ws.port);
        await new Promise((resolve, reject) => {
            ws1.on('open', () => {
                resolve();
            })
        })

        const state_channel = '4598dec954ca4356b95d927a8404aea69b881169b7fc3a69c506471f625254ds';
        //Sent state_channel by agent
        await ws1.call('connectionInfo',{
            "template_version" : 2,
            "offering_hash" : offering_hash,
            "state_channel" : state_channel,
            "dns" : "MDRhMzRiOTlmMjJjNzkwYzRlMzZiMmIzYzJjMzVhMzZkYjA2MjI2ZTQxYzY5MmZjODJiOGI1NmFjMWM1NDBjNWJkNWI4ZGVjNTIzNWEwZmE4NzIyNDc2Yzc3MDljMDI1NTllM2FhNzNhYTAzOTE4YmEyZDQ5MmVlYTc1YWJlYTIzNQ==",
            "ipv4": "NjJkMmY4NjBkZDRhNjIwMzhlYzE5YWEyNGM4YWFjMDdhYmZjNDUyOGMwYzBkMjk1MDJmYWU5YjExMjhjZjFhMTYyZDJmODYwZGQ0YTYyMDM4ZWMxOWFhMjRjOGFhYzA3YWJmYzQ1MjhjMGMwZDI5NTAyZmFlOWIxMTI4Y2YxYTE=",
            "ipv6": "MDhjNTZiOTlmMjJjNzkwYzRlMzZiMmIzYzJjMzVhMzZkYjA2MjI2ZTQxYzY5MmZjODJiOGI1NmFjMWM1NDBjNWJkNWI4ZGVjNTIzNWEwZmE4NzIyNDc2Yzc3MDljMDI1NTllM2FhNzNhYTAzOTE4YmEyZDQ5MmVlYTc1YTU2NTQ=",
            "signature": "MUhad2tqa2Vhb1pmVFNhSnhEdzZhS2t4cDQ1YWdEaUV6Tkd5amZ2ZENuWVlOVkNFMHBscUtLcm5OWGthUXJiYlBuRGUycjU5alpKU1dsaWNMNllNaS96YUg2Vmh5a3FCcFFXQWtwSEErNGZ4eXVpQWNTelpBVUs5QT0="
        }).then(function(result){
            assert.equal(result, true);
        });
        await ws1.close();

        //Listen RPC call auth_info by agent
        const p = new Promise((resolver)=> {
            ws.on('connectionInfo',function(params){
                resolver(params);
            })
        })

        ws.call('subscribe',{
            "type": "client",
            "state_channel" : state_channel
        }).then(function(result){
            assert.equal(result, true);
        });

        await p.then((params) => {
            assert.equal(params && params.state_channel==state_channel, true)
        });
        ws.close();

    });

});