# Mira Habit Manager

A standalone React application containing only Mira's habits and completion-history experience. The existing backend, Mira frontend, expense manager, and food manager are not modified by this project.

## Existing backend contract

- `GET /api/habits?start=YYYY-MM-DD&end=YYYY-MM-DD`
- `POST /api/habits`
- `PUT /api/habits/:id`
- `PUT /api/habits/:id/completions/:date`
- `DELETE /api/habits/:id`

Habit colors remain six-digit hexadecimal strings because that format is required by the existing backend contract. Application styling uses semantic CSS tokens.

## Authentication integration

Authentication UI and Firebase are intentionally omitted. Register a token provider later without changing the habit API modules:

```js
import { configureAccessTokenProvider } from "./api/client";

configureAccessTokenProvider(async () => yourAuthSession.getAccessToken());
```

Without a provider, requests are sent without an `Authorization` header.

## Later setup

Install the declared packages only when you are ready to run the project. No dependency installation, build, preview, application execution, or test execution was performed while this source was created.

