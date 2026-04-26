# AWS Module

The AWS Management module provides utilities for interacting with AWS services using local machine credentials or a mock environment.

## Directory Structure
- `domain/`: Business entities and interfaces related to AWS configuration and services.
- `application/`: Application logic, including the `AWSClient` for service interaction and `SSMPathService` for path parsing.
- `infrastructure/`: Implementations for reading local AWS configuration via Electron IPC.
- `presentation/`: React components for managing credentials and interacting with the Parameter Store (SSM).

## Features
- **Parameter Store (SSM)**: List, search, and manage parameters with support for dynamic path categorization.
- **Credential Setup**: guidance and detection of local AWS profiles (`~/.aws/credentials`).
- **Mock Support**: A built-in 'mock' profile for testing and development without real AWS connectivity.

This module follows the project's Lightweight DDD architecture to ensure scalability and maintainability.
