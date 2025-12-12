# SUPABASE SETUP INSTRUCTIONS

## Step 1: Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a free account (if you don't have one)
2. Create a new project:
   - Click "New Project"
   - Enter a name (e.g., "ClassHub ERP")
   - Enter a secure database password (save this - you'll need it!)
   - Choose a region closest to you
   - Click "Create new project"
   - Wait a few minutes for setup to complete

3. Get your Project URL and Anon Key:
   - From your project dashboard, click on "Settings" (gear icon in sidebar)
   - Click on "API"
   - Copy the **Project URL** (under "Project URL")
   - Copy the **anon/public key** (under "Project API keys")

## Step 2: Run the Database Schema

1. In your Supabase project dashboard, click on "SQL Editor" in the left sidebar
2. Click "New Query"
3. Open the file `supabase-schema.sql` from your project root
4. Copy ALL the SQL content from that file
5. Paste it into the Supabase SQL Editor
6. Click "Run" (or press Ctrl/Cmd + Enter)
7. You should see: "Success. No rows returned"

This will create:
- ✅ Classes table
- ✅ Users table
- ✅ Tasks table
- ✅ Task Statuses table
- ✅ Timetable Slots table
- ✅ Notifications table (optional - see below)
- ✅ Demo data (1 CR + 3 students)

### Optional: Notifications Table

If you want to enable the notification/reminder system (where CRs can send notifications to students), also run the SQL from `supabase-notifications-schema.sql`:

1. Open `supabase-notifications-schema.sql` in your project root
2. Copy all the SQL content
3. Paste it into Supabase SQL Editor
4. Click \"Run\"

This adds the `notifications` table for CR → Student messaging.

## Step 3: Add Environment Variables

1. In your project root directory (where `package.json` is), create a file called `.env.local`
2. Add the following content:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Replace `your_project_url_here` with the Project URL you copied
4. Replace `your_anon_key_here` with the anon key you copied

**Example:**
```
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsIn...
```

## Step 4: Start the Application

1. Stop the dev server if it's running (Ctrl+C)
2. Start it again:
   ```bash
   npm run dev
   ```

3. Open the app in your browser (usually http://localhost:5174)

## Step 5: Test the Login

You can now log in with the demo accounts:

**CR Account:**
- Email: `cr@class.com`
- Password: `password123`

**Student Accounts:**
- Email: `alice@student.com` / Password: `password123`
- Email: `bob@student.com` / Password: `password123`
- Email: `charlie@student.com` / Password: `password123`

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure `.env.local` is in the project root (same folder as `package.json`)
- Make sure the variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after creating `.env.local`

### Login fails / No data showing
- Check the browser console for errors
- Verify the SQL schema ran successfully in Supabase
- Check Supabase dashboard → Table Editor to see if data exists
- Verify your anon key is correct

### "relation does not exist" error
- The database tables weren't created
- Re-run the SQL schema in Supabase SQL Editor

## What Changed?

✅ **Removed**: All localStorage / JSON data storage
✅ **Removed**: Seed data files (seedData.ts)
✅ **Added**: Supabase client integration
✅ **Migrated**: All repositories now query Supabase database
✅ **Migrated**: Authentication now uses Supabase users table
✅ **Same**: All UI/UX exactly as before

All your data is now stored in a real PostgreSQL database in Supabase! 🎉
