import { useEffect, useState, useMemo, FC } from 'react';
import { HomeMessage } from '../domain/HomeModel';
import { HomeService } from '../application/HomeService';
import { HomeStorage } from '../infrastructure/HomeStorage';

export const HomeView: FC = () => {
  const [message, setMessage] = useState<HomeMessage | null>(null);

  // Wire up dependencies (in a real app, use dependency injection)
  const homeService = useMemo(() => {
    const storage = new HomeStorage();
    return new HomeService(storage);
  }, []);

  useEffect(() => {
    homeService.loadHomeData().then(setMessage);
  }, [homeService]);

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      {message ? (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-semibold mb-2">{message.title}</h2>
          <p className="text-gray-600">{message.description}</p>
        </div>
      ) : (
        <p className="text-gray-400">Loading modules...</p>
      )}
    </div>
  );
};
