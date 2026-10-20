# Agentic Coding Guardrails & Feature-Driven Workflow Blueprint

This guide details a step-by-step engineering framework for building applications using AI coding agents (such as Claude Code, Cursor, Aider, or Windsurf). By combining feature-by-feature incremental development with strict context boundaries and automated test guardrails, you can eliminate code drift, prevent uncontrolled dependencies, and maintain a production-grade codebase.

---

## 1. Core Philosophy: The Single-Responsibility Loop

Unrestricted AI agents tend to over-engineer solutions, refactor unrelated modules, or attempt to fix test failures by modifying application logic arbitrarily. To prevent this, development is divided into distinct, isolated phases with explicit permissions.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ 1. Minimal Scaffold│ ──> │ 2. Spec Feature │ ──> │ 3. Build Agent  │ ──> │ 4. Isolated Test│
│   & Governance  │     │    & Scope      │     │    (Code Only)  │     │    (Verify Only)│
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │                         │
                                                        └────── Fix Loop ─────────┘
                                                           (Pass stdout/stderr)
```

---

## 2. Phase 1: Base Foundation & Context Governance

Before triggering any feature request, establish a strict project scaffold and a governance rulebook.

### Step 1.1: Build the Minimal Runnable Base
Create a minimal, working skeleton manually or via a targeted initial prompt.
* Basic directory structure (`src/`, `tests/`, `config/`).
* Runnable entry point returning a healthy state (`200 OK` or basic log output).
* Dependency lockfiles (`package.json`, `Cargo.toml`, `requirements.txt`, or `go.mod`).

### Step 1.2: Establish the Context Rulebook
Place a root governance file (`.cursorrules`, `CLAUDE.md`, or `AGENT.md`). Every agent run must ingest these constraints.

```markdown
# AGENT GOVERNANCE & CONSTRAINTS

## Stack Specifications
- Environment: Node.js (v20 LTS) / TypeScript
- Primary Framework: Fastify
- Database & ORM: PostgreSQL + Prisma
- Test Runner: Vitest

## Hard Architectural Guardrails
1. NEVER modify database models without creating a explicit migration file.
2. NEVER install or import new third-party libraries without explicit human approval.
3. Keep single function lengths under 50 lines.
4. All async routes must include standardized error-handling blocks.

## Execution Rules
- Do NOT run general bash or system commands during test-driven phases.
- Do NOT rewrite or refactor files outside the explicitly scoped target files.
```

---

## 3. Phase 2: Atomic Feature Specification

Never issue open-ended instructions like *"Build user authentication and profile management."* Deconstruct requirements into small, deterministic specifications.

### Deconstructing Epics to Features
Break large features down into single-task deliverables:

| Broad Goal | Atomic Feature Units |
| :--- | :--- |
| **User Authentication** | **Feature 01:** Prisma User model & migration.<br>**Feature 02:** Password hashing utility & unit test.<br>**Feature 03:** Registration API endpoint (`POST /auth/register`).<br>**Feature 04:** JWT issuance & login endpoint (`POST /auth/login`). |

### Feature Specification Template (`docs/specs/feature-01.md`)
Create a brief markdown specification for each unit:

```markdown
# Feature Spec: User Registration Endpoint

## Objective
Expose `POST /auth/register` to accept JSON payload `{ email, password }` and return `{ id, email, createdAt }`.

## Input Validation
- `email`: Valid email format, required.
- `password`: String, minimum 8 characters, required.

## Edge Cases
- Duplicate email: Return HTTP status `409 Conflict`.
- Invalid payload: Return HTTP status `400 Bad Request`.

## Required Files
- Source: `src/routes/auth/register.ts`
- Test: `tests/routes/auth/register.test.ts`
```

---

## 4. Phase 3: The Builder-Evaluator Execution Loop

To keep agents disciplined, separate the **Builder Pass** (writing code) from the **Evaluator Pass** (verifying tests).

```
                      ┌─────────────────────────┐
                      │   Scoped Context Input  │
                      └────────────┬────────────┘
                                   │
                                   ▼
                      ┌─────────────────────────┐
                      │      BUILDER AGENT      │
                      │ Write Code + Test Specs │
                      └────────────┬────────────┘
                                   │
                                   ▼
                      ┌─────────────────────────┐
                      │     EVALUATOR AGENT     │
                      │ (Restricted Tool Access)│
                      │ Exec: `npm test` ONLY   │
                      └────────────┬────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
              [ Tests Pass ]               [ Tests Fail ]
                    │                             │
                    ▼                             ▼
         ┌───────────────────┐        ┌──────────────────────┐
         │ Commit Checkpoint │        │ Feed Test Failure    │
         │   `git commit`    │        │ Log Back to Builder  │
         └───────────────────┘        └──────────────────────┘
```

### Step 3.1: Scoped Builder Prompt
Feed the agent only the files relevant to the current feature:

> *"Read `docs/specs/feature-01.md` and `AGENT.md`. Write the route handler in `src/routes/auth/register.ts` and the test suite in `tests/routes/auth/register.test.ts`. Do not modify files outside these paths."*

### Step 3.2: Scoped Test Runner (Evaluator Guardrail)
Once the code is written, lock down permissions and switch to evaluation mode.

#### Tool-Level Restrictions (System Prompt for Evaluator)
```markdown
You are a strict QA Evaluation Agent.

PERMITTED ACTIONS:
- You may execute only the following bash command: `npm run test`
- You may read test execution logs.

PROHIBITED ACTIONS:
- Do NOT edit any application source files in `src/`.
- Do NOT edit test files in `tests/`.
- Do NOT execute git, npm install, or any system modifying commands.

Task: Run the test command and return a status report (PASS/FAIL) with relevant failure traces if applicable.
```

---

## 5. Phase 4: Automated Local Guardrail Hook

Instead of relying solely on the agent to self-report test runs, automate the verification using a git hook or local shell runner. This guarantees zero human or agent bias.

### Pre-Commit Test Enforcer Script (`.git/hooks/pre-commit` or custom shell script)

```bash
#!/bin/bash
# Local test verification hook for agentic feature checkpoints

echo "=== Running Automated Feature Verification Guardrail ==="

# 1. Run Linter
npm run lint
LINT_STATUS=$?

if [ $LINT_STATUS -ne 0 ]; then
  echo "❌ Linting failed. Halting commit."
  exit 1
fi

# 2. Run Targeted Tests
npm run test
TEST_STATUS=$?

if [ $TEST_STATUS -ne 0 ]; then
  echo "❌ Tests failed. Capture output and feed back to the Builder agent."
  exit 1
fi

echo "✅ All verification checks passed."
exit 0
```

---

## 6. Phase 5: Feedback Loops & Safety Checkpoints

### 1. Handling Failures Safely
When tests fail, capture **only** the terminal standard error output and pass it back to the builder:

> *"The application code failed execution during evaluation. Here is the stdout log:*
> ```text
> FAIL tests/routes/auth/register.test.ts
> Expected status code 409, received 500 at register.ts:32
> ```
> *Fix `src/routes/auth/register.ts` to handle duplicate database constraints correctly. Do not alter test expectations."*

### 2. Mandatory Git Micro-Commits
Once an atomic feature passes all checks, immediately capture a checkpoint:

```bash
git add src/routes/auth/register.ts tests/routes/auth/register.test.ts
git commit -m "feat(auth): add registration endpoint with passing unit tests"
```

> **Safety Guarantee:** If an agent degrades project state during subsequent features, execute `git reset --hard HEAD` to restore the last validated checkpoint without losing prior progress.

---

## Summary Matrix

| Objective | Guardrail Mechanism | Expected Outcome |
| :--- | :--- | :--- |
| Prevent architectural drift | Context configuration (`AGENT.md`) | Agent adheres to tech stack & structural conventions. |
| Avoid bloated prompts | Scoped context selection | Agent focuses only on targeted code files. |
| Stop arbitrary code edits during QA | Restricted Evaluator Prompt / Script Hooks | Agent cannot alter application logic to make tests pass artificially. |
| Protect stable state | Git Micro-Commits | Instant rollback capability if an agent hallucination occurs. |