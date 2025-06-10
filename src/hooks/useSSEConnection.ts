// hooks/useSSEConnection.ts
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Base_Url } from "@/lib/constants";
import { toast } from "sonner";
import { SSEMessage } from "@/types/auth";

export const useSSEConnection = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const cleanup = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    reconnectAttempts.current = 0;
  };

  const connect = () => {
    if (!user?.sessionId || !isAuthenticated) {
      return;
    }

    cleanup();

    try {
      const eventSource = new EventSource(
        `${Base_Url}/sse/session-events?sessionId=${user.sessionId}`,
        {
          withCredentials: true
        }
      );

      // Add session ID to headers (Note: EventSource doesn't support custom headers)
      // We'll need to pass sessionId via URL or use a different approach
      // For now, we'll store it in localStorage and read it on the server via cookie

      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("SSE connection established");
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEMessage = JSON.parse(event.data);
          console.log("SSE message received:", data);

          switch (data.type) {
            case "connected":
              console.log("SSE connection confirmed");
              break;

            case "force-logout": {
              console.log("Force logout received:", data.reason);
              logout();

              const reasonMessages = {
                "new-device-login":
                  "Someone else has signed in to your account from another device.",
                "session-expired": "Your session has expired.",
                "admin-logout": "You have been logged out by an administrator."
              };

              const message =
                reasonMessages[data.reason as keyof typeof reasonMessages] ||
                "You have been logged out.";

              toast.error("Logged Out", {
                description: message,
                duration: 5000
              });

              // Redirect to signin page
              window.location.href = "/signin";
              break;
            }

            case "session-expired":
              console.log("Session expired notification");
              logout();
              toast.error("Session Expired", {
                description: "Your session has expired. Please sign in again.",
                duration: 5000
              });
              window.location.href = "/signin";
              break;

            case "heartbeat":
              // Silent heartbeat, no action needed
              break;

            default:
              console.log("Unknown SSE message type:", data.type);
          }
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);

        if (eventSource.readyState === EventSource.CLOSED) {
          console.log("SSE connection closed");
          if (
            isAuthenticated &&
            reconnectAttempts.current < maxReconnectAttempts
          ) {
            const delay = Math.min(
              1000 * Math.pow(2, reconnectAttempts.current),
              30000
            );
            console.log(
              `Attempting to reconnect SSE in ${delay}ms (attempt ${
                reconnectAttempts.current + 1
              })`
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current++;
              connect();
            }, delay);
          }
        }
      };
    } catch (error) {
      console.error("Failed to establish SSE connection:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.sessionId) {
      connect();
    } else {
      cleanup();
    }

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.sessionId]);

  // Clean up on component unmount
  useEffect(() => {
    return cleanup;
  }, []);

  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
    reconnect: connect,
    disconnect: cleanup
  };
};
