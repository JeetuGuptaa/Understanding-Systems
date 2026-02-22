const express = require("express");
const port = process.env.PORT || 3000;
const app = express();

const redis = require("./redis");

const channel = "temp"; // make sure subscriber have subscribed to this channel
const messages = ["Message A", "Message B", "Message C"];

const messagePublisher = async () => {
  try {
    const message = messages[Math.floor(Math.random() * messages.length)];
    const subscribersCount = await redis.publish(channel, message);
    console.log(`Published: ${message} to ${subscribersCount} subscriber(s)`);
  } catch (error) {
    console.error('Error publishing message:', error);
  }
  
  setTimeout(messagePublisher, 5 * 1000);
};

// Wait for Redis to be ready before starting to publish
redis.on('ready', () => {
  console.log('Starting message publisher...');
  messagePublisher();
});

app.listen(port, (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log(`Server running on port ${port}`);
});
