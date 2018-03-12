"use strict";
const mongo = require('mongodb');
var me = null;

class offerings {

    async _initialize () {
        if (!me || !me.db || !me.db.connector || !me.db.connector.isConnected()) {
            me = this;
            const MongoClient = require('mongodb').MongoClient;
            return new Promise(function (callback) {
                MongoClient.connect(config.mongo.url || process.env.MONGO_URL, function (err, db) {
                    if (err) throw err;
                    me.db = {
                        connector: db,
                        database: db.db(config.mongo.db),
                        offerings: db.db(config.mongo.db).collection(config.mongo.collections.offerings),
                        offering_channels: db.db(config.mongo.db).collection(config.mongo.collections.offering_channels)
                    };
                    callback();
                })
            })
        }
    }

    /**
     * Get offerings by list of hashes
     * @param hashList array
     * @returns {Promise.<Array>}
     */
    async getOfferings (hashList) {
        await this._initialize();
        const ret = [];
        for(var i in hashList) {
            ret.push(new Promise((resolve, reject) => {
                me.db.offerings.findOne({'hash': hashList[i]}, (err,rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            }));
        }
        return Promise.all(ret);
    }

    /**
     * Insert new offering or update if offering with this hash already exists
     * @param hash string
     * @param agentAddress string
     * @param data string
     * @returns {Promise<void>}
     */

    async saveOffering(hash, agentAddress, data) {
        await this._initialize();
        return new Promise((resolve, reject) => {
            const dataObj = {
                hash: hash,
                agentAddress: agentAddress,
                data: data
            }
            me.db.offerings.update({'hash':hash},dataObj,{upsert:true},(err,res) => {
                if (err) reject(err);
                else resolve();
            })
        })
    }

    /**
     * Delete offerings
     * @param hashList
     * @returns {Promise.<Array>}
     */
    async deleteOfferings (hashList) {
        await this._initialize();
        const promises = [];
        for(var i in hashList) {
            promises.push(new Promise((resolve, reject) => {
                me.db.offerings.deleteOne({'hash': hashList[i]}, (err,rows) => {
                    if (err) reject(err);
                    else resolve();
                });
            }));
        }
        return Promise.all(promises);
    }

    async getOfferingChannel(hash,stateChannel){
        await this._initialize();
        let where = null;
        if (hash){
            where = {'hash': hash};
        }else if (stateChannel){
            where = {'stateChannel': stateChannel};
        }else{
            return false;
        }

        return new Promise((resolve, reject) => {
            me.db.offering_channels.find(where).toArray((err,rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        })
    }

    async saveOfferingChannel(hash, stateChannel, messageType, data) {
        await this._initialize();
        return new Promise((resolve, reject) => {
            const dataObj = {
                hash: hash,
                stateChannel: stateChannel,
                messageType: messageType,
                data: data
            }
            me.db.offering_channels.update({'hash': hash,'stateChannel':stateChannel, 'messageType':messageType},dataObj,{upsert:true},(err,res) => {
                if (err) reject(err);
                else resolve();
            })
        })
    }

    async deleteOfferingChannel (hash) {
        await this._initialize();
        return new Promise((resolve, reject) => {
            me.db.offering_channels.deleteOne({'hash': hash}, (err,rows) => {
                if (err) reject(err);
                else resolve();
            });
        })
    }

}

module.exports = offerings;
