
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getSeriesColor(seriesId: number): string {
  switch (seriesId) {
    case 1: // Classic
      return '#0088FF';
    case 2: // X
      return '#00AA88';
    case 3: // Zero
      return '#CC0000';
    case 4: // ZX
      return '#FF9900';
    case 5: // Legends
      return '#6600CC';
    case 6: // Battle Network
      return '#0044CC';
    case 7: // Star Force
      return '#9900FF';
    default:
      return '#888888';
  }
}

export function getSeriesName(seriesId: number): string {
  switch (seriesId) {
    case 1:
      return 'Classic';
    case 2:
      return 'X';
    case 3:
      return 'Zero';
    case 4:
      return 'ZX';
    case 5:
      return 'Legends';
    case 6:
      return 'Battle Network';
    case 7:
      return 'Star Force';
    default:
      return 'Unknown';
  }
}

export function getTagColor(tag: string): string {
  switch (tag) {
    case 'Canon':
      return 'bg-green-100 text-green-800';
    case 'Disputed':
      return 'bg-yellow-100 text-yellow-800';
    case 'Theory':
      return 'bg-purple-100 text-purple-800';
    case 'Game Only':
      return 'bg-blue-100 text-blue-800';
    case 'Manga Only':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getRelationshipColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'ally':
    case 'friend':
      return 'bg-green-100 text-green-800';
    case 'enemy':
    case 'rival':
      return 'bg-red-100 text-red-800';
    case 'creator':
      return 'bg-blue-100 text-blue-800';
    case 'creation':
      return 'bg-cyan-100 text-cyan-800';
    case 'sibling':
      return 'bg-purple-100 text-purple-800';
    case 'predecessor':
    case 'successor':
      return 'bg-amber-100 text-amber-800';
    case 'original':
    case 'copy':
      return 'bg-indigo-100 text-indigo-800';
    case 'complex':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}