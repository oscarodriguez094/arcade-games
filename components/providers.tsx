"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
  name: string;
}

interface UserContextValue {
  user: User | null;
  login: (name: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("av_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  function login(name: string) {
    const u = { name: name.toUpperCase().slice(0, 10) };
    setUser(u);
    localStorage.setItem("av_user", JSON.stringify(u));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("av_user");
  }

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  return useContext(UserContext);
}
