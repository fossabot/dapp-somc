module.exports = {
    mongo: {
        url: 'mongodb://localhost:27017/somc',
        db: 'somc',
        collections:{
            offerings: 'offerings',
            offering_channels: 'offering_channels'
        }
    },
    ws:{
        host: 'localhost',
        port: 8080
    }
}