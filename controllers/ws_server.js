"use strict";

var WebSocketServer = require('rpc-websockets').Server;
var me = null;

class ws_server extends WebSocketServer {

    constructor(options){
        super(options)
        me = this;
    }

    /**
     * Runs a defined RPC method.
     * @private
     * @param {Object} message - a message received
     * @param {Object} socket_id - user's socket id
     * @param {String} ns - namespaces identifier
     * @return {Object|undefined}
     */
    async _runMethod(message, socket_id, ns = "/")
    {
        if (typeof message !== "object")
            return {
                jsonrpc: "2.0",
                error: utils.createError(-32600),
                id: null
            }

        if (message.jsonrpc !== "2.0")
            return {
                jsonrpc: "2.0",
                error: utils.createError(-32600, "Invalid JSON RPC version"),
                id: message.id || null
            }

        if (!message.method)
            return {
                jsonrpc: "2.0",
                error: utils.createError(-32602, "Method not specified"),
                id: message.id || null
            }

        if (typeof message.method !== "string")
            return {
                jsonrpc: "2.0",
                error: utils.createError(-32600, "Invalid method name"),
                id: message.id || null
            }

        if (message.params && typeof message.params === "string")
            return {
                jsonrpc: "2.0",
                error: utils.createError(-32600),
                id: message.id || null
            }

        if (message.method === "rpc.on")
        {
            if (!message.params)
                return {
                    jsonrpc: "2.0",
                    error: utils.createError(-32000),
                    id: message.id || null
                }

            const results = {}

            const event_names = Object.keys(this.namespaces[ns].events)

            for (const name of message.params)
            {
                const index = event_names.indexOf(name)

                if (index === -1)
                {
                    results[name] = "provided event invalid"
                    continue
                }

                this.namespaces[ns].events[event_names[index]].push(socket_id)

                results[name] = "ok"
            }

            return {
                jsonrpc: "2.0",
                result: results,
                id: message.id || null
            }
        }
        else if (message.method === "rpc.off")
        {
            if (!message.params)
                return {
                    jsonrpc: "2.0",
                    error: utils.createError(-32000),
                    id: message.id || null
                }

            const results = {}

            for (const name of message.params)
            {
                if (!this.namespaces[ns].events[name])
                {
                    results[name] = "provided event invalid"
                    continue
                }

                const index = this.namespaces[ns].events[name].indexOf(socket_id)

                if (index === -1)
                {
                    results[name] = "not subscribed"
                    continue
                }

                this.namespaces[ns].events[name].splice(index, 1)
                results[name] = "ok"
            }

            return {
                jsonrpc: "2.0",
                result: results,
                id: message.id || null
            }
        }

        if (!this.namespaces[ns].rpc_methods[message.method])
        {
            return {
                jsonrpc: "2.0",
                error: utils.createError(-32601),
                id: message.id || null
            }
        }

        let response = null

        try { response = await this.namespaces[ns].rpc_methods[message.method](message.params,socket_id) }

        catch (error)
        {
            if (!message.id)
                return

            if (error instanceof Error)
                return {
                    jsonrpc: "2.0",
                    error: {
                        code: -32000,
                        message: error.name,
                        data: error.message
                    },
                    id: message.id
                }

            return {
                jsonrpc: "2.0",
                error: error,
                id: message.id
            }
        }

        // client sent a notification, so we won't need a reply
        if (!message.id)
            return

        return {
            jsonrpc: "2.0",
            result: response,
            id: message.id
        }
    }

}

module.exports = ws_server;