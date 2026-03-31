import http from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  createTask,
  deleteTask,
  filterTasksByCategory,
  getTaskById,
  listTasks,
  updateTask
} from './services/taskService.js';
import { validateTitle, validatePriority, validateStatus, validateCategory } from './utils/validators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let server = null;

/**
 * Parses JSON from request body.
 *
 * @param {object} req - HTTP request object.
 * @returns {Promise<object>} Parsed JSON body.
 */
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON in request body'));
      }
    });
  });
}

/**
 * Sends a JSON response.
 *
 * @param {object} res - HTTP response object.
 * @param {number} statusCode - HTTP status code.
 * @param {object} data - Response data.
 */
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

/**
 * Sends an HTML response.
 *
 * @param {object} res - HTTP response object.
 * @param {string} html - HTML content.
 */
function sendHTML(res, html) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

/**
 * Handles GET /api/tasks - list tasks with optional filters.
 *
 * @param {object} req - HTTP request object.
 * @param {object} res - HTTP response object.
 * @param {string} query - Query string.
 */
function handleGetTasks(req, res, query) {
  try {
    const params = new URLSearchParams(query);
    const status = params.get('status');
    const priority = params.get('priority');
    const category = params.get('category');

    let results = listTasks();

    if (status) {
      const normalizedStatus = validateStatus(status);
      results = results.filter((task) => task.status === normalizedStatus);
    }

    if (priority) {
      const normalizedPriority = validatePriority(priority);
      results = results.filter((task) => task.priority === normalizedPriority);
    }

    if (category) {
      const normalizedCategory = validateCategory(category);
      results = results.filter((task) => task.category === normalizedCategory);
    }

    sendJSON(res, 200, results);
  } catch (error) {
    sendJSON(res, 400, { error: error.message, statusCode: 400 });
  }
}

/**
 * Handles POST /api/tasks - create a new task.
 *
 * @param {object} req - HTTP request object.
 * @param {object} res - HTTP response object.
 */
async function handleCreateTask(req, res) {
  try {
    const body = await parseRequestBody(req);

    const task = createTask({
      title: body.title,
      description: body.description,
      priority: body.priority,
      category: body.category
    });

    sendJSON(res, 201, task);
  } catch (error) {
    sendJSON(res, 400, { error: error.message, statusCode: 400 });
  }
}

/**
 * Handles GET /api/tasks/:id - get a single task.
 *
 * @param {object} req - HTTP request object.
 * @param {object} res - HTTP response object.
 * @param {string} id - Task ID.
 */
function handleGetTask(req, res, id) {
  try {
    const task = getTaskById(id);
    sendJSON(res, 200, task);
  } catch (error) {
    sendJSON(res, 404, { error: error.message, statusCode: 404 });
  }
}

/**
 * Handles PUT /api/tasks/:id - update an existing task.
 *
 * @param {object} req - HTTP request object.
 * @param {object} res - HTTP response object.
 * @param {string} id - Task ID.
 */
async function handleUpdateTask(req, res, id) {
  try {
    const body = await parseRequestBody(req);
    const updates = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.status !== undefined) updates.status = body.status;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.category !== undefined) updates.category = body.category;

    const task = updateTask(id, updates);
    sendJSON(res, 200, task);
  } catch (error) {
    if (error.message.includes('not found')) {
      sendJSON(res, 404, { error: error.message, statusCode: 404 });
    } else {
      sendJSON(res, 400, { error: error.message, statusCode: 400 });
    }
  }
}

/**
 * Handles DELETE /api/tasks/:id - delete an existing task.
 *
 * @param {object} req - HTTP request object.
 * @param {object} res - HTTP response object.
 * @param {string} id - Task ID.
 */
function handleDeleteTask(req, res, id) {
  try {
    deleteTask(id);
    sendJSON(res, 200, { message: 'Task deleted' });
  } catch (error) {
    sendJSON(res, 404, { error: error.message, statusCode: 404 });
  }
}

/**
 * Handles GET / - serve the web UI.
 *
 * @param {object} req - HTTP request object.
 * @param {object} res - HTTP response object.
 */
function handleGetUI(req, res) {
  try {
    const uiPath = join(__dirname, 'public', 'index.html');
    const html = readFileSync(uiPath, 'utf8');
    sendHTML(res, html);
  } catch (error) {
    sendHTML(res, `<h1>Error loading UI</h1><p>${error.message}</p>`);
  }
}

/**
 * Request handler for the HTTP server.
 *
 * @param {object} req - HTTP request object.
 * @param {object} res - HTTP response object.
 */
async function requestHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const query = url.search.slice(1);

  try {
    // GET /
    if (pathname === '/' && req.method === 'GET') {
      handleGetUI(req, res);
      return;
    }

    // GET /api/tasks
    if (pathname === '/api/tasks' && req.method === 'GET') {
      handleGetTasks(req, res, query);
      return;
    }

    // POST /api/tasks
    if (pathname === '/api/tasks' && req.method === 'POST') {
      await handleCreateTask(req, res);
      return;
    }

    // GET /api/tasks/:id
    const getTaskMatch = pathname.match(/^\/api\/tasks\/(.+)$/);
    if (getTaskMatch && req.method === 'GET') {
      handleGetTask(req, res, getTaskMatch[1]);
      return;
    }

    // PUT /api/tasks/:id
    const updateTaskMatch = pathname.match(/^\/api\/tasks\/(.+)$/);
    if (updateTaskMatch && req.method === 'PUT') {
      await handleUpdateTask(req, res, updateTaskMatch[1]);
      return;
    }

    // DELETE /api/tasks/:id
    const deleteTaskMatch = pathname.match(/^\/api\/tasks\/(.+)$/);
    if (deleteTaskMatch && req.method === 'DELETE') {
      handleDeleteTask(req, res, deleteTaskMatch[1]);
      return;
    }

    // 404
    sendJSON(res, 404, { error: 'Not found', statusCode: 404 });
  } catch (error) {
    console.error('Server error:', error);
    sendJSON(res, 500, { error: 'Internal server error', statusCode: 500 });
  }
}

/**
 * Starts the HTTP server.
 *
 * @param {number} port - Port number to listen on.
 * @returns {Promise<void>}
 */
export function startServer(port = 3000) {
  return new Promise((resolve, reject) => {
    server = http.createServer(requestHandler);
    server.listen(port, () => {
      console.log(`Task Manager server running at http://localhost:${port}`);
      resolve();
    });
    server.on('error', reject);
  });
}

/**
 * Stops the HTTP server.
 *
 * @returns {Promise<void>}
 */
export function stopServer() {
  return new Promise((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
