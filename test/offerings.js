var assert = require('assert');
var offerings = require('../models/offerings');

var offeringData = {
        'hash': '4598dec954ca4356b95d927a8404aea69b881169b7fc3a69c506471f625254',
        'agent_address': '0xe87d50b24f73ef30a28af9a6d6c293bfe24a4e7b',
        'data':'a00fad9e4c640f7028ca3f5789464d7aa8215901f772109a269fd433c64c6b686078d39d44d928fded9f7d3900088e936c48e60d5d850654971dc7a649d97b45'
    };

var offeringChannelDate = {
    'hash': '6898dec954ca4356b95d927a8404aea69b881169b7fc3a69c506471f625254',
    'state_channel': '15901f772109a269fd433c64c6b686078d39d44d928fded9f7d3900088e',
    'message_type': 1,
    'data': 'a00fad9e4c640f7028ca3g5f489464d7aa8215901f772109a269fd433c64c6b686078d39d44d928fded9f7d3900088e936c48e60d5d850654971dc7a649d97b45'
}

var o = null;

describe("Test functions of model offerings", function(){
    before(async () => {
        o = new offerings();
    })

    beforeEach(async () => {
        //Delete all old data
        await o.deleteOfferings(offeringData.hash);
        await o.deleteOfferingChannel(offeringChannelDate.hash);
    })

    after(async () => {
        o.db.connector.close();
    });

    it("Save new offering", async () => {
        //this offering should not exist in db
        assert.equal((await o.getOfferings([offeringData.hash]))[0],null);
        await o.saveOffering(offeringData.hash,offeringData.agent_address,offeringData.data);
        assert.equal((await o.getOfferings([offeringData.hash]))[0].hash, offeringData.hash);
    });

    it("Update existing offering", async () => {
        //Add offering first time
        await o.saveOffering(offeringData.hash,offeringData.agent_address,offeringData.data);
        assert.equal((await o.getOfferings([offeringData.hash]))[0].hash,offeringData.hash);
        //Update old offering
        await o.saveOffering(offeringData.hash,offeringData.agent_address+'1',offeringData.data+'1');
        assert.equal((await o.getOfferings([offeringData.hash]))[0].agent_address,offeringData.agent_address+'1');
    });

    it("Delete offering", async () => {
        //Add offering first time
        await o.saveOffering(offeringData.hash,offeringData.agent_address,offeringData.data);
        assert.equal((await o.getOfferings([offeringData.hash]))[0].hash,offeringData.hash);
        await o.deleteOfferings([offeringData.hash]);
        assert.equal((await o.getOfferings([offeringData.hash]))[0],null);
    })

    it("Save new offering channel", async () => {
        //this offering channel should not exist in db
        assert.equal((await o.getOfferingChannel(offeringChannelDate.hash)),null);
        await o.saveOfferingChannel(offeringChannelDate.hash,offeringChannelDate.state_channel,offeringChannelDate.message_type,offeringChannelDate.data);
        assert.equal((await o.getOfferingChannel(offeringChannelDate.hash)).hash,offeringChannelDate.hash);
    });

    it("Update existing offering channel", async () => {
        //Add offering channel first time
        await o.saveOfferingChannel(offeringChannelDate.hash,offeringChannelDate.state_channel,offeringChannelDate.message_type,offeringChannelDate.data);
        assert.equal((await o.getOfferingChannel(offeringChannelDate.hash)).hash,offeringChannelDate.hash);
        //Update old offering
        await o.saveOfferingChannel(offeringChannelDate.hash,offeringChannelDate.state_channel+'1',2,offeringChannelDate.data+'1');
        assert.equal((await o.getOfferingChannel(offeringChannelDate.hash)).state_channel,offeringChannelDate.state_channel+'1');
    });

    it("Delete offering channel", async () => {
        //Add offering channel first time
        await o.saveOfferingChannel(offeringChannelDate.hash,offeringChannelDate.state_channel,offeringChannelDate.message_type,offeringChannelDate.data);
        assert.equal((await o.getOfferingChannel(offeringChannelDate.hash)).hash,offeringChannelDate.hash);
        await o.deleteOfferingChannel(offeringChannelDate.hash);
        assert.equal((await o.getOfferingChannel(offeringChannelDate.hash)),null);
    })
})
