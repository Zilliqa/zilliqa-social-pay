const QueueEmitter = require('./emitter');
const Job = require('./job');

const jobQueue = new QueueEmitter('test');

jobQueue.addListener(jobQueue.events.trigger, (task) => {

  setTimeout(() => {
    jobQueue.taskDone(task);
    console.log(JSON.stringify(task, null, 4));
  }, 2000);
});


jobQueue.addTask(new Job('userConfigurate', { id: 2 }, '1'));
jobQueue.addTask(new Job('userConfigurate', { id: 2 }, '2'));
jobQueue.addTask(new Job('userConfigurate', { id: 2 }, '3'));
jobQueue.addTask(new Job('userConfigurate', { id: 2 }, '4'));
