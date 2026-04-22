import { HomeMessage, HomeRepository } from '../domain/HomeModel';

export class HomeService {
  constructor(private readonly repository: HomeRepository) {}

  async loadHomeData(): Promise<HomeMessage> {
    // In a real app, you might orchestrate domain objects here
    return this.repository.getInitialMessage();
  }
}
