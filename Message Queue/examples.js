/**
 * Examples of how to use the Message Queue programmatically
 * This shows how to interact with BullMQ in your Node.js applications
 */

const { Queue } = require('bullmq');
const redisConnection = require('./redis');

// Create a queue instance
const taskQueue = new Queue('tasks', {
  connection: redisConnection,
});

// Example 1: Add a simple job
async function addSimpleJob() {
  console.log('Example 1: Adding a simple job...');
  
  const job = await taskQueue.add('send-email', {
    to: 'user@example.com',
    subject: 'Hello from BullMQ',
    body: 'This is a programmatic example'
  });
  
  console.log(`✅ Job added with ID: ${job.id}`);
  return job;
}

// Example 2: Add a job with options
async function addJobWithOptions() {
  console.log('\nExample 2: Adding a job with custom options...');
  
  const job = await taskQueue.add(
    'process-image',
    {
      imageUrl: 'https://example.com/image.jpg',
      operations: ['resize', 'optimize']
    },
    {
      // Retry configuration
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      
      // Remove job after completion
      removeOnComplete: true,
      removeOnFail: false,
      
      // Add delay (process after 10 seconds)
      delay: 10000,
      
      // Job timeout (30 seconds)
      timeout: 30000,
    }
  );
  
  console.log(`✅ Job added with ID: ${job.id} (will start in 10 seconds)`);
  return job;
}

// Example 3: Add multiple jobs in bulk
async function addBulkJobs() {
  console.log('\nExample 3: Adding multiple jobs in bulk...');
  
  const jobs = [
    { name: 'send-email', data: { to: 'user1@example.com', subject: 'Bulk 1' } },
    { name: 'send-email', data: { to: 'user2@example.com', subject: 'Bulk 2' } },
    { name: 'send-email', data: { to: 'user3@example.com', subject: 'Bulk 3' } },
    { name: 'send-email', data: { to: 'user4@example.com', subject: 'Bulk 4' } },
    { name: 'send-email', data: { to: 'user5@example.com', subject: 'Bulk 5' } },
  ];
  
  const result = await taskQueue.addBulk(jobs);
  console.log(`✅ Added ${result.length} jobs in bulk`);
  return result;
}

// Example 4: Add a job with priority
async function addPriorityJob() {
  console.log('\nExample 4: Adding a high-priority job...');
  
  const job = await taskQueue.add(
    'generate-report',
    {
      reportType: 'urgent-sales',
      dateRange: '2024-01-01 to 2024-01-31'
    },
    {
      priority: 1, // Lower number = higher priority (default is 0)
      // Jobs with lower priority number will be processed first
    }
  );
  
  console.log(`✅ High-priority job added with ID: ${job.id}`);
  return job;
}

// Example 5: Check job status
async function checkJobStatus(jobId) {
  console.log(`\nExample 5: Checking status of job ${jobId}...`);
  
  const job = await taskQueue.getJob(jobId);
  
  if (!job) {
    console.log('❌ Job not found');
    return null;
  }
  
  const state = await job.getState();
  const progress = job.progress;
  
  console.log(`Job ${job.id}:`);
  console.log(`  Name: ${job.name}`);
  console.log(`  State: ${state}`);
  console.log(`  Progress: ${progress}%`);
  console.log(`  Data:`, job.data);
  
  if (state === 'completed') {
    console.log(`  Result:`, job.returnvalue);
  } else if (state === 'failed') {
    console.log(`  Failed Reason:`, job.failedReason);
  }
  
  return job;
}

// Example 6: Get queue statistics
async function getQueueStats() {
  console.log('\nExample 6: Getting queue statistics...');
  
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    taskQueue.getWaitingCount(),
    taskQueue.getActiveCount(),
    taskQueue.getCompletedCount(),
    taskQueue.getFailedCount(),
    taskQueue.getDelayedCount(),
  ]);
  
  console.log('Queue Statistics:');
  console.log(`  Waiting: ${waiting}`);
  console.log(`  Active: ${active}`);
  console.log(`  Completed: ${completed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Delayed: ${delayed}`);
  console.log(`  Total: ${waiting + active + completed + failed + delayed}`);
}

// Example 7: Scheduled job (cron-like)
async function addRepeatingJob() {
  console.log('\nExample 7: Adding a repeating job...');
  
  // This requires BullMQ Pro or you can use repeatability with patterns
  const job = await taskQueue.add(
    'daily-report',
    { type: 'summary' },
    {
      repeat: {
        pattern: '0 9 * * *', // Every day at 9 AM (cron syntax)
      },
    }
  );
  
  console.log(`✅ Repeating job added with ID: ${job.id}`);
  console.log('   Will run every day at 9 AM');
  return job;
}

// Example 8: Remove a job
async function removeJob(jobId) {
  console.log(`\nExample 8: Removing job ${jobId}...`);
  
  const job = await taskQueue.getJob(jobId);
  
  if (!job) {
    console.log('❌ Job not found');
    return false;
  }
  
  await job.remove();
  console.log(`✅ Job ${jobId} removed`);
  return true;
}

// Main execution
async function main() {
  console.log('🚀 BullMQ Examples\n');
  console.log('==========================================\n');
  
  try {
    // Run examples
    const job1 = await addSimpleJob();
    const job2 = await addJobWithOptions();
    await addBulkJobs();
    await addPriorityJob();
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check status of first job
    await checkJobStatus(job1.id);
    
    // Get statistics
    await getQueueStats();
    
    console.log('\n==========================================');
    console.log('✅ All examples completed!');
    console.log('\n💡 Make sure the worker is running to process these jobs:');
    console.log('   npm run worker');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Close the queue connection
    await taskQueue.close();
    process.exit(0);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export functions for use in other modules
module.exports = {
  addSimpleJob,
  addJobWithOptions,
  addBulkJobs,
  addPriorityJob,
  checkJobStatus,
  getQueueStats,
  removeJob,
};
