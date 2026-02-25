const express = require('express');
const { Queue } = require('bullmq');
const redisConnection = require('./redis');

const app = express();
const PORT = process.env.PORT || 3000;

// Create a queue for processing tasks
const taskQueue = new Queue('tasks', {
  connection: redisConnection,
});

app.use(express.json());

// Add a job to the queue
app.post('/enqueue', async (req, res) => {
  const { task, data } = req.body;
  
  if (!task) {
    return res.status(400).json({ error: 'Task name is required' });
  }

  try {
    const job = await taskQueue.add(task, data || {}, {
      attempts: 3, // Retry up to 3 times on failure
      backoff: {
        type: 'exponential',
        delay: 2000, // Start with 2 seconds delay
      },
    });
    
    res.json({ 
      success: true, 
      message: 'Job added to queue',
      jobId: job.id,
      jobName: job.name
    });
  } catch (err) {
    console.error('Error adding job to queue:', err);
    res.status(500).json({ error: 'Failed to add job to queue' });
  }
});

// Get job status
app.get('/job/:jobId', async (req, res) => {
  try {
    const job = await taskQueue.getJob(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress;
    
    res.json({
      id: job.id,
      name: job.name,
      data: job.data,
      state,
      progress,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
    });
  } catch (err) {
    console.error('Error fetching job:', err);
    res.status(500).json({ error: 'Failed to fetch job status' });
  }
});

// Get queue stats
app.get('/stats', async (req, res) => {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      taskQueue.getWaitingCount(),
      taskQueue.getActiveCount(),
      taskQueue.getCompletedCount(),
      taskQueue.getFailedCount(),
      taskQueue.getDelayedCount(),
    ]);

    res.json({
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch queue stats' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Message Queue Producer' });
});

app.listen(PORT, (err) => {
  if (err) {
    console.error(`Failed to start Message Queue service on port ${PORT}`, err);
    process.exit(1);
  }
  console.log(`🚀 Message Queue Producer running on port ${PORT}`);
  console.log(`📝 Add jobs: POST http://localhost:${PORT}/enqueue`);
  console.log(`📊 View stats: GET http://localhost:${PORT}/stats`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing queue...');
  await taskQueue.close();
  process.exit(0);
});