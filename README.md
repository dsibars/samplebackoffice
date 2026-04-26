# Sample Backoffice

A custom backoffice application designed as a utility tool for daily work and personal life. It provides an interface to edit configuration JSON files, connect to APIs, interact with services, and manage various integrations.

## Architecture & Structure

This application is built with **React**, **TypeScript**, and **Electron**, using **Vite** for fast bundling. It acts as both a desktop app (via Electron) and a potential static web application.

The project follows a "lightweight DDD" (Domain-Driven Design) architecture, focused on clean separation of concerns and a modular structure. 

The `src/` directory is organized into:
* `main/`: Electron's main process definitions.
* `shared/`: The core bootstrap, shared models, general presentation layers.
* `home/`: The initial module of the app. Future generic modules will sit alongside `home` and `shared`.

Each frontend module contains:
* `domain/`: Domain objects and interfaces.
* `application/`: Use cases and services.
* `infrastructure/`: Implementations for data handling, storage, and API access.
* `presentation/`: React visual components, UI logic, and styling.

## Planning & Future Vision

This app is highly **opened and modulable**.
At a future stage, the app will automatically "detect" the existing modules dynamically at build-time. This detection feature will auto-generate the main sidebar/index based on the folders present under `src/`, allowing us to scale the backoffice utilities without hardcoding every route. For now, the structure supports this future vision.

## Development

Use the provided `Makefile` to interact with the project:

- `make install` - Install all dependencies via npm
- `make build` - Build the app using Vite (and build the Electron wrapper)
- `make test` - Run tests using Vitest
- `make run` - Launch the development server and open the Electron app locally

## Modules

### AWS Management
A utility to manage AWS resources using local machine credentials.
- **Parameter Store**: List, search, and view parameters (with decryption).
- **Credential Setup**: Detects local profiles and provides setup guidance for Mac/Linux.
