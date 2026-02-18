export function filterMovies(movies, tabId, searchTerm = '', filters = {}) {
  let filtered = [...movies];

  if (searchTerm.length > 0) {
    const term = searchTerm.toLowerCase();
    const searchFields = [
      'title', 'cast', 'director', 'genre', 'industry', 'keywords',
      'platform', 'quality_name', 'spoken_languages', 'writer', 'year', 'category'
    ];
    filtered = filtered.filter(item =>
      searchFields.some(field =>
        item[field] && String(item[field]).toLowerCase().includes(term)
      )
    );
  } else {
    switch (tabId) {
      case 'movies':
        filtered = filtered.filter(m => m.category?.toLowerCase().includes('movie'));
        break;
      case 'series':
        filtered = filtered.filter(m => m.category?.toLowerCase().includes('series'));
        break;
      case 'anime':
        filtered = filtered.filter(m => m.category?.toLowerCase().includes('anime'));
        break;
      case 'adult':
        filtered = filtered.filter(m => m.adult_content === 'true');
        break;
      default:
        break;
    }
  }

  if (filters.genre && filters.genre !== 'all' && filters.genre !== 'All') {
    filtered = filtered.filter(m => {
      const genre = String(m.genre || '').toLowerCase();
      return genre.includes(filters.genre.toLowerCase());
    });
  }

  if (filters.year && filters.year !== 'all' && filters.year !== 'All') {
    const y = filters.year;
    if (y.includes('-')) {
      const [start, end] = y.split('-').map(Number);
      filtered = filtered.filter(m => {
        const my = parseInt(m.year);
        return my >= start && my <= end;
      });
    } else if (y === 'Before 2000') {
      filtered = filtered.filter(m => parseInt(m.year) < 2000);
    } else {
      filtered = filtered.filter(m => String(m.year) === y);
    }
  }

  if (filters.language && filters.language !== 'all' && filters.language !== 'All') {
    filtered = filtered.filter(m => {
      const lang = String(m.original_language || m.spoken_languages || '').toLowerCase();
      return lang.includes(filters.language.toLowerCase());
    });
  }

  return filtered;
}

export function sortMovies(movies, sortBy) {
  const sorted = [...movies];
  switch (sortBy) {
    case 'latest':
      return sorted.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    case 'oldest':
      return sorted.sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0));
    case 'rating_high':
      return sorted.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    case 'rating_low':
      return sorted.sort((a, b) => (parseFloat(a.rating) || 0) - (parseFloat(b.rating) || 0));
    case 'name_az':
      return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    case 'name_za':
      return sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    case 'year_new':
      return sorted.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    case 'year_old':
      return sorted.sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0));
    default:
      return sorted;
  }
}

export function getContentType(item) {
  if (item.category?.toLowerCase().includes('series') || item.content_type === 'series' || item.type === 'series') {
    return 'tv';
  }
  return 'movie';
}

export function formatDuration(minutes) {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function formatNumber(num) {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
