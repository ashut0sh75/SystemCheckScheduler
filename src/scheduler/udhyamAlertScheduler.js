const cron = require("node-cron");
const moment = require("moment");
const axios = require("axios");
const Mongocon = require("../../db/connector");
const apiStaticData = require("../apiStaticData");

const phoneNumbers = ["7607175127", "9650470421", "7387830311", "9972451827"]; 

cron.schedule("*/5 * * * *", async () => {
  try {
    const db = Mongocon.EPADB();
    if (!db) {
      console.error("Database not connected");
      return;
    }

    console.log(" Running Udhyam Alert Scheduler at", moment().format("YYYY-MM-DD HH:mm:ss"));
    const timeWindow = moment().subtract(5, "minutes").toDate();

    const recentDocs = await db
      .collection(apiStaticData.mongoCollection.UdhyamVerifiedData)
      .find({
        isUdhyamVerified: false,
        optRequested: true,
        createdOn: { $gte: timeWindow },
      })
      .toArray();

    let failedCount = 0;
    let pendingCount = 0;

    recentDocs.forEach((doc) => {
      let httpCode = null;
      if (
        doc.otpVerifyResponseData &&
        doc.otpVerifyResponseData.res &&
        doc.otpVerifyResponseData.res.http_response_code
      ) {
        httpCode = doc.otpVerifyResponseData.res.http_response_code;
      }

      if (doc.otpVerifyCount === 0) {
        pendingCount++;
      } else if (httpCode && httpCode >= 400 ) {
        failedCount++;
      }
    });

    console.log(" Recent Docs Count:", recentDocs.length);
    console.log(" Failed Count:", failedCount);
    console.log(" Pending Count:", pendingCount);

    if (failedCount >= 5 || pendingCount >= 5) {
      const msgTitle = "Udhyam Verification";
      const msgBody = `Failed: ${failedCount}, Pending: ${pendingCount}/ the data is of past 5 minutes`;

      for (const phone of phoneNumbers) {
        const smsUrl = `https://smsg.rapipay.com/sendsmsg/Notification/1107174886527992969/${phone}/${msgTitle}/${msgBody}`;
        console.log(" Sending SMS alert to:", phone);

        try {
          const res = await axios.get(smsUrl, {
            headers: {
              "User-Agent": "NodeScheduler/1.0",
            },
          });
          console.log(" SMS sent successfully to", phone);
          console.log(" SMS Response:", res.data);
        } catch (err) {
          console.error(" SMS failed for", phone, ":", err.message);
        }
      }
    }
  } catch (error) {
    console.error("Scheduler error:", error);
  }
});
