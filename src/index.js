import {
  createTask,
  deleteTask,
  filterTasksByCategory,
  getTaskById,
  listTasks,
  updateTask
} from './services/taskService.js';
import { colorPriority, colorStatus } from './utils/colors.js';

/**
 * Returns a task object with status and priority formatted for terminal output.
 *
 * @param {object} task - Task object from the service layer.
 * @returns {object} Task object with styled status and priority values.
 */
function formatTaskForDisplay(task) {
  return {
    ...task,
    status: colorStatus(task.status),
    priority: colorPriority(task.priority)
  };
}

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
    console.log('Created task 1:', formatTaskForDisplay(firstTask));

    const secondTask = createTask({
      title: 'Write unit tests',
      description: 'Cover create, update, list, delete flows',
      status: 'todo',
      priority: 'medium',
      category: 'work'
    });
    console.log('Created task 2:', formatTaskForDisplay(secondTask));

    const thirdTask = createTask({
      title: 'Plan weekend hike',
      description: 'Research trails in the area',
      status: 'todo',
      priority: 'low',
      category: 'personal'
    });
    console.log('Created task 3:', formatTaskForDisplay(thirdTask));

    const allTasks = listTasks();
    console.log('All tasks:', allTasks.map(formatTaskForDisplay));

    const workTasks = filterTasksByCategory('work');
    console.log('Work tasks:', workTasks.map(formatTaskForDisplay));

    const personalTasks = filterTasksByCategory('personal');
    console.log('Personal tasks:', personalTasks.map(formatTaskForDisplay));

    const updatedTask = updateTask(firstTask.id, {
      status: 'in-progress',
      description: 'Draft endpoints, payloads, and error responses'
    });
    console.log('Updated task 1:', formatTaskForDisplay(updatedTask));

    const loadedTask = getTaskById(secondTask.id);
    console.log('Fetched task 2 by id:', formatTaskForDisplay(loadedTask));

    const deletedTask = deleteTask(firstTask.id);
    console.log('Deleted task 1:', formatTaskForDisplay(deletedTask));

    console.log('Tasks after deletion:', listTasks().map(formatTaskForDisplay));
  } catch (error) {
    console.error('Task Manager failed:', error);
    process.exitCode = 1;
  }
}

main();
