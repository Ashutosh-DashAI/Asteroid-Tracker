/**
 * User and Authentication Types
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

/**
 * Chat and Message Types
 */
export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  sender?: User;
}

export interface Chat {
  id: string;
  participantId: string;
  participant: User;
  lastMessage?: Message;
  lastMessageTime?: string;
  unreadCount: number;
}

/**
 * Asteroid Types
 */
export interface CloseApproachData {
  close_approach_date: string;
  close_approach_date_full: string;
  epoch_date_close_approach: number;
  relative_velocity: {
    kilometers_per_second: string;
    kilometers_per_hour: string;
    miles_per_hour: string;
  };
  miss_distance: {
    astronomical: string;
    kilometers: string;
    lunar: string;
    miles: string;
  };
  orbiting_body: string;
}

export interface EstimatedDiameter {
  kilometers?: {
    estimated_diameter_min: number;
    estimated_diameter_max: number;
  };
  meters?: {
    estimated_diameter_min: number;
    estimated_diameter_max: number;
  };
  miles?: {
    estimated_diameter_min: number;
    estimated_diameter_max: number;
  };
  feet?: {
    estimated_diameter_min: number;
    estimated_diameter_max: number;
  };
}

export interface OrbitalData {
  orbit_id: string;
  orbit_determination_date: string;
  orbit_uncertainty: string;
  minimum_orbit_intersection: string;
  jupiter_tisserand_invariant: string;
  epoch_osculation: string;
  eccentricity: string;
  semi_major_axis: string;
  inclination: string;
  ascending_node_longitude: string;
  orbital_period: string;
  perihelion_distance: string;
  perihelion_argument: string;
  aphelion_distance: string;
  perihelion_time: string;
  mean_anomaly: string;
  mean_motion: string;
  equinox: string;
  orbit_class: {
    orbit_class_type: string;
    orbit_class_description: string;
    orbit_class_range: string;
  };
}

export interface Asteroid {
  id: string;
  neo_reference_id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: EstimatedDiameter;
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: CloseApproachData[];
  orbital_data?: OrbitalData;
  is_sentry_object: boolean;
  isFavorite?: boolean;
  // Add computed fields for convenience
  diameterKm?: number;
  nextCloseApproach?: CloseApproachData;
  speed?: number;
  missDistance?: number;
}

export interface AsteroidFeedFilter {
  startDate?: string;
  endDate?: string;
  hazardousOnly?: boolean;
  diameterMin?: number;
  diameterMax?: number;
  missDistanceMin?: number;
  missDistanceMax?: number;
}

export interface AsteroidStats {
  totalAsteroids: number;
  hazardousCount: number;
  totalCount: number;
  avgDiameter: number;
  maxDiameter: number;
  minDiameter: number;
  avgSpeed: number;
  maxSpeed: number;
}

export interface AsteroidFeedResponse {
  asteroids: Asteroid[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SavedAsteroid {
  id: string;
  userId: string;
  asteroidId: string;
  asteroid: Asteroid;
  savedAt: string;
  notes?: string;
}

export interface AlertPreference {
  id: string;
  userId: string;
  hazardousOnly: boolean;
  diameterThreshold?: number;
  missDistanceThreshold?: number;
  notifyEmail: boolean;
  notifyInApp: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatPayload {
  recipientId: string;
  content: string;
}

/**
 * Notification Types
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

export interface ToastNotification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
}

/**
 * API Error Types
 */
export interface ApiError {
  message: string;
  statusCode: number;
  details?: Record<string, string>;
}

/**
 * Socket.IO Events
 */
export interface SocketEvents {
  MESSAGE_RECEIVED: 'message:received';
  MESSAGE_SENT: 'message:sent';
  USER_ONLINE: 'user:online';
  USER_OFFLINE: 'user:offline';
  NOTIFICATION: 'notification';
  TYPING: 'typing';
  STOP_TYPING: 'stop:typing';
}

/**
 * Store State Types
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface ChatState {
  chats: Chat[];
  selectedChatId: string | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  typing: { userId: string; isTyping: boolean }[];
}

export interface NotificationState {
  notifications: ToastNotification[];
}
