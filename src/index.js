import {
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask
} from './services/taskService.js';

/**
 * Runs a short demonstration of Task Manager features.
 */
function main() {
  try {
    const firstTask = createTask({
      title: 'Design API contract',
      description: 'Draft endpoints and payloads for task module',
      priority: 'high'
    });
    console.log('Created task 1:', firstTask);

    const secondTask = createTask({
      title: 'Write unit tests',
      description: 'Cover create, update, list, delete flows',
      status: 'todo',
      priority: 'medium'
    });
    console.log('Created task 2:', secondTask);

    const allTasks = listTasks();
    console.log('All tasks:', allTasks);

    const updatedTask = updateTask(firstTask.id, {
      status: 'in-progress',
      description: 'Draft endpoints, payloads, and error responses'
    });
    console.log('Updated task 1:', updatedTask);

    const loadedTask = getTaskById(secondTask.id);
    console.log('Fetched task 2 by id:', loadedTask);

    const deletedTask = deleteTask(firstTask.id);
    console.log('Deleted task 1:', deletedTask);

    console.log('Tasks after deletion:', listTasks());
  } catch (error) {
    console.error('Task Manager failed:', error);
    process.exitCode = 1;
  }
}

main();
