import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  getAllTherapists,
  createTherapist,
  updateTherapist,
  deleteTherapist,
  getAllTags,
  createTag
} from '../../services/therapistService';

const TherapistsManager = () => {
  const [therapists, setTherapists] = useState([]);
  const [tags, setTags] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTherapist, setEditingTherapist] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    description: '',
    newTag: ''
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pobierz dane przy montowaniu komponentu
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [therapistsData, tagsData] = await Promise.all([
        getAllTherapists(),
        getAllTags()
      ]);
      setTherapists(therapistsData);
      setTags(tagsData);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (therapist = null) => {
    setError(null);
    if (therapist) {
      setEditingTherapist(therapist);
      setFormData({
        firstName: therapist.firstName,
        lastName: therapist.lastName,
        specialization: therapist.specialization,
        description: therapist.description || '',
        newTag: ''
      });
      setSelectedTags(therapist.Tags);
    } else {
      setEditingTherapist(null);
      setFormData({
        firstName: '',
        lastName: '',
        specialization: '',
        description: '',
        newTag: ''
      });
      setSelectedTags([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTherapist(null);
    setError(null);
    setFormData({
      firstName: '',
      lastName: '',
      specialization: '',
      description: '',
      newTag: ''
    });
    setSelectedTags([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagChange = (e) => {
    const selectedTags = Array.from(e.target.selectedOptions, option => Number(option.value));
    setFormData(prev => ({
      ...prev,
      tags: selectedTags
    }));
  };

  const handleAddTag = async () => {
    if (!formData.newTag.trim()) {
      setError('Nazwa tagu nie może być pusta');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const createdTag = await createTag({ name: formData.newTag.trim() });
      setTags(prev => [...prev, createdTag]);
      setFormData(prev => ({
        ...prev,
        newTag: ''
      }));
    } catch (error) {
      setError(error.message);
      console.error('Error adding tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTag = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(id => id !== tagId)
    }));
    setSelectedTags(prev => prev.filter(tag => tag.id !== tagId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const therapistData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        specialization: formData.specialization,
        description: formData.description,
        tags: selectedTags.map(tag => tag.id)
      };

      if (editingTherapist) {
        await updateTherapist(editingTherapist.id, therapistData);
      } else {
        await createTherapist(therapistData);
      }

      setIsModalOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        specialization: '',
        description: '',
        newTag: ''
      });
      setSelectedTags([]);
      setEditingTherapist(null);
      fetchData();
    } catch (error) {
      setError(error.message || 'Wystąpił błąd podczas zapisywania terapeuty');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć tego terapeutę?')) {
      try {
        setIsLoading(true);
        setError(null);
        await deleteTherapist(id);
        await fetchData();
      } catch (error) {
        setError(error.message);
        console.error('Error deleting therapist:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Zarządzanie Terapeutami</h2>
        <button
          onClick={() => {
            setEditingTherapist(null);
            setFormData({
              firstName: '',
              lastName: '',
              specialization: '',
              description: '',
              newTag: ''
            });
            setSelectedTags([]);
            setError(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Dodaj Terapeutę
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {therapists.map(therapist => (
          <div key={therapist.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-2">
              {therapist.firstName} {therapist.lastName}
            </h3>
            <p className="text-gray-600 mb-2">{therapist.specialization}</p>
            {therapist.description && (
              <p className="text-gray-500 mb-4">{therapist.description}</p>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              {therapist.Tags.map(tag => (
                <span
                  key={tag.id}
                  className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded"
                >
                  {tag.name}
                </span>
              ))}
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
                onClick={() => handleDelete(therapist.id)}
                className="text-red-500 hover:text-red-700"
                disabled={isLoading}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">
              {editingTherapist ? 'Edytuj Terapeutę' : 'Dodaj Terapeutę'}
            </h3>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Imię *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nazwisko *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Specjalizacja *</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Opis</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows="3"
                  disabled={isLoading}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Tagi (opcjonalne)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.newTag}
                    onChange={(e) => setFormData({ ...formData, newTag: e.target.value })}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Dodaj nowy tag"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    disabled={isLoading || !formData.newTag.trim()}
                  >
                    Dodaj
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag.id)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        disabled={isLoading}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError(null);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  disabled={isLoading}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Zapisywanie...
                    </>
                  ) : (
                    'Zapisz'
                  )}
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