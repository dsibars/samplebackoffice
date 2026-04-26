# SSM Packaged Properties

This document describes a future feature for the AWS Parameter Store management in the Sample Backoffice app.

## Feature Overview

In many organizations, AWS Parameter Store keys follow a hierarchical prefix pattern to organize configuration for different environments and services.

**Example Pattern:**
`/{env}/config/{service}/{property}`

**Example Keys:**
- `/dev/config/accounts/jdbc.url`
- `/dev/config/accounts/jdbc.password`
- `/live/config/accounts/jdbc.url`
- `/live/config/auth/jwt.secret`

## Concept: Packaged Properties

Instead of managing each parameter individually, the backoffice app will allow "packaging" or "grouping" these parameters based on their prefix components.

When managing a "packaged property", the user will interact with a structured view that breaks down the key into its constituent parts:

- **Environment**: e.g., `dev`, `live`, `staging`
- **Service**: e.g., `accounts`, `auth`, `payment-gateway`
- **Property**: e.g., `jdbc.password`, `api.key`

## UI/UX Implementation Goals

1. **Grouped View**: The UI should allow filtering or grouping parameters by Environment and Service.
2. **Simplified Editing**: When adding or editing a parameter, the user should be able to select the Environment and Service from dropdowns (or type new ones) and then provide the Property name and Value.
3. **Implicit Composition**: The application will automatically compose the full AWS Parameter Name (e.g., `/dev/config/accounts/jdbc.password`) when interacting with the real AWS API, but the user only manages the decomposed attributes.

## Mock Profile Integration

For testing and demonstration purposes, the built-in `mock` AWS profile will include several sample parameters following this pattern. This allows the development of the "Packaged Properties" feature even without a live AWS environment.

### Sample Mock Data Pattern
`/{env}/config/{service}/{property}`

- `env`: [dev, live]
- `service`: [accounts, inventory, shipping]
- `property`: [db.host, db.password, api.token, max.retries]
