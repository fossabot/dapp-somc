"use strict";

var me = null;
const OfferingModel = require('../models/offerings');
const abi = require('ethereumjs-abi');


class offerings {

    constructor(server){
        me = this;
        this.server = server;
        this.subscribed_agents = {};
        this.subscribed_agents_sockets = {};
        this.subscribed_clients = {};
        this.subscribed_clients_sockets = {};
        this.o = new OfferingModel();
    }

    async newOffering (params){
        if (!params || !params.hash || !params.data){
            return me.server.createError(400, "Hash and data field is required");
        }
        const data_json = new Buffer(params.data, 'base64').toString();
        const data_hash = abi.soliditySHA3(['string'],[data_json]).toString('hex');
        if (data_hash==params.hash){
            await me.o.saveOffering(data_hash,'0xe87d50b24f73ef30a28af9a6d6c293bfe24a4e7b',params.data)
            return true;
        }else{
            return me.server.createError(4001, "Hash does not match", params.hash+'!='+data_hash)
        }
        return me.server.createError(500, "Unknown error")
    }

    async getOfferings (params){
        if (!params || !params.hashes){
            return me.server.createError(400, "Hashes field is required");
        }
        if (!Array.isArray(params.hashes)){
            return me.server.createError(400, "Hashes field must be array");
        }
        let offerings = await me.o.getOfferings(params.hashes);
        let ret = [];
        for (var i in offerings) {
            if (offerings[i] && offerings[i].hash && offerings[i].data)
                ret.push({'hash': offerings[i].hash, 'data': offerings[i].data})
        }
        return ret;
    }

    async subscribe (params,socket_id) {

        if (params.type=='agent') {
            if (!params.offeringHash){
                return me.server.createError(400, "OfferingHash field is required");
            }
            me.subscribed_agents[params.offeringHash] = socket_id;
            me.subscribed_agents_sockets[socket_id] = params.offeringHash;
            me.o.getOfferingChannel(params.offeringHash, null).then((old_messages) => {
                if (old_messages.length > 0) {
                    let client = me.server.namespaces['/'].clients.get(socket_id);
                    for (var i in old_messages) {
                        if (old_messages[i].message_type == 'agent') {
                            me.sendAuthInfo(client, old_messages[i].data)
                        }
                    }
                }
            });
            return true;
        }else if (params.type=='client'){
            if (!params.stateChannel){
                return me.server.createError(400, "StateChannel field is required");
            }
            me.subscribed_clients[params.stateChannel] = socket_id;
            me.subscribed_clients_sockets[socket_id] = params.stateChannel;
            me.o.getOfferingChannel(null, params.stateChannel).then((old_messages) => {
                if (old_messages.length>0) {
                    let client = me.server.namespaces['/'].clients.get(socket_id);
                    for (var i in old_messages) {
                        if (old_messages[i].message_type=='client') {
                            me.sendConnectionInfo(client, old_messages[i].data)
                        }
                    }
                }
            });
            return true;
        }else{
            return me.server.createError(400, "Parameter type must be client or agent");
        }

        //console.log(me.server.namespaces['/'].clients.get(socket_id).send('test') ,socket_id)
        return me.server.createError(500, "Unknown error")
    }

    async auth_info (params) {
        if (!params || !params.offeringHash || !params.stateChannel || !params.client_public_key || !params.password || !params.signature){
            return me.server.createError(400, "Need all required fields");
        }
        me.o.saveOfferingChannel(params.offeringHash,params.stateChannel,'agent', params);

        if (me.subscribed_agents[params.offeringHash]){
            let client = me.server.namespaces['/'].clients.get(me.subscribed_agents[params.offeringHash]);
            if (client) me.sendAuthInfo(client,params)
        }
        return true;
    }

    async connectionInfo (params) {
        if (!params || !params.offeringHash || !params.stateChannel || !params.dns || !params.ipv4 || !params.signature){
            return me.server.createError(400, "Need all required fields");
        }
        me.o.saveOfferingChannel(params.offeringHash,params.stateChannel,'client', params);
        if (me.subscribed_clients[params.stateChannel]){
            let client = me.server.namespaces['/'].clients.get(me.subscribed_clients[params.stateChannel]);
            if (client) me.sendConnectionInfo(client,params)
        }
        return true;
    }

    async sendAuthInfo(client, params){
        client.message_id = client.message_id+1 || 1;
        client.send(JSON.stringify({
            "jsonrpc" : "2.0",
            "id" : client.message_id,
            "method" : "auth_info",
            "params" : params
        }));
    }

    async sendConnectionInfo(client, params){
        client.message_id = client.message_id+1 || 1;
        client.send(JSON.stringify({
            "jsonrpc" : "2.0",
            "id" : client.message_id,
            "method" : "connectionInfo",
            "params" : params
        }));
    }

}

module.exports = offerings;