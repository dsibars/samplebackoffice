# Technical Specifications (For AI Agents)

This document dictates the rules and architectural choices of the Sample Backoffice project. It is intended to be read by all AI agents before performing any significant modifications.

## Goals and Current Status
- **Goal**: Maintain a modular, scalable Electron (and Web-compatible) React + Vite application structured via a lightweight Domain-Driven Design (DDD) approach.
- **Current Status**: Bootstrapping phase. The foundational `shared` and `home` modules are initialized alongside Vite and Electron configurations. AWS management module is being expanded with profile management and mock support.

## Architecture Rules
1. **Lightweight DDD**: 
   Every module inside `src/` (e.g., `shared`, `home`) MUST have:
   - `domain/` (Data shapes, interfaces, domain logic)
   - `application/` (Services that manipulate domain concepts)
   - `infrastructure/` (Storage mechanisms, wrappers around APIs, implementation details)
   - `presentation/` (React components, styles. No raw business logic here unless it's strictly UI state).

2. **Clean Code and SOLID**: 
   Ensure strong adherence to clean coding principles. Prefer composition, immutability, and explicit dependencies. Any changes you make MUST always be reflected in documentations like this file and `README.md`.

3. **Module Auto-Detection Planning**:
   Currently, the application routes/sidebar are being scaffolded manually. In the future, the build step or bootstrap step should dynamically read the `src/` folder and identify all module directories to construct the main navigation. Keep your additions cleanly encapsulated in their module folder so this vision can be effectively realized later.

## Tooling
- We use a `Makefile` to proxy interactions: `make build`, `make test`, `make run`. 
- Vitest is the primary testing framework. Write tests prioritizing `domain` and `application` logic.
- We compile using Vite (and `vite-plugin-electron`). Keep configuration in `vite.config.ts` clean.
- Styling is implemented using Tailwind CSS. 

---

## Custom Tips Section
*When an agent interacts with the user and needs to "correct" something, or extracts a learning around how the user wants things done in this codebase, add it to this section to prevent repetitive mistakes.*

- **AWS Security**: The application MUST NOT store sensitive AWS credentials (like Access Keys) in `localStorage` or internal files. It must delegate credential management to the local machine configuration (`~/.aws/credentials` and `~/.aws/config`). If credentials are missing, provide guidance/terminal commands for the user to configure their system.
- **Mock AWS Profile**: A built-in 'mock' profile is always available for testing. This profile simulates AWS SSM interactions using a local mock database (managed in the Electron Main process) to ensure the application remains functional and testable without real AWS connectivity.
