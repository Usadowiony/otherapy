import React, { useState, useEffect, useRef } from 'react';
import TherapistsManager from '../components/admin/TherapistsManager';
import TagsManager from '../components/admin/TagsManager';
import QuizManager from '../components/admin/QuizManager';
import { useAdminAuth } from '../components/admin/AdminAuthProvider';
import { useNavigate } from 'react-router-dom';
import { checkAdminToken } from '../services/authService';

const AdminPanelPage = () => {
  const { isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await checkAdminToken();
      } catch (err) {
        navigate('/login');
      }
    };
    verifyToken();
  }, [navigate]);

  const [activeTab, setActiveTab] = useState('therapists');
  const quizManagerRef = useRef();

  const tabs = [
    { id: 'therapists', label: 'Terapeuci' },
    { id: 'tags', label: 'Tagi' },
    { id: 'quiz', label: 'Quiz' }
  ];

  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return;
    if (tabId === 'quiz' && quizManagerRef.current && quizManagerRef.current.handleTabChange) {
      setActiveTab(tabId);
      return;
    }
    if (activeTab === 'quiz' && quizManagerRef.current && quizManagerRef.current.handleTabChange) {
      const allow = quizManagerRef.current.handleTabChange(() => setActiveTab(tabId));
      if (allow) setActiveTab(tabId);
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
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

          <div className="p-6">
            {activeTab === 'therapists' && <TherapistsManager />}
            {activeTab === 'tags' && <TagsManager />}
            {activeTab === 'quiz' && (
              <QuizManager ref={quizManagerRef} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;
