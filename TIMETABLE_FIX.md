# Timetable Visibility Fix - Setup Guide

## Problem
Students cannot see timetables created by CRs. Timetable appears blank on student dashboard.

## Root Cause
Row Level Security (RLS) on `timetable_slots` table is blocking student access due to missing policies.

## Solution - Choose One Approach

### ✅ **Option 1: Production-Ready (Recommended)**

Run `timetable-rls-policies.sql` in Supabase SQL Editor.

**What it does:**
- Enables RLS with proper policies
- Students can **read** timetables for their class
- Only CRs can **create/edit/delete** timetables
- Secure and production-ready

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Copy and run all SQL from `timetable-rls-policies.sql`
3. Verify policies are active (queries included in file)

---

### ⚡ **Option 2: Quick Fix (Development Only)**

Run `fix-rls-issue.sql` in Supabase SQL Editor.

**What it does:**
- Disables RLS completely on all tables
- No security restrictions
- Simple and fast for development/prototypes

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Copy and run all SQL from `fix-rls-issue.sql`
3. Done - all users can access all data

---

## After Running SQL Migration

### Test the Fix:

1. **As CR:**
   - Login as CR (`cr@class.com` / `password123`)
   - Go to Timetable page
   - Create or update the timetable
   - Save changes

2. **As Student:**
   - Login as student (`alice@student.com` / `password123`)
   - Go to Timetable page
   - **You should now see the same timetable as CR**

### Debug if Still Not Working:

Open browser console (F12) and look for:
```
====== STUDENT TIMETABLE LOADING ======
User: {id: "...", role: "STUDENT", classId: "..."}
Fetching timetable for classId: ...
✅ Timetable data received: {entriesCount: X, hasData: true, ...}
```

**If you see `entriesCount: 0`:**
- Check if CR has actually created the timetable
- Verify class IDs match between CR and student
- Check Supabase RLS policies are active

**If you see an error:**
- Check the error message in console
- Verify you ran the SQL migration
- Check Supabase credentials are correct

## Enhanced Features

### Improved Student UI:
- Shows helpful message when no timetable exists
- Better loading states
- Comprehensive console debugging

### Debug Logging:
The student timetable page now logs:
- User details (ID, role, classId)
- Query results (count, first entry)
- Helpful warnings for common issues
- Detailed error information

## Files Changed

- ✅ `timetable-rls-policies.sql` - NEW production RLS policies
- ✅ `fix-rls-issue.sql` - UPDATED disable RLS script
- ✅ `StudentTimetablePage.tsx` - Enhanced logging and empty state UI

## No Code Changes Needed

The repository queries were already correct! Both CR and students use:
- Same `TimetableRepository` methods
- Same `class_id` filtering
- No role-based restrictions

The issue was purely RLS policies in Supabase.
