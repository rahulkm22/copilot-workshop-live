import { randomUUID } from 'node:crypto';
import {
  validateDescription,
  validatePriority,
  validateStatus,
  validateTaskId,
  validateTitle,
  validateTaskUpdates
} from '../utils/validators.js';

/**
 * Represents a task domain entity.
 */
export class Task {
  /**
   * Creates a Task instance.
   *
   * @param {object} input - Task creation payload.
   * @param {string} input.title - Task title.
   * @param {string} [input.description] - Task description.
   * @param {'todo'|'in-progress'|'done'} [input.status] - Task status.
   * @param {'low'|'medium'|'high'} [input.priority] - Task priority.
   * @param {string} [input.id] - Existing task id, mostly for hydration.
   * @param {number} [input.createdAt] - Existing creation timestamp.
   * @param {number} [input.updatedAt] - Existing update timestamp.
   */
  constructor(input) {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      throw new TypeError('Invalid task input: expected a plain object.');
    }

    this.id = input.id === undefined ? randomUUID() : validateTaskId(input.id);
    this.title = validateTitle(input.title);
    this.description = validateDescription(input.description);
    this.status = validateStatus(input.status);
    this.priority = validatePriority(input.priority);

    const createdAt = input.createdAt === undefined ? Date.now() : input.createdAt;
    const updatedAt = input.updatedAt === undefined ? createdAt : input.updatedAt;

    if (!Number.isInteger(createdAt) || createdAt <= 0) {
      throw new TypeError('Invalid createdAt: expected a positive integer timestamp.');
    }

    if (!Number.isInteger(updatedAt) || updatedAt < createdAt) {
      throw new TypeError(
        'Invalid updatedAt: expected an integer timestamp greater than or equal to createdAt.'
      );
    }

    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Applies validated updates to a task.
   *
   * @param {object} updates - Task updates.
   * @returns {Task} The updated task.
   */
  update(updates) {
    const normalizedUpdates = validateTaskUpdates(updates);

    if (normalizedUpdates.title !== undefined) {
      this.title = normalizedUpdates.title;
    }

    if (normalizedUpdates.description !== undefined) {
      this.description = normalizedUpdates.description;
    }

    if (normalizedUpdates.status !== undefined) {
      this.status = normalizedUpdates.status;
    }

    if (normalizedUpdates.priority !== undefined) {
      this.priority = normalizedUpdates.priority;
    }

    this.updatedAt = Date.now();
    return this;
  }

  /**
   * Converts the task to a plain object.
   *
   * @returns {{id: string, title: string, description: string, status: string, priority: string, createdAt: number, updatedAt: number}} JSON-safe task data.
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
