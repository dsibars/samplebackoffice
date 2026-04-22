import { useState } from 'react';
import { HomeView } from '../../home/presentation/HomeView';
import { VisualDataEditorView } from '../../visualDataEditor/presentation/VisualDataEditorView';

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'visualDataEditor'>('home');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Sample Backoffice</h1>
        <nav className="flex space-x-4">
          <button 
            onClick={() => setCurrentView('home')}
            className={`font-medium ${currentView === 'home' ? 'text-white border-b-2 border-white' : 'text-blue-200 hover:text-white'}`}
          >
            Home
          </button>
          <button 
            onClick={() => setCurrentView('visualDataEditor')}
            className={`font-medium ${currentView === 'visualDataEditor' ? 'text-white border-b-2 border-white' : 'text-blue-200 hover:text-white'}`}
          >
            Data Editor
          </button>
        </nav>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {currentView === 'home' && <HomeView />}
        {currentView === 'visualDataEditor' && <VisualDataEditorView />}
      </main>
    </div>
  );
}
