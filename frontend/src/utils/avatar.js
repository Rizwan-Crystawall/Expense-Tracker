const GRADIENTS = [
  ['#60a5fa', '#3b82f6'],
  ['#34d399', '#059669'],
  ['#a78bfa', '#7c3aed'],
  ['#f472b6', '#db2777'],
  ['#38bdf8', '#0284c7'],
  ['#fbbf24', '#d97706'],
];

export function getInitials(username = '') {
  const parts = username.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return username.slice(0, 2).toUpperCase() || 'U';
}

export function getAvatarGradient(username = '') {
  const index = [...username].reduce((sum, char) => sum + char.charCodeAt(0), 0) % GRADIENTS.length;
  const [from, to] = GRADIENTS[index];
  return `linear-gradient(135deg, ${from}, ${to})`;
}

export function getProfileImageUrl(username = '') {
  return `https://api.dicebear.com/7.x/notionists/png?seed=${encodeURIComponent(username)}&backgroundColor=171f33`;
}
