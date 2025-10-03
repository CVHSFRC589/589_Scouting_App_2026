# 🔄 Supabase Migration Guide
## Firebase → Modern Supabase Setup

This guide walks you through migrating from your current Firebase setup to the modern Supabase configuration using **secret keys** and **type-safe operations**.

---

## 🔑 **Key Changes (Modern Supabase Approach)**

### **1. Secret Keys vs Service Role Keys**

**Old Approach (Deprecated):**
```env
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...  # JWT-based service_role key
```

**New Approach (Recommended):**
```env
SUPABASE_SECRET_KEY=sb_secret_abc123...  # Modern secret key format
```

### **2. Enhanced Security Features**

✅ **Secret keys** start with `sb_secret_` prefix
✅ **Cannot be used in browser** - Server-only security
✅ **Elevated privileges** with bypass of Row Level Security
✅ **Better logging and monitoring** capabilities

---

## 🚀 **Setup Instructions**

### **Step 1: Get Your Supabase Secret Key**

1. **Go to your Supabase project dashboard**
2. **Click Settings → API**
3. **Copy the "Secret" key** (starts with `sb_secret_`)
   - ❌ **Not** the "anon" key
   - ❌ **Not** the "service_role" key
   - ✅ **Use** the "Secret" key

### **Step 2: Update Environment Variables**

**Update `backend-api/.env`:**
```env
# Modern Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SECRET_KEY=sb_secret_your_actual_secret_key_here
```

### **Step 3: Install Dependencies and Generate Types**

```bash
# Install new dev dependencies for type generation
cd backend-api
npm install

# Generate TypeScript types from your database schema
npm run gen-types
```

**Note:** You'll need to set the `PROJECT_REF` environment variable:
```bash
export PROJECT_REF=your-project-id  # Linux/macOS
set PROJECT_REF=your-project-id     # Windows
npm run gen-types
```

### **Step 4: Validate Your Setup**

```bash
cd ..
source venv/Scripts/activate  # Windows
python scripts/validate_environment.py
```

You should now see **10/10 checks passed**! 🎉

---

## 🔧 **Code Changes Implemented**

### **1. Updated Database Configuration**

**New type-safe client (`src/config/database.ts`):**
```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

**Key improvements:**
- ✅ **Type-safe database operations**
- ✅ **Secret key validation**
- ✅ **Enhanced error handling**
- ✅ **Better connection testing**

### **2. TypeScript Type Generation**

**Automatic type generation:**
```bash
npm run gen-types  # Generates src/types/database.types.ts
```

**Benefits:**
- ✅ **IntelliSense** for all database columns
- ✅ **Compile-time error checking**
- ✅ **Auto-completion** in VS Code
- ✅ **Refactoring safety**

### **3. Enhanced Package Scripts**

**New npm scripts:**
```json
{
  "gen-types": "Generate TypeScript types from database",
  "lint": "ESLint code checking",
  "format": "Prettier code formatting"
}
```

---

## 📊 **Migration from Firebase**

### **Data Migration Strategy**

**Option 1: Automated Migration Script (Recommended)**
```bash
# Export Firebase data
python Scouting-Back-End/firebase_export.py

# Import to Supabase
npm run migrate-data
```

**Option 2: Manual Migration**
1. **Export data** from Firebase Console
2. **Transform data** to match new schema
3. **Import via Supabase** SQL Editor or CSV upload

### **Schema Comparison**

**Firebase Structure:**
```
/regionals/Orange-County/teams/589/Stats/...
```

**Supabase Structure:**
```sql
teams (id, team_number, regional)
matches (team_id, match_data...)
team_statistics (team_id, stat_category, stat_name, value)
```

### **Real-time Features**

**Firebase Realtime Database:**
```javascript
// Old Firebase approach
firebase.database().ref('/teams').on('value', callback);
```

**Supabase Real-time:**
```javascript
// New Supabase approach
supabase
  .channel('team-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'teams' },
    callback
  )
  .subscribe();
```

---

## 🔍 **Testing Your Migration**

### **1. Connection Test**
```bash
cd backend-api
npm run dev
curl http://localhost:3000/health
```

### **2. Database Operations Test**
```bash
# Test team creation
curl -X POST http://localhost:3000/api/teams \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-key-123" \
  -d '{"team_number": 589, "team_name": "Falkon Robotics", "regional": "Orange County"}'

# Test team query
curl "http://localhost:3000/api/teams?regional=Orange County" \
  -H "x-api-key: dev-key-123"
```

### **3. Type Safety Test**
Open any route file in VS Code - you should see:
- ✅ **Auto-complete** for database columns
- ✅ **Type checking** for insert/update operations
- ✅ **IntelliSense** for query building

---

## 🛡️ **Security Best Practices**

### **Environment Variable Security**
```bash
# ✅ DO: Use secret keys only in backend
SUPABASE_SECRET_KEY=sb_secret_xxx

# ❌ DON'T: Use secret keys in frontend
# Frontend should use anon/publishable keys
```

### **Row Level Security (RLS)**
```sql
-- Secret keys bypass RLS, so implement application-level security
-- Example: Check team ownership in API routes
```

### **API Key Management**
```env
# Different keys for different environments
API_KEYS=dev-key-123,mobile-app-key,web-dashboard-key
```

---

## 🎓 **For Students: Learning Opportunities**

### **Backend Development Skills**
- **TypeScript** for type-safe backend development
- **Modern database patterns** with Supabase
- **API security** with secret key management
- **Schema design** and migration strategies

### **Deployment Skills**
- **Environment management** across dev/staging/production
- **Type generation** in CI/CD pipelines
- **Database migration** strategies
- **Security auditing** and key rotation

---

## 🆘 **Troubleshooting**

### **Common Issues**

**"Invalid secret key format":**
- Ensure key starts with `sb_secret_`
- Check you're using Secret key, not anon/service_role

**"Type generation fails":**
- Set `PROJECT_REF` environment variable
- Ensure Supabase CLI is installed
- Check database connection

**"Connection timeout":**
- Verify Supabase URL is correct
- Check secret key has proper permissions
- Test from Supabase dashboard first

### **Getting Help**

1. **Check validation script**: `python scripts/validate_environment.py`
2. **Review logs**: Backend API shows detailed error messages
3. **Test connection**: Use Supabase dashboard to verify credentials
4. **Ask team**: Use Discord/Slack for team support

---

This modern Supabase setup provides **better security**, **type safety**, and **developer experience** while preparing your team for industry-standard backend development practices! 🚀