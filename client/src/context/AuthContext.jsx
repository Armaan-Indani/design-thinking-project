import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth - always logged in as guest
    const guestUser = {
      id: "guest-user-123",
      name: "Guest User",
      email: "guest@example.com"
    };
    setUser(guestUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // No-op for frontend only
    return Object.assign({}, user);
  };

  const register = async (email, password, name) => {
    // No-op
    return Object.assign({}, user);
  };

  const logout = () => {
    // No-op - can't really logout of a local-only app without clearing data potentially
    // For now, just do nothing or maybe show a message
    alert("You are using the offline version.");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
