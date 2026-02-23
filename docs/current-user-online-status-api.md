# Current User & Online Status API

**Version:** 1.0  
**Last Updated:** February 2026

APIs for **who is logged in** and **active/online** status. See [super-admin-online-status-implementation.md](./super-admin-online-status-implementation.md) for full Super Admin implementation.

---

## Overview

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /api/me` | Required | Current user + `last_active_at`, `last_seen_at`, `is_online` |
| `GET /api/profile` | Required | Current user profile (no online info) |
| `GET /api/admin/online-users` | Admin | List users online with `sessions` and `last_used_at` |

---

## GET /api/me

Response: `{ user, last_active_at, last_seen_at, is_online, online_within_minutes }`

---

## GET /api/admin/online-users

**Query:** `minutes` (default 30)

**Response:** `{ online_users_count, time_window_minutes, online_users: [{ ..., sessions: [{ last_used_at, ... }] }] }`
