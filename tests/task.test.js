import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Task } from '../src/models/task.js';

// ---------------------------------------------------------------------------
// Constructor — defaults
// ---------------------------------------------------------------------------

describe('Task constructor — defaults', () => {
  it('assigns a UUID-shaped id when none is provided', () => {
    const task = new Task({ title: 'Default task' });
    assert.match(task.id, /^[0-9a-f-]{36}$/);
  });

  it('defaults status to "todo"', () => {
    const task = new Task({ title: 'Default task' });
    assert.equal(task.status, 'todo');
  });

  it('defaults priority to "medium"', () => {
    const task = new Task({ title: 'Default task' });
    assert.equal(task.priority, 'medium');
  });

  it('defaults description to empty string', () => {
    const task = new Task({ title: 'Default task' });
    assert.equal(task.description, '');
  });

  it('sets createdAt to a positive integer', () => {
    const task = new Task({ title: 'Default task' });
    assert.ok(Number.isInteger(task.createdAt) && task.createdAt > 0);
  });

  it('sets updatedAt equal to createdAt on creation', () => {
    const task = new Task({ title: 'Default task' });
    assert.equal(task.updatedAt, task.createdAt);
  });
});

// ---------------------------------------------------------------------------
// Constructor — explicit values
// ---------------------------------------------------------------------------

describe('Task constructor — explicit values', () => {
  it('stores the provided title after trimming', () => {
    const task = new Task({ title: '  Fix bug  ' });
    assert.equal(task.title, 'Fix bug');
  });

  it('stores the provided description after trimming', () => {
    const task = new Task({ title: 'T', description: '  Some detail  ' });
    assert.equal(task.description, 'Some detail');
  });

  it('stores the provided status in lowercase', () => {
    const task = new Task({ title: 'T', status: 'DONE' });
    assert.equal(task.status, 'done');
  });

  it('stores the provided priority in lowercase', () => {
    const task = new Task({ title: 'T', priority: 'HIGH' });
    assert.equal(task.priority, 'high');
  });

  it('uses a provided id', () => {
    const id = 'custom-id-001';
    const task = new Task({ title: 'T', id });
    assert.equal(task.id, id);
  });

  it('uses a provided createdAt timestamp', () => {
    const ts = Date.now() - 5000;
    const task = new Task({ title: 'T', createdAt: ts, updatedAt: ts });
    assert.equal(task.createdAt, ts);
  });
});

// ---------------------------------------------------------------------------
// Constructor — validation errors
// ---------------------------------------------------------------------------

describe('Task constructor — validation errors', () => {
  it('throws TypeError when input is not an object', () => {
    assert.throws(() => new Task('not an object'), TypeError);
  });

  it('throws TypeError when input is null', () => {
    assert.throws(() => new Task(null), TypeError);
  });

  it('throws TypeError when input is an array', () => {
    assert.throws(() => new Task([]), TypeError);
  });

  it('throws TypeError when title is missing', () => {
    assert.throws(() => new Task({}), TypeError);
  });

  it('throws TypeError when title is empty', () => {
    assert.throws(() => new Task({ title: '' }), TypeError);
  });

  it('throws TypeError when title exceeds 100 characters', () => {
    assert.throws(() => new Task({ title: 'x'.repeat(101) }), TypeError);
  });

  it('throws TypeError when status is invalid', () => {
    assert.throws(() => new Task({ title: 'T', status: 'waiting' }), TypeError);
  });

  it('throws TypeError when priority is invalid', () => {
    assert.throws(() => new Task({ title: 'T', priority: 'ultra' }), TypeError);
  });

  it('throws TypeError when description is not a string', () => {
    assert.throws(() => new Task({ title: 'T', description: 42 }), TypeError);
  });

  it('throws TypeError when id is not a string', () => {
    assert.throws(() => new Task({ title: 'T', id: 123 }), TypeError);
  });

  it('throws TypeError when updatedAt is less than createdAt', () => {
    const now = Date.now();
    assert.throws(() => new Task({ title: 'T', createdAt: now, updatedAt: now - 1 }), TypeError);
  });

  it('throws TypeError when createdAt is zero', () => {
    assert.throws(() => new Task({ title: 'T', createdAt: 0, updatedAt: 0 }), TypeError);
  });
});

// ---------------------------------------------------------------------------
// update()
// ---------------------------------------------------------------------------

describe('Task update()', () => {
  it('updates title and leaves other fields unchanged', () => {
    const task = new Task({ title: 'Old title', status: 'todo', priority: 'low' });
    task.update({ title: 'New title' });
    assert.equal(task.title, 'New title');
    assert.equal(task.status, 'todo');
    assert.equal(task.priority, 'low');
  });

  it('updates status', () => {
    const task = new Task({ title: 'T' });
    task.update({ status: 'done' });
    assert.equal(task.status, 'done');
  });

  it('updates priority', () => {
    const task = new Task({ title: 'T' });
    task.update({ priority: 'high' });
    assert.equal(task.priority, 'high');
  });

  it('updates description', () => {
    const task = new Task({ title: 'T' });
    task.update({ description: 'New description' });
    assert.equal(task.description, 'New description');
  });

  it('updates updatedAt to a value >= createdAt', () => {
    const task = new Task({ title: 'T' });
    const before = task.createdAt;
    task.update({ title: 'Changed' });
    assert.ok(task.updatedAt >= before);
  });

  it('returns the task itself for chaining', () => {
    const task = new Task({ title: 'T' });
    const result = task.update({ title: 'Changed' });
    assert.equal(result, task);
  });

  it('throws TypeError when updates is empty object', () => {
    const task = new Task({ title: 'T' });
    assert.throws(() => task.update({}), TypeError);
  });

  it('throws TypeError when updates is null', () => {
    const task = new Task({ title: 'T' });
    assert.throws(() => task.update(null), TypeError);
  });

  it('throws TypeError for an invalid status value', () => {
    const task = new Task({ title: 'T' });
    assert.throws(() => task.update({ status: 'invalid' }), TypeError);
  });
});

// ---------------------------------------------------------------------------
// toJSON()
// ---------------------------------------------------------------------------

describe('Task toJSON()', () => {
  it('returns a plain object with all expected keys', () => {
    const task = new Task({ title: 'JSON test', description: 'desc' });
    const json = task.toJSON();
    assert.ok(typeof json === 'object' && json !== null);
    ['id', 'title', 'description', 'status', 'priority', 'createdAt', 'updatedAt'].forEach((k) => {
      assert.ok(Object.hasOwn(json, k), `Missing key: ${k}`);
    });
  });

  it('returned object is not the same reference as the task', () => {
    const task = new Task({ title: 'T' });
    const json = task.toJSON();
    assert.notEqual(json, task);
  });

  it('title in toJSON matches the stored title', () => {
    const task = new Task({ title: '  Trim  ' });
    assert.equal(task.toJSON().title, 'Trim');
  });

  it('status in toJSON defaults to "todo"', () => {
    const task = new Task({ title: 'T' });
    assert.equal(task.toJSON().status, 'todo');
  });

  it('priority in toJSON defaults to "medium"', () => {
    const task = new Task({ title: 'T' });
    assert.equal(task.toJSON().priority, 'medium');
  });

  it('category in toJSON defaults to "general"', () => {
    const task = new Task({ title: 'T' });
    assert.equal(task.toJSON().category, 'general');
  });

  it('category is included in toJSON output', () => {
    const task = new Task({ title: 'T', category: 'work' });
    const json = task.toJSON();
    assert.ok(Object.hasOwn(json, 'category'));
  });
});

// ---------------------------------------------------------------------------
// Constructor — category defaults and explicit values
// ---------------------------------------------------------------------------

describe('Task constructor — category', () => {
  it('defaults category to "general"', () => {
    const task = new Task({ title: 'Default task' });
    assert.equal(task.category, 'general');
  });

  it('stores the provided category in lowercase', () => {
    const task = new Task({ title: 'T', category: 'WORK' });
    assert.equal(task.category, 'work');
  });

  it('trims whitespace from category', () => {
    const task = new Task({ title: 'T', category: '  personal  ' });
    assert.equal(task.category, 'personal');
  });

  it('accepts valid categories like "work", "personal", "urgent"', () => {
    ['work', 'personal', 'urgent'].forEach((cat) => {
      const task = new Task({ title: 'T', category: cat });
      assert.equal(task.category, cat);
    });
  });
});

// ---------------------------------------------------------------------------
// Constructor — category validation errors
// ---------------------------------------------------------------------------

describe('Task constructor — category validation errors', () => {
  it('throws TypeError when category is not a string', () => {
    assert.throws(() => new Task({ title: 'T', category: 123 }), TypeError);
  });

  it('throws TypeError when category is empty string', () => {
    assert.throws(() => new Task({ title: 'T', category: '' }), TypeError);
  });

  it('throws TypeError when category is whitespace only', () => {
    assert.throws(() => new Task({ title: 'T', category: '   ' }), TypeError);
  });

  it('throws TypeError when category exceeds 50 characters', () => {
    assert.throws(() => new Task({ title: 'T', category: 'x'.repeat(51) }), TypeError);
  });
});

// ---------------------------------------------------------------------------
// update() — category
// ---------------------------------------------------------------------------

describe('Task update() — category', () => {
  it('updates category and leaves other fields unchanged', () => {
    const task = new Task({ title: 'T', category: 'work', status: 'todo' });
    task.update({ category: 'personal' });
    assert.equal(task.category, 'personal');
    assert.equal(task.status, 'todo');
  });

  it('normalizes category to lowercase when updating', () => {
    const task = new Task({ title: 'T' });
    task.update({ category: 'URGENT' });
    assert.equal(task.category, 'urgent');
  });

  it('trims whitespace from category when updating', () => {
    const task = new Task({ title: 'T' });
    task.update({ category: '  work  ' });
    assert.equal(task.category, 'work');
  });

  it('throws TypeError when updating with invalid category', () => {
    const task = new Task({ title: 'T' });
    assert.throws(() => task.update({ category: 'x'.repeat(51) }), TypeError);
  });
});
