import { IAWSConfigurationReader, AWSConfiguration } from '../domain/AWSConfiguration';

export class ElectronAWSConfigurationReader implements IAWSConfigurationReader {
  async readConfiguration(): Promise<AWSConfiguration> {
    if (!window.electronAPI) {
      return { profiles: [] };
    }
    return window.electronAPI.readAWSConfiguration();
  }

  async hasLocalConfiguration(): Promise<boolean> {
    if (!window.electronAPI) {
      return false;
    }
    return window.electronAPI.hasAWSConfiguration();
  }
}
