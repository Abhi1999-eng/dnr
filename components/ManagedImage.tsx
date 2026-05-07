'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { isDirectUploadAsset, resolveMediaUrl } from '@/lib/media';

type ManagedImageProps = Omit<ImageProps, 'src'> & {
  src?: string | null;
  fallbackSrc?: string;
};

export function ManagedImage({ src, fallbackSrc = '/dnr/page_06.png', alt, ...props }: ManagedImageProps) {
  const primarySrc = useMemo(() => resolveMediaUrl(src, fallbackSrc), [src, fallbackSrc]);
  const fallbackResolved = useMemo(() => resolveMediaUrl(fallbackSrc, '/dnr/page_06.png'), [fallbackSrc]);
  const [currentSrc, setCurrentSrc] = useState(primarySrc);
  const shouldBypassOptimization = isDirectUploadAsset(currentSrc);

  useEffect(() => {
    setCurrentSrc(primarySrc);
  }, [primarySrc]);

  return (
    <Image
      {...props}
      alt={alt}
      src={currentSrc}
      unoptimized={props.unoptimized || shouldBypassOptimization}
      onError={() => {
        if (currentSrc !== fallbackResolved) {
          setCurrentSrc(fallbackResolved);
        }
      }}
    />
  );
}
