const express = require("express");
const Redis = require("ioredis");
const cors = require("cors");

const app = express();
const redis = new Redis();

app.use(
  cors({
    origin: "http://localhost:5173", // Frontend's origin
  })
);

const activeMatches = {}; // Keeps track of active match intervals

app.get("/api/events/:matchId", async (req, res) => {
  const { matchId } = req.params;

  // Set the headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Send an initial keepalive comment to confirm the connection
  res.write("event: connected\n\n");

  const channelName = `match:${matchId}`;
  const subscriber = new Redis();

  await subscriber.subscribe(channelName);
  console.log(`Subscribed to channel: ${channelName}`);

  subscriber.on("message", (channel, message) => {
    const data = JSON.parse(message);
    res.write(`id: ${data.id}\n`);
    res.write(`event: goal\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });

  req.on("close", () => {
    console.log(`Closing connection for matchId: ${matchId}`);
    subscriber.unsubscribe(channelName);
    subscriber.quit();
    res.end();
  });

  // Start publishing events if not already active
  if (!activeMatches[matchId]) {
    console.log(`Starting interval for matchId: ${matchId}`);
    activeMatches[matchId] = setInterval(() => {
      const event = {
        id: Date.now().toString(),
        score: `${Math.floor(Math.random() * 5)}-${Math.floor(
          Math.random() * 5
        )}`,
        homeTeam: "Team A",
        awayTeam: "Team B",
        scorer: `Player ${Math.floor(Math.random() * 10)}`,
      };
      redis.publish(channelName, JSON.stringify(event));
      console.log(`Published event to channel: ${channelName}`, event);
    }, 5000);
  }
});

app.listen(8080, () =>
  console.log("Server listening on http://localhost:8080")
);
