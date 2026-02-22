# Super Admin — Mobile App Clicks API

**Version:** 1.0  
**Last Updated:** February 2026

APIs for **Super Admin** to see **all mobile app store link clicks** (Play Store / App Store): list with filters and chart data for **daily**, **weekly**, and **monthly** views.

---

## Access

- **Auth:** `Authorization: Bearer {token}`
- **Role:** Super Admin (admin middleware)
- **Base path:** `{API_BASE}/api/admin`

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/mobile-app-clicks` | Paginated list of all clicks (optional filters: date, store, country). |
| GET | `/api/admin/mobile-app-clicks/chart` | Aggregated counts for **daily**, **weekly**, or **monthly** (for lists and charts). |

---

## 1. List all clicks

**GET /api/admin/mobile-app-clicks**

### Query parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number. |
| `per_page` | int | 20 | Items per page (1–100). |
| `date_from` | string | - | Filter: YYYY-MM-DD (clicks on or after). |
| `date_to` | string | - | Filter: YYYY-MM-DD (clicks on or before). |
| `store` | string | - | Filter: `playstore` or `appstore`. |
| `country` | string | - | Filter: country code (e.g. DE, US). |

### Response (200)

```json
{
  "clicks": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "store": "playstore",
        "ip": "2001:9e8:d7ec:fa00:...",
        "city": "Bochum",
        "region": "North Rhine-Westphalia",
        "country": "DE",
        "country_name": "Germany",
        "latitude": 51.4498,
        "longitude": 7.2356,
        "timezone": "Europe/Berlin",
        "created_at": "2026-02-18T14:30:00.000000Z"
      }
    ],
    "total": 120,
    "last_page": 5,
    "per_page": 25
  }
}
```

---

## 2. Chart data (daily / weekly / monthly)

**GET /api/admin/mobile-app-clicks/chart**

### Query parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `month` | `day` \| `week` \| `month`. |
| `days_back` | int | 30 | Number of days to include (1–365). |
| `store` | string | - | Optional: `playstore` or `appstore`. |

### Response (200)

```json
{
  "period": "month",
  "days_back": 30,
  "start_date": "2026-01-19",
  "series": [
    { "label": "2026-01", "count": 42 },
    { "label": "2026-02", "count": 78 }
  ],
  "by_store": {
    "playstore": 85,
    "appstore": 35
  },
  "total_clicks": 120
}
```

---

## Frontend usage

- **List:** `getMobileAppClicks({ date_from, date_to, per_page, page })`
- **Chart:** `getMobileAppClicksChart({ period: 'day'|'week'|'month', days_back })`
- Dashboard uses both for chart + clickers table.
