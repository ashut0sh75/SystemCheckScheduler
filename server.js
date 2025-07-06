const Mongocon = require("./db/connector");
const env = require("./environment/environmentVar");

// Replace with your actual MongoDB connection string
const mongoUrl="mongodb+srv://Devrapipay:pjBDGCg34SQkf7Sd@rapipay-eta-dedicated-m.enflr.mongodb.net/?authSource=admin&replicaSet=atlas-hbnnc6-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true";

const redisClientObj = require("./db/redis");
redisClientObj.createConnection(); // important!
const redisPool = redisClientObj.getConnection();


const start = async () => {
  await Mongocon.connectToEpa(mongoUrl);
  await Mongocon.connectToMobiKyc(mongoUrl);
  require("./src/scheduler/udhyamAlertScheduler");
  require("./src/scheduler/mobiRedisDataScheduler");
 
};
start()

 