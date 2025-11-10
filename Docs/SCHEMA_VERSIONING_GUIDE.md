## Schema Versioning & Health Check System
**Team 589 Falkon Robotics - FRC 2025 Scouting App**

---

## 📋 Overview

The scouting app uses a dedicated `app_metadata` table for:
1. ✅ Fast connection health checks (< 1ms queries)
2. ✅ Schema version tracking (prevent incompatible app/database versions)
3. ✅ Feature flags and runtime configuration
4. ✅ Application metadata storage

This ensures the frontend and database are always in sync and prevents errors from schema mismatches.

---

## 🏗️ Architecture

### The `app_metadata` Table

**Purpose:** Single-row table containing application metadata and health check data

**Key Features:**
- **Single Row:** Only one row (id=1), enforced by CHECK constraint
- **Public Read Access:** Anyone can query for health checks and version info
- **Service-Only Writes:** Only migrations can update (via service_role key)
- **Always Fast:** Single row, always cached, minimal overhead

**Schema:**
```sql
CREATE TABLE app_metadata (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- Always 1

    -- Schema versioning
    schema_version TEXT NOT NULL DEFAULT '1.0.0',
    schema_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Application metadata
    app_name TEXT NOT NULL DEFAULT 'FRC 589 Scouting App',
    game_year INTEGER NOT NULL DEFAULT 2025,
    game_name TEXT NOT NULL DEFAULT 'REEFSCAPE',

    -- Database status
    database_status TEXT NOT NULL DEFAULT 'ready',
    last_migration_date TIMESTAMPTZ DEFAULT NOW(),
    last_migration_name TEXT,

    -- Feature flags (JSON)
    feature_flags JSONB DEFAULT '{ ... }'::jsonb,

    -- Health check
    health_check_key TEXT NOT NULL DEFAULT 'alive',
    last_health_check TIMESTAMPTZ,

    -- Compatibility
    min_frontend_version TEXT NOT NULL DEFAULT '1.0.0',
    min_backend_version TEXT NOT NULL DEFAULT '1.0.0',

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 🔄 How It Works

### 1. Health Check (Connection Status)

**Frontend Query (every 10 seconds):**
```typescript
const { data, error } = await supabase
  .from('app_metadata')
  .select('health_check_key, schema_version')
  .eq('id', 1)
  .single();

// Check if connected
if (!error && data?.health_check_key === 'alive') {
  // ✅ Connected!
}
```

**Why This Table?**
- ✅ Single row = always fast (< 1ms)
- ✅ Dedicated purpose = reliable
- ✅ No dependency on user data
- ✅ Returns schema version at same time

### 2. Schema Version Checking

**Semantic Versioning:** `MAJOR.MINOR.PATCH` (e.g., `1.0.0`)

- **MAJOR:** Breaking changes (incompatible with previous versions)
- **MINOR:** New features (backward compatible)
- **PATCH:** Bug fixes (backward compatible)

**Frontend Expected Version:** Defined in `data/schemaVersion.ts`
```typescript
export const EXPECTED_SCHEMA_VERSION = '1.0.0';
export const MIN_SCHEMA_VERSION = '1.0.0';
```

**Compatibility Rules:**
1. Database major version MUST match frontend major version
2. Database minor version MUST be >= minimum required
3. Example compatible combinations:
   - Frontend expects `1.0.0`, database has `1.0.0` ✅
   - Frontend expects `1.0.0`, database has `1.1.0` ✅ (backward compatible)
   - Frontend expects `1.0.0`, database has `2.0.0` ❌ (breaking change)
   - Frontend expects `1.5.0`, database has `1.0.0` ❌ (too old)

**Frontend Validation:**
```typescript
import { isSchemaCompatible, getSchemaCompatibilityMessage } from '@/data/schemaVersion';

const schemaVersion = await supabaseService.getSchemaVersion();

if (!isSchemaCompatible(schemaVersion)) {
  const { message, action } = getSchemaCompatibilityMessage(schemaVersion);
  console.warn('⚠️ Schema incompatible!', message, action);
}
```

### 3. Feature Flags

**Use Case:** Enable/disable features remotely without app updates

**Example:**
```sql
-- In database
UPDATE app_metadata
SET feature_flags = '{
  "pit_scouting": true,
  "match_scouting": true,
  "analytics": false,
  "realtime_updates": true
}'::jsonb
WHERE id = 1;
```

**Frontend Usage:**
```typescript
const metadata = await supabaseService.getAppMetadata();

if (metadata?.feature_flags?.analytics) {
  // Show analytics features
}
```

---

## 📝 Usage Guide

### For Database Migrations

**Step 1: Run Migration SQL**

Execute the migration SQL in Supabase SQL Editor:
```bash
# File: Backend_2025_Scouting/supabase_migration/CREATE_APP_METADATA_TABLE.sql
```

**Step 2: Verify Table Creation**

```sql
SELECT * FROM app_metadata;
```

**Expected Output:**
```
id | schema_version | app_name                  | game_year | health_check_key | ...
---+----------------+---------------------------+-----------+------------------+-----
1  | 1.0.0          | FRC 589 Scouting App      | 2025      | alive            | ...
```

### Updating Schema Version After Migrations

**When to Update:**
- ✅ Added new tables or columns (minor version bump)
- ✅ Changed column types or constraints (major version bump)
- ✅ Renamed tables (major version bump)
- ✅ Fixed bugs in database functions (patch version bump)

**How to Update:**

**Option A: Using Helper Function**
```sql
-- Bump to version 1.1.0 after adding new features
SELECT update_schema_version('1.1.0', 'Added new analytics tables');
```

**Option B: Direct Update**
```sql
UPDATE app_metadata
SET
    schema_version = '1.1.0',
    schema_updated_at = NOW(),
    last_migration_date = NOW(),
    last_migration_name = 'Added analytics feature'
WHERE id = 1;
```

### For Frontend Developers

**Update Expected Version:**

When database schema changes, update frontend expectations:

**File:** `Frontend_2025_Scouting/data/schemaVersion.ts`
```typescript
// Update to match database schema version
export const EXPECTED_SCHEMA_VERSION = '1.1.0';

// Minimum version required (can stay lower for backward compatibility)
export const MIN_SCHEMA_VERSION = '1.0.0';
```

**Frontend Auto-Checks:**
- ✅ Connection header checks schema every 10 seconds
- ✅ Logs warnings if incompatible
- ✅ Shows schema version in console for debugging

---

## 🧪 Testing

### Test Health Check

**Node Script:**
```bash
cd Frontend_2025_Scouting
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_KEY
);

supabase.from('app_metadata').select('*').eq('id', 1).single()
  .then(({ data, error }) => {
    if (error) console.error('❌ Error:', error);
    else console.log('✅ Metadata:', data);
  });
"
```

### Test Schema Version

**In App Console:**
```typescript
import { supabaseService } from '@/data/supabaseService';

// Get version
const version = await supabaseService.getSchemaVersion();
console.log('Schema version:', version);

// Get full metadata
const metadata = await supabaseService.getAppMetadata();
console.log('App metadata:', metadata);
```

---

## 🚨 Troubleshooting

### Issue: Connection shows red even after migration

**Check 1: Does table exist?**
```sql
SELECT tablename FROM pg_tables WHERE tablename = 'app_metadata';
```

**Check 2: Can you query it?**
```sql
SELECT * FROM app_metadata WHERE id = 1;
```

**Check 3: RLS policies correct?**
```sql
SELECT * FROM pg_policies WHERE tablename = 'app_metadata';
```

**Solution:** Re-run CREATE_APP_METADATA_TABLE.sql

### Issue: Schema version warning in console

**Message:** `"Database schema is too old (v1.0.0). Expected v1.5.0 or newer."`

**Cause:** Database needs migration

**Solution:**
1. Run latest migrations in Supabase
2. Update schema version in database
3. Restart frontend app

**Message:** `"Database schema is too new (v2.0.0). This app expects v1.5.0."`

**Cause:** Frontend is outdated

**Solution:**
1. Pull latest frontend code: `git pull`
2. Update dependencies: `npm install`
3. Restart app: `npm start -- --clear`

### Issue: Health check key mismatch

**Message:** `"Health check key mismatch"`

**Cause:** `health_check_key` is not 'alive'

**Solution:**
```sql
UPDATE app_metadata SET health_check_key = 'alive' WHERE id = 1;
```

---

## 📊 Version History

### Schema Version 1.0.0 (Initial)
**Date:** January 2025
**Changes:**
- Created app_metadata table
- Renamed tables: team_matches → reefscape_matches
- Renamed tables: algae_actions → algae
- Renamed tables: coral_actions → coral
- Established health check system

**Migration:** `CREATE_APP_METADATA_TABLE.sql`

### Future Versions

**Version 1.1.0 (Planned)**
- Add analytics tables
- Add match schedule import

**Version 1.2.0 (Planned)**
- Add alliance selection features
- Add playoff bracket tracking

**Version 2.0.0 (Future)**
- Next game year (2026)
- New game schema

---

## 🎯 Best Practices

### For Database Administrators

1. **Always update schema version after migrations**
   ```sql
   SELECT update_schema_version('1.1.0', 'Description of changes');
   ```

2. **Never delete the app_metadata row**
   - It's protected by RLS, but don't override

3. **Document breaking changes**
   - Major version bumps = breaking changes
   - Update frontend code BEFORE deploying

4. **Test migrations in dev first**
   - Verify health check still works
   - Confirm version update successful

### For Frontend Developers

1. **Update expected version when pulling DB changes**
   - Check `EXPECTED_SCHEMA_VERSION` in schemaVersion.ts
   - Match database schema version

2. **Don't suppress schema warnings**
   - They indicate real compatibility issues
   - Fix the root cause, don't silence the warning

3. **Test with different schema versions**
   - Simulate old database (version mismatch)
   - Verify error handling

4. **Use feature flags for gradual rollouts**
   - Query `feature_flags` from metadata
   - Hide features not ready for production

---

## 🔐 Security Notes

### RLS Policies

**Read Access:** Public (anon/publishable key)
- ✅ Anyone can check health and version
- ✅ Required for connection indicator to work

**Write Access:** Service Role Only
- ❌ Frontend cannot modify metadata
- ✅ Only migrations (with service_role key) can update

### Why This Is Safe

- Frontend can read version info (not sensitive)
- Frontend cannot change version info (prevents tampering)
- Health check key is static ('alive') = no secrets
- Feature flags are intentionally public (control visibility)

---

## 📚 Reference

### Helper Functions

**Get Schema Version:**
```sql
SELECT get_schema_version();
```

**Check Compatibility:**
```sql
SELECT check_schema_compatibility('1.0.0');
```

**Ping Health Check:**
```sql
SELECT ping_health_check();  -- Updates last_health_check timestamp
```

### Frontend API

**Check Connection:**
```typescript
const isConnected = await supabaseService.checkConnection();
```

**Get Schema Version:**
```typescript
const version = await supabaseService.getSchemaVersion();
```

**Get Full Metadata:**
```typescript
const metadata = await supabaseService.getAppMetadata();
```

**Validate Schema:**
```typescript
import { isSchemaCompatible, getSchemaCompatibilityMessage } from '@/data/schemaVersion';

const compatible = isSchemaCompatible('1.0.0');
const { message, action } = getSchemaCompatibilityMessage('1.0.0');
```

---

## ✅ Summary

### What You Get

1. ✅ **Reliable Health Checks** - Dedicated table, always fast
2. ✅ **Schema Validation** - Automatic compatibility checking
3. ✅ **Version Tracking** - Know exactly what schema you're running
4. ✅ **Feature Flags** - Control features without app updates
5. ✅ **Migration History** - Track what changed and when

### Maintenance Tasks

**After Every Migration:**
1. Update schema version in database
2. Update expected version in frontend (if needed)
3. Restart app to pick up changes
4. Verify green connection indicator

**Before Competition:**
1. Verify schema version matches
2. Check feature flags are correct
3. Test health check working
4. Document current version

---

**Created:** January 7, 2025
**Status:** ✅ Implemented and Ready
**Migration File:** `CREATE_APP_METADATA_TABLE.sql`
