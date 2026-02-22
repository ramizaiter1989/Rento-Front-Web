# Super Admin – Edit All Agency Details

**Version:** 1.0  
**Last Updated:** February 2026

This document describes how a **Super Admin** can list agencies, get full agency details, and **edit all details** of an agency (user account + agent/business profile).

---

## Access

| Role          | Access                          |
|---------------|----------------------------------|
| **Super Admin** | Full access (list, get, update) |
| Others        | **403 Forbidden**                |

**Authentication:** Required. Use `Authorization: Bearer {token}`.

**Base path:** `{API_BASE}/api/admin`

---

## Endpoints Overview

| Action           | Method | Endpoint                    | Description                          |
|------------------|--------|-----------------------------|--------------------------------------|
| List agencies    | GET    | `/api/admin/agencies`       | Paginated list (optional filters)    |
| Get agency       | GET    | `/api/admin/agencies/{id}`   | Full agency details (any status)     |
| Update agency    | PUT    | `/api/admin/agencies/{id}`   | Edit all user + agent details        |

---

## 1. List Agencies

```http
GET /api/admin/agencies
Authorization: Bearer {token}
Accept: application/json
```

### Query Parameters

| Parameter      | Type   | Default   | Description |
|----------------|--------|-----------|-------------|
| `per_page`     | int    | 20        | Items per page |
| `page`         | int    | 1         | Page number |
| `sort_by`      | string | created_at | Sort field: `created_at`, `username`, `first_name`, `last_name` |
| `sort_order`   | string | desc      | `asc` or `desc` |
| `verified_only`| bool   | false     | If `true`, only verified agencies |
| `business_type`| string | -         | Filter: `rental`, `private`, `company`, `marina` |
| `address`      | string | -         | Filter by governorate (e.g. Beirut, North) |
| `search`       | string | -         | Search by username, first name, or last name |
| `status`       | bool   | -         | Filter by user status (active/inactive) |
| `is_locked`    | bool   | -         | Filter by locked state |
| `include_all`  | bool   | false     | If `true`, list all agencies (including inactive and locked). Default list shows only `status=true` and `is_locked=false`. |

### Example

```http
GET /api/admin/agencies?per_page=10&include_all=1
Authorization: Bearer {token}
```

---

## 2. Get Agency by ID

Returns full agency details including business fields. Works for **any** agency (active, inactive, or locked) so the admin can load the form to edit.

```http
GET /api/admin/agencies/{id}
Authorization: Bearer {token}
Accept: application/json
```

| Parameter | Description        |
|-----------|--------------------|
| `id`      | Agency user ID     |

### Success Response (200)

```json
{
  "success": true,
  "agency": {
    "id": 5,
    "username": "rent_cars_lebanon",
    "first_name": "Rent",
    "last_name": "Lebanon",
    "profile_picture": "https://example.com/storage/users/5/profile/photo.jpg",
    "verified_by_admin": true,
    "business_type": "rental",
    "address": "Beirut",
    "location": { "lat": 33.8, "lng": 35.5, "city": "Beirut" },
    "website": "https://rentcarslb.com",
    "cars_count": 12,
    "cars_accepted_count": 10,
    "cars_not_accepted_count": 2,
    "sea_vehicles_count": 2,
    "company_number": "LB-12345",
    "profession": "owner",
    "policies": "Terms and conditions...",
    "business_doc": "https://example.com/storage/..."
  }
}
```

**404** – Agency not found (invalid ID or user is not agency/agent).

---

## 3. Update Agency (Edit All Details)

Super Admin can update **all** editable fields for the agency's **user** and **agent** records in one request. Send only the fields you want to change; omitted fields are left unchanged.

```http
PUT /api/admin/agencies/{id}
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

| Parameter | Description     |
|-----------|-----------------|
| `id`      | Agency user ID  |

### Request Body (JSON)

All fields are **optional**. Include only fields to update.

#### User (account) fields

| Field                | Type    | Validation / Notes |
|----------------------|---------|--------------------|
| `username`           | string  | Max 255, unique (excluding current user) |
| `first_name`         | string  | Max 100 |
| `last_name`          | string  | Max 100 |
| `email`              | string  | Valid email, max 255 |
| `phone_number`       | string  | Max 50 |
| `verified_by_admin`  | boolean | Mark as verified or not |
| `status`             | boolean | Account active/inactive |
| `is_locked`          | boolean | Lock/unlock account |
| `country`            | string  | Max 100 |
| `city`               | string  | Max 100 |
| `bio`                | string  | Max 500 |
| `gender`             | string  | `male`, `female`, `other` |
| `birth_date`         | string  | ISO date (e.g. `1990-05-15`) |

#### Agent (business) fields

| Field            | Type    | Validation / Notes |
|------------------|---------|--------------------|
| `business_type`  | string  | `rental`, `private`, `company`, `marina` |
| `company_number` | string  | Max 100 |
| `address`        | string  | One of: `Beirut`, `Mount Lebanon`, `North`, `South`, `Bekaa`, `Baalbek`, `Keserwan`, `Nabatieh`, `Akkar` |
| `location`       | object  | e.g. `{ "lat": 33.8, "lng": 35.5, "city": "Beirut" }` |
| `website`        | string  | Valid URL, max 255 |
| `profession`     | string  | `owner`, `manager` |
| `policies`       | string  | Max 10000 (terms and conditions) |
| `app_fees`       | number  | 0–100 (percentage) |

**Note:** Profile photo is not updated by this endpoint. Use `POST /api/admin/users/{id}/photo` to change the user's profile picture. Documents (`business_doc`, `contract_form`) are not updated by this endpoint; they are typically set by the agency via their own flows.

### Example Request

```json
PUT /api/admin/agencies/5
Content-Type: application/json

{
  "first_name": "Rent",
  "last_name": "Lebanon",
  "verified_by_admin": true,
  "status": true,
  "is_locked": false,
  "business_type": "rental",
  "address": "Beirut",
  "location": { "lat": 33.8, "lng": 35.5, "city": "Beirut" },
  "website": "https://rentcarslb.com",
  "company_number": "LB-12345",
  "profession": "owner",
  "policies": "Updated terms and conditions.",
  "app_fees": 10
}
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Agency updated successfully",
  "agency": {
    "id": 5,
    "username": "rent_cars_lebanon",
    "first_name": "Rent",
    "last_name": "Lebanon",
    "profile_picture": "https://example.com/storage/...",
    "verified_by_admin": true,
    "business_type": "rental",
    "address": "Beirut",
    "location": { "lat": 33.8, "lng": 35.5, "city": "Beirut" },
    "website": "https://rentcarslb.com",
    "cars_count": 12,
    "cars_accepted_count": 10,
    "cars_not_accepted_count": 2,
    "sea_vehicles_count": 2,
    "company_number": "LB-12345",
    "profession": "owner",
    "policies": "Updated terms and conditions.",
    "business_doc": "https://example.com/storage/..."
  }
}
```

### Error Responses

- **404 Not Found** – Agency not found (wrong ID or user is not agency/agent).
- **422 Unprocessable Entity** – Validation failed. Response includes an `errors` object with field-level messages.
- **403 Forbidden** – User is not Super Admin.

---

## Typical Flow (Super Admin)

1. **List agencies** (optionally with `include_all=1` to see inactive/locked):
   - `GET /api/admin/agencies?include_all=1`
2. **Load one agency** to populate the edit form:
   - `GET /api/admin/agencies/{id}`
3. **Save changes**:
   - `PUT /api/admin/agencies/{id}` with the fields to update.

---

## Related

- **Agent fee (app_fees):** Can also be set via `PUT /api/admin/agents/{agentId}/fee-percentage` (see admin routes).
- **User photo:** `POST /api/admin/users/{id}/photo` to update profile picture.
- **General user update:** `PUT /api/admin/users/{id}` updates only `verified_by_admin`, `status`, `is_locked`; for full agency details use `PUT /api/admin/agencies/{id}`.
