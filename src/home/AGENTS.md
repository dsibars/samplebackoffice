# Home Module Technical Notes

- Adhere strictly to the Lightweight DDD architecture inside this module.
- Presentational logic should solely reside inside `presentation/`. Avoid passing domain models directly to third-party complex UI layers if they get messy; map them first if needed.
- `infrastructure/` should remain isolated and replaceable so we can switch between LocalStorage, Web APIs, and Electron IPC calls.
