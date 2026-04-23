# Technical Specifications & Guidelines (ROBOTS.md)

## Current Architecture State
- **Persistence**: Using LocalStorage (`LocalStorageBuilderStore`) via `CONFIGS_KEY` and `IMPLS_KEY`. Currently all saving/loading logic is synchronous. If we migrate to an actual API later, `BuilderService` and all React hook data fetches must shift to an async flow using Promises and loaders.
- **Data Models**: Nested behaviors currently rely on `ActionNode` types, structured recursively. Modifying the base behavior of `ActionNode` requires cascading updates inside `FunctionNodeEditor.tsx`.

## Future Iterations / To-Do
1. **Drag and Drop Enhancements**: Reordering is currently handled via native HTML5 `draggable` and drag-events. A third-party library like `@hello-pangea/dnd` or `@dnd-kit/core` could provide a smoother dragging experience and better mobile support if required in the future.
2. **Typescript Strictness**: `value` inside `ActionNode` and the generic dictionary for `Entities` lacks static binding. In a more opinionated setup, validations should catch mismatched Types across custom JSON domains.
3. **Form Validations**: Expanding the JSON editor inside `ConfigurationEditor` to auto-format, catch schema validation, and suggest autocompletions (perhaps integrating Monaco Editor) would vastly improve usability for power users building Configurations.
4. **Export Formatting**: The JSON export feature generates naive representation. This may need transforming via adapters depending on the specific engine ingesting it.

## AI AI Tip:
- If asked to modify visual nodes (e.g., adding color-coding for specific function returns), centralize the mapping inside `FunctionNodeEditor` and look at `config.functions.find(...)` line logic.
