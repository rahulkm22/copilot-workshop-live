import chalk from 'chalk';

const STATUS_STYLES = {
  done: chalk.green,
  'in-progress': chalk.yellow,
  todo: chalk.red
};

const PRIORITY_STYLES = {
  high: chalk.bold.red,
  medium: chalk.bold.yellow,
  low: chalk.dim
};

/**
 * Returns a chalk-styled task status string.
 *
 * @param {'todo'|'in-progress'|'done'} status - Task status value.
 * @returns {string} Styled status text.
 * @throws {TypeError} When status is not a supported string value.
 * @example
 * colorStatus('done');
 * // '\u001b[32mdone\u001b[39m'
 * @example
 * colorStatus('todo');
 * // '\u001b[31mtodo\u001b[39m'
 */
export function colorStatus(status) {
  if (typeof status !== 'string') {
    throw new TypeError('Invalid status: expected a string.');
  }

  const normalizedStatus = status.trim().toLowerCase();
  const style = STATUS_STYLES[normalizedStatus];

  if (!style) {
    throw new TypeError('Invalid status: must be todo, in-progress, or done.');
  }

  return style(normalizedStatus);
}

/**
 * Returns a chalk-styled task priority string.
 *
 * @param {'low'|'medium'|'high'} priority - Task priority value.
 * @returns {string} Styled priority text.
 * @throws {TypeError} When priority is not a supported string value.
 * @example
 * colorPriority('high');
 * // '\u001b[1m\u001b[31mhigh\u001b[39m\u001b[22m'
 * @example
 * colorPriority('low');
 * // '\u001b[2mlow\u001b[22m'
 */
export function colorPriority(priority) {
  if (typeof priority !== 'string') {
    throw new TypeError('Invalid priority: expected a string.');
  }

  const normalizedPriority = priority.trim().toLowerCase();
  const style = PRIORITY_STYLES[normalizedPriority];

  if (!style) {
    throw new TypeError('Invalid priority: must be low, medium, or high.');
  }

  return style(normalizedPriority);
}