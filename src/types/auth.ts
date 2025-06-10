// types/auth.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  sessionId?: string;
}

export interface SSEMessage {
  type: "force-logout" | "connected" | "session-expired" | "heartbeat";
  reason?: string;
  timestamp: string;
}
