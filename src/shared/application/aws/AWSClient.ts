import { ParameterMetadata, Parameter } from '@aws-sdk/client-ssm';

export class AWSClient {
  private static instance: AWSClient;
  private region: string = 'eu-west-1';

  private constructor() {}

  public static getInstance(): AWSClient {
    if (!AWSClient.instance) {
      AWSClient.instance = new AWSClient();
    }
    return AWSClient.instance;
  }

  public setRegion(region: string): void {
    this.region = region;
  }

  public getRegion(): string {
    return this.region;
  }

  public async listParameters(): Promise<ParameterMetadata[]> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.awsSSMListParameters(this.region);
  }

  public async getParameter(name: string): Promise<Parameter | undefined> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.awsSSMGetParameter(this.region, name);
  }
}
