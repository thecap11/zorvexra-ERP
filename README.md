# ClassHub ERP - Class Management System

A modern, beautiful web application for managing class activities between Class Representatives (CR) and Students. Built with React, TypeScript, and Tailwind CSS.

![ClassHub ERP](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue)

## 🎯 Features

### For Class Representatives (CR)
- **Dashboard Overview**: View total students, assignments, and attendance records at a glance
- **Task Management**: Create and manage assignments and attendance records
- **Attendance Tracking**: Mark students as present/absent with bulk actions
- **Assignment Monitoring**: Track student submission status for each assignment
- **Real-time Updates**: All changes are immediately reflected in the system

### For Students
- **Personal Dashboard**: View attendance percentage and assignment completion stats
- **Assignment Management**: View all assignments and mark them as completed
- **Attendance History**: Track attendance records and view detailed statistics
- **Status Updates**: Toggle assignment completion status with one click

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd classerp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔐 Demo Credentials

### Class Representative (CR)
- **Email**: `cr@class.com`
- **Password**: `password123`

### Students
- **Email**: `alice@student.com` (or any other student email)
- **Password**: `password123`

**Available student emails:**
- alice@student.com
- bob@student.com
- carol@student.com
- david@student.com
- emma@student.com
- frank@student.com
- grace@student.com
- henry@student.com

## 📁 Project Structure

```
classerp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Layout.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Navbar.tsx
│   │   └── RequireAuth.tsx
│   ├── context/            # React Context providers
│   │   └── AuthContext.tsx
│   ├── data/               # Seed data
│   │   └── seedData.ts
│   ├── hooks/              # Custom React hooks
│   │   ├── useTasks.ts
│   │   └── useTaskStatuses.ts
│   ├── pages/              # Page components
│   │   ├── CRDashboard.tsx
│   │   ├── CreateTaskPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── StudentAssignmentsPage.tsx
│   │   ├── StudentAttendancePage.tsx
│   │   ├── StudentDashboard.tsx
│   │   └── TaskDetailPage.tsx
│   ├── services/           # Data layer (Repository pattern)
│   │   ├── classRepository.ts
│   │   ├── storage.ts
│   │   ├── taskRepository.ts
│   │   ├── taskStatusRepository.ts
│   │   └── userRepository.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🗄️ Data Layer Architecture

The application uses a **Repository Pattern** that abstracts data access, making it easy to migrate from localStorage to Supabase or any other backend.

### Current Implementation (localStorage)
All data is stored in the browser's localStorage using these repositories:

- **UserRepository**: User authentication and management
- **TaskRepository**: Assignment and attendance task management
- **TaskStatusRepository**: Student task completion and attendance status
- **ClassRepository**: Class information management

### Migrating to Supabase

To migrate to Supabase, you only need to update the repository files in `src/services/`:

1. **Install Supabase client**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Update repository methods**
   Replace localStorage operations with Supabase queries. For example:

   **Before (localStorage):**
   ```typescript
   static async getUserByEmail(email: string): Promise<User | undefined> {
     const users = Storage.get<User[]>(STORAGE_KEYS.USERS) || [];
     return users.find(u => u.email === email);
   }
   ```

   **After (Supabase):**
   ```typescript
   static async getUserByEmail(email: string): Promise<User | undefined> {
     const { data, error } = await supabase
       .from('users')
       .select('*')
       .eq('email', email)
       .single();
     return data || undefined;
   }
   ```

3. **No changes needed in UI components**
   All React components use the repository methods, so they'll work seamlessly with Supabase once repositories are updated.

## 🎨 UI/UX Features

- **Modern Design**: Gradient backgrounds, glassmorphism effects, and smooth animations
- **Responsive Layout**: Works beautifully on desktop, tablet, and mobile devices
- **Intuitive Navigation**: Role-based routing with clear navigation paths
- **Loading States**: Smooth loading indicators for better user experience
- **Status Indicators**: Color-coded badges for quick status recognition
- **Interactive Elements**: Hover effects and transitions for better feedback

## 🛠️ Technologies Used

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **UUID**: Unique ID generation

## 📊 Data Models

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "CR" | "STUDENT";
  rollNo?: string;
  classId: string;
}
```

### Task
```typescript
interface Task {
  id: string;
  classId: string;
  title: string;
  description?: string;
  type: "ASSIGNMENT" | "ATTENDANCE";
  dueDate?: string;
  createdBy: string;
  createdAt: string;
}
```

### TaskStatus
```typescript
interface TaskStatus {
  id: string;
  taskId: string;
  studentId: string;
  status: "NOT_COMPLETED" | "COMPLETED" | "PRESENT" | "ABSENT";
  submittedAt?: string;
  remarks?: string;
}
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌟 Key Features Implementation

### Authentication
- Session persistence using localStorage
- Role-based access control
- Protected routes with automatic redirection

### Task Management
- Create assignments with due dates
- Create attendance records
- Automatic status initialization for all students

### Student Interaction
- Toggle assignment completion status
- View attendance percentage
- Filter assignments by status

### CR Controls
- Bulk attendance marking (Mark all present/absent)
- View individual student status
- Track submission timestamps

## 📝 Future Enhancements

- [ ] Email notifications for new assignments
- [ ] File upload for assignment submissions
- [ ] Export attendance reports to CSV
- [ ] Calendar view for assignments
- [ ] Real-time collaboration with WebSockets
- [ ] Mobile app version
- [ ] Integration with Google Classroom

## 🤝 Contributing

This is a demo project. Feel free to fork and customize for your needs!

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 💡 Notes

- All passwords are stored in plain text for demo purposes. In production, use proper password hashing (bcrypt, argon2, etc.)
- The application uses localStorage, which means data is stored per browser. Clearing browser data will reset the application.
- Sample data is automatically seeded on first load

---

**Built with ❤️ for efficient class management**
