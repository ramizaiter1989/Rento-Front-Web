# Implementation — User Side (Web App)

**Version:** 1.0  
**Last Updated:** February 2026

Implementation guide for the **web app** (user side): who is logged in and posting active status. No online/last-seen data in the response; that is visible only to Super Admin.

---

## Base URL & Auth

- **Base path:** `{API_BASE}/api`
- **Auth:** `Authorization: Bearer {token}` (store token after login, e.g. in memory or `localStorage`).

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/me` | Current logged-in user. Use on app load for "who am I". |
| POST | `/api/me/active` | Post active status (heartbeat). Call periodically so Super Admin can see you as online / last seen. |
| GET | `/api/profile` | Current user profile (same `user` as `/api/me`). |

---

## 1. GET /api/me — Who is logged in

Call on app load or after login.

**Request**

```http
GET /api/me
Authorization: Bearer {token}
Accept: application/json
```

**Response (200)**

```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "phone_number": "+9613123456",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "client",
    "status": true,
    "profile_picture": "https://example.com/storage/users/1/profile/photo.jpg",
    "verified_by_admin": true,
    "client": { ... },
    "agent": null
  }
}
```

Use `user` for display name, avatar, role, and profile. If **401**, redirect to login.

---

## 2. POST /api/me/active — Post active status

Call periodically (e.g. every 1–2 minutes) while the user is on the site. No body required.

**Request**

```http
POST /api/me/active
Authorization: Bearer {token}
Accept: application/json
```

**Response (200)**

```json
{
  "active": true
}
```

---

## 3. GET /api/profile — Current user profile

Same `user` payload as `/api/me`. Use when you only need profile data.

```http
GET /api/profile
Authorization: Bearer {token}
Accept: application/json
```

Response: `{ "user": { ... } }`.

---

## Frontend Implementation

- **`getMe()`** in `src/lib/api.js` — GET /api/me
- **`postMeActive()`** in `src/lib/api.js` — POST /api/me/active
- **`useActiveHeartbeat(isAuthenticated)`** in `src/hooks/useActiveHeartbeat.js` — calls `postMeActive` every 90 seconds when user is authenticated
- **App.jsx** — uses `useActiveHeartbeat(isAuthenticated)` so the heartbeat runs for all logged-in users (client, agent, admin)

---

## Typical flow

1. **App load:** Call `GET /api/me` (or use cached user from token). If 200 → set user (header/avatar). If 401 → redirect to login.
2. **After login:** Store token, then call `GET /api/me` to load user.
3. **While on app:** Start heartbeat (`POST /api/me/active` every 90 s). Stop when user logs out or leaves.
4. **Logout:** Call `POST /api/logout`, clear token.

---

## Error handling

- **401** — Not logged in; clear token and redirect to login.
- **403** — User is locked.

---

## Related

- Login: `POST /api/auth/login`
- Logout: `POST /api/logout`
- Profile completion: `GET /api/profile/status`, `POST /api/profile/complete`
- Super Admin online status: `docs/current-user-online-status-api.md`, `docs/super-admin-online-status-implementation.md`
