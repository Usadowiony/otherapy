import React, { useState } from 'react';
import { PlusIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

const TherapistsManager = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    tags: []
  });

  // Przykładowe dane - później będą pobierane z API
  const [therapists] = useState([
    {
      id: 1,
      firstName: 'Jan',
      lastName: 'Kowalski',
      specialization: 'Psycholog',
      tags: ['Depresja', 'Lęki', 'Relacje']
    },
    // ... więcej terapeutów
  ]);

  const handleOpenModal = (therapist = null) => {
    if (therapist) {
      setSelectedTherapist(therapist);
      setFormData({
        firstName: therapist.firstName,
        lastName: therapist.lastName,
        specialization: therapist.specialization,
        tags: therapist.tags
      });
    } else {
      setSelectedTherapist(null);
      setFormData({
        firstName: '',
        lastName: '',
        specialization: '',
        tags: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTherapist(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implementacja zapisu do API
    handleCloseModal();
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Przycisk dodawania */}
      <button
        onClick={() => handleOpenModal()}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Dodaj terapeutę
      </button>

      {/* Karuzela terapeutów */}
      <div className="relative">
        <div className="overflow-x-auto">
          <div className="flex space-x-4 pb-4">
            {therapists.map((therapist) => (
              <div
                key={therapist.id}
                className="flex-none w-64 bg-white rounded-lg shadow-md p-4"
              >
                <h3 className="text-lg font-medium text-gray-900">
                  {therapist.firstName} {therapist.lastName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {therapist.specialization}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {therapist.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => handleOpenModal(therapist)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {/* TODO: Implementacja usuwania */}}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {selectedTherapist ? 'Edytuj terapeutę' : 'Dodaj terapeutę'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Imię
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nazwisko
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Specjalizacja
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagi
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Depresja', 'Lęki', 'Relacje', 'Trauma', 'Uzależnienia'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${formData.tags.includes(tag)
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }
                      `}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {selectedTherapist ? 'Zapisz' : 'Dodaj'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistsManager; 