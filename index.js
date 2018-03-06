global.config = require('./config/'+(process.env.NODE_ENV || "dev")+'.js')

const ws_server = require('./controllers/ws_server');

const Offerings = require('./controllers/offerings');

const server = new ws_server({
        port: config.ws.port || process.env.WS_PORT,
        host: config.ws.host || process.env.WS_HOST
    });

const offerings = new Offerings(server);
server.register('new_offering', offerings.new_offering)
server.register('get_offerings', offerings.get_offerings)
server.register('subscribe', offerings.subscribe)
//server.register('auth_info', offerings.auth_info)
server.register('connection_info', offerings.connection_info)

module.exports = {
    server: server,
    offerings: offerings
};

//process.on('unhandledRejection', up => { throw up })