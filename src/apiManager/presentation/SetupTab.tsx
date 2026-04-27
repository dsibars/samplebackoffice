import React, { useState } from 'react';
import {
  APIManagerConfig,
  Environment,
  Service,
  Collection,
  Action,
  HTTPMethod,
  ArgumentType,
  ActionArgument
} from '../domain/APIManager';

interface SetupTabProps {
  config: APIManagerConfig;
  onSave: (config: APIManagerConfig) => void;
}

export const SetupTab: React.FC<SetupTabProps> = ({ config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<APIManagerConfig>(config);
  const [errors, setErrors] = useState<string[]>([]);

  const validate = (): string[] => {
    const errs: string[] = [];
    localConfig.services.forEach(service => {
      service.collections.forEach(collection => {
        collection.actions.forEach(action => {
          const bodyArgs = action.arguments.filter(a => a.type === ArgumentType.BODY);
          const bodyJsonPropertyArgs = action.arguments.filter(a => a.type === ArgumentType.BODY_JSON_PROPERTY);

          if (bodyArgs.length > 1) {
            errs.push(`Action "${action.name}" in service "${service.name}" has more than one "body" argument.`);
          }
          if (bodyArgs.length > 0 && bodyJsonPropertyArgs.length > 0) {
            errs.push(`Action "${action.name}" in service "${service.name}" mix "body" and "body_json_property" arguments.`);
          }
        });
      });
    });
    return errs;
  };

  const handleSave = () => {
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);
    onSave(localConfig);
    alert('Configuration saved!');
  };

  const addEnvironment = () => {
    const newEnv: Environment = {
      id: crypto.randomUUID(),
      name: 'new env',
      baseUrl: 'http://localhost:8080'
    };
    setLocalConfig({
      ...localConfig,
      environments: [...localConfig.environments, newEnv]
    });
  };

  const updateEnvironment = (id: string, field: keyof Environment, value: string) => {
    setLocalConfig({
      ...localConfig,
      environments: localConfig.environments.map(env =>
        env.id === id ? { ...env, [field]: value } : env
      )
    });
  };

  const removeEnvironment = (id: string) => {
    setLocalConfig({
      ...localConfig,
      environments: localConfig.environments.filter(env => env.id !== id)
    });
  };

  const addService = () => {
    const newService: Service = {
      id: crypto.randomUUID(),
      name: 'New Service',
      path: '/service',
      collections: []
    };
    setLocalConfig({
      ...localConfig,
      services: [...localConfig.services, newService]
    });
  };

  const updateService = (id: string, field: keyof Service, value: string) => {
    setLocalConfig({
      ...localConfig,
      services: localConfig.services.map(s =>
        s.id === id ? { ...s, [field]: value } : s
      )
    });
  };

  const removeService = (id: string) => {
    setLocalConfig({
      ...localConfig,
      services: localConfig.services.filter(s => s.id !== id)
    });
  };

  const addCollection = (serviceId: string) => {
    const newCollection: Collection = {
      id: crypto.randomUUID(),
      name: 'New Collection',
      path: '',
      actions: []
    };
    setLocalConfig({
      ...localConfig,
      services: localConfig.services.map(s =>
        s.id === serviceId ? { ...s, collections: [...s.collections, newCollection] } : s
      )
    });
  };

  const updateCollection = (serviceId: string, collectionId: string, field: keyof Collection, value: string) => {
    setLocalConfig({
      ...localConfig,
      services: localConfig.services.map(s =>
        s.id === serviceId ? {
          ...s,
          collections: s.collections.map(c =>
            c.id === collectionId ? { ...c, [field]: value } : c
          )
        } : s
      )
    });
  };

  const removeCollection = (serviceId: string, collectionId: string) => {
    setLocalConfig({
      ...localConfig,
      services: localConfig.services.map(s =>
        s.id === serviceId ? {
          ...s,
          collections: s.collections.filter(c => c.id !== collectionId)
        } : s
      )
    });
  };

  const addAction = (serviceId: string, collectionId: string) => {
    const newAction: Action = {
      id: crypto.randomUUID(),
      name: 'New Action',
      path: '/',
      method: HTTPMethod.GET,
      arguments: []
    };
    setLocalConfig({
      ...localConfig,
      services: localConfig.services.map(s =>
        s.id === serviceId ? {
          ...s,
          collections: s.collections.map(c =>
            c.id === collectionId ? { ...c, actions: [...c.actions, newAction] } : c
          )
        } : s
      )
    });
  };

  const updateAction = (serviceId: string, collectionId: string, actionId: string, field: keyof Action, value: any) => {
    setLocalConfig({
      ...localConfig,
      services: localConfig.services.map(s =>
        s.id === serviceId ? {
          ...s,
          collections: s.collections.map(c =>
            c.id === collectionId ? {
              ...c,
              actions: c.actions.map(a =>
                a.id === actionId ? { ...a, [field]: value } : a
              )
            } : c
          )
        } : s
      )
    });
  };

  const removeAction = (serviceId: string, collectionId: string, actionId: string) => {
    setLocalConfig({
      ...localConfig,
      services: localConfig.services.map(s =>
        s.id === serviceId ? {
          ...s,
          collections: s.collections.map(c =>
            c.id === collectionId ? {
              ...c,
              actions: c.actions.filter(a => a.id !== actionId)
            } : c
          )
        } : s
      )
    });
  };

  const addArgument = (serviceId: string, collectionId: string, actionId: string) => {
    const newArg: ActionArgument = {
      name: 'arg',
      type: ArgumentType.URL
    };
    setLocalConfig({
      ...localConfig,
      services: localConfig.services.map(s =>
        s.id === serviceId ? {
          ...s,
          collections: s.collections.map(c =>
            c.id === collectionId ? {
              ...c,
              actions: c.actions.map(a =>
                a.id === actionId ? { ...a, arguments: [...a.arguments, newArg] } : a
              )
            } : c
          )
        } : s
      )
    });
  };

  const updateArgument = (serviceId: string, collectionId: string, actionId: string, argIndex: number, field: keyof ActionArgument, value: any) => {
    setLocalConfig({
      ...localConfig,
      services: localConfig.services.map(s =>
        s.id === serviceId ? {
          ...s,
          collections: s.collections.map(c =>
            c.id === collectionId ? {
              ...c,
              actions: c.actions.map(a =>
                a.id === actionId ? {
                  ...a,
                  arguments: a.arguments.map((arg, idx) =>
                    idx === argIndex ? { ...arg, [field]: value } : arg
                  )
                } : a
              )
            } : c
          )
        } : s
      )
    });
  };

  const removeArgument = (serviceId: string, collectionId: string, actionId: string, argIndex: number) => {
    setLocalConfig({
      ...localConfig,
      services: localConfig.services.map(s =>
        s.id === serviceId ? {
          ...s,
          collections: s.collections.map(c =>
            c.id === collectionId ? {
              ...c,
              actions: c.actions.map(a =>
                a.id === actionId ? {
                  ...a,
                  arguments: a.arguments.filter((_, idx) => idx !== argIndex)
                } : a
              )
            } : c
          )
        } : s
      )
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">API Manager Setup</h2>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Save All Changes
        </button>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Validation errors found:</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Environments</h3>
          <button onClick={addEnvironment} className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Add Env</button>
        </div>
        <div className="space-y-4">
          {localConfig.environments.map(env => (
            <div key={env.id} className="flex space-x-4 items-end">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">
                  Name
                  <input
                    value={env.name}
                    onChange={e => updateEnvironment(env.id, 'name', e.target.value)}
                    className="w-full border rounded px-2 py-1 font-normal"
                  />
                </label>
              </div>
              <div className="flex-[3]">
                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">
                  Base URL
                  <input
                    value={env.baseUrl}
                    onChange={e => updateEnvironment(env.id, 'baseUrl', e.target.value)}
                    className="w-full border rounded px-2 py-1 font-normal"
                    placeholder="https://api.example.com"
                  />
                </label>
              </div>
              <button onClick={() => removeEnvironment(env.id)} className="text-red-600 hover:text-red-800 p-1">Delete</button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Services & Collections</h3>
          <button onClick={addService} className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Add Service</button>
        </div>

        <div className="space-y-6">
          {localConfig.services.map(service => (
            <div key={service.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r">
              <div className="flex space-x-4 items-end mb-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 uppercase font-bold mb-1">
                    Service Name
                    <input
                      value={service.name}
                      className="w-full border rounded px-2 py-1"
                      onChange={e => updateService(service.id, 'name', e.target.value)}
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 uppercase font-bold mb-1">
                    Path
                    <input
                      value={service.path}
                      onChange={e => updateService(service.id, 'path', e.target.value)}
                      className="w-full border rounded px-2 py-1"
                      placeholder="/accounts"
                    />
                  </label>
                </div>
                <button onClick={() => removeService(service.id)} className="text-red-600 hover:text-red-800 p-1">Delete Service</button>
              </div>

              <div className="ml-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium text-gray-700">Collections</h4>
                  <button onClick={() => addCollection(service.id)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Add Collection</button>
                </div>

                {service.collections.map(collection => (
                  <div key={collection.id} className="border-l-2 border-gray-300 pl-4 py-2">
                    <div className="flex space-x-4 items-end mb-4">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 uppercase font-bold mb-1">
                          Collection Name
                          <input
                            value={collection.name}
                            onChange={e => updateCollection(service.id, collection.id, 'name', e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm font-normal"
                          />
                        </label>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 uppercase font-bold mb-1">
                          Path (Optional)
                          <input
                            value={collection.path || ''}
                            onChange={e => updateCollection(service.id, collection.id, 'path', e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm font-normal"
                          />
                        </label>
                      </div>
                      <button onClick={() => removeCollection(service.id, collection.id)} className="text-red-400 hover:text-red-600 p-1">Remove</button>
                    </div>

                    <div className="ml-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h5 className="text-sm font-medium text-gray-600">Actions</h5>
                        <button onClick={() => addAction(service.id, collection.id)} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200">Add Action</button>
                      </div>

                      {collection.actions.map(action => (
                        <div key={action.id} className="bg-white p-3 rounded border border-gray-100 shadow-sm space-y-3">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs text-gray-400 uppercase font-bold mb-1">
                                Action Name
                                <input
                                  value={action.name}
                                  onChange={e => updateAction(service.id, collection.id, action.id, 'name', e.target.value)}
                                  className="w-full border rounded px-2 py-1 text-sm font-normal"
                                />
                              </label>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 uppercase font-bold mb-1">
                                Method
                                <select
                                  value={action.method}
                                  onChange={e => updateAction(service.id, collection.id, action.id, 'method', e.target.value)}
                                  className="w-full border rounded px-2 py-1 text-sm font-normal"
                                >
                                  {Object.values(HTTPMethod).map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                              </label>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 uppercase font-bold mb-1">
                                Path
                                <input
                                  value={action.path}
                                  onChange={e => updateAction(service.id, collection.id, action.id, 'path', e.target.value)}
                                  className="w-full border rounded px-2 py-1 text-sm font-normal"
                                />
                              </label>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-gray-500">Arguments</span>
                              <button onClick={() => addArgument(service.id, collection.id, action.id)} className="text-[10px] bg-gray-50 border px-1 rounded hover:bg-gray-100">Add Arg</button>
                            </div>
                            {action.arguments.map((arg, idx) => (
                              <div key={idx} className="flex space-x-2 items-center">
                                <input
                                  value={arg.name}
                                  onChange={e => updateArgument(service.id, collection.id, action.id, idx, 'name', e.target.value)}
                                  placeholder="Name"
                                  className="flex-1 border rounded px-2 py-1 text-xs"
                                />
                                <select
                                  value={arg.type}
                                  onChange={e => updateArgument(service.id, collection.id, action.id, idx, 'type', e.target.value)}
                                  className="border rounded px-2 py-1 text-xs"
                                >
                                  {Object.values(ArgumentType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <button onClick={() => removeArgument(service.id, collection.id, action.id, idx)} className="text-red-400 hover:text-red-600 text-xs">×</button>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-end">
                            <button onClick={() => removeAction(service.id, collection.id, action.id)} className="text-xs text-red-500 hover:underline">Delete Action</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
