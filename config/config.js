
/**
 * Analytics Server Configs
 */

const os = require("os");

const config = {

    // mode : "local",
    // mode : "development",
    mode : "production",

    local: {
        port: parseInt(process.env.PORT) || 3005,

        hostname : "127.0.0.1",

        mongoConf: {
            dbName: "cv",
            url: "mongodb://localhost/cv",
            options: {
                server: {
                    auto_reconnect : true,
                    reconnectTries : 17280,
                    reconnectInterval : 5000
                }
            }
        }
    }

};

config.mode = "local";


module.exports = config;