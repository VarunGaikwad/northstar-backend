# Northstar Backend

Express + TypeScript + Prisma + NeonDB starter with authentication.

## Folder structure

```
src/
├── config/           # Environment variable validation
├── db/               # Prisma client setup
├── middleware/       # Express middleware (validation, errors)
├── modules/          # Domain modules (auth, users, ...)
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.service.ts
│   │   ├── auth.types.ts
│   │   └── auth.validation.ts
│   └── users/
│       ├── user.service.ts
│       ├── users.controller.ts
│       └── users.routes.ts
├── utils/            # Reusable helpers (hash, jwt, email, errors)
└── index.ts          # App entry point
```

When adding a new domain, create a folder under `src/modules/` with `*.routes.ts`, `*.controller.ts`, `*.service.ts`, and optional `*.validation.ts` / `*.types.ts`. Mount the router in `src/index.ts`.

## Auth endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in and receive a JWT |
| POST | `/api/auth/forgot-password` | Request a password reset link |
| POST | `/api/auth/reset-password` | Set a new password with a reset token |

Use the `authenticate` middleware (`src/middleware/auth.ts`) to protect routes:

```ts
import { authenticate } from "../middleware/auth";

router.get("/me", authenticate, getCurrentUser);
```

### Example requests

Register:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPass1!","firstName":"Jane","lastName":"Doe"}'
```

Login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPass1!"}'
```

Forgot password:

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

Reset password:

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"...","password":"NewStrongPass1!"}'
```

## Environment variables

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` – NeonDB connection string
- `JWT_SECRET` – long random secret
- `JWT_EXPIRES_IN` – e.g. `7d`
- `BCRYPT_SALT_ROUNDS` – default `12`
- `FRONTEND_URL` – used in password-reset links
- Optional SMTP vars to send real emails; otherwise reset links are logged to the console

## Scripts

```bash
npm run dev       # start with nodemon + ts-node
npm run build     # compile TypeScript
npm run start     # run compiled app
npm run prisma:migrate   # create/run migrations
npm run prisma:generate  # regenerate Prisma client
npm run prisma:studio    # open Prisma Studio
```
