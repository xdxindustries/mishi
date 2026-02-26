import { useState, useEffect, useCallback } from 'react';
import { Player } from '../types';
import { getOrCreatePlayer } from '../services/api';

const USERNAME_KEY = 'mishi_username';

export function usePlayer() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (username: string) => {
    setLoading(true);
    setError(null);
    try {
      const p = await getOrCreatePlayer(username);
      setPlayer(p);
      localStorage.setItem(USERNAME_KEY, username);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setPlayer(null);
    localStorage.removeItem(USERNAME_KEY);
  }, []);

  const refreshPlayer = useCallback(async () => {
    if (!player) return;
    try {
      const p = await getOrCreatePlayer(player.username);
      setPlayer(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refresh failed');
    }
  }, [player]);

  // Auto-login on mount if username is saved
  useEffect(() => {
    const savedUsername = localStorage.getItem(USERNAME_KEY);
    if (savedUsername) {
      login(savedUsername);
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { player, setPlayer, loading, error, login, logout, refreshPlayer };
}
