import React, { useState, useEffect } from 'react';
import { AWSClient } from '../../shared/application/aws/AWSClient';
import { ElectronAWSConfigurationReader } from '../../shared/infrastructure/aws/ElectronAWSConfigurationReader';
import { ParameterStoreTab } from './ParameterStoreTab';
import { CredentialSetupTab } from './CredentialSetupTab';
import { AWSProfile } from '../../shared/domain/aws/AWSConfiguration';

const REGIONS = [
  'eu-west-1', 'eu-central-1', 'us-east-1', 'us-west-2', 'ap-southeast-1'
];

export function AWSView() {
  const [activeTab, setActiveTab] = useState<'ssm' | 'setup'>('ssm');
  const [region, setRegion] = useState(AWSClient.getInstance().getRegion());
  const [profile, setProfile] = useState(AWSClient.getInstance().getProfile());
  const [profiles, setProfiles] = useState<AWSProfile[]>([]);
  const [hasConfig, setHasConfig] = useState<boolean | null>(null);
  const configReader = new ElectronAWSConfigurationReader();

  useEffect(() => {
    checkConfig();
  }, []);

  const checkConfig = async () => {
    const exists = await configReader.hasLocalConfiguration();
    setHasConfig(exists);
    if (exists) {
      const config = await configReader.readConfiguration();
      setProfiles(config.profiles);
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegion = e.target.value;
    setRegion(newRegion);
    AWSClient.getInstance().setRegion(newRegion);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProfile = e.target.value;
    setProfile(newProfile);
    AWSClient.getInstance().setProfile(newProfile);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between border border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-gray-800">AWS Management</h2>
          <div className="flex items-center space-x-2">
            <span className={`h-3 w-3 rounded-full ${hasConfig ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-600">
              {hasConfig === null ? 'Checking...' : hasConfig ? 'Credentials Found' : 'No Credentials'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="profile-select" className="text-sm font-medium text-gray-700">Profile:</label>
            <select
              id="profile-select"
              value={profile}
              onChange={handleProfileChange}
              className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
              disabled={!hasConfig}
            >
              {profiles.length > 0 ? (
                profiles.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))
              ) : (
                <option value="default">default</option>
              )}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="region-select" className="text-sm font-medium text-gray-700">Region:</label>
            <select
              id="region-select"
              value={region}
              onChange={handleRegionChange}
              className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
            >
              {REGIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('ssm')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ssm'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Parameter Store (SSM)
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'setup'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Credential Setup
            </button>
          </nav>
        </div>

        <div className="p-6 flex-1 overflow-auto">
          {activeTab === 'ssm' && (
            hasConfig ? <ParameterStoreTab /> :
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No local AWS credentials detected. Please configure them to use the Parameter Store.</p>
              <button
                onClick={() => setActiveTab('setup')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Go to Setup
              </button>
            </div>
          )}
          {activeTab === 'setup' && <CredentialSetupTab onConfigUpdate={checkConfig} />}
        </div>
      </div>
    </div>
  );
}
