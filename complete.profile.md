# DEFINITIVE Field Mapping - Based on Database Schema

## Database Schema Analysis

### Users Table (Base Fields)
```sql
- first_name (string, max:100) - REQUIRED
- last_name (string, max:100) - REQUIRED
- gender (enum: male, female, other) - REQUIRED
- birth_date (date) - REQUIRED
- city (enum: beirut, mount-liban, south, north, bekaa, other) - REQUIRED
- bio (text, nullable) - OPTIONAL
- profile_picture (string, nullable) - OPTIONAL (file path)
- id_card_front (string) - REQUIRED (file path)
- id_card_back (string) - REQUIRED (file path)
```

### Clients Table (Client-Specific Fields)
```sql
- license_number (string, max:100, nullable) - REQUIRED for completion
- driver_license (string, nullable) - REQUIRED for completion (file path)
- profession (enum, nullable) - REQUIRED for completion
  ↳ Values: 'employee', 'freelancer', 'business', 'student', 'other'
- avg_salary (enum, nullable) - REQUIRED for completion
  ↳ Values: '200-500', '500-1000', '1000-2000', '2000+'
- promo_code (string, max:50, nullable) - OPTIONAL
- deposit (integer, default:0) - Auto-managed
- bonus (integer, default:0) - Auto-managed
- trusted_by_app (boolean, default:false) - Auto-managed
- average_rating (decimal, default:0) - Auto-managed
- qualification_code (json, nullable) - Auto-managed
```

### Agents Table (Agency-Specific Fields)
```sql
- business_type (enum, nullable) - REQUIRED for completion
  ↳ Values: 'rental', 'dealer', 'private', 'company', 'business'
- business_doc (string, nullable) - CONDITIONAL (file path)
  ↳ Required ONLY when business_type = 'company'
- company_number (string, max:100, nullable) - CONDITIONAL
  ↳ Required ONLY when business_type = 'company'
- location (json, nullable) - REQUIRED for completion
- app_fees (decimal(5,2), nullable) - OPTIONAL
- profession (enum, nullable) - REQUIRED for completion
  ↳ Values: 'manager', 'agent', 'driver', 'other'
- contract_form (string, nullable) - OPTIONAL (file path or text)
- policies (text, nullable) - OPTIONAL
- website (string, nullable) - OPTIONAL
```

---

## Complete Field Reference

### 1. Base Fields (All Users - Required)

| Frontend Field | Database Column | Type | Validation | Example | Notes |
|----------------|-----------------|------|------------|---------|-------|
| `first_name` | `users.first_name` | string | `required\|max:100` | "John" | |
| `last_name` | `users.last_name` | string | `required\|max:100` | "Doe" | |
| `gender` | `users.gender` | enum | `required\|in:male,female,other` | "male" | Lowercase only |
| `birth_date` | `users.birth_date` | date | `required\|date\|before:today` | "1990-01-15" | YYYY-MM-DD format |
| `city` | `users.city` | enum | `required\|in:beirut,mount-liban,south,north,bekaa,other` | "beirut" | Lowercase only |
| `bio` | `users.bio` | text | `nullable\|string` | "My bio..." | ⚠️ MUST send (can be empty) |
| `id_card_front` | `users.id_card_front` | file | `required\|file\|mimes:jpg,jpeg,png,pdf\|max:5000` | [file] | Stores file path |
| `id_card_back` | `users.id_card_back` | file | `required\|file\|mimes:jpg,jpeg,png,pdf\|max:5000` | [file] | Stores file path |
| `profile_picture` | `users.profile_picture` | file | `nullable\|file\|mimes:jpg,jpeg,png\|max:5000` | [file] | Optional |

---

### 2. Client Fields (When role = "client")

| Frontend Field | Database Column | Type | Validation | Example | Notes |
|----------------|-----------------|------|------------|---------|-------|
| `license_number` | `clients.license_number` | string | `required\|max:100` | "DL123456" | Required for profile completion |
| `driver_license` | `clients.driver_license` | file | `required\|file\|mimes:jpg,jpeg,png,pdf\|max:5000` | [file] | Stores file path |
| `profession` | `clients.profession` | enum | `required\|in:employee,freelancer,business,student,other` | "employee" | Lowercase only |
| `avg_salary` | `clients.avg_salary` | enum | `required\|in:200-500,500-1000,1000-2000,2000+` | "1000-2000" | Exact format |
| `promo_code` | `clients.promo_code` | string | `nullable\|max:50` | "PROMO2024" | ⚠️ Omit if empty |

**Auto-Managed Fields (Don't Send):**
- `deposit` - Managed by system
- `bonus` - Managed by system
- `trusted_by_app` - Managed by admin
- `average_rating` - Calculated by system
- `qualification_code` - Managed by system

---

### 3. Agency Fields (When role = "agency" or "agent")

| Frontend Field | Database Column | Type | Validation | Example | Notes |
|----------------|-----------------|------|------------|---------|-------|
| `business_type` | `agents.business_type` | enum | `required\|in:rental,dealer,private,company,business` | "rental" | Lowercase only |
| `profession` | `agents.profession` | enum | `required\|in:manager,agent,driver,other` | "manager" | Lowercase only |
| `location` | `agents.location` | json | `required\|json` | See below | JSON string |
| `company_number` | `agents.company_number` | string | `required_if:business_type,company\|max:100` | "CMP123" | Only if company |
| `business_doc` | `agents.business_doc` | file | `required_if:business_type,company\|file\|mimes:jpg,jpeg,png,pdf\|max:5000` | [file] | Only if company |
| `app_fees` | `agents.app_fees` | decimal | `nullable\|numeric\|between:0,99.99` | "15.50" | Optional, max 99.99 |
| `contract_form` | `agents.contract_form` | string | `nullable\|string` | "Terms..." | Optional (text or file path) |
| `policies` | `agents.policies` | text | `nullable\|string` | "No smoking..." | Optional |
| `website` | `agents.website` | string | `nullable\|url` | "https://example.com" | Optional |

---

## Location Field Format (JSON)

**Database Type:** `json` (stores as JSON string)

**Required Structure:**
```json
{
  "address": "123 Main St",      // Optional
  "city": "Beirut",               // Optional
  "country": "Lebanon",           // Optional (recommended)
  "latitude": 33.8938,            // REQUIRED (number)
  "longitude": 35.5018,           // REQUIRED (number)
  "zip_code": "1100"              // Optional
}
```

**Minimum Valid Format:**
```json
{
  "latitude": 33.8938,
  "longitude": 35.5018,
  "country": "Lebanon"
}
```

**Frontend Implementation:**
```typescript
const location = {
  latitude: parseFloat(position.coords.latitude.toFixed(6)),
  longitude: parseFloat(position.coords.longitude.toFixed(6)),
  country: "Lebanon"
};

formData.append('location', JSON.stringify(location));
```

---

## Field Type Requirements

### Enum Values (MUST be lowercase)

**gender:**
- ✅ `male`
- ✅ `female`
- ✅ `other`

**city:**
- ✅ `beirut`
- ✅ `mount-liban`
- ✅ `south`
- ✅ `north`
- ✅ `bekaa`
- ✅ `other`

**profession (client):**
- ✅ `employee`
- ✅ `freelancer`
- ✅ `business`
- ✅ `student`
- ✅ `other`

**profession (agency):**
- ✅ `manager`
- ✅ `agent`
- ✅ `driver`
- ✅ `other`

**business_type:**
- ✅ `rental`
- ✅ `dealer`
- ✅ `private`
- ✅ `company`
- ✅ `business`

**avg_salary:**
- ✅ `200-500`
- ✅ `500-1000`
- ✅ `1000-2000`
- ✅ `2000+`

---

## File Upload Specifications

### Accepted MIME Types

| File Field | Accepted Types | Max Size |
|------------|----------------|----------|
| `id_card_front` | image/jpeg, image/jpg, image/png, application/pdf | 5 MB |
| `id_card_back` | image/jpeg, image/jpg, image/png, application/pdf | 5 MB |
| `profile_picture` | image/jpeg, image/jpg, image/png | 5 MB |
| `driver_license` | image/jpeg, image/jpg, image/png, application/pdf | 5 MB |
| `business_doc` | image/jpeg, image/jpg, image/png, application/pdf | 5 MB |

### React Native File Format

```typescript
const file = {
  uri: "file:///path/to/image.jpg",  // File URI
  type: "image/jpeg",                 // MIME type
  name: "filename.jpg"                // Filename with extension
};

formData.append('id_card_front', file as any);
```

---

## Critical Rules

### ⚠️ MUST DO:

1. **Always send `bio`** - Even if empty string
   ```typescript
   formData.append('bio', form.bio || '');
   ```

2. **Never send empty optional fields** - Omit them instead
   ```typescript
   // ❌ WRONG
   formData.append('promo_code', '');
   
   // ✅ CORRECT
   if (form.promo_code?.trim()) {
     formData.append('promo_code', form.promo_code);
   }
   ```

3. **All enums MUST be lowercase**
   ```typescript
   formData.append('gender', form.gender.toLowerCase());
   formData.append('city', form.city.toLowerCase());
   formData.append('profession', form.profession.toLowerCase());
   ```

4. **Don't set Content-Type header in React Native**
   ```typescript
   // ❌ WRONG
   headers: { 'Content-Type': 'multipart/form-data' }
   
   // ✅ CORRECT
   headers: { /* Let axios handle it */ }
   ```

5. **Location MUST be JSON string**
   ```typescript
   formData.append('location', JSON.stringify(locationObject));
   ```

6. **Birth date MUST be YYYY-MM-DD**
   ```typescript
   // If it comes as ISO: "1990-01-15T00:00:00.000Z"
   const date = birthDate.split('T')[0]; // "1990-01-15"
   formData.append('birth_date', date);
   ```

---

## Validation Summary

### Client Profile Complete Checklist

**Base Fields:**
- [ ] first_name (not empty)
- [ ] last_name (not empty)
- [ ] gender (male/female/other, lowercase)
- [ ] birth_date (YYYY-MM-DD format)
- [ ] city (valid enum, lowercase)
- [ ] bio (send even if empty string)
- [ ] id_card_front (file with uri, type, name)
- [ ] id_card_back (file with uri, type, name)

**Client Fields:**
- [ ] license_number (not empty)
- [ ] driver_license (file with uri, type, name)
- [ ] profession (valid enum, lowercase)
- [ ] avg_salary (valid enum, exact format)
- [ ] promo_code (omit if empty, or send trimmed value)

**Total Required Files:** 3 (id_card_front, id_card_back, driver_license)

---

### Agency Profile Complete Checklist

**Base Fields:**
- [ ] first_name (not empty)
- [ ] last_name (not empty)
- [ ] gender (male/female/other, lowercase)
- [ ] birth_date (YYYY-MM-DD format)
- [ ] city (valid enum, lowercase)
- [ ] bio (send even if empty string)
- [ ] id_card_front (file with uri, type, name)
- [ ] id_card_back (file with uri, type, name)

**Agency Fields:**
- [ ] business_type (valid enum, lowercase)
- [ ] profession (valid enum, lowercase)
- [ ] location (JSON string with latitude/longitude)

**Conditional (if business_type === 'company'):**
- [ ] company_number (not empty)
- [ ] business_doc (file with uri, type, name)

**Total Required Files:** 
- Non-company: 2 (id_card_front, id_card_back)
- Company: 3 (id_card_front, id_card_back, business_doc)

---

## Common Mistakes to Avoid

### ❌ Don't Do This:

```typescript
// 1. Skipping bio
if (form.bio) {
  formData.append('bio', form.bio);
}

// 2. Sending empty promo_code
formData.append('promo_code', '');

// 3. Using uppercase enums
formData.append('gender', 'Male'); // ❌
formData.append('city', 'Beirut'); // ❌

// 4. Wrong location format
formData.append('location', { lat: 33.8938, lng: 35.5018 }); // ❌

// 5. Setting Content-Type in React Native
headers: { 'Content-Type': 'multipart/form-data' } // ❌

// 6. Wrong date format
formData.append('birth_date', '01/15/1990'); // ❌
```

### ✅ Do This Instead:

```typescript
// 1. Always send bio
formData.append('bio', form.bio || '');

// 2. Omit empty optional fields
if (form.promo_code?.trim()) {
  formData.append('promo_code', form.promo_code);
}

// 3. Use lowercase enums
formData.append('gender', 'male');
formData.append('city', 'beirut');

// 4. Correct location format
const location = {
  latitude: 33.8938,
  longitude: 35.5018,
  country: "Lebanon"
};
formData.append('location', JSON.stringify(location));

// 5. Don't set Content-Type
headers: { /* Let axios handle it */ }

// 6. Correct date format
formData.append('birth_date', '1990-01-15');
```

---

## Database Storage Paths

When files are successfully uploaded, they are stored at:

| File Type | Storage Path | Database Column |
|-----------|--------------|-----------------|
| Profile Pictures | `storage/app/public/users/{user_id}/profile/` | `users.profile_picture` |
| ID Cards | `storage/app/public/users/{user_id}/id_card/` | `users.id_card_front`, `users.id_card_back` |
| Driver License | `storage/app/public/users/{user_id}/driver_license/` | `clients.driver_license` |
| Business Documents | `storage/app/public/users/{user_id}/business_docs/` | `agents.business_doc` |

The database stores the relative path (e.g., `users/123/id_card/front_abc123.jpg`), not the full system path.

---

## Example: Complete Client Submission

```typescript
const formData = new FormData();

// Base fields
formData.append('first_name', 'John');
formData.append('last_name', 'Doe');
formData.append('gender', 'male');
formData.append('birth_date', '1990-01-15');
formData.append('city', 'beirut');
formData.append('bio', ''); // ✅ Always send

// Files
formData.append('id_card_front', {
  uri: 'file:///path/front.jpg',
  type: 'image/jpeg',
  name: 'id_front.jpg'
});
formData.append('id_card_back', {
  uri: 'file:///path/back.jpg',
  type: 'image/jpeg',
  name: 'id_back.jpg'
});

// Client fields
formData.append('license_number', 'DL123456');
formData.append('profession', 'employee');
formData.append('avg_salary', '1000-2000');
// promo_code omitted (empty)
formData.append('driver_license', {
  uri: 'file:///path/license.jpg',
  type: 'image/jpeg',
  name: 'license.jpg'
});

// Submit
await api.post('/profile/complete', formData, {
  headers: { /* Don't set Content-Type */ },
  timeout: 60000
});
```

---

## Example: Complete Agency Submission (Company Type)

```typescript
const formData = new FormData();

// Base fields
formData.append('first_name', 'Jane');
formData.append('last_name', 'Smith');
formData.append('gender', 'female');
formData.append('birth_date', '1985-05-20');
formData.append('city', 'mount-liban');
formData.append('bio', 'Experienced manager');

// Files
formData.append('id_card_front', { uri: '...', type: 'image/jpeg', name: 'front.jpg' });
formData.append('id_card_back', { uri: '...', type: 'image/jpeg', name: 'back.jpg' });

// Agency fields
formData.append('business_type', 'company');
formData.append('profession', 'manager');

// Location
const location = {
  latitude: 33.8938,
  longitude: 35.5018,
  country: "Lebanon"
};
formData.append('location', JSON.stringify(location));

// Company fields (required because business_type = 'company')
formData.append('company_number', 'CMP123456');
formData.append('business_doc', { uri: '...', type: 'application/pdf', name: 'doc.pdf' });

// Optional
formData.append('website', 'https://example.com');

// Submit
await api.post('/profile/complete', formData, {
  headers: { /* Don't set Content-Type */ },
  timeout: 60000
});
```

---

**Last Updated:** January 2026  
**Database Schema Version:** Latest  
**API Version:** v1
