const { MongoClient } = require("mongodb");
const config = require("../environment/environmentVar");

let epaDb;
let mobiDb;

const connectToEpa = async (url) => {
  try {
    const client = await MongoClient.connect(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    epaDb = client.db(config.mongo_epaDb);
    console.log("✅ Connected to EPA DB");
  } catch (err) {
    console.error("❌ MongoDB connection error (EPA):", err);
    process.exit(1);
  }
};

const connectToMobiKyc = async (url) => {
  try {
    const client = await MongoClient.connect(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    mobiDb = client.db(config.mongo_mobi_kyc);
    console.log("✅ Connected to Mobi KYC DB");
  } catch (err) {
    console.error("❌ MongoDB connection error (MOBI):", err);
    process.exit(1);
  }
};

module.exports = {
  connectToEpa,
  connectToMobiKyc,
  EPADB: () => epaDb,
  MOBIDB: () => mobiDb,
};
