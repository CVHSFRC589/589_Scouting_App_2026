# Submission Tracking for Match Reports

## Overview

Match reports now track which user submitted each report and when it was submitted. This enables accountability and helps identify which students are actively scouting.

## Database Changes

### Migration Required

**Run this in Supabase SQL Editor:**
`Backend_2025_Scouting/supabase_migration/ADD_SUBMISSION_TRACKING_TO_MATCH_REPORTS.sql`

This adds:
- `submitted_by` (UUID) - References the user_profiles table
- `submitted_at` (TIMESTAMP) - When the report was submitted
- Indexes on both columns for fast lookups

### Schema

```sql
ALTER TABLE match_reports
ADD COLUMN submitted_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE;
```

## Frontend Implementation

### Data Flow

1. **User Authentication**
   - User logs in → AuthContext stores `userProfile.id`
   - Available throughout the app via `useAuth()` hook

2. **Match Scouting Workflow**
   - Pregame → Auto → Tele → **Post**
   - On Post page Submit button:
     ```typescript
     const { userProfile } = useAuth();

     const matchDataWithUser = {
       ...matchData,
       submitted_by: userProfile?.id  // Add user ID
     };

     await uploadQueue.enqueue('match_complete', matchDataWithUser);
     ```

3. **Upload Queue Processing**
   - Queue processes match_complete items
   - Calls `supabaseService.submitCompleteMatch(matchData)`
   - Includes `submitted_by` in the data

4. **Database Save**
   ```typescript
   await supabase
     .from('match_reports')
     .upsert({
       // ... all match data ...
       submitted_by: matchData.submitted_by || null,
       submitted_at: matchData.submitted_by ? new Date().toISOString() : null
     });
   ```

## Files Modified

### Backend
- ✅ `ADD_SUBMISSION_TRACKING_TO_MATCH_REPORTS.sql` - Database migration (NEW)

### Frontend
- ✅ `data/supabaseService.tsx` - Added `submitted_by` and `submitted_at` to submitCompleteMatch()
- ✅ `app/(login)/(regional)/(Scouting)/(MatchScouting)/Post.tsx` - Already passing `submitted_by: userProfile?.id`

## Usage Examples

### Query matches by submitter

```sql
-- Get all matches submitted by a specific user
SELECT
  mr.*,
  up.display_name,
  up.email
FROM match_reports mr
LEFT JOIN user_profiles up ON mr.submitted_by = up.id
WHERE mr.submitted_by = 'user-uuid-here'
ORDER BY mr.submitted_at DESC;
```

### Get submission statistics

```sql
-- Count matches submitted by each user
SELECT
  up.display_name,
  up.email,
  COUNT(mr.id) as matches_submitted,
  MIN(mr.submitted_at) as first_submission,
  MAX(mr.submitted_at) as last_submission
FROM user_profiles up
LEFT JOIN match_reports mr ON up.id = mr.submitted_by
WHERE mr.regional = 'tc'  -- Filter by competition
GROUP BY up.id, up.display_name, up.email
ORDER BY matches_submitted DESC;
```

### Find unsubmitted matches

```sql
-- Matches that exist but don't have submission tracking
-- (These were likely created before the feature was added)
SELECT
  team_number,
  match_number,
  regional,
  created_at
FROM match_reports
WHERE submitted_by IS NULL
ORDER BY created_at DESC;
```

## Benefits

✅ **Accountability** - Know who submitted each match report
✅ **Activity Tracking** - See which scouts are most active
✅ **Quality Control** - Identify patterns in data quality by submitter
✅ **Recognition** - Recognize top contributors
✅ **Auditing** - Track when reports were submitted vs when matches occurred

## Backward Compatibility

- Existing match reports will have `submitted_by = NULL`
- New reports will automatically include the submitter's user ID
- The system works whether or not a user is logged in (gracefully handles null)

## Testing

1. **Run the migration**:
   - Execute `ADD_SUBMISSION_TRACKING_TO_MATCH_REPORTS.sql`
   - Verify columns exist with the verification query

2. **Submit a match report**:
   - Log in as a user
   - Complete a match scouting workflow
   - Submit on the Post page

3. **Verify data**:
   ```sql
   SELECT
     team_number,
     match_number,
     submitted_by,
     submitted_at
   FROM match_reports
   ORDER BY created_at DESC
   LIMIT 1;
   ```

   Should show the user's UUID in `submitted_by` and a timestamp in `submitted_at`

## Related Features

This matches the existing submission tracking in:
- ✅ `robot_info` table (pit scouting) - Already has `submitted_by` and `submitted_at`
- ✅ `match_reports` table (match scouting) - NOW has `submitted_by` and `submitted_at`

Both features use the same pattern for consistency across the application.
