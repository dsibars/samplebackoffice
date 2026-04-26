import { AWSConfiguration } from '../domain/aws/AWSConfiguration';
import { ParameterMetadata, Parameter, ParameterType } from '@aws-sdk/client-ssm';
import { AIConfiguration } from '../domain/ai/AIProfile';

export interface ElectronFileResult {
  filePath: string;
  content: string;
  fileName: string;
}

export interface IFilesAPI {
  openFile: () => Promise<ElectronFileResult | null>;
  saveFile: (filePath: string, content: string) => Promise<boolean>;
}

export interface IAWSApi {
  hasAWSConfiguration: () => Promise<boolean>;
  readAWSConfiguration: () => Promise<AWSConfiguration>;
  ssm: {
    listParameters: (region: string, profile: string) => Promise<ParameterMetadata[]>;
    getParameter: (region: string, profile: string, name: string) => Promise<Parameter | undefined>;
    putParameter: (region: string, profile: string, name: string, value: string, type: ParameterType) => Promise<boolean>;
    deleteParameter: (region: string, profile: string, name: string) => Promise<boolean>;
    getCategorizations: () => Promise<string[]>;
    saveCategorization: (patterns: string[]) => Promise<boolean>;
  };
}

export interface IAIApi {
  readConfiguration: () => Promise<AIConfiguration>;
  saveConfiguration: (config: AIConfiguration) => Promise<boolean>;
  getModels: (profileId: string) => Promise<string[]>;
  prompt: (profileId: string, model: string, input: string) => Promise<string>;
}

export interface IElectronAPI {
  files: IFilesAPI;
  aws: IAWSApi;
  ai: IAIApi;
}

declare global {
  interface Window {
    electronAPI?: IElectronAPI;
  }
}
