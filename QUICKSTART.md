# ASTRA Frontend - Quick Start Guide

## ✅ Build Status: SUCCESS

The ASTRA frontend has been successfully built and is production-ready!

### Build Output
```
dist/index.html                   0.71 kB │ gzip:   0.44 kB
dist/assets/index-BlJhiQcr.css   24.45 kB │ gzip:   5.00 kB
dist/assets/index-gjGrRp8Z.js   472.18 kB │ gzip: 145.94 kB
```

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ installed
- npm 9+ or yarn

### 2. Installation

```bash
# Navigate to project directory
cd d:\Astra-Frontend

# Install dependencies (already done)
npm install
```

### 3. Environment Setup

Backend should be running on `http://localhost:3000`. The frontend automatically proxies API calls:
- `/api/*` → `http://localhost:3000/api/*`
- `/socket.io/*` → `http://localhost:3000/socket.io/*`

### 4. Development Mode

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

**Features in Dev Mode:**
- Live Hot Module Reloading (HMR)
- Source maps for debugging
- CORS proxy for backend communication
- Socket.IO proxy for real-time updates

### 5. Production Build

```bash
# Create optimized production build
npm run build

# Output goes to dist/ folder
```

### 6. Type Checking

```bash
# Verify TypeScript types
npm run type-check
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build locally |
| `npm run type-check` | Check TypeScript types |

## 🔑 Key Features

### Authentication
- Email/Password login and signup
- JWT Token management with auto-refresh
- Persistent session (localStorage)
- Protected routes with redirects

### Real-Time Chat
- Socket.IO integration
- Real-time message delivery
- Typing indicators
- Online/offline status
- Connection status monitoring

### UI/UX
- Glassmorphism design
- Smooth animations (Framer Motion)
- Responsive layout (mobile-friendly)
- Dark mode by default
- Loading states and error handling
- Toast notifications

### Forms
- Advanced validation (Zod)
- Real-time error feedback
- Password strength indicator
- Visual feedback on input
- Auto-focus management

## 📁 Project Structure

```
src/
├── api/
│   └── api.ts                 # Axios instance + JWT interceptors
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx      # Login form component
│   │   └── SignupForm.tsx     # Signup form with strength check
│   ├── chat/
│   │   └── ChatInterface.tsx  # Real-time chat UI
│   ├── layout/
│   │   └── MainLayout.tsx     # Main app shell
│   └── notifications/
│       └── Toast.tsx          # Toast notification system
├── hooks/
│   └── useSocket.ts           # Socket.IO custom hook
├── pages/
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── DashboardPage.tsx
├── store/
│   ├── authStore.ts           # Auth state (Zustand)
│   └── chatStore.ts           # Chat state (Zustand)
├── styles/
│   └── globals.css            # Global styles + animations
├── types/
│   └── index.ts               # TypeScript definitions
├── App.tsx                    # Root component + Router
└── main.tsx                   # React entry point
```

## 🔌 API Integration

### Base URL
All API calls are made to `/api` which proxies to `http://localhost:3000`:

```typescript
// Code calls:
await axios.get('/api/auth/me');

// Actually calls:
// http://localhost:3000/api/auth/me
```

### JWT Token Handling
The Axios instance automatically:
1. Attaches JWT to all requests
2. Handles 401 responses by refreshing token
3. Retries failed requests
4. Logs user out on refresh failure

```typescript
// Automatic - no manual token handling needed!
const { data } = await apiService.auth.login(email, password);
```

## 🔄 Socket.IO Events

### Listening for Events
```typescript
const { on, emit } = useSocket();

on('message:received', (message) => {
  // Handle new message
});
```

### Emitting Events
```typescript
emit('typing', { chatId, userId });
emit('message:send', { chatId, content });
```

### Available Events
- `message:received` - New message arrived
- `message:sent` - Message confirmed
- `typing` - User typing
- `stop:typing` - User stopped typing
- `user:online` - User online
- `user:offline` - User offline

## 🛡️ Type Safety

The project uses TypeScript strict mode. All components and functions are fully typed:

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
  content: string;
  timestamp: string;
  isRead: boolean;
}
```

## 🎨 Customization

### Colors & Theme
Edit `tailwind.config.ts` for color customization:
```javascript
extend: {
  colors: {
    'primary': '#6366f1',  // Indigo
    'secondary': '#a855f7', // Purple
  }
}
```

### Animations
Add custom animations in `src/styles/globals.css`:
```css
@keyframes customAnimation {
  from { /* start */ }
  to { /* end */ }
}
```

### Glassmorphism Effects
Utilities available in globals.css:
- `.glass` - Full glass effect
- `.glass-sm` - Subtle glass effect
- `.backdrop-blur-2xl` - Strong blur

## 🐛 Debugging

### Enable Debug Logging
The Socket.IO hook logs connection events:
```typescript
// Check browser console for socket events
```

### React DevTools
Install React DevTools browser extension for component inspection.

### TypeScript Errors
Run type-check before committing:
```bash
npm run type-check
```

## 📦 Dependencies

### Core
- react 18.2.0
- react-dom 18.2.0
- typescript 5.3.0

### Build & Dev Tools
- vite 5.4.21
- @vitejs/plugin-react 4.2.0
- tailwindcss 3.4.0
- postcss 8.4.32

### UI & Animation
- framer-motion 10.16.16
- lucide-react 0.263.1

### State & Forms
- zustand 4.4.1
- react-hook-form 7.48.0
- zod 3.22.4

### HTTP & Real-time
- axios 1.6.5
- socket.io-client 4.7.2

### Routing
- react-router-dom 6.20.0

## 🚨 Troubleshooting

### Port Already in Use
```bash
# If port 5173 is busy, Vite will use next available port
npm run dev
# Check console output for actual port
```

### Module Not Found
If you see module errors:
```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install
```

### Type Checking Fails
```bash
# Verify TypeScript strict mode errors
npm run type-check

# Fix issues or disable strict mode in tsconfig.json
```

### Socket.IO Connection Failed
1. Ensure backend is running on `http://localhost:3000`
2. Check backend has Socket.IO enabled
3. Verify CORS settings on backend

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎯 Next Steps

1. **Run Development Server**
   ```bash
   npm run dev
   ```

2. **Test Authentication**
   - Visit `http://localhost:5173/login`
   - Try creating an account

3. **Test Chat**
   - Login and navigate to dashboard
   - Open chat interface

4. **Monitor Backend**
   - Ensure `/api` endpoints respond
   - Verify Socket.IO server running

## 📞 Support

For issues:
1. Check console for error messages
2. Verify backend is running
3. Run `npm run type-check` to check types
4. Check network tab in DevTools

---

**Frontend is ready for deployment!** 🚀

All components are production-ready with:
- ✅ Zero TypeScript errors
- ✅ Optimized build output
- ✅ Full error handling
- ✅ Real-time capabilities
- ✅ Responsive design
