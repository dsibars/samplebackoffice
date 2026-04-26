import { useState, useEffect } from 'react';
import { ElectronAWSConfigurationReader } from '../infrastructure/ElectronAWSConfigurationReader';
import { AWSProfile } from '../domain/AWSConfiguration';

interface CredentialSetupTabProps {
  onConfigUpdate: () => void;
}

export function CredentialSetupTab({ onConfigUpdate }: CredentialSetupTabProps) {
  const [profiles, setProfiles] = useState<AWSProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    profile: 'default',
    accessKey: '',
    secretKey: '',
    region: 'eu-west-1'
  });
  const configReader = new ElectronAWSConfigurationReader();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const config = await configReader.readConfiguration();
      // Filter out 'mock' from the machine configuration display to avoid confusion
      setProfiles(config.profiles.filter(p => p.name !== 'mock'));
    } catch (err) {
      console.error('Failed to read AWS config', err);
    } finally {
      setLoading(false);
    }
  };

  const generateCommands = () => {
    const { profile, accessKey, secretKey, region } = form;
    return `# To configure the "${profile}" profile locally, run:
mkdir -p ~/.aws
cat >> ~/.aws/credentials << EOF
[${profile}]
aws_access_key_id = ${accessKey || 'YOUR_ACCESS_KEY'}
aws_secret_access_key = ${secretKey || 'YOUR_SECRET_KEY'}
EOF

cat >> ~/.aws/config << EOF
[profile ${profile}]
region = ${region}
output = json
EOF`;
  };

  return (
    <div className="max-w-4xl space-y-8">
      <section>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Machine Configuration</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Reading ~/.aws/credentials...</p>
        ) : profiles.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-sm text-yellow-700">No AWS profiles detected on this machine.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profiles.map(p => (
              <div key={p.name} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                <p className="font-bold text-gray-800">[{p.name}]</p>
                <p className="text-xs text-gray-500">Access Key: {p.accessKeyId || 'Unknown'}</p>
                <p className="text-xs text-gray-500">Region: {p.region || 'Unknown'}</p>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => { loadConfig(); onConfigUpdate(); }}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          Refresh Detection
        </button>
      </section>

      <section className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Help Me Setup</h3>
        <p className="text-sm text-gray-600 mb-6">
          Fill in your credentials to generate the commands needed to configure your machine.
          <span className="font-bold text-red-600"> These values are not stored by the application.</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Profile Name</label>
              <input
                type="text"
                value={form.profile}
                onChange={e => setForm({...form, profile: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">AWS Access Key ID</label>
              <input
                type="text"
                value={form.accessKey}
                onChange={e => setForm({...form, accessKey: e.target.value})}
                placeholder="AKIA..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">AWS Secret Access Key</label>
              <input
                type="password"
                value={form.secretKey}
                onChange={e => setForm({...form, secretKey: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Setup Commands (Mac/Linux)</label>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-xs font-mono overflow-x-auto whitespace-pre h-48">
                {generateCommands()}
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(generateCommands())}
                className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-500 italic">Copy and paste these commands into your terminal to apply the configuration.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
