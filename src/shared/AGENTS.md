# Shared Module Technical Notes

- Only place logic here if it's genuinely needed by multiple different modules.
- Do not introduce circular dependencies where `shared` relies on specific logic from `home` or other feature modules.
- The `presentation/` logic sets up the Vite/React entry points. Keep them as thin as possible.
