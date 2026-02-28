import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte links comuns do YouTube para o formato de incorporação (embed)
 * que é necessário para funcionar dentro do site/iframe.
 */
export function formatVideoUrl(url: string | undefined): string {
  if (!url) return "";
  
  // YouTube Normal: https://www.youtube.com/watch?v=ID
  // YouTube Short: https://youtu.be/ID
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(youtubeRegex);
  
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1&modestbranding=1&rel=0`;
  }
  
  return url;
}
