# VisualDataEditor Module Technical Notes

- Adhere strictly to the Lightweight DDD architecture inside this module.
- Presentational logic should solely reside inside `presentation/`. Avoid passing domain models directly to third-party complex UI layers if they get messy; map them first if needed.
- `infrastructure/` interacts with `papaparse` for CSV parsing and standard IPC bindings exposed on `window.electronAPI`. Provide web standard fallbacks where possible natively.
