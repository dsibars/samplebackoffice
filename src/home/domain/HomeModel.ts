export interface HomeMessage {
  title: string;
  description: string;
}

// Domain logic interface for home features
export interface HomeRepository {
  getInitialMessage(): Promise<HomeMessage>;
}
