const config = require("../environment/environmentVar");
const RedisPool = require("redis-connection-pool").default || require("redis-connection-pool");

class redisConnection {
  constructor() {
    this.redisPool = null;
  }

  createConnection() {
    this.redisPool = RedisPool("myRedisPool", {
      host: "10.2.103.67",
      port: 6379,
      max_clients: 30,
      perform_checks: false,
      database: 0,
      options: {
        auth_pass: "$!tT^ansF#r2o23pIT",
      },
    });

    console.log("✅ Redis pool created");
    return this.redisPool;
  }

  setConnection(redisPool) {
    this.redisPool = redisPool;
  }

  getConnection() {
    if (!this.redisPool) {
      console.error("❌ Redis pool not initialized. Call createConnection() first.");
      process.exit(1);
    }
    return this.redisPool;
  }

  closeConnection() {
    if (this.redisPool && typeof this.redisPool.quit === "function") {
      this.redisPool.quit();
      console.log("🔌 Redis pool connection closed");
    }
  }
}

var redisClientObj = new redisConnection(); 

module.exports = redisClientObj;
