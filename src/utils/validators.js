const ALLOWED_STATUSES = ['todo', 'in-progress', 'done'];
const ALLOWED_PRIORITIES = ['low', 'medium', 'high'];

/**
 * Validates and normalizes a task title.
 *
 * @param {string} title - Raw task title.
 * @returns {string} Normalized title.
 * @throws {TypeError} When title is not a valid non-empty string up to 100 chars.
 * @example
 * validateTitle('  Write tests  ');
 * // 'Write tests'
 * @example
 * validateTitle('Plan sprint');
 * // 'Plan sprint'
 */
export function validateTitle(title) {
  if (typeof title !== 'string') {
    throw new TypeError('Invalid title: expected a string.');
  }

  const normalizedTitle = title.trim();
  if (normalizedTitle.length === 0) {
    throw new TypeError('Invalid title: cannot be empty.');
  }

  if (normalizedTitle.length > 100) {
    throw new TypeError('Invalid title: must be 100 characters or fewer.');
  }

  return normalizedTitle;
}

/**
 * Validates and normalizes a task description.
 *
 * @param {string|undefined} description - Raw task description.
 * @returns {string} Normalized description.
 * @throws {TypeError} When description is not a string or exceeds max length.
 * @example
 * validateDescription(undefined);
 * // ''
 * @example
 * validateDescription('  Ship v1 release notes  ');
 * // 'Ship v1 release notes'
 */
export function validateDescription(description) {
  if (description === undefined) {
    return '';
  }

  if (typeof description !== 'string') {
    throw new TypeError('Invalid description: expected a string.');
  }

  const normalizedDescription = description.trim();
  if (normalizedDescription.length > 500) {
    throw new TypeError('Invalid description: must be 500 characters or fewer.');
  }

  return normalizedDescription;
}

/**
 * Validates and normalizes a task status.
 *
 * @param {string|undefined} status - Raw status value.
 * @returns {'todo'|'in-progress'|'done'} Normalized status.
 * @throws {TypeError} When status is not one of the allowed values.
 * @example
 * validateStatus('IN-PROGRESS');
 * // 'in-progress'
 * @example
 * validateStatus(undefined);
 * // 'todo'
 */
export function validateStatus(status) {
  if (status === undefined) {
    return 'todo';
  }

  if (typeof status !== 'string') {
    throw new TypeError('Invalid status: expected a string.');
  }

  const normalizedStatus = status.trim().toLowerCase();
  if (!ALLOWED_STATUSES.includes(normalizedStatus)) {
    throw new TypeError('Invalid status: must be todo, in-progress, or done.');
  }

  return normalizedStatus;
}

/**
 * Validates and normalizes a task priority.
 *
 * @param {string|undefined} priority - Raw priority value.
 * @returns {'low'|'medium'|'high'} Normalized priority.
 * @throws {TypeError} When priority is not one of the allowed values.
 * @example
 * validatePriority('HIGH');
 * // 'high'
 * @example
 * validatePriority(undefined);
 * // 'medium'
 */
export function validatePriority(priority) {
  if (priority === undefined) {
    return 'medium';
  }

  if (typeof priority !== 'string') {
    throw new TypeError('Invalid priority: expected a string.');
  }

  const normalizedPriority = priority.trim().toLowerCase();
  if (!ALLOWED_PRIORITIES.includes(normalizedPriority)) {
    throw new TypeError('Invalid priority: must be low, medium, or high.');
  }

  return normalizedPriority;
}

/**
 * Validates a task identifier.
 *
 * @param {string} id - Task identifier.
 * @returns {string} Normalized id.
 * @throws {TypeError} When id is not a non-empty string.
 * @example
 * validateTaskId('de305d54-75b4-431b-adb2-eb6b9e546014');
 * // 'de305d54-75b4-431b-adb2-eb6b9e546014'
 * @example
 * validateTaskId(' task-123 ');
 * // 'task-123'
 */
export function validateTaskId(id) {
  if (typeof id !== 'string') {
    throw new TypeError('Invalid task id: expected a string.');
  }

  const normalizedId = id.trim();
  if (normalizedId.length === 0) {
    throw new TypeError('Invalid task id: cannot be empty.');
  }

  return normalizedId;
}

/**
 * Validates and normalizes a task category.
 *
 * @param {string|undefined} category - Raw category value.
 * @returns {string} Normalized category.
 * @throws {TypeError} When category is not a valid string between 1-50 chars.
 * @example
 * validateCategory('  Work  ');
 * // 'work'
 * @example
 * validateCategory(undefined);
 * // 'general'
 */
export function validateCategory(category) {
  if (category === undefined) {
    return 'general';
  }

  if (typeof category !== 'string') {
    throw new TypeError('Invalid category: expected a string.');
  }

  const normalizedCategory = category.trim().toLowerCase();
  if (normalizedCategory.length === 0) {
    throw new TypeError('Invalid category: cannot be empty.');
  }

  if (normalizedCategory.length > 50) {
    throw new TypeError('Invalid category: must be 50 characters or fewer.');
  }

  return normalizedCategory;
}

/**
 * Validates update patch input for a task.
 *
 * @param {object} updates - Partial update payload.
 * @returns {object} Normalized update payload.
 * @throws {TypeError} When updates are invalid or contain no supported fields.
 * @example
 * validateTaskUpdates({ title: 'Refine backlog', priority: 'LOW' });
 * // { title: 'Refine backlog', priority: 'low' }
 * @example
 * validateTaskUpdates({ description: '  Add acceptance criteria  ' });
 * // { description: 'Add acceptance criteria' }
 */
export function validateTaskUpdates(updates) {
  if (typeof updates !== 'object' || updates === null || Array.isArray(updates)) {
    throw new TypeError('Invalid updates: expected a plain object.');
  }

  const normalizedUpdates = {};

  if (Object.hasOwn(updates, 'title')) {
    normalizedUpdates.title = validateTitle(updates.title);
  }

  if (Object.hasOwn(updates, 'description')) {
    normalizedUpdates.description = validateDescription(updates.description);
  }

  if (Object.hasOwn(updates, 'status')) {
    normalizedUpdates.status = validateStatus(updates.status);
  }

  if (Object.hasOwn(updates, 'priority')) {
    normalizedUpdates.priority = validatePriority(updates.priority);
  }

  if (Object.hasOwn(updates, 'category')) {
    normalizedUpdates.category = validateCategory(updates.category);
  }

  if (Object.keys(normalizedUpdates).length === 0) {
    throw new TypeError(
      'Invalid updates: include at least one of title, description, status, priority, or category.'
    );
  }

  return normalizedUpdates;
}
