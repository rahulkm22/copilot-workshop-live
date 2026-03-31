import { Task } from '../models/task.js';
import { validateTaskId, validateTaskUpdates } from '../utils/validators.js';

const tasks = new Map();

/**
 * Creates a new task and stores it in memory.
 *
 * @param {object} input - Task creation payload.
 * @returns {object} A copy of the created task.
 */
export function createTask(input) {
  const task = new Task(input);

  if (tasks.has(task.id)) {
    throw new Error(`Task already exists: ${task.id}`);
  }

  tasks.set(task.id, task);
  return task.toJSON();
}

/**
 * Gets a task by id.
 *
 * @param {string} id - Task id.
 * @returns {object} A copy of the matching task.
 */
export function getTaskById(id) {
  const normalizedId = validateTaskId(id);
  const task = tasks.get(normalizedId);

  if (!task) {
    throw new Error(`Task not found: ${normalizedId}`);
  }

  return task.toJSON();
}

/**
 * Lists all tasks.
 *
 * @returns {object[]} Copies of all tasks in insertion order.
 */
export function listTasks() {
  return [...tasks.values()].map((task) => task.toJSON());
}

/**
 * Updates an existing task.
 *
 * @param {string} id - Task id.
 * @param {object} updates - Partial update payload.
 * @returns {object} A copy of the updated task.
 */
export function updateTask(id, updates) {
  const normalizedId = validateTaskId(id);
  const task = tasks.get(normalizedId);

  if (!task) {
    throw new Error(`Task not found: ${normalizedId}`);
  }

  const normalizedUpdates = validateTaskUpdates(updates);
  task.update(normalizedUpdates);

  return task.toJSON();
}

/**
 * Deletes an existing task.
 *
 * @param {string} id - Task id.
 * @returns {object} A copy of the deleted task.
 */
export function deleteTask(id) {
  const normalizedId = validateTaskId(id);
  const task = tasks.get(normalizedId);

  if (!task) {
    throw new Error(`Task not found: ${normalizedId}`);
  }

  tasks.delete(normalizedId);
  return task.toJSON();
}

/**
 * Removes all tasks from the in-memory store. Intended for test isolation only.
 */
export function clearTasks() {
  tasks.clear();
}
