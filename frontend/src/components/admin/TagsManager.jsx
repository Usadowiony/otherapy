import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getAllTags, createTag, updateTag, setGlobalAuthErrorHandler } from '../../services/tagService';
import { useAdminAuth } from './AdminAuthProvider';

const TagsManager = () => {
  const [tags, setTags] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [formData, setFormData] = useState({
    name: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, tag: null, loading: false, error: '' });
  const { sessionExpired, handleApiAuthError } = useAdminAuth();

  useEffect(() => {
    setGlobalAuthErrorHandler(handleApiAuthError);
    return () => setGlobalAuthErrorHandler(null);
  }, [handleApiAuthError]);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setIsLoading(true);
      const data = await getAllTags();
      setTags(data);
    } catch (error) {
      setError('Błąd podczas pobierania tagów');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (tag = null) => {
    setSelectedTag(tag);
    if (tag) {
      setFormData({
        name: tag.name
      });
    } else {
      setFormData({
        name: ''
      });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTag(null);
    setFormData({
      name: ''
    });
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (selectedTag) {
        await updateTag(selectedTag.id, formData);
      } else {
        await createTag(formData);
      }
      await fetchTags();
      handleCloseModal();
    } catch (error) {
      setError(error.message || 'Wystąpił błąd podczas zapisywania tagu');
    } finally {
      setIsLoading(false);
    }
  };

  // Usuwanie tagów - funkcjonalność wyłączona
  const handleDeleteClick = () => {};
  const handleDeleteCancel = () => {};
  const handleDeleteConfirm = () => {};

  return (
    <div className="p-4">
      {sessionExpired && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Sesja administratora wygasła z powodu braku aktywności. Zaloguj się ponownie.
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Zarządzanie Tagami</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
          disabled={isLoading}
        >
          <PlusIcon className="h-5 w-5" />
          Dodaj Tag
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
          {tags.map(tag => (
            <div key={tag.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-semibold mb-2">{tag.name}</h3>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleOpenModal(tag)}
                  className="text-blue-500 hover:text-blue-700"
                  disabled={isLoading}
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteClick(tag)}
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
              {selectedTag ? 'Edytuj Tag' : 'Dodaj Tag'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nazwa</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
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
                  {isLoading ? 'Zapisywanie...' : (selectedTag ? 'Zapisz' : 'Dodaj')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Potwierdź usunięcie</h3>
            <p className="text-gray-600 mb-6">
              Funkcja usuwania tagów została wyłączona.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >Anuluj</button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 opacity-50 cursor-not-allowed"
                disabled
              >Usuń</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsManager;