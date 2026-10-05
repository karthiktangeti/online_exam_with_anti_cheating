import { createContext, useContext, useEffect, useState } from 'react'; import api from '../services/api.js';
const Ctx = createContext(); export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem('token')) return setLoading(false);
    api.get('/auth/me').then(r => setUser(r.data.user)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
  }, []);
  const authed = async (path, body) => { const { data } = await api.post(path, body); localStorage.setItem('token', data.token); setUser(data.user); return data.user; };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };
  const updateUser = async body => { const { data } = await api.put('/auth/profile', body); setUser(data.user); return data.user; };
  return <Ctx.Provider value={{ user, loading, login: b => authed('/auth/login', b), register: b => authed('/auth/register', b), updateUser, logout }}>{children}</Ctx.Provider>;
}
