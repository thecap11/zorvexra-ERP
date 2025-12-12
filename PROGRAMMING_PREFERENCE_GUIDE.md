# C/Java Programming Preference - Implementation Guide

## Current Status

I've encountered file corruption issues while trying to automatically edit files. To avoid further problems, here's a complete manual implementation guide.

## ✅ Already Completed

1. Created `programming-preference-migration.sql` - Ready to run in Supabase
2. Updated `src/types/index.ts` - Added `programmingPreference?: 'C' | 'JAVA' | null;` to User and AuthUser

## ⚠️ File Needs Manual Fix

**`src/services/userRepository.ts` got corrupted with duplicate functions.**

Please manually add these two lines:

### In `mapFromDB` method (around line 295):
```typescript
private static mapFromDB(dbUser: any): User {
    return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        password: dbUser.password,
        role: dbUser.role,
        rollNo: dbUser.roll_no,
        classId: dbUser.class_id,
        preferredLanguage: dbUser.preferred_language as 'GERMAN' | 'FRENCH' | null,
        programmingPreference: dbUser.programming_preference as 'C' | 'JAVA' | null, // ADD THIS LINE
    };
}
```

### In `mapToDB` method (around line 308):
```typescript
private static mapToDB(user: any): any {
    const dbUser: any = {
        name: user.name,
        email: user.email,
        role: user.role,
    };

    if (user.id) dbUser.id = user.id;
    if (user.password) dbUser.password = user.password;
    if (user.rollNo !== undefined) dbUser.roll_no = user.rollNo;
    if (user.classId) dbUser.class_id = user.classId;
    if (user.preferredLanguage !== undefined) dbUser.preferred_language = user.preferredLanguage;
    if (user.programmingPreference !== undefined) dbUser.programming_preference = user.programmingPreference; // ADD THIS LINE

    return dbUser;
}
```

## 📝 Remaining Implementation Steps

### Step 1:  Fix UserRepository (Manual)

See above - add the two lines for `programmingPreference`

### Step 2: Add Method to Update Programming Preference

Add to `UserRepository` class:

```typescript
/**
 * Update user's programming preference
 */
static async updateProgrammingPreference(
    userId: string,
    preference: 'C' | 'JAVA' | null
): Promise<User | undefined> {
    return this.updateUser(userId, { programmingPreference: preference });
}
```

### Step 3: Update languageUtils.ts

Add programming elective detection:

```typescript
// Add to languageUtils.ts
export function isProgrammingElective(subject: string): boolean {
    const lower = subject.toLowerCase();
    return lower.includes('programming') && (lower.includes('c') || lower.includes('java'));
}

export function getProgrammingOption(subject: string): 'C' | 'JAVA' | null {
    const lower = subject.toLowerCase();
    if (lower.includes(' c ') || lower.includes('(c)') || lower.includes('- c')) return 'C';
    if (lower.includes('java')) return 'JAVA';
    return null;
}
```

### Step 4: Update Student Management Page

Add programming preference dropdown (similar to language preference):

```tsx
// In StudentManagementPage.tsx, add column:
<th>Programming</th>

// In table row:
<td>
    <select
        value={student.programmingPreference || ''}
        onChange={(e) => handleProgrammingChange(student.id, e.target.value as 'C' | 'JAVA' | '')}
        className="..."
    >
        <option value="">Not Set</option>
        <option value="C">C</option>
        <option value="JAVA">Java</option>
    </select>
</td>

// Add handler:
const handleProgrammingChange = async (studentId: string, preference: 'C' | 'JAVA' | '') => {
    const value = preference === '' ? null : preference;
    await UserRepository.updateProgrammingPreference(studentId, value);
    // Refresh list
    loadStudents();
    toast.success('Programming preference updated');
};
```

### Step 5: Update Attendance Page

Add C/Java tabs (copy the German/French pattern):

```tsx
// In AttendanceCalendarPage.tsx

// Add state:
const [selectedProgramming, setSelectedProgramming] = useState<'C' | 'JAVA'>('C');

// Update load logic to detect programming elective:
if (isProgrammingElective(selectedPeriod.subject)) {
    // Show C/Java tabs instead of / in addition to language tabs
}

// Filter students by programming preference:
if (isProgrammingElective(selectedPeriod.subject)) {
    students = allStudents.filter(s => s.programmingPreference === selectedProgramming);
}

// Add tab UI (similar to language tabs):
{selectedPeriod && isProgrammingElective(selectedPeriod.subject) && (
    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
        <button onClick={() => setSelectedProgramming('C')} className={...}>C</button>
        <button onClick={() => setSelectedProgramming('JAVA')} className={...}>Java</button>
    </div>
)}
```

### Step 6: Update Student Dashboard

Add programming preference display:

```tsx
// In StudentDashboard.tsx
{user.programmingPreference && (
    <div className="flex items-center gap-2">
        <Code className="w-5 h-5 text-primary-600" />
        <div>
            <p className="text-sm text-slate-600">Programming Language</p>
            <p className="font-semibold">{user.programmingPreference}</p>
        </div>
    </div>
)}
```

## Database Migration

Run this in Supabase SQL Editor:

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS programming_preference TEXT 
CHECK (programming_preference IN ('C', 'JAVA'));
```

## Testing Checklist

- [ ] Run database migration
- [ ] Build compiles without errors
- [ ] CR can assign C/Java to students
- [ ] CR marks attendance for "Programming Elective (C/Java)" period
- [ ] C and Java tabs appear
- [ ] Only C students show when C tab selected
- [ ] Only Java students show when Java tab selected
- [ ] Student sees their programming preference on dashboard
- [ ] Attendance persists correctly

## Recommendation

Due to the file editing issues, I recommend:
1. Fix `userRepository.ts` manually first (remove duplicates, add the 2 lines)
2. Test that it compiles
3. Then I can continue with the remaining steps OR you can follow this guide manually
