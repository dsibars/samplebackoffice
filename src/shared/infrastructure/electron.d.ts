import { AWSConfiguration } from '../domain/aws/AWSConfiguration';
import { ParameterMetadata, Parameter } from '@aws-sdk/client-ssm';

export interface ElectronFileResult {
  filePath: string;
  content: string;
  fileName: string;
}

export interface IElectronAPI {
  openFile: () => Promise<ElectronFileResult | null>;
  saveFile: (filePath: string, content: string) => Promise<boolean>;
  hasAWSConfiguration: () => Promise<boolean>;
  readAWSConfiguration: () => Promise<AWSConfiguration>;
  awsSSMListParameters: (region: string) => Promise<ParameterMetadata[]>;
  awsSSMGetParameter: (region: string, name: string) => Promise<Parameter | undefined>;
}

declare global {
  interface Window {
    electronAPI?: IElectronAPI;
  }
}
