import React, { useMemo } from 'react';
import { Player, OwnedBao } from '../types';
import PlaygroundScene from '../components/playground/PlaygroundScene';

interface PlaygroundPageProps {
  player: Player;
}

const PlaygroundPage: React.FC<PlaygroundPageProps> = ({ player }) => {
  const ownedBaos = useMemo(() => {
    return Object.values(player.collection) as OwnedBao[];
  }, [player.collection]);

  const isEmpty = ownedBaos.length === 0;

  return (
    <div style={styles.page}>
      {isEmpty ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>(  . _ .  )</div>
          <h3 style={styles.emptyTitle}>The restaurant is empty!</h3>
          <p style={styles.emptyText}>Pull some bao to see them visit the bistro.</p>
        </div>
      ) : (
        <PlaygroundScene ownedBaos={ownedBaos} />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    background: '#DBC8B2',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 24px',
    gap: '8px',
    flex: 1,
  },
  emptyIcon: {
    fontSize: '40px',
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-body)',
    marginBottom: '8px',
  },
  emptyTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    color: 'var(--color-text)',
    margin: 0,
  },
  emptyText: {
    fontSize: '15px',
    color: 'var(--color-text-light)',
    fontFamily: 'var(--font-body)',
    margin: 0,
  },
};

export default PlaygroundPage;
