import type { SVGProps } from "react";

// lucide-react ships no brand marks (LinkedIn/Instagram/X), so these three
// are hand-drawn at the same 24x24/stroke-free glyph size as the rest of
// the icon system instead of pulling in an extra dependency for three
// paths.
export function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.5 8.75h3.38V20.5H3.5V8.75Zm6.02 0h3.24v1.61h.05c.45-.85 1.56-1.75 3.21-1.75 3.43 0 4.06 2.26 4.06 5.2v6.69h-3.38v-5.93c0-1.42-.03-3.24-1.97-3.24-1.98 0-2.28 1.55-2.28 3.14v6.03H9.52V8.75Z" />
    </svg>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden
      {...props}
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.15" cy="6.85" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M13.6 10.62 20.02 3h-1.53l-5.58 6.62L8.45 3H3.2l6.73 9.53L3.2 21h1.53l5.9-7l4.71 7h5.25l-6.99-10.38Zm-2.09 2.48-.68-.96L5.4 4.13h2.35l4.38 6.2.68.96 5.7 8.06h-2.35l-4.65-6.25Z" />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M14.5 21v-7.6h2.55l.38-2.96h-2.93V8.56c0-.86.24-1.44 1.47-1.44h1.57V4.48A21 21 0 0 0 15.5 4.4c-2.28 0-3.84 1.39-3.84 3.94v2.1H9.1v2.96h2.56V21h2.84Z" />
    </svg>
  );
}

export function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <rect x="2.75" y="5.75" width="18.5" height="12.5" rx="3.5" />
      <path d="M10.5 9.3v5.4l4.7-2.7-4.7-2.7Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12.02 3c-4.97 0-9 4.03-9 9 0 1.6.42 3.1 1.15 4.4L3 21l4.72-1.12A8.96 8.96 0 0 0 12.02 21c4.97 0 9-4.03 9-9s-4.03-9-9-9Zm4.98 12.78c-.21.6-1.22 1.15-1.68 1.19-.43.04-.87.2-2.94-.61-2.48-.98-4.07-3.52-4.2-3.68-.12-.17-1-1.33-1-2.54s.63-1.8.86-2.05c.21-.23.46-.29.62-.29l.44.01c.14 0 .33-.05.51.4.21.51.7 1.75.76 1.88.06.13.1.28.02.45-.08.17-.12.28-.24.43-.12.15-.25.33-.36.44-.12.12-.25.25-.11.49.14.24.62 1.03 1.34 1.67.92.83 1.7 1.09 1.94 1.21.24.12.38.1.52-.06.15-.16.62-.72.79-.97.16-.24.33-.2.55-.12.23.08 1.44.68 1.68.81.25.12.41.18.47.28.06.11.06.62-.14 1.21Z" />
    </svg>
  );
}
