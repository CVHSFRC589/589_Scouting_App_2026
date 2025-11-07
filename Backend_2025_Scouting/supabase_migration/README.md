# Frontend Compatibility Migration
## Team 589 Falkon Robotics - Simple Table Rename

---

## 🎯 What This Does

This migration **renames 3 tables** to match what the frontend expects:

1. `team_matches` → `reefscape_matches`
2. `algae_actions` → `algae`
3. `coral_actions` → `coral`

**That's it!** No data loss, no schema changes, just renaming.

---

## ⚠️ Why We Need This

The frontend app was built to write to tables named:
- `reefscape_matches`
- `algae`
- `coral`

But the current Supabase database has:
- `team_matches` ❌
- `algae_actions` ❌
- `coral_actions` ❌

**Result:** Frontend cannot submit match scouting data! This migration fixes that.

---

## 🚀 How to Run Migration

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in left sidebar

### Step 2: Run Migration Script

1. Click **New query**
2. Open file: `FRONTEND_FIX_MIGRATION.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click **Run** (or Ctrl+Enter)

**Expected output:**
```
✅ team_matches renamed to reefscape_matches
✅ algae_actions renamed to algae
✅ coral_actions renamed to coral
✅ Foreign key constraints updated
🎉 MIGRATION COMPLETE!
```

### Step 3: Verify Migration

```bash
cd Backend_2025_Scouting/supabase_migration
node verify_frontend_compatibility.js
```

**Expected output:**
```
✅ ALL TESTS PASSED!
🎉 Frontend is fully compatible with database!
```

---

## 📋 What Gets Changed

### Tables Renamed:
| Before | After | Data | Indexes | Policies |
|--------|-------|------|---------|----------|
| `team_matches` | `reefscape_matches` | ✅ Preserved | ✅ Updated | ✅ Updated |
| `algae_actions` | `algae` | ✅ Preserved | ✅ Updated | ✅ Updated |
| `coral_actions` | `coral` | ✅ Preserved | ✅ Updated | ✅ Updated |

### Tables Unchanged:
- ✅ `teams` - No change
- ✅ `robot_info` - No change
- ✅ `robot_rankings` - No change
- ✅ `robot_coral_stats` - No change
- ✅ `robot_algae_stats` - No change
- ✅ `robot_climb_stats` - No change
- ✅ `robots_complete` view - No change
- ✅ `events`, `tba_matches`, etc. - No change

---

## ✅ After Migration

### Frontend Will Work:
- ✅ Pit scouting (already working, no change)
- ✅ Match scouting (NOW WORKING!)
- ✅ Algae actions (NOW WORKING!)
- ✅ Coral placements (NOW WORKING!)
- ✅ Statistics viewing (already working, no change)

### Backend Will Need Updates:
Backend routes currently reference wrong table names. After migration:

**Files to update:**
- `src/routes/matches.js` - Change `matches` → `reefscape_matches`
- Any other routes querying match data

**Don't worry!** The migration script is safe. Backend just won't work until routes are updated.

---

## 🔒 Safety Features

This migration is safe because:
1. **No data deletion** - Only renaming tables
2. **Preserves all data** - Every row stays intact
3. **Maintains relationships** - Foreign keys updated automatically
4. **Keeps RLS** - Security policies recreated
5. **Updates indexes** - Performance maintained

---

## 🆘 Troubleshooting

### Error: "relation already exists"
**Cause:** Migration already ran
**Solution:** Tables are already renamed. Skip to verification step.

### Error: "cannot rename system column"
**Cause:** Trying to rename a Supabase system table
**Solution:** Make sure you're only renaming the 3 tables listed

### Frontend still can't write
**Solution:**
1. Check Supabase Table Editor - verify table names
2. Run verification script again
3. Check frontend console for errors

### Verification script fails
**Solution:**
```bash
# Check environment variables
cat Backend_2025_Scouting/.env | grep SUPABASE

# Test basic connection
cd Backend_2025_Scouting
node test-simple-connection.js
```

---

## 📊 Migration Timeline

**Total time:** ~5 minutes

1. **SQL Migration:** 1-2 minutes
2. **Verification:** 1 minute
3. **Testing:** 2 minutes

**Downtime:** Only during SQL execution (~30 seconds)

---

## 🎓 What Students Learn

This migration demonstrates:
- **Database schema evolution** - How to safely change structure
- **Table renaming** - PostgreSQL ALTER TABLE command
- **Foreign key management** - Updating relationships
- **RLS policy updates** - Maintaining security during changes
- **Index maintenance** - Keeping performance after rename
- **Verification testing** - Ensuring migrations work

---

## 📁 Files in This Directory

```
supabase_migration/
├── README.md                              ← You are here
├── FRONTEND_FIX_MIGRATION.sql             ← Main migration script
├── verify_frontend_compatibility.js       ← Verification script
└── (dangerous scripts deleted)            ← Removed for safety
```

---

## ✨ Next Steps After Migration

1. ✅ **Run migration** - Rename tables
2. ✅ **Verify success** - Run verification script
3. ⚠️ **Update backend** - Change route references
4. ✅ **Test frontend** - Submit match data
5. ✅ **Go scout!** - App is ready for competition

---

**Questions?** Check:
- Original audit: `../DATABASE_AUDIT_REPORT.md`
- Migration summary: `../MIGRATION_SUMMARY.md`

**Ready to fix the frontend!** 🤖🏆
