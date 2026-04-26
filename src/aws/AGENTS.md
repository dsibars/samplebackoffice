# AWS Module Technical Notes

- **Architecture**: Strictly adhere to the Lightweight DDD structure (domain, application, infrastructure, presentation).
- **Security**:
    - NEVER store sensitive AWS credentials (like Access Keys or Secret Keys) in `localStorage` or internal application files.
    - Always delegate credential management to the local machine's standard configuration files (`~/.aws/credentials`).
    - Use Electron IPC to securely access these local configurations from the Main process.
- **Mocking**: Maintain and prioritize the 'mock' profile for testing. Any new AWS service integration should include corresponding mock behavior.
- **SSM Pathing**: Use `SSMPathService` for any logic involving the parsing or recomposition of hierarchical SSM parameter paths.
- **State Management**: Persist the active AWS profile and region in `localStorage` within the `AWSClient` to maintain user context across sessions.
