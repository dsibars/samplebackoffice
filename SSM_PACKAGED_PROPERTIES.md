# SSM Packaged Properties & Categorization

This document describes the dynamic categorization feature for AWS Parameter Store management.

## Feature Overview: Dynamic Categorization

Instead of hardcoded grouping, the backoffice app uses a collection of user-defined "SSM Categorizations" (prefix patterns). These patterns are applied dynamically to all retrieved AWS Parameter keys.

### Moment T0: No Categorizations
Parameters are shown as a simple list with their full Name:
- `/live/config/auth/jwt.secret`

### Moment T1: Configure Categorizations
The user adds prefix patterns, for example:
1. `/{env}/config/{service}/`
2. `/{env}/config/infra/{container}/`

### Moment T2: Dynamic Matching & Column Aggregation
When listing parameters, each key is matched against the defined patterns.

**Match Case 1:** `/live/config/auth/jwt.secret` matches pattern 1.
- **Extracted Attributes**: `env=live`, `service=auth`, `property=jwt.secret`

**Match Case 2:** `/live/config/infra/ee6798/some.property` matches pattern 2.
- **Extracted Attributes**: `env=live`, `container=ee6798`, `property=some.property`

**Fallback Case**: A parameter that doesn't match any pattern.
- **Extracted Attributes**: `property=/unmatched/path/to/key`

### Moment T3: Aggregated UI View
The UI table dynamically aggregates all captured variables into columns. In the example above, the table would have columns:
- `env`
- `service`
- `container`
- `property`

Rows will populate only the columns that correspond to their matched pattern's variables.

## Implementation Rules

1. **Categorizations are Global**: They apply across all AWS profiles (real and mock).
2. **First Match Wins**: Patterns should be evaluated in order.
3. **Variable Extraction**: Patterns use `{variable_name}` syntax to identify segments to be extracted as columns.
4. **Editing**: When editing, the UI uses the matched pattern to decompose the name, and when saving, it recomposes the full AWS name using the same pattern.

## Mock Profile Implementation

The `mock` profile comes pre-configured with the sample categorizations and data described above to demonstrate this dynamic behavior.
