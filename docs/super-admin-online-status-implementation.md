# Implementation — Super Admin Side

**Version:** 1.0  
**Last Updated:** February 2026

Implementation guide for the **Super Admin** dashboard: current user (with last seen/online) and list of users who are online with last seen.

---

## Base URL & Auth

- **Base path:** `{API_BASE}/api` and `{API_BASE}/api/admin`
- **Auth:** `Authorization: Bearer {super_admin_token}`
- **Role:** Only users with `user_permissions.role = 'super_admin'` can use these endpoints.

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/me` | Current Super Admin user + own `last_active_at`, `last_seen_at`, `is_online` |
| GET | `/api/admin/online-users` | List users who are online and their last seen per session |

---

## 1. GET /api/me — Current admin + own last seen / online

**Response (200)**

```json
{
  "user": { "id": 1, "username": "admin", "first_name": "Super", "last_name": "Admin", "role": "admin", ... },
  "last_active_at": "2026-02-18T14:30:00.000000Z",
  "last_seen_at": "2026-02-18T14:30:00.000000Z",
  "is_online": true,
  "online_within_minutes": 15
}
```

---

## 2. GET /api/admin/online-users — Who is online + last seen

**Query:** `minutes` (default 30) — users with token activity in the last N minutes.

**Response (200)**

```json
{
  "online_users_count": 12,
  "time_window_minutes": 30,
  "online_users": [
    {
      "id": 5,
      "username": "john_doe",
      "first_name": "John",
      "last_name": "Doe",
      "role": "client",
      "sessions": [
        { "id": 101, "name": "mobile", "last_used_at": "2026-02-18T14:28:00.000000Z", "created_at": "..." },
        { "id": 102, "name": "web", "last_used_at": "2026-02-18T14:30:00.000000Z", "created_at": "..." }
      ]
    }
  ]
}
```

**Last seen** for a user: use the latest `last_used_at` across their `sessions`.

---

## Frontend Implementation

- **AdminLayout** — Uses `getMe()` to show current admin name + last seen in sidebar profile.
- **AdminDashboard** — Fetches `getOnlineUsers({ minutes: 30 })`, shows count under Total Users and an "Online Users" card with list + last seen per user.
- **AdminUsersPage** — Shows "Online now: X" in the top bar.
- **formatLastSeen** — Utility to format `last_used_at` (e.g. "Just now", "5 min ago", "2h ago").
- **getLatestLastSeen(user)** — Returns latest `last_used_at` from user's `sessions`.

---

## Error handling

- **401** — Invalid or missing token.
- **403** — Not Super Admin.
