import { useState } from 'react';
import { HomeView } from '../../home/presentation/HomeView';
import { VisualDataEditorView } from '../../visualDataEditor/presentation/VisualDataEditorView';
import { ClientVisualBuilderView } from '../../clientVisualBuilder/presentation/ClientVisualBuilderView';
import { AWSView } from '../../aws/presentation/AWSView';
import { AIView } from '../../ai/presentation/AIView';
import { APIManagerView } from '../../apiManager/presentation/APIManagerView';

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'visualDataEditor' | 'clientVisualBuilder' | 'aws' | 'ai' | 'apiManager'>('home');

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
          <button 
            onClick={() => setCurrentView('clientVisualBuilder')}
            className={`font-medium ${currentView === 'clientVisualBuilder' ? 'text-white border-b-2 border-white' : 'text-blue-200 hover:text-white'}`}
          >
            Visual Builder
          </button>
          <button
            onClick={() => setCurrentView('apiManager')}
            className={`font-medium ${currentView === 'apiManager' ? 'text-white border-b-2 border-white' : 'text-blue-200 hover:text-white'}`}
          >
            API Manager
          </button>
          <button
            onClick={() => setCurrentView('aws')}
            className={`font-medium ${currentView === 'aws' ? 'text-white border-b-2 border-white' : 'text-blue-200 hover:text-white'}`}
          >
            AWS
          </button>
          <button
            onClick={() => setCurrentView('ai')}
            className={`font-medium ${currentView === 'ai' ? 'text-white border-b-2 border-white' : 'text-blue-200 hover:text-white'}`}
          >
            AI
          </button>
        </nav>
      </header>
      <main className="flex-1 w-full p-6 xl:p-8">
        {currentView === 'home' && <HomeView />}
        {currentView === 'visualDataEditor' && <VisualDataEditorView />}
        {currentView === 'clientVisualBuilder' && <ClientVisualBuilderView />}
        {currentView === 'apiManager' && <APIManagerView />}
        {currentView === 'aws' && <AWSView />}
        {currentView === 'ai' && <AIView />}
      </main>
    </div>
  );
}
