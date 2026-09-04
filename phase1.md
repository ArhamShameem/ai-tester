PHASE 2 — PROJECT DASHBOARD

Phase 1 is completed and working.

Now implement ONLY Phase 2.

Before making changes, inspect the existing frontend and backend to understand the Phase 1 implementation. Do not rewrite working authentication code.

==================================================
GOAL
==================================================

Build a professional project dashboard for the AI Tester Platform.

The dashboard should use the EXISTING backend Project APIs:

POST   /api/projects
GET    /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id

Do not create duplicate project APIs.

==================================================
DASHBOARD
==================================================

Create:

/dashboard

The dashboard should:

- fetch the authenticated user's projects
- display projects in a clean card/grid layout
- provide a "Create Project" action
- show loading state
- show empty state when there are no projects
- show API error state
- allow opening a project
- allow deleting a project

Each project card should display:

- project name
- application URL
- created date
- test case count if available
- latest test run status if available

Do NOT use fake test case counts or fake run statuses.

If the current Project API does not return these values, do not invent them.

Instead, keep the UI ready for these fields to be added later.

==================================================
CREATE PROJECT
==================================================

Add a create-project modal/page/form.

Fields:

name
URL

Validation should happen on the frontend for good UX.

Backend validation remains the source of truth.

Use the existing:

POST /api/projects

After successful creation:

- close the modal/form
- refresh project list
- show appropriate feedback

Handle API errors properly.

==================================================
PROJECT DETAILS
==================================================

Create:

/projects/[projectId]

When opened:

GET /api/projects/:id

Display:

Project name
Project URL
Created date

Create a developer-tool style layout with sections/tabs:

Overview
Test Cases
Test Runs
Settings

For now:

Overview:
- project information
- "Analyze Application" placeholder/action area
- project statistics section

Test Cases:
- empty state
- explain that AI-generated test cases will appear here in a future phase

Test Runs:
- empty state
- explain that test execution will appear here in a future phase

Settings:
- project name
- project URL
- edit project
- delete project

Do NOT implement Playwright or AI yet.

==================================================
EDIT PROJECT
==================================================

Use:

PATCH /api/projects/:id

Allow changing:

- project name
- URL

After update:

- update UI immediately or refetch
- show success/error feedback

==================================================
DELETE PROJECT
==================================================

Use:

DELETE /api/projects/:id

Before deletion:

show a confirmation dialog.

After successful deletion:

redirect to:

/dashboard

Do not allow accidental deletion.

==================================================
API CLIENT
==================================================

Use the API abstraction created in Phase 1.

Do NOT write fetch logic repeatedly inside every component.

Create reusable functions such as:

getProjects()
getProject(id)
createProject(data)
updateProject(id, data)
deleteProject(id)

All authenticated requests must continue using:

credentials: "include"

Do not use localStorage for authentication.

==================================================
TYPES
==================================================

Create/reuse proper TypeScript types.

For example:

Project

Do not use:

any

unless absolutely unavoidable.

Keep API response types explicit.

==================================================
UI/UX
==================================================

Make the UI look like a modern developer tool.

Think:

GitHub
Vercel
Playwright dashboards
CI/CD platforms

Use:

- responsive layout
- cards
- buttons
- dialogs
- badges
- tabs
- skeleton/loading states
- empty states
- error states

Use shadcn/ui components if already installed.

Do not add a large UI library unnecessarily.

==================================================
IMPORTANT
==================================================

Do NOT implement:

- Playwright
- Ollama
- AI test generation
- Redis
- BullMQ
- test execution
- GitHub integration

Those belong to later phases.

==================================================
QUALITY CHECK
==================================================

After implementation:

1. Run frontend typecheck/build.
2. Fix all TypeScript errors.
3. Verify authentication still works.
4. Verify project CRUD from the UI.
5. Verify unauthorized users cannot access project data.
6. Verify deleting a project redirects correctly.
7. Ensure no fake/mock project data is used.

At the end report:

- files created/modified
- APIs used
- commands/tests run
- current functionality
- any issues remaining

STOP after completing Phase 2.
