
import React from 'react';
import { Article, ClothingItem } from './types';

// Helper to determine image source (Base64 vs URL)
export const getImageSrc = (src: string) => {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('blob:')) return src;
  if (src.startsWith('data:')) return src;
  
  // Heuristic for Base64 signatures
  if (src.startsWith('/9j/')) return `data:image/jpeg;base64,${src}`; // JPEG
  if (src.startsWith('iVBOR')) return `data:image/png;base64,${src}`; // PNG
  if (src.startsWith('R0lGOD')) return `data:image/gif;base64,${src}`; // GIF
  if (src.startsWith('UklGR')) return `data:image/webp;base64,${src}`; // WebP
  
  // Default fallback
  return `data:image/jpeg;base64,${src}`;
};

// Helper for merging classNames
const cn = (defaultClass: string, propsClass?: string) => {
    return propsClass ? `${defaultClass} ${propsClass}` : defaultClass;
};

// Simple SVG Icons
export const Icons = {
  Upload: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-6 h-6", props.className) },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" })
    )
  ),
  Plus: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-6 h-6", props.className) },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4.5v15m7.5-7.5h-15" })
    )
  ),
  Camera: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-6 h-6", props.className) },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" }),
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" })
    )
  ),
  Magic: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-6 h-6", props.className) },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" })
    )
  ),
  Trash: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-5 h-5", props.className) },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" })
    )
  ),
  Check: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-6 h-6", props.className) },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "m4.5 12.75 6 6 9-13.5" })
    )
  ),
  Shirt: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-6 h-6", props.className) },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m-3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" })
    )
  ),
  User: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-6 h-6", props.className) },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" })
    )
  ),
  Sparkles: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-6 h-6", props.className) },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" })
    )
  ),
  Heart: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-6 h-6", props.className) },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" })
    )
  ),
  Close: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-6 h-6", props.className) },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18 18 6M6 6l12 12" })
    )
  ),
  ChevronLeft: (props: any) => (
     React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-6 h-6", props.className) },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 19.5 8.25 12l7.5-7.5" })
    )
  ),
  ChevronRight: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-6 h-6", props.className) },
     React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "m8.25 4.5 7.5 7.5-7.5 7.5" })
   )
 ),
 Minimize: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-6 h-6", props.className) },
     React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.75 9h16.5m-16.5 6.75h16.5" })
   )
 ),
 Lock: (props: any) => (
  React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-5 h-5", props.className) },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0V10.5m-1.5 0h12a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5h-12a1.5 1.5 0 0 1-1.5-1.5v-6a1.5 1.5 0 0 1 1.5-1.5Z" })
  )
 ),
 Unlock: (props: any) => (
  React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-5 h-5", props.className) },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" })
  )
 ),
 Search: (props: any) => (
  React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-4 h-4", props.className) },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" })
  )
 ),
 Eye: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-5 h-5", props.className) },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" }),
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" })
    )
 ),
 Activity: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-5 h-5", props.className) },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" }),
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" })
    )
 ),
 Shop: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-5 h-5", props.className) },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" })
    )
 ),
 Globe: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-5 h-5", props.className) },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S12 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S12 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" })
    )
 ),
 SpeakerWave: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-5 h-5", props.className) },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" })
    )
 ),
 Play: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-5 h-5", props.className) },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" })
    )
 ),
 Pause: (props: any) => (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props, className: cn("w-5 h-5", props.className) },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 5.25v13.5m-7.5-13.5v13.5" })
    )
 )
};

// Z-Index Order for Visual Layering
// Higher number = In Front
export const Z_INDEX_ORDER: Record<string, number> = {
  'accessory': 50,
  'top': 40,
  'full-body': 30,
  'bottom': 20,
  'shoes': 10,
  'unknown': 1
};

// Anatomical Sort Order for AI Generation (Deeper layers first)
export const ANATOMICAL_ORDER: Record<string, number> = {
  'accessory': 10,
  'full-body': 20, // Coats cover tops
  'top': 30,
  'bottom': 40,
  'shoes': 50,
  'unknown': 60
};

// Style Keywords Suggestions & Associations
export const INITIAL_STYLE_SUGGESTIONS = [
  "Minimalist", "Streetwear", "Avant-Garde", "Techwear", "Vintage", "Y2K", "Gorpcore", "Luxury"
];

export const STYLE_ASSOCIATIONS: Record<string, string[]> = {
  "minimalist": ["Scandi", "Monochrome", "Sustainable", "Quiet Luxury", "Brutalist"],
  "streetwear": ["Y2K", "Skate", "Hypebeast", "Techwear", "Sportswear"],
  "avant-garde": ["Darkwear", "Gothic", "Deconstruction", "Artisanal", "Cyberpunk"],
  "techwear": ["Cyberpunk", "Gorpcore", "Utilitarian", "Futuristic", "Tactical"],
  "goth": ["Darkwear", "Punk", "Emo", "Grunge", "Vamp"],
  "y2k": ["McBling", "Cybercore", "Retro", "Pop Punk", "Kitsch"],
  "vintage": ["Retro", "Thrift", "Sustainable", "Upcycled", "Americana"],
  "preppy": ["Ivy League", "Old Money", "Classic", "Trad", "Nautical"],
  "luxury": ["High Fashion", "Haute Couture", "Quiet Luxury", "Formal", "Opulent"],
  "gorpcore": ["Outdoors", "Hiking", "Techwear", "Sustainable", "Utility"]
};

// Map Styles to Brand suggestions
export const STYLE_TO_BRAND_ASSOCIATIONS: Record<string, string[]> = {
  "techwear": ["Acronym", "Nike ACG", "Stone Island", "Arc'teryx"],
  "minimalist": ["Jil Sander", "The Row", "Lemaire", "COS"],
  "streetwear": ["Supreme", "Stüssy", "Off-White", "Nike"],
  "luxury": ["Hermès", "Chanel", "Louis Vuitton", "Cartier"],
  "avant-garde": ["Rick Owens", "Maison Margiela", "Yohji Yamamoto"],
  "gorpcore": ["Salomon", "The North Face", "Patagonia", "Arc'teryx"],
  "y2k": ["Blumarine", "Diesel", "Juicy Couture"],
  "vintage": ["Levi's", "Ralph Lauren", "Champion"]
};

// This alias is used in App.tsx initially but we will supersede it with smart suggestions logic
export const STYLE_KEYWORDS_SUGGESTIONS = INITIAL_STYLE_SUGGESTIONS;

// Brand Associations
export const INITIAL_BRAND_SUGGESTIONS = [
  "Balenciaga", "Rick Owens", "Prada", "Arc'teryx", "Stüssy", "Maison Margiela", "Supreme", "Gucci", "Carhartt WIP", "Acronym"
];

export const BRAND_ASSOCIATIONS: Record<string, string[]> = {
  "rick owens": ["Boris Bidjan Saberi", "Ann Demeulemeester", "Julius", "Yohji Yamamoto", "Guidi", "Carol Christian Poell"],
  "balenciaga": ["Vetements", "Maison Margiela", "Raf Simons", "Off-White", "Yeezy"],
  "prada": ["Miu Miu", "Jil Sander", "Bottega Veneta", "Loewe", "Gucci", "Dior"],
  "gucci": ["Saint Laurent", "Versace", "Fendi", "Prada", "Balenciaga", "Louis Vuitton"],
  "supreme": ["Palace", "Stüssy", "Kith", "Noah", "BAPE", "Wtaps"],
  "stussy": ["Carhartt WIP", "Supreme", "Palace", "Obey", "Dickies", "Brain Dead"],
  "carhartt": ["Dickies", "Stan Ray", "Ben Davis", "Timberland", "Carhartt WIP"],
  "arc'teryx": ["Salomon", "The North Face", "Patagonia", "And Wander", "Acronym", "Goldwin"],
  "acronym": ["Stone Island Shadow Project", "Nike ACG", "Veillance", "Guerrilla Group", "Orbit Gear"],
  "stone island": ["C.P. Company", "Acronym", "Moncler", "Napapijri"],
  "nike": ["Adidas", "Jordan", "New Balance", "Asics", "Puma"],
  "adidas": ["Nike", "Puma", "Reebok", "New Balance"],
  "new balance": ["Asics", "Saucony", "Nike", "Salomon", "JJJJound"],
  "yohji yamamoto": ["Comme des Garçons", "Issey Miyake", "Rick Owens", "Ann Demeulemeester", "Y-3"],
  "comme des garçons": ["Junya Watanabe", "Yohji Yamamoto", "Issey Miyake", "Undercover", "Sacai"],
  "undercover": ["Number (N)ine", "Raf Simons", "Kapital", "Visvim", "Neighborhood"],
  "visvim": ["Kapital", "Wtaps", "Neighborhood", "RRL", "Needles"],
  "off-white": ["Palm Angels", "Heron Preston", "Amiri", "Fear of God", "A-Cold-Wall*"],
  "fear of god": ["Jerry Lorenzo", "Essentials", "Off-White", "Amiri", "Yeezy"],
  "bottega veneta": ["The Row", "Loewe", "Jil Sander", "Hermès", "Khaite"],
  "the row": ["Khaite", "Toteme", "Jil Sander", "Lemaire", "Phoebe Philo"],
  "celine": ["Saint Laurent", "Dior", "Chanel", "Chloé"],
  "maison margiela": ["MM6", "Dries Van Noten", "Raf Simons", "Balenciaga", "Jil Sander"],
  "raf simons": ["Prada", "Helmut Lang", "Undercover", "Rick Owens"],
  "helmut lang": ["Raf Simons", "Calvin Klein", "Jil Sander", "Theory"],
  "alexander mcqueen": ["Vivienne Westwood", "John Galliano", "Givenchy", "Saint Laurent"],
  "vivienne westwood": ["Jean Paul Gaultier", "Alexander McQueen", "Moschino", "Comme des Garçons"],
  "jean paul gaultier": ["Mugler", "Vivienne Westwood", "Versace", "Margiela"]
};

// Mock Data with Real Fashion Articles using Unsplash URLs for realism
export const MOCK_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Dark Matter: The Rick Owens Retrospective',
    subtitle: 'Exploring the brutalist poetry of fashion\'s prince of darkness in the age of crumbling empires.',
    author: 'Juno Calypso',
    date: 'October 22, 2024',
    themeColor: '#e5e5e5',
    category: 'Editorial',
    coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
    content: `
      <p class="mb-6 text-lg leading-relaxed text-stone-700">Rick Owens does not design clothes; he builds armor for the end of the world. In a season defined by safe choices and quiet luxury, Owens remains a monolith of defiance. His latest collection, <em>PORTERVILLE</em>, is a raw, guttural scream in the face of conformity.</p>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">The silhouette is elongated, distorted, dragging on the floor like the train of a fallen angel. We see the return of the kiss boot, now reimagined with industrial hardware that feels less like fashion and more like infrastructure. This is clothing for the post-apocalypse, where survival depends on looking terrifyingly beautiful.</p>
      <div class="my-10 p-8 bg-stone-900 text-white rounded-xl border border-stone-800 text-center italic font-serif text-xl">
        "I want to live in a world that is soft and grey and quiet, like a tomb."
      </div>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">The color palette is, as expected, a study in darkness: dust, black, iron, and blood. But it's the textures that captivate—boiled cashmere that looks like scar tissue, and leather stiff enough to deflect a blade. This is isn't just style; it's a survival strategy.</p>
    `,
    items: [
      {
        id: 'ro-1',
        type: 'shoes',
        category: 'shoes',
        description: 'Grill Kiss Boots',
        originalImage: 'https://images.unsplash.com/photo-1605763240004-7d93b172d7cd?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1605763240004-7d93b172d7cd?auto=format&fit=crop&w=800&q=80',
        price: '$1,850',
        brand: 'Rick Owens',
        buyLink: 'https://www.google.com/search?q=rick+owens+grill+kiss+boots&tbm=shop'
      },
      {
        id: 'ro-2',
        type: 'top',
        category: 'top',
        description: 'Level Tee Black',
        originalImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
        price: '$385',
        brand: 'Rick Owens',
        buyLink: 'https://www.google.com/search?q=rick+owens+level+tee&tbm=shop'
      },
      {
        id: 'ro-3',
        type: 'bottom',
        category: 'bottom',
        description: 'Tyrone Jeans',
        originalImage: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
        price: '$790',
        brand: 'Rick Owens DRKSHDW',
        buyLink: 'https://www.google.com/search?q=rick+owens+tyrone+jeans&tbm=shop'
      },
      {
        id: 'ro-4',
        type: 'top',
        category: 'full-body',
        description: 'Jumbo Peter Coat',
        originalImage: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80',
        price: '$3,200',
        brand: 'Rick Owens',
        buyLink: 'https://www.google.com/search?q=rick+owens+jumbo+peter+coat&tbm=shop'
      }
    ]
  },
  {
    id: 'art-2',
    title: 'Technical Systems: Acronym & The Future',
    subtitle: 'Errolson Hugh continues to redefine the interface between the human body and the urban environment.',
    author: 'Kao.Systems',
    date: 'October 18, 2024',
    themeColor: '#cbd5e1',
    category: 'Collection',
    coverImage: 'https://images.unsplash.com/photo-1523396870176-2233c8fa0d46?auto=format&fit=crop&w=1200&q=80',
    content: `
      <p class="mb-6 text-lg leading-relaxed text-stone-700">Acronym is not a fashion brand; it is a design bureau solving problems you didn't know you had. The J1A-GT is not a jacket; it is a wearable operating system. With the release of the latest FW24 collection, Errolson Hugh cements his status as the architect of modern techwear.</p>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">The focus this season is on "operational fluidity." The Gravity Pocket allows for device deployment in milliseconds, while the Interops system means your bag and your jacket function as a single unit. It is clothing optimized for high-velocity urban transit.</p>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">Styling these pieces requires a commitment to the aesthetic. Wide, articulated cargo pants balance the structured geometry of the jackets. It is a look that says you are ready for anything—a torrential downpour, a long-haul flight, or a tactical espionage mission.</p>
    `,
    items: [
      {
        id: 'acr-1',
        type: 'top',
        category: 'top',
        description: 'J1A-GT 3L Gore-Tex Jacket',
        originalImage: 'https://images.unsplash.com/photo-1551488852-0801712a5c5d?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1551488852-0801712a5c5d?auto=format&fit=crop&w=800&q=80',
        price: '$1,900',
        brand: 'Acronym',
        buyLink: 'https://acrnm.com'
      },
      {
        id: 'acr-2',
        type: 'bottom',
        category: 'bottom',
        description: 'P30A-DS Ultrawide Cargo',
        originalImage: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=800&q=80',
        price: '$1,450',
        brand: 'Acronym',
        buyLink: 'https://acrnm.com'
      },
      {
        id: 'acr-3',
        type: 'shoes',
        category: 'shoes',
        description: 'XT-6 GTX Utility',
        originalImage: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80',
        price: '$220',
        brand: 'Salomon',
        buyLink: 'https://www.salomon.com'
      },
      {
        id: 'acr-4',
        type: 'accessory',
        category: 'accessory',
        description: '3A-1 Interops Bag',
        originalImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        price: '$1,200',
        brand: 'Acronym',
        buyLink: 'https://acrnm.com'
      }
    ]
  },
  {
    id: 'art-3',
    title: 'Quiet Luxury: The Loro Piana Standard',
    subtitle: 'Why the world’s richest people are dressing like they have nothing to prove.',
    author: 'Isabella Rossellini',
    date: 'October 15, 2024',
    themeColor: '#fef3c7',
    category: 'Editorial',
    coverImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
    content: `
      <p class="mb-6 text-lg leading-relaxed text-stone-700">In a noisy world, silence is the ultimate flex. Quiet Luxury is not about logos; it's about fabrics so rare they have their own supply chains. Loro Piana, The Row, and Brunello Cucinelli are the titans of this movement, trading flash for vicuña and cashmere.</p>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">The aesthetic is muted, earthy, and impossibly soft. A $500 baseball cap that looks like nothing special until you touch it. A trench coat with a drape that defies gravity. This is clothing for people who fly private not because they want to be seen, but because they want to disappear.</p>
      <div class="my-10 p-8 bg-stone-100 text-stone-600 rounded-xl border border-stone-200 text-center italic font-serif text-xl">
        "Money talks, wealth whispers."
      </div>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">To achieve this look, focus on neutrals: oatmeal, camel, charcoal, and navy. Fit is paramount; it should be loose but not oversized, tailored but not restrictive. It is the uniform of the 0.1%.</p>
    `,
    items: [
      {
        id: 'ql-1',
        type: 'shoes',
        category: 'shoes',
        description: 'Summer Walk Loafers',
        originalImage: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
        price: '$980',
        brand: 'Loro Piana',
        buyLink: 'https://us.loropiana.com'
      },
      {
        id: 'ql-2',
        type: 'top',
        category: 'top',
        description: 'Cashmere Turtle Neck',
        originalImage: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
        price: '$1,850',
        brand: 'The Row',
        buyLink: 'https://www.therow.com'
      },
      {
        id: 'ql-3',
        type: 'bottom',
        category: 'bottom',
        description: 'Pleated Wool Trousers',
        originalImage: 'https://images.unsplash.com/photo-1506634572416-48cdfe530110?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1506634572416-48cdfe530110?auto=format&fit=crop&w=800&q=80',
        price: '$1,200',
        brand: 'Lemaire',
        buyLink: 'https://www.lemaire.fr'
      },
      {
        id: 'ql-4',
        type: 'full-body',
        category: 'full-body',
        description: 'Double Faced Cashmere Coat',
        originalImage: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80',
        price: '$4,500',
        brand: 'Brunello Cucinelli',
        buyLink: 'https://shop.brunellocucinelli.com'
      }
    ]
  },
  {
    id: 'art-4',
    title: 'Gorpcore 2.0: The Arc\'teryx Evolution',
    subtitle: 'From the peaks of British Columbia to the streets of SoHo, technical gear is here to stay.',
    author: 'Sarah Gorp',
    date: 'October 10, 2024',
    themeColor: '#dbeafe',
    category: 'New Arrival',
    coverImage: 'https://images.unsplash.com/photo-1501618669935-18b6ecb79d95?q=80&w=1200&auto=format&fit=crop',
    content: `
      <p class="mb-6 text-lg leading-relaxed text-stone-700">Gorpcore started as a trend; now it's a lifestyle. The marriage of high-performance alpine gear with streetwear sensibilities has created a uniform for the modern urbanite. It's pragmatic, durable, and weirdly chic.</p>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">Arc'teryx leads the pack with its Beta AR shells and System_A drops, but brands like And Wander and Goldwin are pushing the envelope with experimental Japanese textiles. The key is the mix: a $800 waterproof shell worn with vintage Levi's and beaten-up Salomons.</p>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">Color plays a huge role in Gorpcore 2.0. We're moving away from just black and grey into vibrant ambers, forest greens, and electric blues—mimicking the safety colors of rescue gear.</p>
    `,
    items: [
      {
        id: 'gorp-1',
        type: 'top',
        category: 'top',
        description: 'Beta AR Jacket',
        originalImage: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80',
        price: '$600',
        brand: 'Arc\'teryx',
        buyLink: 'https://arcteryx.com'
      },
      {
        id: 'gorp-2',
        type: 'shoes',
        category: 'shoes',
        description: 'XT-6 Advanced',
        originalImage: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
        price: '$190',
        brand: 'Salomon',
        buyLink: 'https://www.salomon.com'
      },
      {
        id: 'gorp-3',
        type: 'bottom',
        category: 'bottom',
        description: 'Tech Hiking Pants',
        originalImage: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
        price: '$385',
        brand: 'And Wander',
        buyLink: 'https://www.andwander.com'
      },
      {
        id: 'gorp-4',
        type: 'accessory',
        category: 'accessory',
        description: 'Mantis 2 Waistpack',
        originalImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        price: '$55',
        brand: 'Arc\'teryx',
        buyLink: 'https://arcteryx.com'
      }
    ]
  },
  {
    id: 'art-5',
    title: 'Y2K Revival: The Blumarine Fantasy',
    subtitle: 'Butterflies, low-rise jeans, and the unapologetic return of glitter.',
    author: 'Paris Nicole',
    date: 'October 05, 2024',
    themeColor: '#fbcfe8',
    category: 'Collection',
    coverImage: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=1200&auto=format&fit=crop',
    content: `
      <p class="mb-6 text-lg leading-relaxed text-stone-700">It’s 2003 forever. The Y2K revival shows no signs of slowing down, fueled by Depop, TikTok, and a collective nostalgia for a simpler, sparklier time. Blumarine has spearheaded this movement, bringing back the butterfly tops and ruffled cardigans of the early millennium.</p>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">This aesthetic is about fun. It's about showing skin, wearing pink, and not taking yourself too seriously. Low-rise jeans are mandatory, as are rimless sunglasses and mini shoulder bags.</p>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">Brands like Diesel under Glenn Martens have also tapped into this energy, twisting it into something grittier and more distressed. It's pop star fashion for the end of days.</p>
    `,
    items: [
      {
        id: 'y2k-1',
        type: 'top',
        category: 'top',
        description: 'Butterfly Crop Top',
        originalImage: 'https://images.unsplash.com/photo-1621203165259-699f2c471c75?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1621203165259-699f2c471c75?auto=format&fit=crop&w=800&q=80',
        price: '$450',
        brand: 'Blumarine',
        buyLink: 'https://www.blumarine.com'
      },
      {
        id: 'y2k-2',
        type: 'bottom',
        category: 'bottom',
        description: '1969 D-Ebbey Jeans',
        originalImage: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc4176c?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc4176c?auto=format&fit=crop&w=800&q=80',
        price: '$325',
        brand: 'Diesel',
        buyLink: 'https://shop.diesel.com'
      },
      {
        id: 'y2k-3',
        type: 'accessory',
        category: 'accessory',
        description: 'Le Cagole XS Bag',
        originalImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        price: '$2,550',
        brand: 'Balenciaga',
        buyLink: 'https://www.balenciaga.com'
      },
      {
        id: 'y2k-4',
        type: 'shoes',
        category: 'shoes',
        description: 'Kiki Ankle Boots',
        originalImage: 'https://images.unsplash.com/photo-1608256246200-53e635b5b69f?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1608256246200-53e635b5b69f?auto=format&fit=crop&w=800&q=80',
        price: '$1,100',
        brand: 'Marc Jacobs',
        buyLink: 'https://www.marcjacobs.com'
      }
    ]
  },
  {
    id: 'art-6',
    title: 'Japanese Americana: The Kapital World',
    subtitle: 'Skeleton bones, sashiko stitching, and the art of beautiful decay.',
    author: 'Hiroki N.',
    date: 'September 28, 2024',
    themeColor: '#ffedd5',
    category: 'Editorial',
    coverImage: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=1200&auto=format&fit=crop',
    content: `
      <p class="mb-6 text-lg leading-relaxed text-stone-700">Kapital is a world unto itself. Based in Kojima, the denim capital of Japan, the brand remixes traditional American workwear with hippie culture, punk, and indigenous crafts. The result is "Kountry"—a line that feels like it was dug out of a time capsule.</p>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">The Bone Series remains their most iconic output—denim jackets and sweats emblazoned with bleached skeleton motifs. But the real magic is in the Boro pieces, which use century-old sashiko techniques to repair and embellish fabrics until they become art.</p>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">Wearing Kapital is about texture. It’s mixing a rough denim jacket with a soft bandana scarf and smiley-face socks. It's playful, artisanal, and deeply cool.</p>
    `,
    items: [
      {
        id: 'kap-1',
        type: 'top',
        category: 'top',
        description: 'Bone Denim Jacket',
        originalImage: 'https://images.unsplash.com/photo-1516257984-b1b4d8c9b30b?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1516257984-b1b4d8c9b30b?auto=format&fit=crop&w=800&q=80',
        price: '$650',
        brand: 'Kapital',
        buyLink: 'https://www.kapital.jp'
      },
      {
        id: 'kap-2',
        type: 'bottom',
        category: 'bottom',
        description: 'Century Denim Jeans',
        originalImage: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=800&q=80',
        price: '$480',
        brand: 'Kapital',
        buyLink: 'https://www.kapital.jp'
      },
      {
        id: 'kap-3',
        type: 'top',
        category: 'top',
        description: 'Keel Weaving Vest',
        originalImage: 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&w=800&q=80',
        price: '$520',
        brand: 'Visvim',
        buyLink: 'https://shop.visvim.com'
      },
      {
        id: 'kap-4',
        type: 'accessory',
        category: 'accessory',
        description: 'Bandana Snufkin Bag',
        originalImage: 'https://images.unsplash.com/photo-1575296505360-818d4d320ec1?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1575296505360-818d4d320ec1?auto=format&fit=crop&w=800&q=80',
        price: '$320',
        brand: 'Kapital',
        buyLink: 'https://www.kapital.jp'
      }
    ]
  },
  {
    id: 'art-7',
    title: 'Neo-Prep: The Miu Miu Effect',
    subtitle: 'School uniforms for the rebellious, the intellectual, and the dangerously chic.',
    author: 'Miuccia',
    date: 'September 22, 2024',
    themeColor: '#f3f4f6',
    category: 'New Arrival',
    coverImage: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1200&auto=format&fit=crop',
    content: `
      <p class="mb-6 text-lg leading-relaxed text-stone-700">Miu Miu has single-handedly revived the pleated skirt. But this isn't your boarding school uniform. This is prep with an edge—skirts so short they're scandalous, unfinished hems, and proportions that feel delightfully wrong.</p>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">The Neo-Prep look mixes these academic staples with sporty elements and nerdy accessories. Think grey cardigans worn with New Balance sneakers, or wire-rimmed glasses paired with a leather biker jacket.</p>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">It's a look that plays with innocence and subverts it. It says, "I read critical theory, but I also party until 4 AM."</p>
    `,
    items: [
      {
        id: 'miu-1',
        type: 'bottom',
        category: 'bottom',
        description: 'Chino Pleated Miniskirt',
        originalImage: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=800&q=80',
        price: '$1,350',
        brand: 'Miu Miu',
        buyLink: 'https://www.miumiu.com'
      },
      {
        id: 'miu-2',
        type: 'top',
        category: 'top',
        description: 'Cashmere Cardigan',
        originalImage: 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&w=800&q=80',
        price: '$1,890',
        brand: 'Miu Miu',
        buyLink: 'https://www.miumiu.com'
      },
      {
        id: 'miu-3',
        type: 'shoes',
        category: 'shoes',
        description: 'Miu Miu x New Balance 530',
        originalImage: 'https://images.unsplash.com/photo-1518002171953-a080ee321e2f?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1518002171953-a080ee321e2f?auto=format&fit=crop&w=800&q=80',
        price: '$1,120',
        brand: 'Miu Miu',
        buyLink: 'https://www.miumiu.com'
      },
      {
        id: 'miu-4',
        type: 'shoes',
        category: 'shoes',
        description: 'Penny Loafers',
        originalImage: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
        price: '$950',
        brand: 'Prada',
        buyLink: 'https://www.prada.com'
      }
    ]
  },
  {
    id: 'art-8',
    title: 'Demna\'s Reality: Balenciaga',
    subtitle: 'Trash bags, oversized suits, and the luxury of looking like you don\'t care.',
    author: 'Demna',
    date: 'September 15, 2024',
    themeColor: '#000000',
    category: 'Collection',
    coverImage: 'https://images.unsplash.com/photo-1550614000-4b9519e0222f?q=80&w=1200&auto=format&fit=crop',
    content: `
      <p class="mb-6 text-lg leading-relaxed text-stone-700">Demna Gvasalia has turned Balenciaga into a social experiment. Are these dirty sneakers worth $1,000? Is a leather trash bag high fashion? The answer, invariably, is yes.</p>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">The silhouette is extreme: shoulders are massive, pants are dragging, and hoodies are cavernous. It is a caricature of streetwear, elevated to the level of couture. It challenges our perceptions of value and taste.</p>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">Wearing Balenciaga is a statement. It requires a certain level of irony and a lot of confidence. It's fashion for the internet age—memorable, controversial, and impossible to ignore.</p>
    `,
    items: [
      {
        id: 'bal-1',
        type: 'shoes',
        category: 'shoes',
        description: '3XL Sneakers',
        originalImage: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
        price: '$1,090',
        brand: 'Balenciaga',
        buyLink: 'https://www.balenciaga.com'
      },
      {
        id: 'bal-2',
        type: 'top',
        category: 'top',
        description: 'Oversized Tape Hoodie',
        originalImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        price: '$1,450',
        brand: 'Balenciaga',
        buyLink: 'https://www.balenciaga.com'
      },
      {
        id: 'bal-3',
        type: 'bottom',
        category: 'bottom',
        description: 'Baggy Sweatpants',
        originalImage: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80',
        price: '$950',
        brand: 'Balenciaga',
        buyLink: 'https://www.balenciaga.com'
      },
      {
        id: 'bal-4',
        type: 'accessory',
        category: 'accessory',
        description: 'Swift Oval Sunglasses',
        originalImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
        price: '$630',
        brand: 'Balenciaga',
        buyLink: 'https://www.balenciaga.com'
      }
    ]
  },
  {
    id: 'art-9',
    title: 'Skate Culture High: Supreme & Palace',
    subtitle: 'How the sidewalk became the runway for the world\'s biggest brands.',
    author: 'Tyshawn',
    date: 'September 08, 2024',
    themeColor: '#ef4444',
    category: 'New Arrival',
    coverImage: 'https://images.unsplash.com/photo-1520975661595-64536ef8ad77?q=80&w=1200&auto=format&fit=crop',
    content: `
      <p class="mb-6 text-lg leading-relaxed text-stone-700">Skateboarding has always been cool, but now it's high fashion. Brands like Supreme and Palace have transcended their roots to become cultural juggernauts, collaborating with everyone from Louis Vuitton to Jean Paul Gaultier.</p>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">The look is relaxed but specific: baggy work pants (Dickies or Carhartt), graphic tees, and durable outerwear. It's about utility first, but with a graphic sensibility that pops on camera.</p>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">You don't have to kickflip to wear it, but you have to respect the culture. Authenticity is the currency here. Don't be a poser.</p>
    `,
    items: [
      {
        id: 'sk8-1',
        type: 'top',
        category: 'top',
        description: 'Box Logo Hoodie',
        originalImage: 'https://images.unsplash.com/photo-1513757378314-e46255f6ed16?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1513757378314-e46255f6ed16?auto=format&fit=crop&w=800&q=80',
        price: '$168',
        brand: 'Supreme',
        buyLink: 'https://www.supremenewyork.com'
      },
      {
        id: 'sk8-2',
        type: 'bottom',
        category: 'bottom',
        description: 'Double Knee Pants',
        originalImage: 'https://images.unsplash.com/photo-1604176354204-9268737828fa?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1604176354204-9268737828fa?auto=format&fit=crop&w=800&q=80',
        price: '$120',
        brand: 'Carhartt WIP',
        buyLink: 'https://www.carhartt-wip.com'
      },
      {
        id: 'sk8-3',
        type: 'top',
        category: 'top',
        description: 'Tri-Ferg T-Shirt',
        originalImage: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80',
        price: '$48',
        brand: 'Palace',
        buyLink: 'https://www.palaceskateboards.com'
      },
      {
        id: 'sk8-4',
        type: 'shoes',
        category: 'shoes',
        description: 'Dunk Low Pro SB',
        originalImage: 'https://images.unsplash.com/photo-1595996955220-9bc9bc916a9e?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1595996955220-9bc9bc916a9e?auto=format&fit=crop&w=800&q=80',
        price: '$130',
        brand: 'Nike SB',
        buyLink: 'https://www.nike.com'
      }
    ]
  },
  {
    id: 'art-10',
    title: 'New Wave Tailoring: The Row',
    subtitle: 'Olsen twins dominance and the perfection of the oversized suit.',
    author: 'Ashley',
    date: 'September 01, 2024',
    themeColor: '#f5f5f4',
    category: 'Editorial',
    coverImage: 'https://images.unsplash.com/photo-1585914641050-fa9883c7225c?q=80&w=1200&auto=format&fit=crop',
    content: `
      <p class="mb-6 text-lg leading-relaxed text-stone-700">The suit is dead; long live the suit. The Row has redefined tailoring for the modern woman (and man), focusing on slouchy, fluid shapes that exude confidence.</p>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">Gone are the restrictive cuts of the past. New wave tailoring is about movement. Jackets are boxy, trousers are wide, and fabrics are incredibly luxe. It's power dressing without the aggression.</p>
      <p class="mb-6 text-lg leading-relaxed text-stone-700">Pair an oversized blazer with a simple white tee and loafers for a look that works in the boardroom and the gallery opening.</p>
    `,
    items: [
      {
        id: 'row-1',
        type: 'top',
        category: 'full-body',
        description: 'Igor Trousers',
        originalImage: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80',
        price: '$1,390',
        brand: 'The Row',
        buyLink: 'https://www.therow.com'
      },
      {
        id: 'row-2',
        type: 'top',
        category: 'top',
        description: 'Sibel Wool Blazer',
        originalImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
        price: '$3,250',
        brand: 'The Row',
        buyLink: 'https://www.therow.com'
      },
      {
        id: 'row-3',
        type: 'accessory',
        category: 'accessory',
        description: 'Margaux 15 Bag',
        originalImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
        price: '$4,390',
        brand: 'The Row',
        buyLink: 'https://www.therow.com'
      },
      {
        id: 'row-4',
        type: 'shoes',
        category: 'shoes',
        description: 'Minimalist Loafers',
        originalImage: 'https://images.unsplash.com/photo-1531310197838-cc254d0fd966?auto=format&fit=crop&w=800&q=80',
        processedImage: 'https://images.unsplash.com/photo-1531310197838-cc254d0fd966?auto=format&fit=crop&w=800&q=80',
        price: '$1,100',
        brand: 'The Row',
        buyLink: 'https://www.therow.com'
      }
    ]
  }
];
