# The Archive — Personal Media Library

A static website for cataloguing and downloading **your own** music and video files
in multiple qualities. No backend, no database — just files + a JSON catalog.

## Folder structure

```
media-library/
├── index.html
├── style.css
├── script.js
├── media/
│   ├── library.json          ← catalog metadata (edit this to add entries)
│   ├── music/                ← put your .mp3 files here
│   ├── video/                ← put your .mp4 files here
│   └── thumbnails/           ← cover art (.jpg/.png/.svg)
```

## Adding a new track or video

1. **Export your file at each quality you want to offer.**
   Use a tool you already have (e.g. ffmpeg, HandBrake, Audacity) to create the variants. Example with ffmpeg:

   ```bash
   ffmpeg -i original.wav -b:a 320k song-title_320.mp3
   ffmpeg -i original.wav -b:a 128k song-title_128.mp3

   ffmpeg -i original.mp4 -vf scale=-2:1080 song-title_1080p.mp4
   ffmpeg -i original.mp4 -vf scale=-2:480  song-title_480p.mp4
   ```

2. **Drop the files** into `media/music/` or `media/video/`.

3. **Add a cover image** (square works best for music, 16:9 for video) into `media/thumbnails/`.

4. **Add an entry to `media/library.json`**, following the existing pattern:

   ```json
   {
     "id": "m3",
     "title": "My New Song",
     "artist": "Me",
     "genre": "Lo-fi",
     "duration": "2:58",
     "cover": "media/thumbnails/my-new-song.jpg",
     "files": [
       { "quality": "320 kbps", "format": "MP3", "size": "7.1 MB", "path": "media/music/song-title_320.mp3" },
       { "quality": "128 kbps", "format": "MP3", "size": "2.9 MB", "path": "media/music/song-title_128.mp3" }
     ]
   }
   ```

   Use a unique `id` for every entry. `size` is just a display label — type whatever
   the actual file size is.

5. Refresh the page — no build step needed.

## Running locally

Browsers block `fetch()` on local files opened directly (`file://`), so serve the
folder with any simple local server, for example:

```bash
cd media-library
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploying

Since this is fully static, you can host it for free on any of:
- GitHub Pages
- Netlify / Vercel (drag-and-drop deploy)
- Cloudflare Pages

Just upload the whole `media-library` folder. Be mindful of file size limits on
free hosting tiers if your video files are large — you may want a CDN or object
storage (e.g. Cloudflare R2, Backblaze B2) for the actual media files, with
`library.json` pointing at those URLs instead of local paths.

## A note on content

This template is built for **content you own or have rights to distribute**
(your own recordings, your own videos, or properly licensed material). Swapping
in copyrighted commercial music or movies you don't have rights to would make
distributing them through this site a copyright violation, regardless of the
tech being legal.
