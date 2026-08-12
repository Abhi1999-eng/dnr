'use client';

import Image, { type ImageProps } from 'next/image';
import { useMemo, useState } from 'react';
import { resolveMediaUrl } from '@/lib/media';

type ManagedImageProps = Omit<ImageProps, 'src'> & {
  src?: string | null;
  fallbackSrc?: string;
};

export function ManagedImage({ src, fallbackSrc = '/dnr/page_06.png', alt, ...props }: ManagedImageProps) {
  const primarySrc = useMemo(() => resolveMediaUrl(src, fallbackSrc), [src, fallbackSrc]);
  const fallbackResolved = useMemo(() => resolveMediaUrl(fallbackSrc, '/dnr/page_06.png'), [fallbackSrc]);

  return <ManagedImageInner key={`${primarySrc}|${fallbackResolved}`} primarySrc={primarySrc} fallbackResolved={fallbackResolved} alt={alt} {...props} />;
}

function ManagedImageInner({
  primarySrc,
  fallbackResolved,
  alt,
  ...props
}: Omit<ManagedImageProps, 'src' | 'fallbackSrc'> & {
  primarySrc: string;
  fallbackResolved: string;
}) {
  const [currentSrc, setCurrentSrc] = useState(primarySrc);

  return (
    <Image
      {...props}
      alt={alt}
      src={currentSrc}
      unoptimized={props.unoptimized}
      onError={() => {
        if (currentSrc !== fallbackResolved) {
          setCurrentSrc(fallbackResolved);
        }
      }}
    />
  );
}
