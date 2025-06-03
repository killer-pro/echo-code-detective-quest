
export class SVGFallbacks {
  static generateCharacterSVG(name: string, role: string): string {
    const colors = {
      témoin: '#3B82F6',
      suspect: '#EF4444', 
      enquêteur: '#10B981',
      innocent: '#8B5CF6'
    };
    
    const color = colors[role as keyof typeof colors] || '#6B7280';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}80;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" fill="url(#grad)"/>
        <circle cx="256" cy="180" r="80" fill="white" opacity="0.9"/>
        <path d="M 150 400 Q 256 300 362 400 L 362 512 L 150 512 Z" fill="white" opacity="0.8"/>
        <text x="256" y="200" fill="#1F2937" font-family="Arial" font-size="48" font-weight="bold" text-anchor="middle">${initials}</text>
        <text x="256" y="450" fill="white" font-family="Arial" font-size="24" text-anchor="middle">${name}</text>
        <text x="256" y="480" fill="white" font-family="Arial" font-size="16" text-anchor="middle" opacity="0.8">${role}</text>
      </svg>
    `)}`;
  }

  static generateBackgroundSVG(title: string): string {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#87CEEB;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4682B4;stop-opacity:1" />
          </linearGradient>
          <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
          </radialGradient>
        </defs>
        
        <!-- Ciel -->
        <rect width="800" height="400" fill="url(#skyGrad)"/>
        
        <!-- Soleil -->
        <circle cx="650" cy="120" r="40" fill="url(#sunGrad)"/>
        
        <!-- Sol -->
        <rect x="0" y="400" width="800" height="200" fill="#8B4513"/>
        <rect x="0" y="400" width="800" height="50" fill="#228B22"/>
        
        <!-- Bâtiments -->
        <rect x="100" y="250" width="120" height="150" fill="#696969"/>
        <rect x="300" y="200" width="100" height="200" fill="#778899"/>
        <rect x="500" y="280" width="80" height="120" fill="#2F4F4F"/>
        
        <!-- Fenêtres -->
        <rect x="120" y="270" width="20" height="25" fill="#FFD700"/>
        <rect x="160" y="270" width="20" height="25" fill="#FFD700"/>
        <rect x="120" y="320" width="20" height="25" fill="#FFD700"/>
        <rect x="320" y="230" width="15" height="20" fill="#87CEEB"/>
        <rect x="350" y="230" width="15" height="20" fill="#87CEEB"/>
        
        <!-- Titre -->
        <text x="400" y="580" fill="white" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle">${title}</text>
      </svg>
    `)}`;
  }

  static generatePropSVG(name: string): string {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="propGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8B4513;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#A0522D;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Objet principal -->
        <rect x="156" y="156" width="200" height="200" rx="20" fill="url(#propGrad)" stroke="#654321" stroke-width="4"/>
        
        <!-- Détails -->
        <circle cx="256" cy="256" r="60" fill="#CD853F" opacity="0.8"/>
        <circle cx="256" cy="256" r="30" fill="#DEB887"/>
        
        <!-- Nom -->
        <text x="256" y="420" fill="#2F4F4F" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle">${name}</text>
        
        <!-- Ombre -->
        <ellipse cx="256" cy="480" rx="100" ry="20" fill="#000000" opacity="0.2"/>
      </svg>
    `)}`;
  }

  static generateDefaultPlayer(): string {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="playerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#2E5A8A;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Corps -->
        <rect x="24" y="32" width="16" height="24" fill="url(#playerGrad)" rx="2"/>
        
        <!-- Tête -->
        <circle cx="32" cy="20" r="10" fill="#F4C2A1"/>
        
        <!-- Cheveux -->
        <path d="M 22 16 Q 32 8 42 16 Q 42 12 32 10 Q 22 12 22 16" fill="#8B4513"/>
        
        <!-- Yeux -->
        <circle cx="28" cy="18" r="1.5" fill="#000"/>
        <circle cx="36" cy="18" r="1.5" fill="#000"/>
        
        <!-- Bouche -->
        <path d="M 29 23 Q 32 25 35 23" stroke="#000" stroke-width="1" fill="none"/>
        
        <!-- Bras -->
        <rect x="16" y="34" width="6" height="16" fill="url(#playerGrad)" rx="3"/>
        <rect x="42" y="34" width="6" height="16" fill="url(#playerGrad)" rx="3"/>
        
        <!-- Jambes -->
        <rect x="26" y="56" width="5" height="8" fill="#654321"/>
        <rect x="33" y="56" width="5" height="8" fill="#654321"/>
      </svg>
    `)}`;
  }
}
