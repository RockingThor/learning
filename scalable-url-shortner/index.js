require("dotenv").config();
const express = require("express");
const redis = require("redis");
const shortid = require("shortid");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend's origin
  })
);

const redisClients = [
  redis.createClient({
    host: process.env.REDIS_HOST_1,
    port: process.env.REDIS_PORT_1,
  }),
  redis.createClient({
    host: process.env.REDIS_HOST_2,
    port: process.env.REDIS_PORT_2,
  }),
  redis.createClient({
    host: process.env.REDIS_HOST_3,
    port: process.env.REDIS_PORT_3,
  }),
];

redisClients.forEach((client, index) => {
  client.on("error", (err) =>
    console.error(`Redis client ${index} error:`, err)
  );
  client
    .connect()
    .catch((err) =>
      console.error(`Redis client ${index} failed to connect:`, err)
    );
});

function getRedisClient(key) {
  const hash = key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  console.log(hash, " ...", hash % redisClients.length);
  return redisClients[hash % redisClients.length];
}

app.post("/shorten", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).send("URL is required");
  }

  const shortId = shortid.generate();
  console.log(shortId);
  const redisClient = getRedisClient(shortId);

  await redisClient.set(shortId, url);
  res.json({ shortUrl: `http://localhost:${process.env.PORT}/${shortId}` });
});

app.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;
  const redisClient = getRedisClient(shortId);
  const url = await redisClient.get(shortId);

  try {
    new URL(url); // Throws error if invalid
    res.redirect(url);
  } catch (error) {
    console.error("Invalid URL in Redis:", url);
    res.status(400).send("Invalid URL stored");
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
