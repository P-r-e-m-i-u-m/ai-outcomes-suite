# Architecture

## Principles

- Product packages are independent.
- Shared package contains only common types and utilities.
- The CLI proves the MVP behavior without requiring a hosted backend.
- Mock AI is the default so contributors can run demos without API keys.

## Packages

### `packages/sat-tutor`

Stores question attempts in memory, calculates mastery, and creates a seven-day outcome plan. A production system would replace in-memory storage with a database and add adaptive question selection.

### `packages/compliance-os`

Stores AI compliance events and generates a report. A production system would add encrypted storage, retention policies, admin roles, and export formats.

### `packages/legal-agent`

Runs lightweight document classification and risk scanning. A production system would add OCR, jurisdiction-specific rules, attorney review, and user reminders.

## Production Backend Idea

- API: Next.js, Fastify, or NestJS.
- Database: Postgres.
- Jobs: queue for report generation and reminders.
- Storage: encrypted document storage.
- Auth: email magic link or organization SSO.
- Observability: structured logs and audit events.

