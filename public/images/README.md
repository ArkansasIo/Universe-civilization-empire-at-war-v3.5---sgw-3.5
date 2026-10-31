# images/

Static visual assets used by the game UI.

## Structure

- `ui/`: interface-specific graphics and icon sets.
- `game/`: original OGame-style illustrations for every navigation destination, catalog item, resource, and mothership system.
- supporting CSS/JS for image-heavy UI sections.

Keep filenames stable because legacy templates/modules may reference paths directly.

Regenerate the illustrations after changing navigation or game catalogs with `npm run assets:generate`.
