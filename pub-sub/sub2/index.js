const express = require('express');
const port = process.env.PORT || 3002;
const app = express();

const redis = require('./redis');
const subscriber = redis.duplicate();

const channel = 'temp';

(async () => {
  await subscriber.connect();
  
  await subscriber.subscribe(channel, (message) => {
    console.log(`Subscriber 2 received from ${channel}: ${message}`);
  });
  
  console.log(`Subscriber 2: Subscribed to channel: ${channel}`);
})();

subscriber.on('error', (err) => {
  console.error('Subscriber 2 error:', err);
});

app.listen(port, (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log(`Subscriber 2 server running on port ${port}`);
});
