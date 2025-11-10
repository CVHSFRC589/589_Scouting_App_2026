# Manual Testing Guide: Authentication System

This guide helps you manually test the new authentication system.

## Prerequisites

- Supabase database schema applied (`setup_authentication.sql`)
- Frontend development server running (`npm start`)
- Access to Supabase dashboard for verification

## Test Suite

### Test 1: New User Signup ✅

**Steps:**
1. Open the app (should show login screen)
2. Click "Sign Up" link
3. Fill in the form:
   - Display Name: "Test Student" (optional)
   - Email: `test@example.com`
   - Password: `test123`
   - Confirm Password: `test123`
4. Click "Create Account"

**Expected Results:**
- ✅ Success alert: "Account Created! 🎉"
- ✅ Redirects to login screen
- ✅ Console shows: `[Auth] Sign up successful`

**Verify in Database:**
```sql
-- Check user was created
SELECT email, created_at FROM auth.users
WHERE email = 'test@example.com';

-- Check profile was auto-created
SELECT email, display_name, is_admin, created_at
FROM user_profiles
WHERE email = 'test@example.com';
```

---

### Test 2: User Login ✅

**Steps:**
1. On login screen, enter:
   - Email: `test@example.com`
   - Password: `test123`
2. Click "Sign In"

**Expected Results:**
- ✅ Redirects to home screen
- ✅ Console shows:
   ```
   [Auth] Sign in successful
   [Index] User authenticated, redirecting to home
   ```

**Verify in Database:**
```sql
-- Check last_login was updated
SELECT email, last_login, created_at
FROM user_profiles
WHERE email = 'test@example.com';
```

---

### Test 3: Form Validation ✅

Test each validation rule:

**A. Empty Email**
- Leave email blank → Should show error: "Please enter your email address."

**B. Invalid Email Format**
- Enter: `notanemail` → Should show error: "Please enter a valid email address."

**C. Short Password**
- Enter password: `12345` (less than 6 chars) → Should show error: "Password must be at least 6 characters long."

**D. Passwords Don't Match**
- Password: `test123`
- Confirm: `test456`
- Should show error: "Passwords do not match."

**E. Email Already Exists**
- Try to sign up with `test@example.com` again → Should show: "This email is already registered. Try signing in instead."

---

### Test 4: Protected Routes ✅

**Steps:**
1. Log out (if logged in)
2. Try to manually navigate to: `/(login)/home`

**Expected Results:**
- ✅ Redirects back to login screen
- ✅ Console shows: `[Router] Redirecting to login - user not authenticated`

---

### Test 5: User Tracking in Pit Scouting ✅

**Steps:**
1. Log in as test user
2. Navigate to Pit Scouting
3. Fill in pit scouting data for a team (e.g., Team 589)
4. Submit the data

**Expected Results:**
- ✅ Data saved successfully
- ✅ Console shows: `✅ Pit data saved to Supabase by user <user-id>`

**Verify in Database:**
```sql
-- Check submitted_by is set
SELECT team_number, regional, submitted_by, submitted_at
FROM robot_info
WHERE team_number = 589
ORDER BY submitted_at DESC
LIMIT 1;

-- Verify it links to correct user
SELECT
    ri.team_number,
    ri.regional,
    ri.submitted_at,
    up.email as submitted_by_email,
    up.display_name as submitted_by_name
FROM robot_info ri
JOIN user_profiles up ON ri.submitted_by = up.id
WHERE ri.team_number = 589
ORDER BY ri.submitted_at DESC
LIMIT 1;
```

---

### Test 6: User Tracking in Match Scouting ✅

**Steps:**
1. Log in as test user
2. Navigate to Match Scouting
3. Complete all phases (Pregame → Auto → Tele → Post)
4. Submit the match

**Expected Results:**
- ✅ Data queued for upload
- ✅ Console shows: `✅ Complete match data saved to Supabase by user <user-id>`

**Verify in Database:**
```sql
-- Check submitted_by is set
SELECT team_number, match_number, regional, submitted_by, submitted_at
FROM matches
WHERE team_number = 589
ORDER BY submitted_at DESC
LIMIT 1;

-- Verify it links to correct user
SELECT
    m.team_number,
    m.match_number,
    m.regional,
    m.submitted_at,
    up.email as submitted_by_email,
    up.display_name as submitted_by_name
FROM matches m
JOIN user_profiles up ON m.submitted_by = up.id
WHERE m.team_number = 589
ORDER BY m.submitted_at DESC
LIMIT 1;
```

---

### Test 7: Admin User Setup ✅

**Steps:**
1. Sign up with your actual email (e.g., `coach@team589.org`)
2. Run in Supabase SQL Editor:
   ```sql
   UPDATE user_profiles
   SET is_admin = true
   WHERE email = 'coach@team589.org';
   ```
3. Verify admin status:
   ```sql
   SELECT email, is_admin FROM user_profiles
   WHERE email = 'coach@team589.org';
   ```

**Expected Results:**
- ✅ `is_admin` is now `true`
- ✅ Admin user can access admin features (future implementation)

---

### Test 8: Admin User List View ✅

**Query the admin view:**
```sql
SELECT
    email,
    display_name,
    is_admin,
    total_matches_submitted,
    total_pit_reports_submitted,
    last_login
FROM admin_user_list
ORDER BY created_at DESC;
```

**Expected Results:**
- ✅ Shows all users with their submission counts
- ✅ Counts match actual submissions

---

## Common Issues & Solutions

### Issue: "No route named '(login)' exists"
**Solution:** Make sure `app/(login)/_layout.tsx` exists. This was added to fix routing.

### Issue: Profile not created after signup
**Solution:** Check the trigger exists:
```sql
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```
If missing, re-run `setup_authentication.sql`.

### Issue: Cannot update `is_admin` field
**Solution:** Make sure you're logged in to Supabase with admin privileges, or use the service role key.

### Issue: `submitted_by` is null
**Solution:** User might not be logged in when submitting. Check:
```javascript
console.log('User profile:', userProfile);
```
Should show user ID.

---

## Next Steps After Testing

Once all tests pass:

1. ✅ Authentication system is working
2. ✅ User tracking is recording submissions
3. 🔜 Build admin UI for user management
4. 🔜 Add team/regional selection after login
5. 🔜 Create match statistics dashboard
6. 🔜 Implement scouting assignments

---

## Test Results Log

Use this section to track your test results:

- [ ] Test 1: New User Signup
- [ ] Test 2: User Login
- [ ] Test 3: Form Validation
- [ ] Test 4: Protected Routes
- [ ] Test 5: Pit Scouting Tracking
- [ ] Test 6: Match Scouting Tracking
- [ ] Test 7: Admin User Setup
- [ ] Test 8: Admin User List View

**Date Tested:** ___________
**Tested By:** ___________
**Issues Found:** ___________
