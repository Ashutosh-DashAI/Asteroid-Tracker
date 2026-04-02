# ASTRA Frontend Documentation

## Overview

ASTRA is a premium, modern SaaS frontend built with React 18, TypeScript, Tailwind CSS, and cutting-edge animation libraries. The application features a real-time chat interface with Socket.IO integration, JWT-based authentication, and a beautiful glassmorphism design.

## 🎯 Architecture & Tech Stack

### Core Technologies
- **React 18** - UI framework
- **Vite** - Build tool (blazingly fast)
- **TypeScript** - Type safety (strict mode)
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client with interceptors
- **Zustand** - Lightweight state management
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Lucide React** - Icon library

### Project Structure
```
src/
├── api/
│   └── api.ts                    # Axios setup with JWT token handling & refresh logic
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx         # Advanced login form with Zod validation
│   │   └── SignupForm.tsx        # Signup form with password strength indicator
│   ├── chat/
│   │   └── ChatInterface.tsx     # Real-time chat interface with typing indicators
│   ├── layout/
│   │   └── MainLayout.tsx        # Main layout with sidebar and header
│   └── notifications/
│       └── Toast.tsx             # Toast notification system
├── hooks/
│   └── useSocket.ts              # Socket.IO connection hook with lifecycle management
├── pages/
│   ├── LoginPage.tsx             # Login page wrapper
│   ├── SignupPage.tsx            # Signup page wrapper
│   └── DashboardPage.tsx         # Main dashboard with chat interface
├── store/
│   ├── authStore.ts              # Zustand auth store with persistence
│   └── chatStore.ts              # Zustand chat store with real-time updates
├── styles/
│   └── globals.css               # Global styles with animations & utilities
├── types/
│   └── index.ts                  # TypeScript type definitions
├── App.tsx                       # Main app component with routing & providers
└── main.tsx                      # Entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (or compatible version)
- npm or yarn package manager

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   - Backend runs on `http://localhost:3000`
   - Frontend runs on `http://localhost:5173` (Vite default)
   - Vite is configured with proxies for `/api` and `/socket.io`

3. **Start Development Server**
   ```bash
   npm  run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

5. **Type Checking**
   ```bash
   npm run type-check
   ```

## 🔐 API & Authentication

### JWT Token Handling
The Axios instance (`src/api/api.ts`) automatically:
- Attaches JWT token from localStorage to requests
- Handles 401 errors with automatic token refresh
- Retries failed requests after refresh
- Redirects to login on refresh failure

### Token Storage
- **Access Token**: `localStorage.getItem('token')`
- **Refresh Token**: `localStorage.getItem('refreshToken')`
- **User Data**: `localStorage.getItem('user')`

### API Endpoints Setup
All API endpoints are proxied through `/api`:
```typescript
// Backend: http://localhost:3000/auth/login
// Frontend calls: /api/auth/login (proxied by Vite)
```

## 💬 Real-Time Chat & Socket.IO

### Connection
Socket.IO automatically connects when user is authenticated:
```typescript
const { emit, on, isConnected } = useSocket();

// Listen for events
on('message:received', (data) => {
  // Handle new message
});

// Emit events
emit('typing', { chatId, userId });
```

### Socket Events
- `message:received` - New message arrived
- `message:sent` - Message confirmed sent
- `typing` - User started typing
- `stop:typing` - User stopped typing
- `user:online` - User came online
- `user:offline` - User went offline

## 🎨 Design System

### Glassmorphism Effects
```html
<!-- Backdrop blur with semi-transparent background -->
<div class="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl">
  Content
</div>

<!-- Utility classes -->
<div class="glass">Glass effect</div>
<div class="glass-sm">Smaller glass effect</div>
```

### Animations
Pre-built animation utilities in `src/styles/globals.css`:
- `animate-fadeIn`, `animate-fadeInUp`, `animate-fadeInDown`
- `animate-scaleIn`, `animate-slideInLeft`, `animate-slideInRight`
- `animate-bounce-soft`, `animate-pulse-glow`
- `animate-float`, `animate-shimmer`

### Color Palette
- Primary: Indigo (`#6366f1`)
- Secondary: Purple (`#a855f7`)
- Accent: Pink/Rose
- Dark: Slate 950 (`#030712`)

## 📝 Form Validation

### Zod Schema Example
```typescript
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;
```

### React Hook Form Integration
```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
  mode: 'onChange',
});
```

## 🌐 State Management (Zustand)

### Auth Store
```typescript
import { useAuthStore } from '@/store/authStore';

const { user, login, logout, isAuthenticated } = useAuthStore();
```

### Chat Store
```typescript
import { useChatStore } from '@/store/chatStore';

const { chats, messages, sendMessage } = useChatStore();
```

Both stores include:
- Local storage persistence
- Error handling
- Loading states
- Real-time updates

## 🧪 TypeScript Types

### Core Types (`src/types/index.ts`)
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Chat {
  id: string;
  participantId: string;
  participant: User;
  lastMessage?: Message;
  unreadCount: number;
}
```

## 📱 Responsive Design

The application is fully responsive:
- Mobile-first approach
- Tailwind breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`
- Hidden/visible utilities for different screen sizes
- Collapsible sidebar on mobile

## 🎭 Component Showcase

### LoginForm Component
- Zod validation
- Password visibility toggle
- Real-time error messages with animations
- Loading state button
- Smooth transitions

### SignupForm Component
- Advanced password strength indicator
- Confirm password validation
- Real-time error animations
- Password visibility toggles
- Pre-filled field status indicators

### ChatInterface Component
- Real-time message display
- Typing indicators
- Auto-scroll to latest message
- Message timestamps
- File attachment UI (placeholder)
- Emoji selector UI (placeholder)

### MainLayout Component
- Responsive sidebar
- Mobile menu toggle
- Real-time connection status
- Unread message badge
- User profile menu
- Smooth animations

## 🔄 Protected Routes

The app includes route protection:
```typescript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

Only authenticated users can access protected routes.

## 🎬 Animations

### Framer Motion Usage
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Staggered Animations
Multiple items can animate sequentially:
```typescript
const containerVariants = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};
```

## 📊 Performance Optimizations

- Vite for fast HMR (Hot Module Replacement)
- Tree-shaking for smaller bundle sizes
- Lazy loading of routes (can be added)
- Efficient re-renders with React 18
- Memoization where needed

## 🐛 Error Handling

### API Errors
- Automatic token refresh on 401
- Detailed error messages from backend
- Graceful fallbacks
- Toast notifications for user feedback

### Form Errors
- Real-time validation with Zod
- Animated error reveals
- Field-level error messages
- Form submission error handling

### Socket Errors
- Connection retry with exponential backoff
- Automatic reconnection
- Graceful degradation
- Online/offline status indicator

## 🔒 Security Features

- JWT token-based authentication
- Secure token storage (localStorage - can be upgraded to httpOnly via backend)
- Automatic token refresh before expiry
- CORS proxy setup for development
- TypeScript strict mode prevents type-related bugs

## 🚀 Deployment

### Build Command
```bash
npm run build
```

### Output
- `dist/` folder with optimized production build
- Sourcemaps disabled for production
- Minified assets

### Environment Variables (if needed)
Create `.env` file:
```
VITE_API_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
```

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Socket.IO Client](https://socket.io/docs/v4/client-api)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## 💡 Key Features Implemented

✅ Modern authentication with JWT  
✅ Real-time messaging with Socket.IO  
✅ Advanced form validation with Zod  
✅ Global state management with Zustand  
✅ Beautiful glassmorphism UI  
✅ Smooth animations and transitions  
✅ Responsive design  
✅ TypeScript strict mode  
✅ Error handling & loading states  
✅ Toast notifications  
✅ Typing indicators  
✅ Unread message badges  
✅ User presence (online/offline)  
✅ Protected routes  
✅ Auto token refresh  

## 🎯 Next Steps & Enhancements

- Add user search & discovery
- File sharing capability
- User profiles & settings
- Message reactions
- Group chats
- Voice/video calling
- Read receipts
- Message editing/deletion
- Dark/light theme toggle
- Internationalization (i18n)

---

**Built with ❤️ using React 18, TypeScript, and cutting-edge web technologies**
