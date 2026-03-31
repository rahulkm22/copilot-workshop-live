import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  createTask,
  getTaskById,
  listTasks,
  updateTask,
  deleteTask,
  filterTasksByCategory,
  clearTasks
} from '../src/services/taskService.js';

beforeEach(() => {
  clearTasks();
});

// ---------------------------------------------------------------------------
// createTask
// ---------------------------------------------------------------------------

describe('createTask', () => {
  it('returns a JSON object with all expected fields', () => {
    const task = createTask({ title: 'First task' });
    ['id', 'title', 'description', 'status', 'priority', 'category', 'createdAt', 'updatedAt'].forEach((k) => {
      assert.ok(Object.hasOwn(task, k), `Missing key: ${k}`);
    });
  });

  it('stores the provided title', () => {
    const task = createTask({ title: 'My task' });
    assert.equal(task.title, 'My task');
  });

  it('assigns default status of "todo"', () => {
    const task = createTask({ title: 'T' });
    assert.equal(task.status, 'todo');
  });

  it('assigns default priority of "medium"', () => {
    const task = createTask({ title: 'T' });
    assert.equal(task.priority, 'medium');
  });

  it('assigns default category of "general"', () => {
    const task = createTask({ title: 'T' });
    assert.equal(task.category, 'general');
  });

  it('assigns default description of empty string', () => {
    const task = createTask({ title: 'T' });
    assert.equal(task.description, '');
  });

  it('stores a task with explicit status and priority', () => {
    const task = createTask({ title: 'T', status: 'in-progress', priority: 'high' });
    assert.equal(task.status, 'in-progress');
    assert.equal(task.priority, 'high');
  });

  it('stores a task with explicit category', () => {
    const task = createTask({ title: 'T', category: 'work' });
    assert.equal(task.category, 'work');
  });

  it('throws TypeError when title is missing', () => {
    assert.throws(() => createTask({}), TypeError);
  });

  it('throws TypeError when input is null', () => {
    assert.throws(() => createTask(null), TypeError);
  });

  it('throws TypeError when input is not an object', () => {
    assert.throws(() => createTask('invalid'), TypeError);
  });

  it('throws Error when a task with the same explicit id is created twice', () => {
    createTask({ title: 'First', id: 'dupe-id' });
    assert.throws(() => createTask({ title: 'Second', id: 'dupe-id' }), Error);
  });
});

// ---------------------------------------------------------------------------
// getTaskById
// ---------------------------------------------------------------------------

describe('getTaskById', () => {
  it('returns the correct task for a valid id', () => {
    const created = createTask({ title: 'Find me' });
    const found = getTaskById(created.id);
    assert.equal(found.id, created.id);
    assert.equal(found.title, 'Find me');
  });

  it('returns a plain object, not the internal Task instance', () => {
    const created = createTask({ title: 'Plain obj' });
    const found = getTaskById(created.id);
    assert.equal(Object.getPrototypeOf(found), Object.prototype);
  });

  it('throws Error when the task does not exist', () => {
    assert.throws(() => getTaskById('no-such-id'), Error);
  });

  it('throws TypeError when id is not a string', () => {
    assert.throws(() => getTaskById(123), TypeError);
  });

  it('throws TypeError when id is empty string', () => {
    assert.throws(() => getTaskById(''), TypeError);
  });
});

// ---------------------------------------------------------------------------
// listTasks
// ---------------------------------------------------------------------------

describe('listTasks', () => {
  it('returns an empty array when no tasks exist', () => {
    assert.deepEqual(listTasks(), []);
  });

  it('returns all created tasks', () => {
    createTask({ title: 'Task A' });
    createTask({ title: 'Task B' });
    const tasks = listTasks();
    assert.equal(tasks.length, 2);
  });

  it('returns tasks in insertion order', () => {
    createTask({ title: 'First' });
    createTask({ title: 'Second' });
    const tasks = listTasks();
    assert.equal(tasks[0].title, 'First');
    assert.equal(tasks[1].title, 'Second');
  });

  it('returns plain objects, not Task instances', () => {
    createTask({ title: 'T' });
    const tasks = listTasks();
    assert.equal(typeof tasks[0], 'object');
  });

  it('count decreases after a task is deleted', () => {
    const t = createTask({ title: 'To delete' });
    createTask({ title: 'Stays' });
    deleteTask(t.id);
    assert.equal(listTasks().length, 1);
  });
});

// ---------------------------------------------------------------------------
// updateTask
// ---------------------------------------------------------------------------

describe('updateTask', () => {
  it('updates the title of an existing task', () => {
    const task = createTask({ title: 'Old' });
    const updated = updateTask(task.id, { title: 'New' });
    assert.equal(updated.title, 'New');
  });

  it('updates the status of an existing task', () => {
    const task = createTask({ title: 'T' });
    const updated = updateTask(task.id, { status: 'done' });
    assert.equal(updated.status, 'done');
  });

  it('updates the priority of an existing task', () => {
    const task = createTask({ title: 'T' });
    const updated = updateTask(task.id, { priority: 'low' });
    assert.equal(updated.priority, 'low');
  });

  it('updates the description of an existing task', () => {
    const task = createTask({ title: 'T' });
    const updated = updateTask(task.id, { description: 'New description' });
    assert.equal(updated.description, 'New description');
  });

  it('updates the category of an existing task', () => {
    const task = createTask({ title: 'T', category: 'work' });
    const updated = updateTask(task.id, { category: 'personal' });
    assert.equal(updated.category, 'personal');
  });

  it('updatedAt is >= createdAt after update', () => {
    const task = createTask({ title: 'T' });
    const updated = updateTask(task.id, { title: 'Changed' });
    assert.ok(updated.updatedAt >= updated.createdAt);
  });

  it('does not mutate fields not present in the update payload', () => {
    const task = createTask({ title: 'T', priority: 'high' });
    const updated = updateTask(task.id, { title: 'Changed' });
    assert.equal(updated.priority, 'high');
  });

  it('throws Error when task does not exist', () => {
    assert.throws(() => updateTask('no-such-id', { title: 'X' }), Error);
  });

  it('throws TypeError when updates object is empty', () => {
    const task = createTask({ title: 'T' });
    assert.throws(() => updateTask(task.id, {}), TypeError);
  });

  it('throws TypeError when id is not a string', () => {
    assert.throws(() => updateTask(99, { title: 'X' }), TypeError);
  });

  it('throws TypeError when status value is invalid', () => {
    const task = createTask({ title: 'T' });
    assert.throws(() => updateTask(task.id, { status: 'pending' }), TypeError);
  });
});

// ---------------------------------------------------------------------------
// deleteTask
// ---------------------------------------------------------------------------

describe('deleteTask', () => {
  it('returns the deleted task data', () => {
    const task = createTask({ title: 'Gone' });
    const deleted = deleteTask(task.id);
    assert.equal(deleted.id, task.id);
    assert.equal(deleted.title, 'Gone');
  });

  it('removes the task so it can no longer be retrieved', () => {
    const task = createTask({ title: 'Remove me' });
    deleteTask(task.id);
    assert.throws(() => getTaskById(task.id), Error);
  });

  it('removes the task from listTasks()', () => {
    const task = createTask({ title: 'Remove me' });
    deleteTask(task.id);
    assert.deepEqual(listTasks(), []);
  });

  it('throws Error when the task does not exist', () => {
    assert.throws(() => deleteTask('no-such-id'), Error);
  });

  it('throws TypeError when id is not a string', () => {
    assert.throws(() => deleteTask(42), TypeError);
  });

  it('throws TypeError when id is empty string', () => {
    assert.throws(() => deleteTask(''), TypeError);
  });

  it('throws Error when deleting an already-deleted task again', () => {
    const task = createTask({ title: 'Delete twice' });
    deleteTask(task.id);
    assert.throws(() => deleteTask(task.id), Error);
  });
});

// ---------------------------------------------------------------------------
// filterTasksByCategory
// ---------------------------------------------------------------------------

describe('filterTasksByCategory', () => {
  it('returns an empty array when no tasks match the category', () => {
    createTask({ title: 'T1', category: 'work' });
    const tasks = filterTasksByCategory('personal');
    assert.deepEqual(tasks, []);
  });

  it('returns all tasks with the specified category', () => {
    createTask({ title: 'Work 1', category: 'work' });
    createTask({ title: 'Work 2', category: 'work' });
    createTask({ title: 'Personal', category: 'personal' });
    const workTasks = filterTasksByCategory('work');
    assert.equal(workTasks.length, 2);
    assert.equal(workTasks[0].title, 'Work 1');
    assert.equal(workTasks[1].title, 'Work 2');
  });

  it('returns tasks in insertion order', () => {
    createTask({ title: 'First', category: 'work' });
    createTask({ title: 'Second', category: 'personal' });
    createTask({ title: 'Third', category: 'work' });
    const workTasks = filterTasksByCategory('work');
    assert.equal(workTasks[0].title, 'First');
    assert.equal(workTasks[1].title, 'Third');
  });

  it('performs case-insensitive category matching', () => {
    createTask({ title: 'T', category: 'work' });
    const tasks1 = filterTasksByCategory('WORK');
    const tasks2 = filterTasksByCategory('Work');
    assert.equal(tasks1.length, 1);
    assert.equal(tasks2.length, 1);
  });

  it('returns tasks defaulting to "general" category', () => {
    createTask({ title: 'Default 1' });
    createTask({ title: 'Default 2' });
    createTask({ title: 'Work', category: 'work' });
    const generalTasks = filterTasksByCategory('general');
    assert.equal(generalTasks.length, 2);
  });

  it('returns plain objects, not Task instances', () => {
    createTask({ title: 'T', category: 'test' });
    const tasks = filterTasksByCategory('test');
    assert.equal(typeof tasks[0], 'object');
    assert.equal(Object.getPrototypeOf(tasks[0]), Object.prototype);
  });

  it('filters out deleted tasks', () => {
    const task = createTask({ title: 'Delete me', category: 'work' });
    createTask({ title: 'Keep me', category: 'work' });
    deleteTask(task.id);
    const workTasks = filterTasksByCategory('work');
    assert.equal(workTasks.length, 1);
    assert.equal(workTasks[0].title, 'Keep me');
  });

  it('reflects updates to task categories', () => {
    const task = createTask({ title: 'T', category: 'work' });
    updateTask(task.id, { category: 'personal' });
    const workTasks = filterTasksByCategory('work');
    const personalTasks = filterTasksByCategory('personal');
    assert.equal(workTasks.length, 0);
    assert.equal(personalTasks.length, 1);
  });
});
