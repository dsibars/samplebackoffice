import { ParameterMetadata, Parameter, ParameterType } from '@aws-sdk/client-ssm';

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
    return window.electronAPI.aws.ssm.listParameters(this.region, this.profile);
  }

  public async getParameter(name: string): Promise<Parameter | undefined> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.aws.ssm.getParameter(this.region, this.profile, name);
  }

  public async putParameter(name: string, value: string, type: ParameterType): Promise<boolean> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.aws.ssm.putParameter(this.region, this.profile, name, value, type);
  }

  public async deleteParameter(name: string): Promise<boolean> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.aws.ssm.deleteParameter(this.region, this.profile, name);
  }

  public async getSSMCategorizations(): Promise<string[]> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.aws.ssm.getCategorizations();
  }

  public async saveSSMCategorization(patterns: string[]): Promise<boolean> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.aws.ssm.saveCategorization(patterns);
  }
}
