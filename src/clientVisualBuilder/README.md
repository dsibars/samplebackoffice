# Client Visual Builder Module

The Client Visual Builder is a specialized module for defining, composing, and exporting tree-like execution rules or macros via a visual interface. 

## Core Concepts

The module's architecture is grouped conceptually around:

1. **Configurations**
   A Configuration is an overarching dictionary of available `Entities` and `Functions`. Configurations are intended to represent specific "Workflows" or "Sub-Systems". You can manage multiple parallel Configurations entirely independently.

2. **Entities**
   Entities represent context markers or constraint dimensions. For example, if building an HTTP interceptor, entities might include `moment` (IN or OUT) and `target` (URL, HEADERS, BODY). Every composed action row sets these context markers to declare *when* and *to what* the actions apply.

3. **Functions & Items**
   - **Items**: Represent expected arguments. An item is a simple parameter metadata definition (e.g., `mandatory: true`, `allowedValues: ["RSA", "AES"]`).
   - **Functions**: Take `Items` as arguments and return a single `Item` as a result. A Function acts as a programmable operation macro (e.g., `encrypt`, `base64`, `concat`).

4. **Composition (Implementations)**
   Using the builder UI, users can create "Rows". Each Row pairs selected Entity contexts with an `ActionNode` tree. An `ActionNode` can either be a literal item string value OR a dynamically nested function call. Building these visual nested blocks outputs a pure JSON object which external systems can translate into actionable runtime macros.
   - Implementations can be named via the text input next to the title.
   - Rows are fully sortable via native Drag and Drop using their header sections.

## How to use

1. Go to the "Visual Builder" tab.
2. Select or create a new Configuration from the left sidebar.
3. Switch to "Edit Config Setup" to define JSON rules for `entities` and `functions`.
4. Switch to "Compose Actions" and build nested functionality.
5. Click "Export JSON" on the top right to retrieve the compiled `ClientImplementation` object for external services.
