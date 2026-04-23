import { BuilderConfiguration, ClientImplementation } from '../domain/models';

const CONFIGS_KEY = 'samplebackoffice_builder_configs';
const IMPLS_KEY = 'samplebackoffice_builder_implementations';

export class LocalStorageBuilderStore {
  
  private getDefaultConfig(): BuilderConfiguration {
    return {
      id: "default-crypto-setup",
      name: "Encryption Workflow Setup",
      entities: [
        { code: "target", description: "Function Target", allowed_values: ["url", "body", "head"] },
        { code: "moment", description: "When execute", allowed_values: ["IN", "OUT"] },
        { code: "environment", description: "Environment constraint", allowed_values: ["PROD", "PRE", "DEV"] }
      ],
      functions: [
        {
           code: "encrypt",
           description: "Standard RSA/AES block encryption algorithm for secure data payloads.",
           arguments: [
              { code: "content", mandatory: true, description: "Text to encrypt" },
              { code: "certificate", mandatory: true, description: "Certificate", allowed_values: ["CERT-1", "CERT-2", "CERT-3"] },
              { code: "key", mandatory: true, description: "Encryption Key" },
              { code: "algorithm", mandatory: true, description: "Algorithm", allowed_values: ["RSA", "AES"] }
           ],
           result: { code: "ret_enc", mandatory: true, description: "Encrypted string" }
        },
        {
          code: "b64",
          description: "Encodes arbitrary strings down to base-64 representation suitable for headers.",
          arguments: [
             { code: "content", mandatory: true, description: "Text to encode" }
          ],
          result: { code: "ret_b64", mandatory: true, description: "Base64 string" }
        },
        {
          code: "body",
          description: "Extracts or references the complete HTTP request body structure.",
          arguments: [],
          result: { code: "ret_body", mandatory: true, description: "Request content" }
        },
        {
          code: "concat",
          description: "Concatenates two separate strings strictly end-to-end.",
          arguments: [
            { code: "part1", mandatory: true, description: "First part" },
            { code: "part2", mandatory: true, description: "Second part" }
          ],
          result: { code: "ret_concat", mandatory: true, description: "Concatenated string" }
        },
        {
          code: "extract_json_field",
          description: "Dynamically accesses a dot-notated field key within a raw JSON string.",
          arguments: [
            { code: "json", mandatory: true, description: "Source JSON string" },
            { code: "field", mandatory: true, description: "Field name to extract (e.g., user.id)" }
          ],
          result: { code: "ret_extracted", mandatory: true, description: "Extracted Field Value" }
        },
        {
          code: "date_format",
          description: "Parses ISO dates returning strongly typed layout formats.",
          arguments: [
            { code: "date_string", mandatory: true, description: "ISO Date String" },
            { code: "format", mandatory: true, description: "Target Format", allowed_values: ["YYYY-MM-DD", "DD/MM/YYYY", "Unix Timestamp"] }
          ],
          result: { code: "ret_date", mandatory: true, description: "Formatted Date" }
        },
        {
          code: "http_get",
          description: "Performs synchronous outbound GET requests, awaiting and extracting responses.",
          arguments: [
            { code: "url", mandatory: true, description: "URL to fetch" },
            { code: "auth_token", mandatory: false, description: "Optional Bearer Token" }
          ],
          result: { code: "ret_response", mandatory: true, description: "HTTP Response Body" }
        },
        {
          code: "string_replace",
          description: "Searches text universally replacing all matched source values with alternative targets.",
          arguments: [
            { code: "source", mandatory: true, description: "Original String" },
            { code: "search", mandatory: true, description: "Text to find" },
            { code: "replace", mandatory: true, description: "Replacement text" }
          ],
          result: { code: "ret_replaced", mandatory: true, description: "Replaced String" }
        }
      ]
    };
  }

  loadConfigurations(): BuilderConfiguration[] {
    const raw = localStorage.getItem(CONFIGS_KEY);
    if (!raw) {
      const def = [this.getDefaultConfig()];
      this.saveConfigurations(def);
      return def;
    }
    return JSON.parse(raw);
  }

  saveConfigurations(configs: BuilderConfiguration[]): void {
    localStorage.setItem(CONFIGS_KEY, JSON.stringify(configs));
  }

  loadImplementations(): ClientImplementation[] {
    const raw = localStorage.getItem(IMPLS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  }

  saveImplementations(implementations: ClientImplementation[]): void {
    localStorage.setItem(IMPLS_KEY, JSON.stringify(implementations));
  }
}
