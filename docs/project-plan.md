# Task Manager CLI Application - Project Plan

## Project Overview

The Task Manager CLI is a command-line application built with Node.js that allows users to efficiently manage their tasks through a simple, intuitive interface. Users can create, list, update, and delete tasks with rich metadata including priority levels, status tracking, and timestamps. The application stores all tasks in memory, making it fast and responsive while maintaining a clean, minimal architecture without external dependencies.

## User Stories

1. **Add a new task**
   - As a user, I want to create a new task with a title and description
   - Acceptance criteria:
     - Command syntax: `task add "title" "description"`
     - Task is created with status=todo and priority=medium by default
     - Task receives an auto-generated ID, createdAt timestamp, and updatedAt timestamp
     - Success message displays the new task with its ID

2. **List all tasks**
   - As a user, I want to view all my tasks at once
   - Acceptance criteria:
     - Command: `task list` displays all tasks in a formatted table or list
     - Output shows: ID, title, description, status, priority, createdAt, updatedAt
     - Tasks are sorted by creation date (newest first) by default
     - Empty state shows helpful message when no tasks exist

3. **Filter tasks by status**
   - As a user, I want to see only tasks with a specific status
   - Acceptance criteria:
     - Command: `task list --status todo|in-progress|done`
     - Only tasks matching the specified status are displayed
     - Filter works in combination with other view operations

4. **Filter tasks by priority**
   - As a user, I want to see only tasks with a specific priority
   - Acceptance criteria:
     - Command: `task list --priority low|medium|high`
     - Only tasks matching the specified priority are displayed
     - Filter works in combination with other view operations

5. **Sort tasks by priority**
   - As a user, I want to sort tasks by priority to see urgent tasks first
   - Acceptance criteria:
     - Command: `task list --sort priority`
     - Tasks are displayed in order: high → medium → low
     - Works alongside filters

6. **Sort tasks by creation date**
   - As a user, I want to sort tasks chronologically
   - Acceptance criteria:
     - Command: `task list --sort date` (or default behavior)
     - Tasks display newest first
     - Works alongside filters

7. **Update a task**
   - As a user, I want to modify task properties
   - Acceptance criteria:
     - Command: `task update <id> --title "new title"` (and/or status, priority, description)
     - At least one property must be specified
     - updatedAt timestamp is refreshed
     - Confirmation message shows updated task

8. **Mark task as complete**
   - As a user, I want to quickly mark a task as done
   - Acceptance criteria:
     - Command: `task done <id>`
     - Task status changes to "done"
     - updatedAt timestamp is updated
     - Success message confirms completion

9. **Delete a task**
   - As a user, I want to remove a task
   - Acceptance criteria:
     - Command: `task delete <id>`
     - Task is removed from the list
     - Confirmation message shows which task was deleted
     - Error shown if ID doesn't exist

10. **View help**
    - As a user, I want to understand how to use the application
    - Acceptance criteria:
      - Command: `task help` or `task --help`
      - Displays overview of all available commands with syntax
      - Examples are provided for common operations

11. **Assign a category to a task**
    - As a user, I want to organize tasks by category (e.g., "work", "personal", "urgent")
    - Acceptance criteria:
      - Command: `task add "title" "description" --category "work"`
      - Category is optional and defaults to "general" if not specified
      - Category value is a string with no predefined enum list
      - Task is created with the assigned category
      - Success message displays the category assigned to the task

12. **Filter tasks by category**
    - As a user, I want to view only tasks in a specific category
    - Acceptance criteria:
      - Command: `task list --category "work"`
      - Only tasks matching the specified category are displayed
      - Filter works in combination with status and priority filters
      - Works alongside sorting options

## Data Model

### Task Entity

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| id | string | Unique identifier (UUID or timestamp-based) | "task-1711900800000" |
| title | string | Task name/summary | "Review PR #42" |
| description | string | Detailed task information | "Check code quality and test coverage" |
| status | enum | Current state of task | "todo", "in-progress", "done" |
| priority | enum | Task urgency level | "low", "medium", "high" |
| category | string | Optional task category for organization | "work", "personal", "urgent" |
| createdAt | number | Unix timestamp of creation | 1711900800000 |
| updatedAt | number | Unix timestamp of last modification | 1711900800000 |

**Category Property Details:**
- **Optional:** Yes (defaults to "general" if not specified)
- **Type:** String
- **Format:** Free-form string, user-defined (no predefined enum)
- **Default value:** "general"
- **Length:** 1-50 characters recommended
- **Use cases:** "work", "personal", "urgent", "shopping", "health", etc.

## File Structure

```
src/
├── index.js                 # CLI entry point and command handler
├── commands/
│   ├── add.js              # Add command implementation
│   ├── list.js             # List command with filtering/sorting
│   ├── update.js           # Update command implementation
│   ├── delete.js           # Delete command implementation
│   └── help.js             # Help command implementation
├── models/
│   └── Task.js             # Task class and validation
├── store/
│   └── TaskStore.js        # In-memory task storage and queries
└── utils/
    ├── parser.js           # Command-line argument parser
    ├── formatter.js        # Output formatting and display
    └── validators.js       # Input validation functions
```

## Implementation Phases

### Phase 1: Foundation & Core Operations (Milestone 1)
**Objective:** Build the basic CLI structure and in-memory storage
- [ ] Set up Node.js project with entry point (index.js)
- [ ] Implement Task class with validation
- [ ] Create TaskStore for in-memory storage (CRUD operations)
- [ ] Build command-line argument parser
- [ ] Implement basic output formatter
- [ ] Create `task add` command
- [ ] Create `task list` command (basic, no filters/sorts)

**Deliverable:** Users can add and list tasks

### Phase 2: Advanced Viewing & Filtering (Milestone 2)
**Objective:** Enable users to filter and sort tasks flexibly
- [ ] Implement `--status` filter
- [ ] Implement `--priority` filter
- [ ] Combine multiple filters
- [ ] Implement `--sort date` functionality
- [ ] Implement `--sort priority` functionality
- [ ] Improve table formatting and readability
- [ ] Add empty-state messaging

**Deliverable:** Users can organize and view tasks by multiple criteria

### Phase 3: Task Management (Milestone 3)
**Objective:** Complete full CRUD operations and workflow
- [ ] Implement `task update` command with property flags
- [ ] Implement `task done` command for quick status updates
- [ ] Implement `task delete` command
- [ ] Add confirmation/success messages
- [ ] Add error handling for invalid IDs and inputs
- [ ] Implement `task help` command

**Deliverable:** Users have complete task lifecycle management

### Phase 4: Polish & Documentation (Milestone 4)
**Objective:** Ensure code quality, usability, and documentation
- [ ] Add comprehensive error messages
- [ ] Add edge case handling (empty inputs, invalid formats)
- [ ] Create user-facing README with examples
- [ ] Add inline code comments and JSDoc
- [ ] Test all command combinations
- [ ] Validate with Node.js 20+ without external dependencies

**Deliverable:** Production-ready CLI with full documentation

## Error Handling Conventions and Input Validation Rules

### Input Validation Rules

#### Task Title
- **Required:** Yes
- **Type:** String
- **Length:** 1-100 characters
- **Constraints:** Cannot be empty, leading/trailing whitespace trimmed
- **Error message:** `"Error: Task title is required and must be between 1-100 characters"`

#### Task Description
- **Required:** No (optional)
- **Type:** String
- **Length:** 0-500 characters
- **Constraints:** If provided, max 500 characters
- **Error message:** `"Error: Task description cannot exceed 500 characters"`

#### Task ID
- **Required:** Yes (for update/delete/done operations)
- **Type:** String
- **Constraints:** Must reference an existing task; format "task-TIMESTAMP"
- **Error message:** `"Error: Task with ID '{id}' not found"`

#### Task Priority
- **Required:** No (defaults to "medium")
- **Type:** Enum
- **Allowed values:** "low", "medium", "high" (case-insensitive)
- **Error message:** `"Error: Priority must be one of: low, medium, high"`

#### Task Status
- **Required:** No (defaults to "todo")
- **Type:** Enum
- **Allowed values:** "todo", "in-progress", "done" (case-insensitive)
- **Error message:** `"Error: Status must be one of: todo, in-progress, done"`

#### Task Category
- **Required:** No (defaults to "general")
- **Type:** String
- **Length:** 1-50 characters
- **Constraints:** Free-form string, user-defined; leading/trailing whitespace trimmed
- **Error message:** `"Error: Category must be between 1-50 characters"`

#### Filter/Sort Parameters
- **Filter values:** Must match valid enum values for status/priority
- **Sort values:** "date" or "priority" only
- **Error message:** `"Error: Invalid filter or sort parameter: '{value}'"`

### Error Handling Patterns

#### Pattern 1: Validation Failure
```
User input → Validate → Fail → Display error message → Exit with code 1
```

#### Pattern 2: Operation Success
```
Valid input → Execute operation → Display success message → Exit with code 0
```

#### Pattern 3: Invalid Command
```
Unknown command → Display error → Show help hint → Exit with code 1
```

#### Pattern 4: Missing Required Argument
```
Incomplete command → Parse fails → Display usage → Exit with code 1
```

### Error Message Format

All error messages follow this pattern:
```
"Error: [specific error description]"
```

All success messages follow this pattern:
```
"✓ [action completed]: [details]"
```

### Validation Strategy

1. **Early validation:** Validate all inputs before any data mutations
2. **Fail-fast:** Return first error encountered, don't accumulate errors
3. **Helpful messages:** Include the invalid value and allowed options
4. **Consistent naming:** Use consistent terminology in all messages
5. **User-friendly:** Avoid technical jargon in error messages

### Number Handling

- **Task ID:** Auto-generated from `Date.now()` as `"task-" + timestamp`
- **Timestamps:** Stored as Unix milliseconds (number type)
- **Priority levels:** Sorted numerically (high=3, medium=2, low=1) internally
- **No user input for ID or timestamp:** Users never directly provide these values

## Technical Constraints

- **Node.js version:** 20+
- **Dependencies:** None (only built-in modules)
- **Storage:** In-memory only (data lost on process exit)
- **Platform compatibility:** Cross-platform (Windows, macOS, Linux)
- **CLI pattern:** Command-based (e.g., `task add`, `task list`)

## Success Criteria

- All user stories have been implemented and tested
- No external dependencies are used
- Code is documented and maintainable
- Help documentation is clear and accurate
- Application handles errors gracefully with helpful messages
- All commands work as specified in their acceptance criteria
