import React from 'react';

export type GameAssetKind = 'ships' | 'defenses' | 'facilities' | 'technologies' | 'resources' | 'pages' | 'mothership';

interface GameAssetImageProps {
  kind: GameAssetKind;
  id: string;
  alt: string;
  className?: string;
}

export const GameAssetImage: React.FC<GameAssetImageProps> = ({ kind, id, alt, className = '' }) => (
  <img
    src={`/images/game/${kind}/${id}.svg`}
    alt={alt}
    loading="lazy"
    decoding="async"
    className={`block ${className}`}
  />
);
