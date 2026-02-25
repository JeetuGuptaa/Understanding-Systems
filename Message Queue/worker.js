const { Worker } = require('bullmq');
const redisConnection = require('./redis');

// Create a worker that processes jobs from the 'tasks' queue
const worker = new Worker(
  'tasks',
  async (job) => {
    console.log(`Processing job ${job.id}: ${job.name}`);
    console.log('Job data:', JSON.stringify(job.data, null, 2));

    // Simulate different task types
    switch (job.name) {
      case 'send-email':
        return await processEmailTask(job);
      
      case 'process-image':
        return await processImageTask(job);
      
      case 'generate-report':
        return await processReportTask(job);
      
      default:
        return await processGenericTask(job);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 jobs concurrently
  }
);

// Task processors
async function processEmailTask(job) {
  const { to, subject, body } = job.data;
  
  // Simulate sending email
  await updateProgress(job, 25, 'Connecting to email server...');
  await sleep(1000);
  
  await updateProgress(job, 50, 'Composing email...');
  await sleep(1000);
  
  await updateProgress(job, 75, 'Sending email...');
  await sleep(1000);
  
  await updateProgress(job, 100, 'Email sent!');
  
  return {
    success: true,
    to,
    subject,
    sentAt: new Date().toISOString(),
  };
}

async function processImageTask(job) {
  const { imageUrl, operations } = job.data;
  
  await updateProgress(job, 20, 'Downloading image...');
  await sleep(1500);
  
  await updateProgress(job, 50, 'Applying filters...');
  await sleep(2000);
  
  await updateProgress(job, 80, 'Optimizing image...');
  await sleep(1000);
  
  await updateProgress(job, 100, 'Image processed!');
  
  return {
    success: true,
    imageUrl,
    operations,
    processedAt: new Date().toISOString(),
  };
}

async function processReportTask(job) {
  const { reportType, dateRange } = job.data;
  
  await updateProgress(job, 10, 'Fetching data...');
  await sleep(2000);
  
  await updateProgress(job, 40, 'Analyzing data...');
  await sleep(2500);
  
  await updateProgress(job, 70, 'Generating report...');
  await sleep(2000);
  
  await updateProgress(job, 100, 'Report ready!');
  
  return {
    success: true,
    reportType,
    dateRange,
    recordsProcessed: Math.floor(Math.random() * 1000) + 100,
    generatedAt: new Date().toISOString(),
  };
}

async function processGenericTask(job) {
  await updateProgress(job, 50, 'Processing task...');
  await sleep(2000);
  
  await updateProgress(job, 100, 'Task completed!');
  
  return {
    success: true,
    taskName: job.name,
    data: job.data,
    processedAt: new Date().toISOString(),
  };
}

// Helper functions
async function updateProgress(job, percentage, message) {
  await job.updateProgress(percentage);
  console.log(`  ⏳ ${percentage}% - ${message}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Event listeners
worker.on('completed', (job, returnvalue) => {
  console.log(`Job ${job.id} completed successfully`);
  console.log('Result:', JSON.stringify(returnvalue, null, 2));
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

worker.on('active', (job) => {
  console.log(`Job ${job.id} is now active`);
});

worker.on('progress', (job, progress) => {
  console.log(`Job ${job.id} progress: ${progress}%`);
});

console.log('Worker started and waiting for jobs...');
console.log('Queue: tasks');
console.log(`Concurrency: 5`);
console.log('⏸Press Ctrl+C to stop the worker\n');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing worker...');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing worker...');
  await worker.close();
  process.exit(0);
});
