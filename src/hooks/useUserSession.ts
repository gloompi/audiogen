import { useEffect, useState } from 'react';

const SESSION_KEY = 'hyroscale_user_session_id';

export function useUserSession() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session ID
    let currentId = localStorage.getItem(SESSION_KEY);

    // Validate existing ID (must be UUID-like and not huge)
    if (currentId && currentId.length > 36) {
      localStorage.removeItem(SESSION_KEY);
      currentId = null;
    }

    // If no session ID exists, generate a new one
    if (!currentId) {
      currentId = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, currentId);
    }

    // Use setTimeout to avoid synchronous state update warning
    setTimeout(() => setUserId(currentId), 0);
  }, []);

  return userId;
}
