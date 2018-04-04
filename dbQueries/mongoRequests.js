
/**
 * Module Dependencies
 */

const MongoClient = require("mongodb").MongoClient;
const fs = require('fs');
const mongo = require("mongodb");
const Grid = require('gridfs');
// const Grid = require("gridfs-stream");
const winston = require("winston");
const config = require("../config/config");

/**
 * MongoDB db:CV Connection
 */
let dataBaseCv;

const connectCv = () => {
    mongo.MongoClient.connect(config[process.env.NODE_ENV].mongoConf.url, function(err, db) {
        if(err) {
            winston.log("error", "mongo db:"+ config[process.env.NODE_ENV].mongoConf.dbName +" connection closed");

            setTimeout(connectCv, config[process.env.NODE_ENV].mongoConf.options.server.reconnectInterval);

            return winston.log("error", err);
        }

        dataBaseCv = db;
        winston.log("info", "mongo db:"+ config[process.env.NODE_ENV].mongoConf.dbName +" connection ready");

        db.on("close", function () {
            winston.log("error", "mongo db:"+ config[process.env.NODE_ENV].mongoConf.dbName +" connection closed");

            dataBaseCv = null;
            setTimeout(connectCv, config[process.env.NODE_ENV].mongoConf.options.server.reconnectInterval);
        });
    });
};

connectCv();

/**
 * MongoDB db:avatar (gridFs) Connection
 */
let databaseAvatar;

const connectAvatar = () => {
    let yourMongoURI = 'mongodb://localhost:27017/icon';

    mongo.MongoClient.connect(yourMongoURI, function(err, db) {
        databaseAvatar = Grid(db, mongo);
    });

};

connectAvatar();


/**
 * ---------------------------------------------------------
 */

const mongoQueries = {

    /**
     * Insert personal info
     * @param data
     * @returns {Promise<any>}
     */
    insertDocument: data => {
        return new Promise(((resolve, reject) => {
            dataBaseCv.collection(data.collectionName).insertOne(data.documentInfo)
                .then(resolve, reject)
        }))
    },

    getDocumentByUserId: data => {
        return new Promise(((resolve, reject) => {
            const query = {userId: data.userId};
            dataBaseCv.collection(data.collectionName).findOne(query, null, {lean: true})
                .then(resolve, reject)
        }))
    },

    /**
     * Insert Avatar
     * @param data
     */
    insertAvatar: data => {
        return new Promise((resolve, reject) => {
            if ("" !== data.content) {
                let img = data.content;
                let imageFormat = img.split(';')[0].match(/jpeg|png|gif/)[0];
                let data23 = img.replace(/^data:image\/\w+;base64,/, "");
                let buf = new Buffer(data23, 'base64');

                databaseAvatar.writeFile({
                    filename: data.fileName,
                    content_type: 'image/'+ imageFormat
                }, buf, function(err, doc) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(doc);
                    }
                })
            }
            else {
                resolve();
            }
        })
    },

    getAvatar : (id, res, next) => {
        let readstream = databaseAvatar.createReadStream({
            _id: id
        });

        next(readstream, next);
    }

};

module.exports = mongoQueries;