const { MongoClient } = require('mongodb');
const { MONGO_URI } = require('../shared');

let client;

async function connect() {
    if (!client) {
        client = await MongoClient.connect(MONGO_URI)
            .catch(err => console.log(err));

    };

    return client;
}

const getConnectedClient = () => client;

module.exports = { connect, getConnectedClient }