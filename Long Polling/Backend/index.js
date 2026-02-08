const express = require("express");
const port = process.env.PORT || 3000;
const app = express();
const cors = require("cors");

const db = {};
const eventReqs = new Map();

const startEmitter = async (eventId) => {
  let updateAfter = Math.floor(Math.random() * 32);
  console.log(`${eventId} will be updated after ${updateAfter} sec`)
  setTimeout(() => {
    let score = Math.floor(Math.random() * 10);
    db[eventId].score += score;
    db[eventId].updatedAt = Date.now();
    console.log(`${eventId} updated`);

    let pendingReqs = eventReqs.get(eventId);
    if (pendingReqs && pendingReqs.size > 0) {
      pendingReqs.forEach(({res, timeoutId}) => {
        clearTimeout(timeoutId);
        if (!res.headersSent) {
          res.status(200).json({
            success: true,
            message: 'Data fetched successfully',
            data: {
              item: db[eventId]
            }
          });
        }
      });
      pendingReqs.clear();
    }

    startEmitter(eventId);
  }, updateAfter * 1000);
}

const mimicEvents = () => {
  const N = 5; 
  for (let i = 0; i<N; i++) {
    let eventId = `EVENT#${String(i).padStart(2, '0')}`;
    db[eventId] = {
      id : eventId,
      score : 0,
      updatedAt : Date.now()
    }
    eventReqs.set(eventId, new Set());
    startEmitter(eventId);
  }
}

mimicEvents();

app.use(cors());  

app.get('/status', async (req, res) => {
  try {
     const { eventId, last_updated } = req.query;
     if (!eventId || last_updated === undefined) {
      return res.status(500).json({
        success: false, 
        message: 'eventId and last_updated are required'
      });
     }

     if (db[eventId]) {
      if (db[eventId].updatedAt > last_updated) {
        return res.status(200).json({
          success: true, 
          message: 'Data fetched successfully',
          data : {
            item : db[eventId]
          }
        })
      } else {
        const pendingReqs = eventReqs.get(eventId);
        const requestObj = { res, timeoutId: null };

        let timeoutId = setTimeout(() => {
          const reqs = eventReqs.get(eventId);
          reqs.delete(requestObj);

          if (!res.headersSent) {
            return res.status(408).json({
              success: false,
              message: 'Request timed out',
              data : {}
            })
          }
        }, 30 * 1000);

        requestObj.timeoutId = timeoutId;
        pendingReqs.add(requestObj);

        req.on('close', () => {
          clearTimeout(timeoutId);
          const reqs = eventReqs.get(eventId);
          reqs.delete(requestObj);
        });
      }
     } else {
       return res.status(404).json({
         success: false,
         message: 'Event not found',
         data: {}
       });
     }
  } catch (err) {
    err.scope = 'GET event status'
    return res.status(500).json({
      success: false, 
      data: {},
      message: 'Error while fetching event status'
    })
  }
})

app.listen(port, (err) => {
  if (err) {
    console.log(`Error while starting server, ${err}`);
    process.exit(1);
  }

  console.log(`App running on port ${port}`);
});
