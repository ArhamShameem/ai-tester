You are working on an existing full-stack TypeScript project called "AI Tester Platform".

IMPORTANT:
Do NOT rewrite or replace the existing architecture.
First inspect the existing codebase and understand what is already implemented.
Preserve existing working functionality and follow the current coding style.

==================================================
PROJECT GOAL
==================================================

Build a mini TestSprite-inspired AI-powered testing platform.

The platform should allow a user to:

1. Register/login securely.
2. Create testing projects by providing an application URL.
3. Analyze the target web application using Playwright.
4. Use AI to understand the application and generate meaningful test cases.
5. Store generated test cases in PostgreSQL.
6. Execute those test cases using Playwright.
7. Run testing jobs asynchronously using Redis + BullMQ.
8. Store test run/results/screenshots/errors.
9. Use AI to analyze failed tests and provide:
   - probable root cause
   - explanation
   - suggested fix
   - confidence/reasoning
10. Display everything in a clean dashboard.
11. Eventually support GitHub integration/webhooks and CI execution.

The project should feel like a real production-style developer tool rather than a CRUD demo.

==================================================
CURRENT STACK
==================================================

Frontend:
- Next.js
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui where useful

Backend:
- Node.js
- Express
- TypeScript
- REST APIs

Database:
- PostgreSQL
- Supabase
- Prisma 6.19.0

Authentication:
- JWT
- bcrypt
- HttpOnly cookies

Validation:
- Zod

Browser automation/testing:
- Playwright

AI:
- Ollama initially
- Local LLM
- AI provider abstraction so another provider can be added later

Background jobs:
- Redis
- BullMQ

Deployment target:
- Vercel for frontend
- Render for backend
- Supabase for PostgreSQL
- Upstash Redis
- Ollama/Playwright worker can initially run locally if required

==================================================
CURRENTLY IMPLEMENTED
==================================================

The following functionality ALREADY EXISTS.

Backend structure:

backend/
  src/
    controllers/
    middleware/
    routes/
    services/
    lib/
    types/
    utils/
    app.ts
    server.ts

Existing functionality:

- Express server
- GET /api/health
- Prisma setup
- Supabase PostgreSQL connection
- Prisma migrations
- JWT authentication
- bcrypt password hashing
- HttpOnly JWT cookie
- login
- register
- logout
- GET /api/auth/me
- authentication middleware
- Zod validation
- centralized error handling
- Project CRUD
- project ownership authorization

Existing project APIs:

POST   /api/projects
GET    /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id

Current Prisma models include:

User
Project
TestCase
TestRun
TestResult

with these enums:

TestRunStatus:
- PENDING
- RUNNING
- COMPLETED
- FAILED

TestResultStatus:
- PASSED
- FAILED
- SKIPPED

Do not unnecessarily modify the existing schema.

==================================================
IMPORTANT EXISTING AUTH DESIGN
==================================================

JWT is NOT stored in the database.

JWT is generated during login/register and stored in an HttpOnly cookie.

Browser requests must send credentials.

Local development:

Frontend:
http://localhost:3000

Backend:
http://localhost:4000

Make sure backend uses port 4000 so it does not conflict with Next.js.

Backend CORS should allow:

http://localhost:3000

with:

credentials: true

Frontend fetch requests must use:

credentials: "include"

Do not move JWT into localStorage.

==================================================
HOW YOU SHOULD WORK
==================================================

Work incrementally.

DO NOT implement every feature in one giant change.

Implement the project in the following phases.

After each phase:

1. Inspect the implementation.
2. Run TypeScript/build checks.
3. Fix errors.
4. Explain what was implemented.
5. Clearly mention files changed.
6. Do not continue to the next major phase until the current phase is working.

Avoid unnecessary dependencies.

Prefer simple, maintainable production-style code.

Do not introduce complicated abstractions unless they solve a real problem.

==================================================
PHASE 1 — FRONTEND FOUNDATION
==================================================

Build the Next.js frontend.

Requirements:

- App Router
- TypeScript
- Tailwind
- Clean responsive UI
- reusable components
- API utility layer
- authentication state handling

Create:

/login
/register
/dashboard

The frontend should communicate with:

NEXT_PUBLIC_API_URL=http://localhost:4000

Create a centralized API client/helper.

It must automatically use:

credentials: "include"

for authenticated requests.

Implement:

register
login
logout
getCurrentUser

Handle:

- loading states
- API errors
- validation errors
- unauthorized state

Protected dashboard routes should redirect unauthenticated users to login.

Do not store JWT in localStorage.

==================================================
PHASE 2 — PROJECT DASHBOARD
==================================================

Build the dashboard around the existing Project APIs.

Dashboard should allow:

- create project
- list projects
- open project
- edit project
- delete project

Create project form:

name
URL

Show:

- project name
- URL
- created date
- number of test cases
- latest test run status if available

Project details page:

/projects/[projectId]

Design it like a developer testing platform.

Possible sections:

Overview
Test Cases
Test Runs
Settings

Do not add fake data.

Use actual backend data.

==================================================
PHASE 3 — DATABASE IMPROVEMENTS
==================================================

Inspect the current Prisma schema.

Only add fields/models if genuinely required by upcoming features.

Potential requirements:

Project analysis metadata
Test case source
AI generation metadata
Test execution metadata
Failure analysis
Browser artifacts

Prefer extending the existing schema instead of creating redundant models.

If schema changes are necessary:

- create a Prisma migration
- run Prisma generate
- ensure existing data remains compatible

Do not upgrade Prisma.

Keep:

Prisma 6.19.0

==================================================
PHASE 4 — PLAYWRIGHT APPLICATION ANALYZER
==================================================

This is one of the most important features.

When a user starts analysis for a project:

Backend should start a Playwright analysis job.

Given:

project.url

Playwright should open the website and inspect it.

Collect useful structured information such as:

- page title
- URL
- links
- buttons
- inputs
- forms
- headings
- navigation
- visible text
- interactive elements
- important selectors
- basic page structure
- available routes discovered through navigation where reasonable

Do NOT simply dump the entire HTML into the LLM.

Create a structured representation.

Example:

{
  "pages": [],
  "navigation": [],
  "forms": [],
  "buttons": [],
  "links": [],
  "inputs": [],
  "headings": []
}

The analyzer should be modular.

Create something similar to:

services/browser/
services/analyzer/

Do not put Playwright logic directly inside controllers.

Handle:

- navigation timeout
- invalid URL
- unreachable site
- browser errors
- authentication-required pages
- unexpected page crashes

Return useful errors.

==================================================
PHASE 5 — OLLAMA AI INTEGRATION
==================================================

Integrate Ollama through an AI provider abstraction.

Do NOT couple the entire application directly to Ollama.

Create an interface such as:

AIProvider

with operations conceptually like:

generateTestCases()
analyzeFailure()

Then create:

OllamaProvider

Ollama default endpoint:

http://localhost:11434/api

Use environment variables where appropriate.

Example:

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=<configured-model>

Do not hardcode a specific model throughout the application.

The provider should return structured JSON.

==================================================
PHASE 6 — AI TEST CASE GENERATION
==================================================

After Playwright analyzes a project:

Send the structured application representation to the AI.

Ask AI to generate meaningful functional test cases.

Tests should cover things such as:

- navigation
- forms
- validation
- buttons
- important user flows
- positive cases
- negative cases
- edge cases where detectable

Avoid generating meaningless tests such as:

"Check that the page loads."

unless that test is actually useful.

AI output MUST follow a strict structured format.

Example:

{
  "testCases": [
    {
      "title": "...",
      "description": "...",
      "steps": [
        {
          "action": "...",
          "target": "...",
          "value": "..."
        }
      ],
      "expectedResult": "..."
    }
  ]
}

Validate AI output with Zod.

Never blindly trust LLM output.

If parsing fails:

- capture the raw output
- return a useful error
- do not save malformed test cases

Persist valid test cases using Prisma.

==================================================
PHASE 7 — TEST CASE MANAGEMENT
==================================================

Project details page should display generated test cases.

User should be able to:

- view test case
- delete test case
- manually trigger execution
- eventually edit test case

Each test case should show:

title
description
steps
expected result
created date
latest execution status

Use real database records.

==================================================
PHASE 8 — PLAYWRIGHT TEST EXECUTION ENGINE
==================================================

Build an execution engine that takes a stored TestCase and executes it.

Important:

Do NOT generate arbitrary JavaScript from the LLM and execute it directly.

Use a controlled test action model.

For example:

actions:

navigate
click
fill
select
check
assertVisible
assertText
assertURL

Map those actions to Playwright APIs.

Example:

{
  "action": "click",
  "target": "Login"
}

should be translated by deterministic application code into Playwright operations.

Do not use eval().

Do not execute AI-generated arbitrary code.

The execution engine should capture:

- status
- duration
- error
- screenshot on failure
- useful logs

==================================================
PHASE 9 — REDIS + BULLMQ
==================================================

Testing should eventually run asynchronously.

Add:

Redis
BullMQ

Create queues such as:

test-execution
application-analysis
ai-analysis

Architecture:

API
 ↓
create job
 ↓
BullMQ
 ↓
worker
 ↓
Playwright
 ↓
database

The API should return a job/run ID rather than blocking the HTTP request.

Create a worker process separate from the Express API.

Example architecture:

backend/
  src/
    workers/
      test.worker.ts
      analysis.worker.ts

Workers should:

- update TestRun status
- execute tests
- save results
- handle failures
- handle retries safely

Avoid duplicate execution when jobs retry.

==================================================
PHASE 10 — TEST RUN RESULTS
==================================================

Create a proper test run experience.

When a run starts:

TestRun = PENDING

then:

RUNNING

then:

COMPLETED

or:

FAILED

Each run should contain TestResults.

Dashboard should show:

Total
Passed
Failed
Skipped
Duration

Individual test result:

- status
- duration
- error
- screenshot
- logs if available

Add a test run history page.

==================================================
PHASE 11 — AI FAILURE ANALYSIS
==================================================

This is a major differentiating feature.

When a test fails, send relevant information to AI:

- test case
- expected result
- executed action
- error message
- stack trace
- page URL
- screenshot metadata
- relevant logs

Ask AI to produce structured analysis.

Example:

{
  "rootCause": "...",
  "explanation": "...",
  "suggestedFix": "...",
  "confidence": 0.85
}

Validate the response with Zod.

Store failure analysis.

UI should show:

Root Cause
Why It Failed
Suggested Fix
Confidence

Do not claim AI findings are guaranteed facts.

Present them as analysis/hypotheses.

==================================================
PHASE 12 — SCREENSHOTS AND ARTIFACTS
==================================================

Design artifact storage so it can work locally and with Supabase Storage later.

Create an abstraction:

ArtifactStorage

Possible implementations:

LocalArtifactStorage
SupabaseArtifactStorage

For MVP local storage is acceptable.

Do not hardcode file-system operations throughout the application.

Screenshots should be associated with TestResult.

==================================================
PHASE 13 — GITHUB INTEGRATION
==================================================

After core testing works, add GitHub integration.

Allow a project to optionally connect to a GitHub repository.

Eventually support:

- repository connection
- webhook
- push event
- trigger test run
- test result status

Do not make GitHub integration required for normal project testing.

Keep it modular.

==================================================
PHASE 14 — CI/CD
==================================================

Add GitHub Actions.

CI should run:

- lint
- typecheck
- backend build
- frontend build
- tests where appropriate

Do not require Ollama for every CI build.

AI integration tests should be separable from normal CI.

==================================================
PHASE 15 — PRODUCTION READINESS
==================================================

Review the whole project.

Add:

- environment validation
- proper logging
- request validation
- rate limiting where appropriate
- secure cookie configuration
- production CORS configuration
- graceful shutdown
- worker error handling
- retry handling
- database error handling
- timeout handling
- Playwright cleanup
- no secrets committed to Git
- .env.example

Review all APIs for authorization issues.

A user must never be able to access another user's:

projects
test cases
test runs
test results
artifacts

Authorization must always be checked server-side.

==================================================
IMPORTANT SECURITY REQUIREMENTS
==================================================

Never:

- store JWT in localStorage
- expose JWT to frontend JavaScript
- use eval()
- execute arbitrary AI-generated JavaScript
- trust raw AI output
- expose database credentials
- expose Ollama secrets/config unnecessarily
- allow unrestricted filesystem access from user input

Validate:

- URLs
- project IDs
- test case IDs
- AI responses
- API payloads

Be careful with SSRF because users provide arbitrary application URLs.

For the browser analyzer:

- validate URLs
- restrict protocols to http/https
- avoid localhost/private-network access in production
- consider DNS/IP validation before production deployment
- implement timeouts

==================================================
CODE QUALITY
==================================================

Use:

- TypeScript strict mode
- async/await
- clear service/controller separation
- reusable utilities
- Zod validation
- Prisma transactions where appropriate
- meaningful error classes
- centralized error handling

Avoid:

- huge controllers
- business logic inside routes
- duplicated Prisma queries
- duplicated frontend API logic
- unnecessary state libraries
- unnecessary dependencies
- overengineering

==================================================
EXPECTED BACKEND STRUCTURE
==================================================

Aim toward something similar to:

backend/
  src/
    controllers/
      auth.controller.ts
      project.controller.ts
      test.controller.ts
      testRun.controller.ts

    services/
      auth.service.ts
      project.service.ts
      testCase.service.ts
      testRun.service.ts

      ai/
        ai.provider.ts
        ollama.provider.ts

      browser/
        browser.service.ts
        analyzer.service.ts
        executor.service.ts

      storage/
        artifact-storage.ts

    workers/
      analysis.worker.ts
      test.worker.ts

    queues/
      analysis.queue.ts
      test.queue.ts

    middleware/
      auth.middleware.ts
      validation.middleware.ts
      error.middleware.ts

    routes/
      auth.routes.ts
      project.routes.ts
      test.routes.ts
      testRun.routes.ts

    lib/
      prisma.ts
      redis.ts

    utils/

==================================================
EXPECTED FRONTEND STRUCTURE
==================================================

Aim toward:

frontend/
  app/
    login/
    register/
    dashboard/
    projects/
      [projectId]/

  components/
    auth/
    projects/
    tests/
    test-runs/
    ui/

  lib/
    api.ts
    auth.ts

  types/

Keep UI clean and professional.

Think of products such as:

- TestSprite
- Playwright dashboards
- GitHub Actions
- modern developer tools

as UX inspiration, but do NOT copy proprietary code/design.

==================================================
ENVIRONMENT VARIABLES
==================================================

Use .env.example files.

Backend example:

DATABASE_URL=
DIRECT_URL=
JWT_SECRET=

REDIS_URL=

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=

FRONTEND_URL=http://localhost:3000

Frontend:

NEXT_PUBLIC_API_URL=http://localhost:4000

Never commit actual secrets.

==================================================
LOCAL DEVELOPMENT
==================================================

The target local setup should eventually be:

Frontend:
localhost:3000

Backend:
localhost:4000

Ollama:
localhost:11434

Redis:
localhost:6379

PostgreSQL:
Supabase

Playwright:
runs inside worker process

The project should be runnable without paid services.

==================================================
VERY IMPORTANT DEVELOPMENT RULE
==================================================

Before implementing anything:

1. Inspect the repository.
2. Identify what already exists.
3. Do not recreate existing auth/project functionality.
4. Do not upgrade Prisma.
5. Do not replace working architecture.
6. Implement one phase at a time.
7. Run build/typecheck after changes.
8. Fix errors before moving forward.
9. Keep changes focused.
10. Explain architectural decisions briefly.

Start with:

PHASE 1 — FRONTEND FOUNDATION

First inspect the existing frontend and backend configuration.

Then implement the frontend authentication flow and backend/frontend port configuration.

Do not implement Playwright, Ollama, Redis, BullMQ, GitHub integration, or CI yet.

Stop after Phase 1 and report:

- files created/modified
- commands run
- current functionality
- any remaining issues
- how to test it locally