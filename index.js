
global.config = require('./config/'+(process.env.NODE_ENV || "dev")+'.js')

const ws_server = require('./controllers/ws_server');

const Offerings = require('./controllers/offerings');

const server = new ws_server({
        port: config.ws.port || process.env.WS_PORT,
        host: config.ws.host || process.env.WS_HOST
    });

const offerings = new Offerings(server);
server.register('newOffering', offerings.newOffering)
server.register('getOfferings', offerings.getOfferings)
server.register('subscribe', offerings.subscribe)
server.register('connectionInfo', offerings.connectionInfo)

module.exports = {
    server: server,
    offerings: offerings
};
