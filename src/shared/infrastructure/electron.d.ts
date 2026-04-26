import { AWSConfiguration } from '../domain/aws/AWSConfiguration';
import { ParameterMetadata, Parameter, ParameterType } from '@aws-sdk/client-ssm';

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
  awsSSMListParameters: (region: string, profile: string) => Promise<ParameterMetadata[]>;
  awsSSMGetParameter: (region: string, profile: string, name: string) => Promise<Parameter | undefined>;
  awsSSMPutParameter: (region: string, profile: string, name: string, value: string, type: ParameterType) => Promise<boolean>;
  awsSSMDeleteParameter: (region: string, profile: string, name: string) => Promise<boolean>;
  getSSMCategorizations: () => Promise<string[]>;
  saveSSMCategorization: (patterns: string[]) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI?: IElectronAPI;
  }
}
