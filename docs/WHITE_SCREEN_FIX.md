# Web White-Screen Fix

The web client uses a production-safe Vite base path and reloads once when Vite reports a stale dynamic-import chunk. The Pages workflow builds without hard-coding the repository path so the same artifact works with GitHub Pages and the configured custom domain.
