import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BaoSteamer from '../components/bao/BaoSteamer';
import Button from '../components/common/Button';

interface LoginPageProps {
  onLogin: (username: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, loading, error }) => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    await onLogin(trimmed);
    navigate('/pull');
  };

  return (
    <div style={styles.container}>
      {/* Floating decorative circles */}
      <div style={styles.decorCircle1} />
      <div style={styles.decorCircle2} />
      <div style={styles.decorCircle3} />

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Steamer visual */}
        <div style={styles.steamerWrap}>
          <BaoSteamer size={180} isShaking={loading} />
        </div>

        {/* Title */}
        <h1 style={styles.title}>Mishi</h1>
        <p style={styles.subtitle}>Collect them all!</p>

        {/* Username input */}
        <div style={styles.inputWrap}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
            autoFocus
            style={styles.input}
            disabled={loading}
          />
        </div>

        {/* Error message */}
        {error && <p style={styles.error}>{error}</p>}

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !username.trim()}
          style={{ width: '100%', padding: '14px 24px', fontSize: '17px' }}
        >
          {loading ? 'Opening...' : 'Open Steamer'}
        </Button>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(160deg, #fff8f0 0%, #ffe8d6 40%, #fff1e0 100%)',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'rgba(251, 191, 36, 0.08)',
    top: '-80px',
    right: '-60px',
    pointerEvents: 'none',
  },
  decorCircle2: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'rgba(249, 115, 86, 0.06)',
    bottom: '40px',
    left: '-50px',
    pointerEvents: 'none',
  },
  decorCircle3: {
    position: 'absolute',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'rgba(74, 222, 128, 0.06)',
    top: '30%',
    left: '10%',
    pointerEvents: 'none',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '340px',
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
  steamerWrap: {
    marginBottom: '8px',
    animation: 'float 3s ease-in-out infinite',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '48px',
    fontWeight: 700,
    color: '#f97356',
    margin: '0 0 4px',
    letterSpacing: '1px',
    textShadow: '0 2px 8px rgba(249, 115, 86, 0.2)',
  },
  subtitle: {
    fontFamily: 'var(--font-body)',
    fontSize: '16px',
    color: '#8b7565',
    margin: '0 0 28px',
    fontWeight: 500,
  },
  inputWrap: {
    width: '100%',
    marginBottom: '16px',
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '14px',
    border: '2px solid #e8ddd2',
    background: '#ffffff',
    fontSize: '16px',
    fontFamily: 'var(--font-body)',
    color: '#4a3728',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(74, 55, 40, 0.06)',
  },
  error: {
    color: '#e53e3e',
    fontSize: '14px',
    margin: '0 0 12px',
    fontFamily: 'var(--font-body)',
  },
};

export default LoginPage;
