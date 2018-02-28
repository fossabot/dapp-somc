global.config = require('../config/'+(process.env.NODE_ENV || "dev")+'.js')
var assert = require('assert');
require('../index.js')


const WebSocketClient = require('rpc-websockets').Client;
const abi = require('ethereumjs-abi');

const offering_data = '{ \
            "template_version" : 2, \
            "agent_public_key" : "MDRhMzRiOTlmMjJjNzkwYzRlMzZiMmIzYzJjMzVhMzZkYjA2MjI2ZTQxYzY5MmZjODJiOGI1NmFjMWM1NDBjNWJkNWI4ZGVjNTIzNWEwZmE4NzIyNDc2Yzc3MDljMDI1NTllM2FhNzNhYTAzOTE4YmEyZDQ5MmVlYTc1YWJlYTIzNQ==", \
            "service_name" : "VPN", \
            "country" : "US", \
            "service_supply" : 5, \
            "service_unit" : "MB", \
            "unit_price" : 0.0000002, \
            "min_units" : 100, \
            "max_units" : 10000, \
            "billing_interval" : 50, \
            "billing_interval_time_deviation" : 10, \
            "free_intervals" : 2, \
            "min_download_mbps" : 0.2, \
            "min_upload_mbps" : 0.5, \
            "uuid" : "ea864be6-db42-43e2-bffa-aa44ace573f0", \
            "signature" : "MUhad2tqa2Vhb1pmVFNhSnhEdzZhS2t4cDQ1YWdEaUV6Tkd5amZ2ZENuWVlOVkNFMHBscUtLcm5OWGthUXJiYlBuRGUycjU5alpKU1dsaWNMNllNaS96YUg2Vmh5a3FCcFFXQWtwSEErNGZ4eXVpQWNTelpBVUs5QT0=" \
        }';

describe("Test functions SOMC wesocket server", function(){

    after(async () => {
        process.exit(0);
    })

    it("Save new offering", async () => {
        const ws = new WebSocketClient('ws://'+config.ws.host+':'+config.ws.port);
        await new Promise((resolve, reject) => {
            ws.on('open', () => {
                resolve();
            })
        })
        await ws.call('new_offering',{
            "hash" : abi.soliditySHA3(['string'],[offering_data]).toString('hex'),
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
        await ws.call('get_offerings',{
            "hashes":[abi.soliditySHA3(['string'],[offering_data]).toString('hex')]
        }).then(function(result){
            assert.equal(Array.isArray(result) && result[0].hash==abi.soliditySHA3(['string'],[offering_data]).toString('hex'), true);
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
        await ws.call('get_offerings',{
            "hashes":[abi.soliditySHA3(['string'],[offering_data]).toString('hex')+'1']
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
        const offering_hash = abi.soliditySHA3(['string'],[offering_data]).toString('hex');
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
            ws.on('connection_info',function(params){
                resolver(params);
            })
        })

        //Sent state_channel by agent
        await ws1.call('connection_info',{
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
        const offering_hash = abi.soliditySHA3(['string'],[offering_data]).toString('hex');
        const state_channel = '4598dec954ca4356b95d927a8404aea69b881169b7fc3a69c506471f625254ds';
        //Sent state_channel by agent
        await ws1.call('connection_info',{
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
            ws.on('connection_info',function(params){
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