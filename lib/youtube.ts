function normalizeYouTubeId(value: string) {
  const id = value.trim();
  return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
}

export function getYouTubeVideoId(url: string): string | null {
  const raw = String(url || '').trim();
  if (!raw) return null;

  const directId = normalizeYouTubeId(raw);
  if (directId) return directId;

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      return normalizeYouTubeId(parsed.pathname.split('/').filter(Boolean)[0] || '');
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (parsed.pathname === '/watch') {
        return normalizeYouTubeId(parsed.searchParams.get('v') || '');
      }

      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts[0] === 'embed' || parts[0] === 'shorts') {
        return normalizeYouTubeId(parts[1] || '');
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
}
