#!/usr/bin/env bash
# Re-encodes the hero footage for scroll scrubbing.
# A keyframe every 6 frames keeps currentTime seeks cheap, so the pour
# follows the scroll without stutter. Run from the project root:
#   bash scripts/encode-hero.sh
set -euo pipefail
cd "$(dirname "$0")/.."
SRC="public/brand/hero.mp4"
OUT="public/brand/hero-scrub.mp4"
OUT_SM="public/brand/hero-scrub-720.mp4"
POSTER="public/brand/hero-poster.jpg"

ffmpeg -y -i "$SRC" -c:v libx264 -g 6 -keyint_min 6 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart -crf 20 -an "$OUT"

# Lighter 720p variant for narrower desktop windows and slow connections.
ffmpeg -y -i "$SRC" -vf "scale=1280:720" -c:v libx264 -g 6 -keyint_min 6 \
  -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart -crf 21 -an "$OUT_SM"

# Poster = the final frame (queen centered, fully lit), used as the LCP image
# and as the complete fallback when the video is not available.
if [ ! -f "$POSTER" ]; then
  ffmpeg -y -sseof -0.05 -i "$SRC" -frames:v 1 -q:v 2 "$POSTER"
fi
