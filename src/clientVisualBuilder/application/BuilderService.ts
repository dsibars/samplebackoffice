import { BuilderConfiguration, ClientImplementation } from '../domain/models';
import { LocalStorageBuilderStore } from '../infrastructure/LocalStorageBuilderStore';

export class BuilderService {
  private store: LocalStorageBuilderStore;

  constructor() {
    this.store = new LocalStorageBuilderStore();
  }

  getConfigurations(): BuilderConfiguration[] {
    return this.store.loadConfigurations();
  }

  saveConfiguration(config: BuilderConfiguration): void {
    const configs = this.getConfigurations();
    const idx = configs.findIndex(c => c.id === config.id);
    if (idx >= 0) {
      configs[idx] = config;
    } else {
      configs.push(config);
    }
    this.store.saveConfigurations(configs);
  }

  getImplementationsForConfig(configId: string): ClientImplementation[] {
    return this.store.loadImplementations().filter(i => i.configurationId === configId);
  }

  saveImplementation(implementation: ClientImplementation): void {
    const impls = this.store.loadImplementations();
    const idx = impls.findIndex(i => i.id === implementation.id);
    if (idx >= 0) {
      impls[idx] = implementation;
    } else {
      impls.push(implementation);
    }
    this.store.saveImplementations(impls);
  }
}
