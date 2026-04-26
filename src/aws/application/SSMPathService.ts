export interface ParsedPath {
  pattern: string | null;
  variables: Record<string, string>;
  propertyName: string;
}

export class SSMPathService {
  /**
   * Matches a path against a list of patterns and returns the first match.
   */
  public static parsePath(path: string, patterns: string[]): ParsedPath {
    for (const pattern of patterns) {
      const parsed = this.tryMatch(path, pattern);
      if (parsed) {
        return parsed;
      }
    }

    return {
      pattern: null,
      variables: {},
      propertyName: path,
    };
  }

  /**
   * Tries to match a path against a specific pattern.
   */
  private static tryMatch(path: string, pattern: string): ParsedPath | null {
    // Extract variable names from pattern, e.g., ["env", "service"] from "/{env}/config/{service}/"
    const variableNames: string[] = [];
    const variableRegex = /\{([^}]+)\}/g;
    let match;
    while ((match = variableRegex.exec(pattern)) !== null) {
      variableNames.push(match[1]);
    }

    // Convert pattern to regex
    // Escape special regex characters except for our placeholders
    let regexString = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Replace placeholders with capture groups
    variableNames.forEach(name => {
      // Escape the placeholder in the regex string
      const escapedPlaceholder = `\\{${name}\\}`;
      // Use [^/]* to match path segments (can be empty)
      regexString = regexString.replace(escapedPlaceholder, '([^/]*)');
    });

    // Ensure it matches from the start and capture the remainder as propertyName
    const regex = new RegExp(`^${regexString}(.*)$`);
    const pathMatch = path.match(regex);

    if (pathMatch) {
      const variables: Record<string, string> = {};
      variableNames.forEach((name, index) => {
        variables[name] = pathMatch[index + 1];
      });
      const propertyName = pathMatch[variableNames.length + 1];

      return {
        pattern,
        variables,
        propertyName,
      };
    }

    return null;
  }

  /**
   * Recomposes the full AWS path from a pattern, variables, and property name.
   */
  public static recomposePath(pattern: string | null, variables: Record<string, string>, propertyName: string): string {
    if (!pattern) {
      return propertyName;
    }

    let fullPath = pattern;
    for (const [name, value] of Object.entries(variables)) {
      fullPath = fullPath.replace(`{${name}}`, value);
    }

    return fullPath + propertyName;
  }
}
