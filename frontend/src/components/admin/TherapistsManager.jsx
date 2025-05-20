import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import {
  getAllTherapists,
  createTherapist,
  updateTherapist,
  deleteTherapist,
  setGlobalAuthErrorHandler
} from '../../services/therapistService';
import { getAllTags } from '../../services/tagService';
import { useAdminAuth } from './AdminAuthProvider';

const TherapistsManager = () => {
  const [therapists, setTherapists] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    description: '',
    tags: []
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [therapistToDelete, setTherapistToDelete] = useState(null);
  const { sessionExpired, handleApiAuthError } = useAdminAuth();

  useEffect(() => {
    setGlobalAuthErrorHandler(handleApiAuthError);
    return () => setGlobalAuthErrorHandler(null);
  }, [handleApiAuthError]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [therapistsData, tagsData] = await Promise.all([
        getAllTherapists(),
        getAllTags()
      ]);
      setTherapists(therapistsData);
      setAvailableTags(tagsData);
    } catch (error) {
      setError('Błąd podczas pobierania danych');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (therapist = null) => {
    setSelectedTherapist(therapist);
    if (therapist) {
      setFormData({
        firstName: therapist.firstName,
        lastName: therapist.lastName,
        specialization: therapist.specialization,
        description: therapist.description || '',
        tags: therapist.tagIds || []
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        specialization: '',
        description: '',
        tags: []
      });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTherapist(null);
    setFormData({
      firstName: '',
      lastName: '',
      specialization: '',
      description: '',
      tags: []
    });
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const tagId = parseInt(value);
      setFormData(prev => ({
        ...prev,
        tags: checked
          ? [...prev.tags, tagId]
          : prev.tags.filter(id => id !== tagId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const therapistData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        specialization: formData.specialization,
        description: formData.description,
        tagIds: formData.tags
      };

      if (selectedTherapist) {
        await updateTherapist(selectedTherapist.id, therapistData);
      } else {
        await createTherapist(therapistData);
      }

      await fetchData();
      handleCloseModal();
    } catch (error) {
      setError(error.message || 'Wystąpił błąd podczas zapisywania terapeuty');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (therapist) => {
    setTherapistToDelete(therapist);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (therapistToDelete) {
      try {
        setIsLoading(true);
        await deleteTherapist(therapistToDelete.id);
        await fetchData();
      } catch (error) {
        setError('Błąd podczas usuwania terapeuty');
      } finally {
        setIsLoading(false);
        setShowDeleteConfirm(false);
        setTherapistToDelete(null);
      }
    }
  };

  return (
    <div className="p-4">
      {sessionExpired && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Sesja administratora wygasła z powodu braku aktywności. Zaloguj się ponownie.
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Zarządzanie Terapeutami</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
          disabled={isLoading}
        >
          <PlusIcon className="h-5 w-5" />
          Dodaj Terapeutę
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {therapists.map(therapist => (
            <div key={therapist.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-semibold mb-2">
                {therapist.firstName} {therapist.lastName}
              </h3>
              <p className="text-gray-600 mb-2">{therapist.specialization}</p>
              {therapist.description && (
                <p className="text-gray-500 mb-4">{therapist.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {therapist.tagIds && therapist.tagIds.map(tagId => {
                  const tag = availableTags.find(t => t.id === tagId);
                  return tag ? (
                    <span
                      key={tag.id}
                      className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded"
                    >
                      {tag.name}
                    </span>
                  ) : null;
                })}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleOpenModal(therapist)}
                  className="text-blue-500 hover:text-blue-700"
                  disabled={isLoading}
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteClick(therapist)}
                  className="text-red-500 hover:text-red-700"
                  disabled={isLoading}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">
              {selectedTherapist ? 'Edytuj Terapeutę' : 'Dodaj Terapeutę'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imię</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nazwisko</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specjalizacja</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Opis</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows="4"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tagi
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {availableTags.map(tag => (
                    <div key={tag.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`tag-${tag.id}`}
                        name="tags"
                        value={tag.id}
                        checked={formData.tags.includes(tag.id)}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`tag-${tag.id}`} className="ml-2 block text-sm text-gray-900">
                        {tag.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? 'Zapisywanie...' : (selectedTherapist ? 'Zapisz' : 'Dodaj')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Potwierdź usunięcie</h3>
            <p className="text-gray-600 mb-6">
              Czy na pewno chcesz usunąć terapeutę {therapistToDelete?.firstName} {therapistToDelete?.lastName}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Anuluj
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                disabled={isLoading}
              >
                {isLoading ? 'Usuwanie...' : 'Usuń'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistsManager;