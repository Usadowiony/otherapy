import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { getAllTags, createTag, updateTag, setGlobalAuthErrorHandler, deleteTag, getTagTherapistUsage, getTagQuizUsage } from '../../services/tagService';
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
  const [usageInfo, setUsageInfo] = useState({ open: false, tagId: null, loading: false, therapists: [], quiz: { questions: [], answers: [] }, error: '' });
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

  const handleDeleteClick = (tag) => {
    setDeleteDialog({ open: true, tag, loading: false, error: '' });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, tag: null, loading: false, error: '' });
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialog(prev => ({ ...prev, loading: true, error: '' }));
    try {
      await deleteTag(deleteDialog.tag.id);
      setDeleteDialog({ open: false, tag: null, loading: false, error: '' });
      await fetchTags();
    } catch (err) {
      setDeleteDialog(prev => ({ ...prev, loading: false, error: err.message || 'Błąd podczas usuwania tagu' }));
    }
  };

  const handleShowUsage = async (tagId) => {
    setUsageInfo({ open: true, tagId, loading: true, therapists: [], quiz: { questions: [], answers: [] }, error: '' });
    try {
      const [therapists, quiz] = await Promise.all([
        getTagTherapistUsage(tagId),
        getTagQuizUsage(tagId)
      ]);
      setUsageInfo({ open: true, tagId, loading: false, therapists, quiz, error: '' });
    } catch (err) {
      setUsageInfo({ open: true, tagId, loading: false, therapists: [], quiz: { questions: [], answers: [] }, error: err.message || 'Błąd pobierania użycia tagu' });
    }
  };

  const handleCloseUsage = () => {
    setUsageInfo({ open: false, tagId: null, loading: false, therapists: [], quiz: { questions: [], answers: [] }, error: '' });
  };

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
            <div key={tag.id} className="bg-white rounded-lg shadow flex items-center justify-between px-4 py-2 group">
              <div
                className="flex-1 min-w-0 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 group-hover:scrollbar-thumb-gray-400"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'transparent transparent' }}
                onMouseEnter={e => {
                  e.currentTarget.style.scrollbarColor = '#d1d5db #fff'; // #d1d5db = gray-300
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.scrollbarColor = 'transparent transparent';
                }}
              >
                <span
                  className="text-base font-medium leading-6 whitespace-nowrap block max-w-xs truncate"
                  title={tag.name}
                  style={{ maxWidth: '16rem', display: 'inline-block' }}
                >
                  {tag.name}
                </span>
              </div>
              <div className="flex gap-2 ml-2 flex-shrink-0 items-center">
                <button
                  onClick={() => handleOpenModal(tag)}
                  className="text-blue-500 hover:text-blue-700"
                  disabled={isLoading}
                  title="Edytuj"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteClick(tag)}
                  className="text-red-500 hover:text-red-700"
                  disabled={isLoading}
                  title="Usuń"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
                <div className="relative group flex items-center">
                  <button
                    className="text-blue-400 hover:text-blue-600 ml-1 flex items-center"
                    title="Gdzie używany?"
                    type="button"
                    onMouseEnter={async (e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setUsageInfo(prev => ({ ...prev, loading: true, tagId: tag.id, open: true, mouseX: rect.left, mouseY: rect.top }));
                      try {
                        const [therapists, quiz] = await Promise.all([
                          getTagTherapistUsage(tag.id),
                          getTagQuizUsage(tag.id)
                        ]);
                        setUsageInfo({ open: true, tagId: tag.id, loading: false, therapists, quiz, error: '', mouseX: rect.left, mouseY: rect.top });
                      } catch (err) {
                        setUsageInfo({ open: true, tagId: tag.id, loading: false, therapists: [], quiz: { questions: [], answers: [] }, error: err.message || 'Błąd pobierania użycia tagu', mouseX: rect.left, mouseY: rect.top });
                      }
                    }}
                    onMouseLeave={() => setUsageInfo({ open: false, tagId: null, loading: false, therapists: [], quiz: { questions: [], answers: [] }, error: '' })}
                  >
                    <InformationCircleIcon className="h-5 w-5 align-middle" style={{verticalAlign: 'middle'}} />
                  </button>
                  {usageInfo.open && usageInfo.tagId === tag.id && (
                    <div
                      className="fixed z-50 bg-white border border-gray-300 rounded shadow-lg p-3 text-xs text-left whitespace-normal"
                      style={{
                        left: usageInfo.mouseX + 20,
                        top: usageInfo.mouseY + 10,
                        minWidth: '16rem',
                        maxWidth: '22rem',
                        pointerEvents: 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                      }}
                    >
                      <div className="font-semibold mb-1 text-blue-700 flex items-center gap-1">
                        <InformationCircleIcon className="h-4 w-4 text-blue-500" /> Użycie tagu
                      </div>
                      {usageInfo.loading ? (
                        <div className="text-gray-500">Ładowanie...</div>
                      ) : usageInfo.error ? (
                        <div className="text-red-600 mb-2">{usageInfo.error}</div>
                      ) : (
                        <>
                          <div className="mb-2">
                            <span className="font-semibold">Terapeuci:</span>
                            {usageInfo.therapists.length === 0 ? (
                              <span className="text-gray-500 ml-2">Brak</span>
                            ) : (
                              <ul className="ml-2">
                                {usageInfo.therapists.map(t => (
                                  <li key={t.id} className="mb-1">• {t.firstName} {t.lastName}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="border-t border-gray-200 my-2"></div>
                          <div>
                            <span className="font-semibold">Quizy (pytania/odpowiedzi):</span>
                            {(!usageInfo.quiz.questions.length && !usageInfo.quiz.answers.length) ? (
                              <span className="text-gray-500 ml-2">Brak</span>
                            ) : (
                              <ul className="ml-2">
                                {/* Odpowiedzi */}
                                {usageInfo.quiz.answers.map(a => (
                                  <li key={a.aText + '-' + (a.aIdx ?? Math.random())} className="mb-1">
                                    • {a.aText} <span className="text-gray-400">(pytanie nr {a.qIdx || '?'})</span>
                                  </li>
                                ))}
                                {/* Pytania */}
                                {usageInfo.quiz.questions.map((q, idx) => (
                                  <li key={q.text + '-' + (q.qIdx ?? idx)} className="mb-1">
                                    • {q.text} <span className="text-gray-400">(nr {q.qIdx || q.number || idx + 1})</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
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
              Czy na pewno chcesz usunąć tag <span className="font-semibold">{deleteDialog.tag?.name}</span>?<br/>
              <span className="text-red-600">Jeśli tag jest gdziekolwiek używany, zostanie usunięty ze wszystkich miejsc na zawsze.</span>
            </p>
            {deleteDialog.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">{deleteDialog.error}</div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={deleteDialog.loading}
              >Anuluj</button>
              <button
                onClick={handleDeleteConfirm}
                className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ${deleteDialog.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={deleteDialog.loading}
              >{deleteDialog.loading ? 'Usuwanie...' : 'Usuń'}</button>
            </div>
          </div>
        </div>
      )}

      {/* USUNIECIE POPUPA - nie renderujemy usageInfo.open na dole */}
    </div>
  );
};

export default TagsManager;