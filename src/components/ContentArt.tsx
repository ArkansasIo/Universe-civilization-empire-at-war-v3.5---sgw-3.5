import React from 'react';
import { getContentImage } from '../utils/contentImages';

interface ContentArtProps {
  collection: string;
  id: string | number;
  alt: string;
  className?: string;
  // Shown when no painted art exists for this item (e.g. procedurally spawned rivals).
  fallback?: React.ReactNode;
}

export const ContentArt: React.FC<ContentArtProps> = ({ collection, id, alt, className = '', fallback = null }) => {
  const src = getContentImage(collection, id);
  if (!src) return <>{fallback}</>;
  return <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
};
