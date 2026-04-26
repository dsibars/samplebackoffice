export interface AWSProfile {
  name: string;
  accessKeyId?: string;
  region?: string;
}

export interface AWSConfiguration {
  profiles: AWSProfile[];
}

export interface IAWSConfigurationReader {
  readConfiguration(): Promise<AWSConfiguration>;
  hasLocalConfiguration(): Promise<boolean>;
}
