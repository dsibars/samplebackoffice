import { HomeMessage, HomeRepository } from '../domain/HomeModel';

export class HomeStorage implements HomeRepository {
  async getInitialMessage(): Promise<HomeMessage> {
    // Simulate fetching from LocalStorage or Electron backend
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          title: "Welcome to the Sample Backoffice",
          description: "This is a clean, structured DDD React/Electron application designed for modularity.",
        });
      }, 500);
    });
  }
}
