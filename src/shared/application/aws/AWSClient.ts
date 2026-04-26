import { ParameterMetadata, Parameter } from '@aws-sdk/client-ssm';

export class AWSClient {
  private static instance: AWSClient;
  private region: string = localStorage.getItem('aws-region') || 'eu-west-1';
  private profile: string = localStorage.getItem('aws-profile') || 'mock';

  private constructor() {}

  public static getInstance(): AWSClient {
    if (!AWSClient.instance) {
      AWSClient.instance = new AWSClient();
    }
    return AWSClient.instance;
  }

  public setRegion(region: string): void {
    this.region = region;
    localStorage.setItem('aws-region', region);
  }

  public getRegion(): string {
    return this.region;
  }

  public setProfile(profile: string): void {
    this.profile = profile;
    localStorage.setItem('aws-profile', profile);
  }

  public getProfile(): string {
    return this.profile;
  }

  public async listParameters(): Promise<ParameterMetadata[]> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.awsSSMListParameters(this.region, this.profile);
  }

  public async getParameter(name: string): Promise<Parameter | undefined> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.awsSSMGetParameter(this.region, this.profile, name);
  }
}
