# Frontend Architecture Plan

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 + TypeScript 6 |
| Build tool | Vite 8 |
| Router | react-router-dom v7 |
| HTTP client | Native `fetch` + custom wrapper |
| Styling | Plain CSS (no framework) |

## Directory Layout

```
src/
├── api/
│   ├── client.ts         # fetch wrapper — credentials: include, JSON handling, error normalization
│   ├── products.ts       # Product CRUD API calls
│   └── members.ts        # Member auth/profile API calls
├── context/
│   └── AuthContext.tsx    # Auth state — current member, login/logout/register actions
├── hooks/
│   ├── useAuth.ts        # Hook into AuthContext
│   └── useProducts.ts    # Product data fetching + mutations
├── pages/
│   ├── LoginPage.tsx     # Login / Register (tabs)
│   ├── ProductList.tsx   # Product grid / table
│   ├── ProductDetail.tsx # Single product view
│   ├── ProductForm.tsx   # Create / Edit product (shared form)
│   └── ProfilePage.tsx   # Edit member name/email
├── components/
│   ├── Layout.tsx        # Navbar + sidebar + main content
│   ├── ProtectedRoute.tsx# Redirect to /login if not authenticated
│   └── ProductCard.tsx   # Card in product list
├── types/
│   └── index.ts          # TypeScript interfaces matching backend domain models
├── App.tsx               # Router setup
├── App.css
├── index.css
└── main.tsx
```

## Pages

| Route | Page | Auth | Description |
|-------|------|------|-------------|
| `/login` | LoginPage | No | Login / Register tabs |
| `/products` | ProductList | No | Public product list |
| `/products/:id` | ProductDetail | No | Public product detail |
| `/products/new` | ProductForm | Yes | Create product |
| `/products/:id/edit` | ProductForm | Yes | Edit product |
| `/profile` | ProfilePage | Yes | View/edit member info |
| `/` | Redirect to `/products` | — | Root redirect |

## Auth Flow

```
LoginPage                    ProductList (public)          Protected pages
   │                              │                             │
   │ POST /api/members/login      │                             │
   │ ← Set-Cookie: session_key    │                             │
   │ ← { member }                 │                             │
   │                              │                             │
   ├─→ AuthContext updates ───────┼────→ AuthContext guards ───┤
   │   member stored in state     │     session_key in cookie   │
   │   redirect to /products      │                             │
```

- `session_key` cookie is **HttpOnly + Secure** — not accessible from JS
- Every authenticated request sends cookie automatically (`credentials: 'include'`)
- Auth middleware on backend rotates the session_key on each request
- Backend sends `Set-Cookie` with new key; browser handles it transparently
- Frontend determines auth state by calling `GET /api/members/me` on app load

## Vite Proxy

```ts
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

All `/api/*` requests are forwarded to the Go backend. No CORS configuration needed during development.

## Implementation Order

1. ✅ Login / Register page
2. AuthContext + useAuth hook + API client
3. Layout + routing
4. Product list page
5. Product detail page
6. Product form (create + edit)
7. Profile page
8. Three-tier product details/prices (after backend implementation)

## Data Flow

```
Page → hook → api/client.ts → Vite Proxy → Go Backend
                                        ↓
Page ← hook ← api/client.ts ← Vite Proxy ← Go Backend
```
