import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center", background: "#0B0A0A" }}>
        <svg width="124" height="124" viewBox="0 0 64 64" fill="#C9A24B">
          <path d="M32 1.6c2.6 0 4.6 2 4.6 4.6 0 2-1.2 3.7-3.1 4.3v1.9h-3V10.5c-1.9-.6-3.1-2.3-3.1-4.3 0-2.6 2-4.6 4.6-4.6Z" />
          <path d="M17.4 17.2 16 18.2c1.2 3.6 3.6 6.6 6.6 8.8h18.8c3-2.2 5.4-5.2 6.6-8.8l-1.4-1-1.1 0.9c-1.6 1.3-3.4 2.1-5.3 2.5l-.7-2.9-.9-.3c-1.5 1.3-3.3 2.1-5.3 2.4l-.6-3h-1.4l-.6 3c-2-.3-3.8-1.1-5.3-2.4l-.9.3-.7 2.9c-1.9-.4-3.7-1.2-5.3-2.5l-1.1-.9Z" />
          <circle cx="16.4" cy="16" r="2.5" />
          <circle cx="24.2" cy="13.6" r="2.4" />
          <circle cx="32" cy="12.7" r="2.4" />
          <circle cx="39.8" cy="13.6" r="2.4" />
          <circle cx="47.6" cy="16" r="2.5" />
          <rect x="22.8" y="26.4" width="18.4" height="3.6" rx="1.2" />
          <rect x="24.6" y="31" width="14.8" height="2.4" rx="1" />
          <path d="M26.6 33.6h10.8c-1.2 2.6-2.4 4.6-2.4 7.1 0 2.6 2.6 4.6 5.6 6.6 2.8 1.9 3.8 4.9 2.9 7.2-.4 1-1 1.7-1.9 2.2H22.4c-.9-.5-1.5-1.2-1.9-2.2-.9-2.3.1-5.3 2.9-7.2 3-2 5.6-4 5.6-6.6 0-2.5-1.2-4.5-2.4-7.1Z" />
          <rect x="17.2" y="56.2" width="29.6" height="3.2" rx="1.1" />
          <rect x="14" y="59.2" width="36" height="3.6" rx="1.4" />
        </svg>
      </div>
    ),
    size
  );
}
