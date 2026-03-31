import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateTitle,
  validateDescription,
  validateStatus,
  validatePriority,
  validateTaskId,
  validateTaskUpdates
} from '../src/utils/validators.js';

// ---------------------------------------------------------------------------
// validateTitle
// ---------------------------------------------------------------------------

describe('validateTitle', () => {
  it('returns trimmed title for a valid string', () => {
    assert.equal(validateTitle('  Write tests  '), 'Write tests');
  });

  it('returns title unchanged when no surrounding whitespace', () => {
    assert.equal(validateTitle('Plan sprint'), 'Plan sprint');
  });

  it('throws TypeError when title is not a string', () => {
    assert.throws(() => validateTitle(42), TypeError);
  });

  it('throws TypeError when title is undefined', () => {
    assert.throws(() => validateTitle(undefined), TypeError);
  });

  it('throws TypeError when title is null', () => {
    assert.throws(() => validateTitle(null), TypeError);
  });

  it('throws TypeError when title is empty after trimming', () => {
    assert.throws(() => validateTitle('   '), TypeError);
  });

  it('throws TypeError when title is an empty string', () => {
    assert.throws(() => validateTitle(''), TypeError);
  });

  it('throws TypeError when title exceeds 100 characters', () => {
    assert.throws(() => validateTitle('a'.repeat(101)), TypeError);
  });

  it('accepts a title of exactly 100 characters', () => {
    const title = 'a'.repeat(100);
    assert.equal(validateTitle(title), title);
  });
});

// ---------------------------------------------------------------------------
// validateDescription
// ---------------------------------------------------------------------------

describe('validateDescription', () => {
  it('returns empty string when description is undefined', () => {
    assert.equal(validateDescription(undefined), '');
  });

  it('returns trimmed description for a valid non-empty string', () => {
    assert.equal(validateDescription('  Ship v1 release notes  '), 'Ship v1 release notes');
  });

  it('returns empty string for a blank string', () => {
    assert.equal(validateDescription('   '), '');
  });

  it('returns empty string for empty string input', () => {
    assert.equal(validateDescription(''), '');
  });

  it('throws TypeError when description is not a string', () => {
    assert.throws(() => validateDescription(123), TypeError);
  });

  it('throws TypeError when description is null', () => {
    assert.throws(() => validateDescription(null), TypeError);
  });

  it('throws TypeError when description exceeds 500 characters', () => {
    assert.throws(() => validateDescription('x'.repeat(501)), TypeError);
  });

  it('accepts a description of exactly 500 characters', () => {
    const desc = 'd'.repeat(500);
    assert.equal(validateDescription(desc), desc);
  });
});

// ---------------------------------------------------------------------------
// validateStatus
// ---------------------------------------------------------------------------

describe('validateStatus', () => {
  it('defaults to "todo" when status is undefined', () => {
    assert.equal(validateStatus(undefined), 'todo');
  });

  it('returns normalized lowercase "todo"', () => {
    assert.equal(validateStatus('TODO'), 'todo');
  });

  it('returns normalized lowercase "in-progress"', () => {
    assert.equal(validateStatus('IN-PROGRESS'), 'in-progress');
  });

  it('returns normalized lowercase "done"', () => {
    assert.equal(validateStatus('DONE'), 'done');
  });

  it('accepts already-lowercase valid values', () => {
    assert.equal(validateStatus('todo'), 'todo');
    assert.equal(validateStatus('in-progress'), 'in-progress');
    assert.equal(validateStatus('done'), 'done');
  });

  it('trims whitespace before validation', () => {
    assert.equal(validateStatus('  todo  '), 'todo');
  });

  it('throws TypeError when status is an unknown string', () => {
    assert.throws(() => validateStatus('pending'), TypeError);
  });

  it('throws TypeError when status is not a string', () => {
    assert.throws(() => validateStatus(1), TypeError);
  });

  it('throws TypeError when status is null', () => {
    assert.throws(() => validateStatus(null), TypeError);
  });
});

// ---------------------------------------------------------------------------
// validatePriority
// ---------------------------------------------------------------------------

describe('validatePriority', () => {
  it('defaults to "medium" when priority is undefined', () => {
    assert.equal(validatePriority(undefined), 'medium');
  });

  it('returns normalized lowercase "low"', () => {
    assert.equal(validatePriority('LOW'), 'low');
  });

  it('returns normalized lowercase "medium"', () => {
    assert.equal(validatePriority('MEDIUM'), 'medium');
  });

  it('returns normalized lowercase "high"', () => {
    assert.equal(validatePriority('HIGH'), 'high');
  });

  it('trims whitespace before validation', () => {
    assert.equal(validatePriority('  high  '), 'high');
  });

  it('throws TypeError when priority is an unknown string', () => {
    assert.throws(() => validatePriority('critical'), TypeError);
  });

  it('throws TypeError when priority is not a string', () => {
    assert.throws(() => validatePriority(true), TypeError);
  });

  it('throws TypeError when priority is null', () => {
    assert.throws(() => validatePriority(null), TypeError);
  });
});

// ---------------------------------------------------------------------------
// validateTaskId
// ---------------------------------------------------------------------------

describe('validateTaskId', () => {
  it('returns a valid UUID unchanged', () => {
    const id = 'de305d54-75b4-431b-adb2-eb6b9e546014';
    assert.equal(validateTaskId(id), id);
  });

  it('trims surrounding whitespace from an id', () => {
    assert.equal(validateTaskId(' task-123 '), 'task-123');
  });

  it('throws TypeError when id is not a string', () => {
    assert.throws(() => validateTaskId(99), TypeError);
  });

  it('throws TypeError when id is undefined', () => {
    assert.throws(() => validateTaskId(undefined), TypeError);
  });

  it('throws TypeError when id is null', () => {
    assert.throws(() => validateTaskId(null), TypeError);
  });

  it('throws TypeError when id is an empty string', () => {
    assert.throws(() => validateTaskId(''), TypeError);
  });

  it('throws TypeError when id is a blank string after trimming', () => {
    assert.throws(() => validateTaskId('   '), TypeError);
  });
});

// ---------------------------------------------------------------------------
// validateTaskUpdates
// ---------------------------------------------------------------------------

describe('validateTaskUpdates', () => {
  it('normalizes a valid title in an updates object', () => {
    const result = validateTaskUpdates({ title: '  Refine backlog  ' });
    assert.equal(result.title, 'Refine backlog');
  });

  it('normalizes a valid priority in an updates object', () => {
    const result = validateTaskUpdates({ priority: 'LOW' });
    assert.equal(result.priority, 'low');
  });

  it('normalizes a valid status in an updates object', () => {
    const result = validateTaskUpdates({ status: 'DONE' });
    assert.equal(result.status, 'done');
  });

  it('normalizes description in an updates object', () => {
    const result = validateTaskUpdates({ description: '  Add acceptance criteria  ' });
    assert.equal(result.description, 'Add acceptance criteria');
  });

  it('handles multiple fields simultaneously', () => {
    const result = validateTaskUpdates({ title: 'New title', status: 'done', priority: 'high' });
    assert.deepEqual(result, { title: 'New title', status: 'done', priority: 'high' });
  });

  it('ignores unrecognized fields in the updates object', () => {
    const result = validateTaskUpdates({ title: 'Clean up', unknown: 'ignored' });
    assert.ok(!Object.hasOwn(result, 'unknown'));
  });

  it('throws TypeError when updates is an empty object', () => {
    assert.throws(() => validateTaskUpdates({}), TypeError);
  });

  it('throws TypeError when updates is null', () => {
    assert.throws(() => validateTaskUpdates(null), TypeError);
  });

  it('throws TypeError when updates is an array', () => {
    assert.throws(() => validateTaskUpdates([]), TypeError);
  });

  it('throws TypeError when updates is not an object', () => {
    assert.throws(() => validateTaskUpdates('title'), TypeError);
  });

  it('throws TypeError when only unrecognized fields are provided', () => {
    assert.throws(() => validateTaskUpdates({ foo: 'bar' }), TypeError);
  });

  it('throws TypeError for an invalid nested title value', () => {
    assert.throws(() => validateTaskUpdates({ title: '' }), TypeError);
  });

  it('throws TypeError for an invalid nested status value', () => {
    assert.throws(() => validateTaskUpdates({ status: 'unknown' }), TypeError);
  });
});
