import React, { useState } from 'react';
import TherapistsManager from '../components/admin/TherapistsManager';
import TagsManager from '../components/admin/TagsManager';

const AdminPanelPage = () => {
  const [activeTab, setActiveTab] = useState('therapists');

  const tabs = [
    { id: 'therapists', label: 'Terapeuci' },
    { id: 'tags', label: 'Tagi' },
    { id: 'quiz', label: 'Quiz' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Kontener główny */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Zakładki */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Zawartość zakładek */}
          <div className="p-6">
            {activeTab === 'therapists' && <TherapistsManager />}
            {activeTab === 'tags' && <TagsManager />}
            {activeTab === 'quiz' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Zarządzanie quizem</h2>
                {/* Tutaj będzie komponent do zarządzania quizem */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;
