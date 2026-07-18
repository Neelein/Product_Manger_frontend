# Login / Register Feature Plan

## Overview

Implement member authentication with login and registration forms, cookie-based session handling, and auth state management.

## Pages

**LoginPage** (`/login`)
- Tab switcher: Login / Register
- Login: email + password → `POST /api/members/login`
- Register: name + email + password → `POST /api/members/register`
- On success: redirect to `/products`

## Component

```
LoginPage
├── LoginCard
│   ├── Logo + Title
│   ├── TabSwitcher (Login | Register)
│   ├── ErrorBanner
│   ├── SuccessBanner
│   └── Form
│       ├── [name]   (register only)
│       ├── [email]
│       ├── [password]
│       └── SubmitBtn (with loading spinner)
```

## Validation (frontend)

| Field | Rule |
|-------|------|
| Name | Required (register only) |
| Email | Required, valid email format |
| Password | Required, min 6 characters |

## API Integration

| Action | Endpoint | Method | Credentials |
|--------|----------|--------|-------------|
| Login | `/api/members/login` | POST | `include` |
| Register | `/api/members/register` | POST | `include` |

### Login Response (200)
```json
{
  "member": { "id": "...", "email": "...", "name": "..." }
}
```
Backend also sets `Set-Cookie: session_key=...; HttpOnly; Secure; SameSite=Lax`

### Register Response (201)
```json
{
  "id": "...", "email": "...", "name": "..."
}
```

## Error Handling

| Condition | Display |
|-----------|---------|
| Network error | "網路錯誤，請稍後再試" |
| HTTP 401 | "invalid credentials" → "信箱或密碼錯誤" |
| HTTP 409 | "email already exists" → "此信箱已註冊" |
| HTTP 400 | Backend error message |
| Validation fail | Chinese field-level messages |
