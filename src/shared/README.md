# Shared Module

This module contains application-wide bootstrap code and shared components/models used by other modules (like `home`).

## Structure
- `presentation/`: Core UI shell, styling root (`index.css`), and the primary React renderer wrapper (`App.tsx`, `main.tsx`).
- `domain/`: Data types, models, or global application state interfaces.
- `application/`: Shared services (e.g., global error handlers, generic data parsers).
- `infrastructure/`: Shared utility clients (e.g., base HTTP clients, IPC wrappers).
