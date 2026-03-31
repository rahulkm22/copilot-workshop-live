import assert from 'assert';
import { startServer, stopServer } from '../src/server.js';
import {
  createTask,
  deleteTask,
  listTasks,
  filterTasksByCategory
} from '../src/services/taskService.js';

/**
 * Makes an HTTP request and returns the response.
 *
 * @param {string} method - HTTP method.
 * @param {string} path - Request path.
 * @param {object} data - Optional request body.
 * @returns {Promise<{status: number, body: object}>}
 */
async function request(method, path, data = null) {
  const url = `http://localhost:3001${path}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const body = response.status === 200 && response.headers.get('content-type')?.includes('text/html')
    ? await response.text()
    : await response.json();

  return { status: response.status, body };
}

let globalTaskId = null;

console.log('Starting server tests on port 3001...');

// Start server on port 3001 for testing
await startServer(3001);

// Give server a moment to start
await new Promise((resolve) => setTimeout(resolve, 100));

try {
  // Test GET / (serve web UI)
  assert.strictEqual(true, true, 'GET / - web UI test setup');
  {
    const result = await request('GET', '/');
    assert.strictEqual(result.status, 200, 'GET / - returns 200');
    assert(typeof result.body === 'string', 'GET / - returns HTML');
    assert(result.body.includes('Task Manager'), 'GET / - contains Task Manager title');
  }

  // Test POST /api/tasks (create task)
  {
    const result = await request('POST', '/api/tasks', {
      title: 'Test task',
      description: 'A test task',
      priority: 'high',
      category: 'testing'
    });
    assert.strictEqual(result.status, 201, 'POST /api/tasks - returns 201');
    assert(result.body.id, 'POST /api/tasks - returns task with id');
    assert.strictEqual(result.body.title, 'Test task', 'POST /api/tasks - title matches');
    assert.strictEqual(result.body.priority, 'high', 'POST /api/tasks - priority matches');
    assert.strictEqual(result.body.category, 'testing', 'POST /api/tasks - category matches');
    assert.strictEqual(result.body.status, 'todo', 'POST /api/tasks - status defaults to todo');
    globalTaskId = result.body.id;
  }

  // Test GET /api/tasks (list all tasks)
  {
    const result = await request('GET', '/api/tasks');
    assert.strictEqual(result.status, 200, 'GET /api/tasks - returns 200');
    assert(Array.isArray(result.body), 'GET /api/tasks - returns array');
    assert(result.body.length > 0, 'GET /api/tasks - returns at least one task');
  }

  // Test GET /api/tasks with status filter
  {
    const result = await request('GET', '/api/tasks?status=todo');
    assert.strictEqual(result.status, 200, 'GET /api/tasks?status=todo - returns 200');
    assert(Array.isArray(result.body), 'GET /api/tasks?status=todo - returns array');
    assert(result.body.every((t) => t.status === 'todo'), 'GET /api/tasks?status=todo - all filtered');
  }

  // Test GET /api/tasks with priority filter
  {
    const result = await request('GET', '/api/tasks?priority=high');
    assert.strictEqual(result.status, 200, 'GET /api/tasks?priority=high - returns 200');
    assert(Array.isArray(result.body), 'GET /api/tasks?priority=high - returns array');
    assert(result.body.every((t) => t.priority === 'high'), 'GET /api/tasks?priority=high - all filtered');
  }

  // Test GET /api/tasks with category filter
  {
    const result = await request('GET', '/api/tasks?category=testing');
    assert.strictEqual(result.status, 200, 'GET /api/tasks?category=testing - returns 200');
    assert(Array.isArray(result.body), 'GET /api/tasks?category=testing - returns array');
    assert(result.body.some((t) => t.category === 'testing'), 'GET /api/tasks?category=testing - matches');
  }

  // Test GET /api/tasks/:id (single task)
  {
    const result = await request('GET', `/api/tasks/${globalTaskId}`);
    assert.strictEqual(result.status, 200, 'GET /api/tasks/:id - returns 200');
    assert.strictEqual(result.body.id, globalTaskId, 'GET /api/tasks/:id - returns correct task');
  }

  // Test PUT /api/tasks/:id (update task)
  {
    const result = await request('PUT', `/api/tasks/${globalTaskId}`, {
      status: 'in-progress',
      priority: 'low',
      description: 'Updated description'
    });
    assert.strictEqual(result.status, 200, 'PUT /api/tasks/:id - returns 200');
    assert.strictEqual(result.body.status, 'in-progress', 'PUT /api/tasks/:id - status updated');
    assert.strictEqual(result.body.priority, 'low', 'PUT /api/tasks/:id - priority updated');
    assert.strictEqual(result.body.description, 'Updated description', 'PUT /api/tasks/:id - description updated');
  }

  // Test DELETE /api/tasks/:id (delete task)
  {
    const result = await request('DELETE', `/api/tasks/${globalTaskId}`);
    assert.strictEqual(result.status, 200, 'DELETE /api/tasks/:id - returns 200');
    assert(result.body.message, 'DELETE /api/tasks/:id - returns message');
  }

  // Test GET /api/tasks/:id after deletion (should return 404)
  {
    const result = await request('GET', `/api/tasks/${globalTaskId}`);
    assert.strictEqual(result.status, 404, 'GET /api/tasks/:id after delete - returns 404');
  }

  // Test POST with missing required field
  {
    const result = await request('POST', '/api/tasks', {
      description: 'No title provided'
    });
    assert.strictEqual(result.status, 400, 'POST /api/tasks without title - returns 400');
    assert(result.body.error, 'POST /api/tasks without title - returns error');
  }

  // Test PUT on non-existent task
  {
    const result = await request('PUT', '/api/tasks/task-invalid-id', {
      status: 'done'
    });
    assert.strictEqual(result.status, 404, 'PUT /api/tasks/:id non-existent - returns 404');
  }

  // Test 404 for unknown route
  {
    const result = await request('GET', '/unknown-route');
    assert.strictEqual(result.status, 404, 'GET /unknown-route - returns 404');
  }

  console.log('✅ All server tests passed!');
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exitCode = 1;
} finally {
  await stopServer();
}
