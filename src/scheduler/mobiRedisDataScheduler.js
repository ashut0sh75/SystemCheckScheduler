const cron = require("node-cron");
const moment = require("moment");
const Mongocon = require("../../db/connector");
const apiStaticData = require("../apiStaticData");

const redisScan = require("redisscan");
const redis = require("redis").createClient( {
 host: "10.2.103.67",
 port: 6379,
 password:"$!tT^ansF#r2o23pIT"
}
);

cron.schedule("/1 * * * *", async () => {
  console.log("📦 Running Redis-to-Mongo dump at", moment().format("YYYY-MM-DD HH:mm:ss"));
  let processed = 0;
let db = Mongocon.MOBIDB();

  redisScan({
    redis,
    each_callback: function (type, key, subkey,length, value, cb) {
      (async () => {
        try {

          if (/^MOBI_[A-Z0-9]{10}_V[12]$/.test(key)) {
            console.log("⏩ Skipping key:", key);
             if (typeof cb === "function") cb();
		  return;
          }

          await db.collection(apiStaticData.mongoCollection.MobiRedisData).updateOne(
            { key },
            { $set: { value:value, updatedAt: new Date() } },
            { upsert: true }
          );

          processed++;
        } catch (err) {
          console.error(`❌ Error dumping key ${key}:`, err);
        } finally {
           if (typeof cb === "function") cb();
        }
      })();
    },
    done_callback: function (err) {
      if (err) {
        console.error("🚨 Redis scan failed:", err);
      } else {
        console.log(`✅ Redis dump completed. Total processed: ${processed}`);
      }
    },
  });
});
