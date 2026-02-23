# Mobile App Click Tracking

Tracks when users click the Play Store or App Store links on the `/mobile-app` page. The frontend sends the visitor's IP geolocation (from [ipapi.co](https://ipapi.co)) plus the store identifier to the backend.

**Auth:** Not required (public endpoint).  
**Base path:** `{API_BASE}/api`

---

## Flow

1. User visits the Mobile App page and clicks either **Get it on Google Play** or **Download on the App Store**.
2. Frontend fetches visitor IP geolocation from `https://ipapi.co/json` (GET).
3. Frontend POSTs that data + `store` (`"playstore"` or `"appstore"`) to `POST /api/mobile-app/click`.
4. Store link opens in a new tab.

If the ipapi or backend request fails, the store link still opens. Tracking does not block the user.

---

## Frontend Implementation

### API Function

**File:** `src/lib/api.js`

```js
export const trackMobileAppClick = (data) => {
  return api.post('/mobile-app/click', data);
};
```

### Usage

**File:** `src/pages/MobileAppPage.jsx`

```js
const handleStoreClick = async (e, store, url) => {
  e.preventDefault();
  try {
    const res = await fetch("https://ipapi.co/json");
    const ipData = await res.json();
    await trackMobileAppClick({ ...ipData, store });
  } catch (_) {}
  window.open(url, "_blank", "noopener,noreferrer");
};
```

- Play Store: `store: "playstore"`
- App Store: `store: "appstore"`

---

## Backend API

See the backend docs for the full spec. Summary:

### POST /api/mobile-app/click

- **Method:** `POST`
- **Content-Type:** `application/json`
- **Body:** ipapi.co JSON response + required field `store`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `store` | string | **Yes** | `"playstore"` or `"appstore"` |
| `ip` | string | No | Visitor IP (IPv4 or IPv6) |
| `city` | string | No | City name |
| `region` | string | No | Region / state |
| `country_code` | string | No | ISO country code |
| `country_name` | string | No | Country name |
| `latitude` | number | No | Latitude |
| `longitude` | number | No | Longitude |
| `timezone` | string | No | e.g. `Europe/Berlin` |
| `currency` | string | No | e.g. `EUR` |
| ... | | | (other ipapi fields accepted) |

### Responses

- **201 Created** – Click recorded. `{ "success": true }`
- **422 Unprocessable Entity** – Validation failed (e.g. invalid or missing `store`).

### Backend Behaviour

1. Validates `store` is `playstore` or `appstore`.
2. Validates optional ipapi fields (types and max lengths).
3. Stores the payload in the `mobile_app_clicks` table.
4. Returns 201 on success.

---

## Admin API — List & Chart

**Auth:** Required (admin Bearer token).

### List — `GET /api/admin/mobile-app-clicks`

| Param       | Type   | Description                        |
|-------------|--------|------------------------------------|
| `page`      | int    | Page number (default 1)            |
| `per_page`  | int    | Items per page (default 20)        |
| `date_from` | string | Filter: YYYY-MM-DD (on or after)   |
| `date_to`   | string | Filter: YYYY-MM-DD (on or before)  |
| `store`     | string | Filter: `playstore` or `appstore`  |
| `country`   | string | Filter: country code (e.g. DE)     |

Response: `{ clicks: { data: [...], total, current_page, last_page, ... } }`

### Chart — `GET /api/admin/mobile-app-clicks/chart`

| Param       | Type   | Description                     |
|-------------|--------|---------------------------------|
| `period`    | string | `day` \| `week` \| `month`      |
| `days_back` | int    | Days to include (1–365)         |
| `store`     | string | Optional: `playstore` or `appstore` |

Response: `{ series: [{ label, count }], by_store: { playstore, appstore }, total_clicks }`

See **Super Admin — Mobile App Clicks API** spec for full details.

---

## ipapi.co

- **URL:** https://ipapi.co/json  
- **Method:** GET  
- **Docs:** https://ipapi.co  
- **Free tier:** ~1,000 lookups/day (~30K/month)  
- **Response:** JSON with IP geolocation fields
