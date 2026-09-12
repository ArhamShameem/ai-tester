# 🧪 AI Tester Platform

> **Autonomous, Agentic End-to-End Web Testing & AI Failure Diagnostics**  
> Inspired by TestSprite. Built with Next.js 15, TypeScript, Express, Playwright, Ollama, BullMQ, and Supabase.

---

## 🌟 Overview

**AI Tester Platform** is a full-stack, developer-first autonomous quality assurance platform designed to replace manual script writing and slow debugging cycles. 

By pairing **Playwright** browser crawling with **local LLMs (via Ollama)** and **Supabase**, the platform:
1. **Explores target web applications** to gather deep DOM telemetry, input states, buttons, links, and navigation routes.
2. **Synthesizes structured test suites** (happy path, edge cases, negative validation, authentication flows) validated against typed Zod schemas.
3. **Executes tests in headless Chromium** with auto-waiting, dynamic element recovery, and step trace capture.
4. **Captures failure artifacts & screenshots**, uploading them directly to **Supabase Storage**.
5. **Diagnoses failed tests with AI**, providing probable root cause analysis, plain-English explanations, and actionable code fixes.
6. **Visualizes live telemetry & reports** in a clean, TestSprite-inspired Next.js 15 web console.

---

## ⚡ Key Features

- 🔍 **Autonomous DOM Discovery & Web Crawling**: Playwright analyzes target URLs, extracting interactive elements, forms, accessibility landmarks, and route structures.
- 🧠 **AI-Powered Test Case Synthesis**: Generates structured, resilient test steps via Ollama models (`qwen3:4b`, `llama3.2`, `deepseek-r1`, etc.) without manual coding.
- 🚦 **Asynchronous Queue Engine**: Background workers powered by **BullMQ** and **Redis** handle browser automation and LLM inference outside the HTTP request lifecycle.
- 🛡️ **Self-Healing & Resilient Test Execution**: Built-in retry strategies, dynamic element matching, and robust auto-waiting against modern single-page applications (SPAs).
- 📸 **Cloud Artifact Storage**: Captures full-page screenshots upon test failures and securely uploads them to Supabase Storage with public CDN URLs and database persistence.
- 🔬 **Intelligent Root Cause Diagnostics**: Analyzes stack traces, DOM snapshots, and execution logs using AI to identify exactly why a test failed and how to remediate it.
- 🎨 **Modern TestSprite Light Aesthetic**: Thoughtfully styled UI featuring deep forest green accents (`#2e633f`), warm neutral backgrounds (`#f8faf7`), subtle sage borders (`#dce3da`), interactive animated grid backgrounds, and a profile dropdown.
- 🔐 **Secure JWT Authentication**: HTTP-only cookie-based authentication with bcrypt password hashing and user project scoping.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer"]
        UI["Next.js 15 App Router\n(Tailwind CSS + Lucide)"]
    end

    subgraph API ["Backend Layer (Express + TypeScript)"]
        Server["Express API Server (:4000)"]
        Auth["JWT & Cookie Auth"]
        Routes["REST Endpoints\n(/api/projects, /api/test-runs, etc.)"]
        Prisma["Prisma ORM 6.19"]
    end

    subgraph Queues ["Queue & Background Workers"]
        Redis[("Redis / Upstash\n(:6379)")]
        BullMQ["BullMQ Job Queues"]
        TestWorker["Test Execution Worker"]
        AIWorker["Failure Analysis Worker"]
    end

    subgraph External ["Automation & AI Engines"]
        PW["Playwright Headless Browser\n(Chromium)"]
        TargetApp["Target Web Application"]
        Ollama["Ollama Local LLM\n(:11434)"]
    end

    subgraph Cloud ["Supabase Cloud"]
        Postgres[("PostgreSQL Database")]
        Storage[("Supabase Storage\n(test-artifacts bucket)")]
    end

    %% Flow connections
    UI <-->|HTTP / JSON| Server
    Server --> Auth
    Server --> Routes
    Routes --> Prisma
    Prisma <--> Postgres

    Server -->|Enqueue Jobs| BullMQ
    BullMQ <--> Redis
    BullMQ --> TestWorker
    BullMQ --> AIWorker

    TestWorker -->|Automate| PW
    PW -->|Interact & Crawl| TargetApp
    PW -->|Upload Screenshots| Storage
    Storage -.->|CDN Public URL| Prisma

    AIWorker -->|Analyze Traces| Ollama
    Routes -->|Synthesize Tests| Ollama
    AIWorker -.->|Store Failure Diagnosis| Prisma
```

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | [Next.js 15 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) | High-performance dashboard, SSR & Client components |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Lucide Icons | Clean TestSprite-inspired design system (`#f8faf7`, `#2e633f`) |
| **Backend API** | [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/) + [TypeScript](https://www.typescriptlang.org/) | Type-safe RESTful API services |
| **Database & ORM** | [Supabase PostgreSQL](https://supabase.com/) + [Prisma 6.19](https://www.prisma.io/) | Relational persistence, schema migrations, type-safe queries |
| **Browser Automation** | [Playwright Core](https://playwright.dev/) | Headless DOM discovery, element telemetry, and test execution |
| **AI Inference** | [Ollama](https://ollama.ai/) (`qwen3:4b`, `llama3.2`, `deepseek-r1`) | Local LLM inference for test synthesis and failure root-cause diagnosis |
| **Job Queues** | [BullMQ](https://docs.bullmq.io/) + [Redis / ioredis](https://redis.io/) | Asynchronous, concurrent job processing and worker lifecycle |
| **Cloud Storage** | [Supabase Storage](https://supabase.com/storage) | Cloud storage for failure screenshots (`test-artifacts` bucket) |
| **Validation & Auth** | [Zod](https://zod.dev/) + [bcrypt](https://github.com/kelektiv/node.bcrypt.js) + [JWT](https://jwt.io/) | Request validation and secure HTTP-only cookie authentication |

---

## 📁 Repository Structure

```text
ai-tester-platform/
├── backend/                        # Express API & Worker Engine
│   ├── prisma/
│   │   └── schema.prisma           # Prisma schema (User, Project, TestCase, TestRun, TestResult)
│   ├── src/
│   │   ├── controllers/            # Route controllers (Auth, Project, Analysis, Test Cases, Runs)
│   │   ├── middleware/             # Auth guards, validation, and global error handling
│   │   ├── lib/                    # Prisma client, Redis client, BullMQ configuration
│   │   ├── queues/                 # BullMQ queue producers
│   │   ├── routes/                 # Express API routes
│   │   ├── schemas/                # Zod validation schemas
│   │   ├── services/
│   │   │   ├── ai/                 # Ollama provider, prompts, and failure triage logic
│   │   │   ├── browser/            # Playwright crawler & step execution engine
│   │   │   ├── storage/            # Supabase Storage & local disk artifact services
│   │   │   ├── auth.service.ts     # User registration, bcrypt hash, JWT signing
│   │   │   ├── project.service.ts  # Project management
│   │   │   ├── test-case.service.ts# Test generation & retrieval
│   │   │   └── test-execution.service.ts # Test run lifecycle orchestrator
│   │   ├── workers/                # BullMQ test runners and AI failure analysis workers
│   │   ├── app.ts                  # Express application setup, CORS, and middleware
│   │   └── server.ts               # HTTP server entry point
│   ├── .env.example                # Backend environment template
│   └── package.json
│
├── frontend/                       # Next.js 15 Web Application
│   ├── app/
│   │   ├── dashboard/              # Projects dashboard with quick stats & project cards
│   │   ├── login/                  # Authentication login page
│   │   ├── register/               # User registration page
│   │   ├── projects/[projectId]/   # Project overview, test cases, and test runs
│   │   │   └── runs/[runId]/       # Detailed test run view with step results & AI diagnosis
│   │   ├── layout.tsx              # Root layout with navbar and AuthProvider
│   │   └── page.tsx                # Landing page
│   ├── components/                 # UI components, modals, auth guards, animated grid
│   ├── context/                    # AuthContext (user session, login, logout)
│   ├── lib/                        # API client, fetch wrapper, and utilities
│   ├── .env.example                # Frontend environment template
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 📋 Prerequisites

Before setting up the platform, ensure you have the following installed on your machine:

1. **Node.js**: Version `18.18+` or `20.x+` ([Download Node.js](https://nodejs.org/))
2. **Git**: Version `2.x+`
3. **Redis**: Local server or managed service (e.g., [Upstash](https://upstash.com/) or Docker `docker run -p 6379:6379 redis:alpine`)
4. **Ollama**: Local AI runner ([Download Ollama](https://ollama.ai/))
5. **Supabase Account**: For PostgreSQL database and Storage ([Supabase](https://supabase.com/))

---

## ⚙️ Environment Configuration

### 1. Backend (`backend/.env`)

Create a `.env` file in the `backend/` directory by copying `backend/.env.example`:

```bash
cp backend/.env.example backend/.env
```

Configure the following variables:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Express API port | `4000` |
| `DATABASE_URL` | Supabase / PostgreSQL transaction pooler URL (PgBouncer) | `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Direct PostgreSQL connection string for Prisma migrations | `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | Secret string for signing authentication tokens | `your-secure-random-secret-key-32-chars` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `OLLAMA_BASE_URL` | Base URL where Ollama daemon is running | `http://localhost:11434` |
| `OLLAMA_MODEL` | Ollama model tag for synthesis and failure triage | `qwen3:4b` *(or `llama3.2`, `deepseek-r1`)* |
| `FRONTEND_URL` | URL of the frontend Next.js application | `http://localhost:3000` |
| `TEST_WORKER_CONCURRENCY` | Number of simultaneous browser test jobs per worker | `1` |
| `ALLOW_LOCAL_URLS` | Allow testing against `localhost` and internal IPs | `true` |
| `SUPABASE_URL` | Supabase project API URL | `https://[project-ref].supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role secret (with storage write access) | `eyJhbGciOi...` |
| `SUPABASE_STORAGE_BUCKET` | Supabase storage bucket name for screenshots | `test-artifacts` |

### 2. Frontend (`frontend/.env.local`)

Create a `.env.local` file in the `frontend/` directory:

```bash
cp frontend/.env.example frontend/.env.local
```

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL accessible from the browser | `http://localhost:4000` |

---

## 📦 Setup & Installation Guide

### Step 1: Clone the Repository
```bash
git clone https://github.com/ArhamShameem/ai-tester.git
cd ai-tester
```

---

### Step 2: Configure Supabase (Database & Storage)

1. **Database**:
   - Create a new project in [Supabase](https://supabase.com/).
   - Go to **Project Settings** -> **Database**.
   - Copy the **Connection String (URI)**:
     - Use the **Transaction Pooler** URL (port 6543) for `DATABASE_URL`.
     - Use the **Direct Connection** URL (port 5432) for `DIRECT_URL`.

2. **Storage Bucket**:
   - In your Supabase Dashboard, navigate to **Storage**.
   - Click **New Bucket**.
   - Name the bucket: `test-artifacts`.
   - Toggle **Public Bucket** to **ON** (so failure screenshots can be viewed in the dashboard).
   - Click **Save**.
   - Under **Project Settings** -> **API**, copy your `Project URL` and `service_role key` into `backend/.env`.

---

### Step 3: Setup Ollama (Local AI Model)

1. Install Ollama from [ollama.ai](https://ollama.ai/).
2. Pull your preferred model (e.g., `qwen3:4b` or `llama3.2`):
   ```bash
   ollama pull qwen3:4b
   ```
3. Start the Ollama server:
   ```bash
   ollama serve
   ```
4. Verify the server is running by visiting `http://localhost:11434/api/tags`.

---

### Step 4: Setup & Start the Backend

1. Navigate to `backend/` and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Install Playwright's Chromium browser engine:
   ```bash
   npx playwright install chromium
   ```

3. Synchronize your Prisma schema with your PostgreSQL database:
   ```bash
   npx prisma db push
   # Or run migrations:
   # npx prisma migrate dev
   ```

4. Start the Express API server (Development mode):
   ```bash
   npm run dev
   ```
   *The server will be available at `http://localhost:4000`.*

5. In a separate terminal, start the BullMQ background workers:
   ```bash
   cd backend
   npm run worker
   ```
   *The worker listens for test execution and AI failure analysis jobs.*

---

### Step 5: Setup & Start the Frontend

1. Navigate to `frontend/` and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:3000`.*

---

## 🚀 How to Use the Platform

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as Next.js Console
    participant Backend as Express API
    participant DB as PostgreSQL
    participant Worker as BullMQ Worker
    participant PW as Playwright Engine
    participant Ollama as Ollama LLM
    participant Storage as Supabase Storage

    User->>Frontend: 1. Sign up / Login
    Frontend->>Backend: POST /api/auth/login
    Backend-->>Frontend: Set HttpOnly JWT Cookie

    User->>Frontend: 2. Create Project (Target URL)
    Frontend->>Backend: POST /api/projects
    Backend->>DB: Save Project

    User->>Frontend: 3. Click "Analyze Application"
    Frontend->>Backend: POST /api/projects/:id/analyze
    Backend->>PW: Crawl DOM & Elements
    PW-->>Backend: Return DOM Telemetry
    Backend->>DB: Save ApplicationAnalysis

    User->>Frontend: 4. Click "Generate Test Cases"
    Frontend->>Backend: POST /api/projects/:id/test-cases/generate
    Backend->>Ollama: Prompt with DOM Telemetry
    Ollama-->>Backend: Synthesized Test Cases (JSON)
    Backend->>DB: Save TestCases

    User->>Frontend: 5. Click "Run Tests"
    Frontend->>Backend: POST /api/projects/:id/test-runs
    Backend->>Worker: Enqueue TestRun Job

    Worker->>PW: Execute Steps sequentially
    alt Step Fails
        PW->>Storage: Upload Failure Screenshot
        Storage-->>PW: Return Screenshot CDN URL
        Worker->>Ollama: Request Failure Diagnosis
        Ollama-->>Worker: Root Cause & Suggested Fix
    end
    Worker->>DB: Save TestResults & AI Diagnosis

    User->>Frontend: 6. View Results & AI Triage
    Frontend->>Backend: GET /api/test-runs/:id/results
    Backend-->>Frontend: Display Pass/Fail, Steps, Screenshot, & Fix
```

1. **Register & Log In**: Visit `http://localhost:3000/register` to create an account.
2. **Create a Project**: Click **+ New Project**, provide a title (e.g. `My Storefront`) and a URL (e.g., `https://demo.playwright.dev/todomvc`).
3. **Analyze Target**: Inside the project dashboard, click **Analyze Application** to let Playwright map the application's forms, buttons, and navigation hierarchy.
4. **Generate AI Test Cases**: Click **Generate Tests**, choose focus areas (Happy path, Form validation, Edge cases), and let Ollama synthesize tests.
5. **Execute Test Run**: Click **Run All Tests**. The BullMQ worker executes steps live using headless Chromium.
6. **Inspect Results & AI Root Cause**: Open the test run details to inspect passed/failed steps, failure screenshots, error logs, and the AI's step-by-step remediation guide.

---

## 📡 REST API Reference

All protected endpoints require a valid JWT cookie set via `/api/auth/login` or `/api/auth/register`.

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Login and receive an HTTP-only JWT cookie |
| `POST` | `/api/auth/logout` | Clear the JWT session cookie |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |

### Projects (`/api/projects`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/projects` | List all projects belonging to the user |
| `POST` | `/api/projects` | Create a new project (`name`, `url`) |
| `GET` | `/api/projects/:id` | Get project details by ID |
| `PATCH` | `/api/projects/:id` | Update project metadata |
| `DELETE` | `/api/projects/:id` | Delete project and cascade child records |

### Application Analysis (`/api/projects/:id`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/projects/:projectId/analyze` | Launch Playwright DOM crawler on project target URL |
| `GET` | `/api/projects/:projectId/analysis` | Fetch the latest DOM telemetry analysis |

### Test Cases (`/api/projects/:id/test-cases` & `/api/test-cases`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/projects/:projectId/test-cases/generate` | Synthesize new test cases using Ollama |
| `GET` | `/api/projects/:projectId/test-cases` | List all test cases for a project |
| `DELETE` | `/api/projects/:projectId/test-cases` | Clear all test cases for a project |
| `GET` | `/api/test-cases/:testCaseId` | Get single test case with steps |
| `DELETE` | `/api/test-cases/:testCaseId` | Delete a single test case |

### Test Runs & Results (`/api/projects/:id/test-runs` & `/api/test-runs`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/projects/:projectId/test-runs` | Trigger a new test run (enqueued to BullMQ) |
| `GET` | `/api/projects/:projectId/test-runs` | List test runs for a project |
| `GET` | `/api/test-runs/:testRunId` | Get status and overview of a test run |
| `GET` | `/api/test-runs/:testRunId/results` | Get detailed test results, failure triage, and screenshot URLs |
| `GET` | `/api/projects/:projectId/runs/:testRunId/artifacts/:filename` | Stream local artifact fallback |

---

## 🛠️ Troubleshooting & FAQs

### 1. Redis Connection Issues / BullMQ Warning
> `[WorkerEngine] Redis is not reachable. Workers will retry connection in background.`
- Ensure your Redis server is running:
  - Windows / macOS: Start your local Redis service or check Docker with `docker ps`.
  - Cloud: If using Upstash, verify the `REDIS_URL` in `backend/.env` is in `rediss://...` format.

### 2. Ollama Connection Refused (`fetch failed: ECONNREFUSED 127.0.0.1:11434`)
- Confirm Ollama is running:
  ```bash
  ollama serve
  ```
- Test connectivity in your browser or with curl:
  ```bash
  curl http://localhost:11434/api/tags
  ```
- Ensure the model specified in `backend/.env` (`OLLAMA_MODEL`) is pulled (`ollama pull qwen3:4b`).

### 3. Playwright Chromium Missing
> `Executable doesn't exist at C:\Users\...\AppData\Local\ms-playwright\chromium-...`
- Run the Playwright browser installation inside `backend/`:
  ```bash
  cd backend
  npx playwright install chromium
  ```

### 4. Supabase Storage Upload Failures (403 Forbidden)
- Ensure the bucket name in `backend/.env` matches exactly: `SUPABASE_STORAGE_BUCKET=test-artifacts`.
- Verify the bucket is marked **Public** in the Supabase Dashboard.
- Use the **`service_role` key** (not the public anon key) in `SUPABASE_SERVICE_ROLE_KEY` to grant server-side upload permissions.

### 5. Testing Localhost or Private IPs
- By default, internal IPs are guarded. To test local web applications running on your machine (e.g. `http://localhost:8080`), set `ALLOW_LOCAL_URLS=true` in `backend/.env`.

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">
  <sub>Built with ❤️ for autonomous software testing & AI reliability.</sub>
</div>
