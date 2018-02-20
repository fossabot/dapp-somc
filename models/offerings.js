"use strict";
var mongo = require('mongodb');
var me = null;

class offerings {

    async _initialize () {
        if (!me || !me.db || !me.db.connector || !me.db.connector.isConnected()) {
            me = this;
            var MongoClient = require('mongodb').MongoClient;
            var url = "mongodb://localhost:27017/somc";
            return new Promise(function (callback) {
                MongoClient.connect(url, function (err, db) {
                    if (err) throw err;
                    me.db = {
                        connector: db,
                        database: db.db("somc"),
                        offerings: db.db("somc").collection('offerings'),
                        offering_channels: db.db("somc").collection('offering_channel')
                    };
                    callback();
                })
            })
        }
    }

    /**
     * Get offerings by list of hashes
     * @param hash_list array
     * @returns {Promise.<Array>}
     */
    async getOfferings (hash_list) {
        await this._initialize();
        var ret = [];
        for(var i in hash_list) {
            ret.push(await new Promise((resolve, reject) => {
                me.db.offerings.findOne({'hash': hash_list[i]}, (err,rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
            }));
        }
        return ret;
    }

    /**
     * Insert new offering or update if offering with this hash already exists
     * @param hash string
     * @param agent_address string
     * @param data string
     * @returns true
     */

    async saveOffering(hash, agent_address, data) {
        await this._initialize();
        await new Promise((resolve, reject) => {
            var dataObj = {
                hash: hash,
                agent_address: agent_address,
                data: data
            }
            me.db.offerings.update({'hash':hash},dataObj,{upsert:true},(err,res) => {
                if (err) reject(err);
                resolve();
            })
        })
    }

    /**
     * Delete offerings
     * @param hash_list
     * @returns {Promise.<void>}
     */
    async deleteOfferings (hash_list) {
        await this._initialize();
        for(var i in hash_list) {
            await new Promise((resolve, reject) => {
                me.db.offerings.deleteOne({'hash': hash_list[i]}, (err,rows) => {
                    if (err) reject(err);
                    resolve();
                });
            })
        }
    }

    async getOfferingChannel(hash){
        await this._initialize();
        return await new Promise((resolve, reject) => {
            me.db.offering_channels.findOne({'hash': hash}, (err,rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        })
    }

    async saveOfferingChannel(hash, state_channel, message_type, data) {
        await this._initialize();
        await new Promise((resolve, reject) => {
            var dataObj = {
                hash: hash,
                state_channel: state_channel,
                message_type: message_type,
                data: data
            }
            me.db.offering_channels.update({'hash':hash},dataObj,{upsert:true},(err,res) => {
                if (err) reject(err);
                resolve();
            })
        })
    }

    async deleteOfferingChannel (hash) {
        await this._initialize();
        await new Promise((resolve, reject) => {
            me.db.offering_channels.deleteOne({'hash': hash}, (err,rows) => {
                if (err) reject(err);
                resolve();
            });
        })
    }

}

module.exports = offerings;


