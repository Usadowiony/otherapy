import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import Welcome from "../quiz/Welcome";
import { getAllQuizzes, getQuiz, updateQuiz } from "../../services/quizService";
import { getQuestionsForQuiz, createQuestion, updateQuestion, deleteQuestion } from "../../services/questionService";
import { createAnswer, updateAnswer, deleteAnswer } from "../../services/answerService";
import { getAllTags, createTag, setGlobalAuthErrorHandler } from "../../services/tagService";
import { useAdminAuth } from './AdminAuthProvider';
import { saveQuizDraft, getQuizDrafts, getQuizDraft, deleteQuizDraft, updateQuizDraft } from '../../services/quizDraftService';
import { PencilIcon } from '@heroicons/react/24/outline';

const EditQuestionModal = ({ open, onClose, onSave, initialText }) => {
  const [text, setText] = useState(initialText || "");
  const [error, setError] = useState("");
  useEffect(() => {
    setText(initialText || "");
    setError("");
  }, [open, initialText]);
  const handleSave = () => {
    if (!text.trim()) {
      setError("Treść pytania jest wymagana.");
      return;
    }
    setError("");
    onSave(text);
  };
  return open ? (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg min-w-[300px] max-w-[95vw] w-full" style={{maxWidth: 400}}>
        <h3 className="font-bold mb-2">Edytuj pytanie</h3>
        <input
          className="border p-2 w-full mb-2"
          value={text}
          onChange={e => { setText(e.target.value); setError(""); }}
          placeholder="Treść pytania"
        />
        {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={onClose}>Anuluj</button>
          <button
            className={`px-3 py-1 rounded text-white bg-blue-600 hover:bg-blue-700 ${!text.trim() ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={handleSave}
            disabled={!text.trim()}
            type="button"
          >Zapisz</button>
        </div>
      </div>
    </div>
  ) : null;
};

const EditAnswerModal = ({ open, onClose, onSave, initialText, initialTags = [], availableTags = [] }) => {
  const [text, setText] = useState(initialText || "");
  const [selectedTags, setSelectedTags] = useState(initialTags);
  const [error, setError] = useState("");
  const [showNoTagsWarning, setShowNoTagsWarning] = useState(false);
  useEffect(() => {
    setText(initialText || "");
    setSelectedTags(initialTags || []);
    setError("");
    setShowNoTagsWarning(false);
  }, [open, initialText, initialTags]);

  const handleTagChange = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
    setShowNoTagsWarning(false);
  };

  const handleSave = () => {
    if (!text.trim()) {
      setError("Treść odpowiedzi jest wymagana.");
      return;
    }
    if (selectedTags.length === 0) {
      setShowNoTagsWarning(true);
      setError("");
      return;
    }
    setError("");
    setShowNoTagsWarning(false);
    onSave(text, selectedTags);
  };

  const handleAddAnyway = () => {
    setShowNoTagsWarning(false);
    onSave(text, selectedTags);
  };

  return open ? (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg min-w-[300px] max-w-[95vw] w-full" style={{maxWidth: 400}}>
        <h3 className="font-bold mb-2">Edytuj odpowiedź</h3>
        <input
          className="border p-2 w-full mb-2"
          value={text}
          onChange={e => { setText(e.target.value); setError(""); setShowNoTagsWarning(false); }}
          placeholder="Treść odpowiedzi"
        />
        {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
        <div className="mb-2">
          <div className="font-semibold mb-1">Tagi (zalecane):</div>
          <div className="flex flex-wrap gap-2 mb-1">
            {availableTags.map(tag => (
              <label key={tag.id} className="flex items-center gap-1 text-sm bg-gray-100 px-2 py-1 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => handleTagChange(tag.id)}
                  className="accent-blue-600"
                />
                {tag.name}
              </label>
            ))}
          </div>
          {showNoTagsWarning && (
            <div className="text-orange-600 text-xs mt-1 flex flex-col gap-2">
              <span>Zaleca się przypisanie tagów do odpowiedzi (możesz dodać nowe tagi w panelu Tagi).</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={onClose}>Anuluj</button>
          {showNoTagsWarning ? (
            <button
              className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded"
              onClick={handleAddAnyway}
              type="button"
            >Dodaj mimo to</button>
          ) : (
            <button
              className={`px-3 py-1 rounded text-white bg-blue-600 hover:bg-blue-700 ${!text.trim() ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={handleSave}
              disabled={!text.trim()}
              type="button"
            >Zapisz</button>
          )}
        </div>
      </div>
    </div>
  ) : null;
};

// Modal do zapisu draftu z nazwą i autorem
const SaveDraftModal = ({ open, onClose, onSave, loadedDraft, isPublishedDraft, allDrafts }) => {
  const [mode, setMode] = useState('new'); // 'overwrite' lub 'new'
  const [name, setName] = useState(loadedDraft?.name || "");
  const [author, setAuthor] = useState(loadedDraft?.author || "");
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      setMode(loadedDraft && !isPublishedDraft ? 'overwrite' : 'new');
      setName(loadedDraft?.name || "");
      setAuthor(loadedDraft?.author || "");
      setError("");
    }
  }, [open, loadedDraft, isPublishedDraft]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'new') {
      if (!name.trim() || !author.trim()) {
        setError("Nazwa i autor są wymagane");
        return;
      }
      // Walidacja unikalności nazw (case-sensitive, nie identyczne)
      const exists = allDrafts?.some(d => d.name.trim() === name.trim());
      if (exists) {
        setError("Draft o takiej nazwie już istnieje. Nazwy muszą być unikalne.");
        return;
      }
    }
    onSave({ mode, name, author });
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        {loadedDraft && (
          <div className="mb-4">
            <div className="font-semibold text-gray-700 mb-1">Zapisz zmiany:</div>
            <label className="flex items-center gap-2 mb-1">
              <input
                type="radio"
                checked={mode === 'overwrite'}
                onChange={() => setMode('overwrite')}
                disabled={isPublishedDraft}
              />
              <span className={isPublishedDraft ? 'text-gray-400' : ''}>Nadpisz aktualny draft</span>
              {isPublishedDraft && <span className="text-xs text-gray-400">(nie można nadpisać opublikowanego draftu)</span>}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={mode === 'new'}
                onChange={() => setMode('new')}
              />
              <span>Zapisz jako nowy draft</span>
            </label>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'new' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Nazwa wersji</label>
                <input className="border p-2 w-full rounded" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Autor</label>
                <input className="border p-2 w-full rounded" value={author} onChange={e => setAuthor(e.target.value)} required />
              </div>
            </>
          )}
          {error && <div className="text-red-600 text-xs">{error}</div>}
          <div className="flex gap-2 justify-end mt-4">
            <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={onClose}>Anuluj</button>
            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Zapisz</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- helper: porównanie draftu z quizem opublikowanym ---
function areQuestionsEqual(q1, q2) {
  if (!Array.isArray(q1) || !Array.isArray(q2) || q1.length !== q2.length) return false;
  for (let i = 0; i < q1.length; ++i) {
    const a = q1[i], b = q2[i];
    if (a.text !== b.text || a.order !== b.order) return false;
    if (!Array.isArray(a.answers) || !Array.isArray(b.answers) || a.answers.length !== b.answers.length) return false;
    for (let j = 0; j < a.answers.length; ++j) {
      const aa = a.answers[j], ba = b.answers[j];
      if (aa.text !== ba.text || aa.order !== ba.order) return false;
      // Możesz dodać porównanie tagów jeśli istotne
    }
  }
  return true;
}

const QuizManager = forwardRef((props, ref) => {
  const [quiz, setQuiz] = useState(null);
  const [draftQuestions, setDraftQuestions] = useState([]); // [{id, text, order, answers: [{id, text, order}]}]
  const [hasChanges, setHasChanges] = useState(false);
  const [showQModal, setShowQModal] = useState(false);
  const [editQIdx, setEditQIdx] = useState(null);
  const [showAModal, setShowAModal] = useState(false);
  const [editAIdx, setEditAIdx] = useState({ qIdx: null, aIdx: null });
  const [validationError, setValidationError] = useState("");
  const scrollContainerRef = useRef(null);
  const [availableTags, setAvailableTags] = useState([]);
  const { sessionExpired, handleApiAuthError } = useAdminAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const pendingTabRef = useRef(null);
  const [isDraftSaved, setIsDraftSaved] = useState(true); // nowa flaga
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [showDraftsList, setShowDraftsList] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState(null);
  const [showDeleteDraftModal, setShowDeleteDraftModal] = useState(false);
  const [draftInUseId, setDraftInUseId] = useState(null); // id draftu aktualnie edytowanego lub opublikowanego
  const [publishedDraftId, setPublishedDraftId] = useState(null);
  const [publishedQuestions, setPublishedQuestions] = useState([]);

  useEffect(() => {
    setGlobalAuthErrorHandler(handleApiAuthError);
    return () => setGlobalAuthErrorHandler(null);
  }, [handleApiAuthError]);

  // Pobierz quiz i drafty z bazy (NIE pobieraj pytań quizu!)
  useEffect(() => {
    const fetchData = async () => {
      const quizzes = await getAllQuizzes();
      if (!quizzes.length) { setQuiz(null); setDraftQuestions([]); return; }
      setQuiz(quizzes[0]);
      // Pobierz najnowszy draft (lub opublikowany, jeśli nie ma draftów)
      const drafts = await getQuizDrafts(quizzes[0].id);
      setDrafts(drafts);
      let draftToLoad = drafts[0];
      if (quizzes[0].publishedDraftId) {
        const published = drafts.find(d => d.id === quizzes[0].publishedDraftId);
        if (published) draftToLoad = published;
      }
      if (draftToLoad) {
        setDraftQuestions(draftToLoad.data.questions);
        setDraftInUseId(draftToLoad.id);
        initialStateRef.current = JSON.stringify(draftToLoad.data.questions);
      } else {
        setDraftQuestions([]);
        initialStateRef.current = JSON.stringify([]);
      }
    };
    fetchData();
    getAllTags().then(setAvailableTags);
  }, []);

  // Pobieranie wersji roboczych quizu (na żądanie)
  useEffect(() => {
    if (quiz && showDraftsList) {
      setLoadingDrafts(true);
      getQuizDrafts(quiz.id).then(ds => {
        setDrafts(ds);
        if (ds.length > 0) setDraftInUseId(ds[0].id);
      }).finally(() => setLoadingDrafts(false));
    }
  }, [quiz, showDraftsList]);

  // Po załadowaniu quizu pobierz opublikowany draft (do porównań)
  useEffect(() => {
    if (!quiz) return;
    setPublishedDraftId(quiz.publishedDraftId);
    if (quiz.publishedDraftId) {
      getQuizDrafts(quiz.id).then(ds => {
        const published = ds.find(d => d.id === quiz.publishedDraftId);
        setPublishedQuestions(published ? published.data.questions : []);
      });
    } else {
      setPublishedQuestions([]);
    }
  }, [quiz]);

  // Zmiany?
  const initialStateRef = useRef();
  useEffect(() => {
    if (draftInUseId === publishedDraftId && publishedQuestions.length) {
      setHasChanges(!areQuestionsEqual(draftQuestions, publishedQuestions));
    } else {
      setHasChanges(JSON.stringify(draftQuestions) !== initialStateRef.current);
    }
  }, [draftQuestions, publishedQuestions, draftInUseId, publishedDraftId]);

  // Ochrona przed utratą zmian przy odświeżeniu/przeładowaniu strony
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  // Funkcja do obsługi próby zmiany zakładki (np. w AdminPanelPage)
  const handleTabChange = (nextTab) => {
    if (hasChanges) {
      setShowUnsavedModal(true);
      pendingTabRef.current = nextTab;
      return false; // blokuj zmianę tabów
    }
    return true; // pozwól na zmianę tabów
  };

  useImperativeHandle(ref, () => ({
    handleTabChange
  }));

  // Funkcja do potwierdzenia porzucenia zmian
  const confirmLeave = () => {
    setShowUnsavedModal(false);
    setHasChanges(false);
    if (pendingTabRef.current) {
      // Wywołaj zmianę tabów w AdminPanelPage (trzeba przekazać handleTabChange do propsów)
      pendingTabRef.current();
      pendingTabRef.current = null;
    }
  };

  // Funkcja do anulowania porzucenia zmian
  const cancelLeave = () => {
    setShowUnsavedModal(false);
    pendingTabRef.current = null;
  };

  // Dodaj funkcję przesuwania pytań
  const moveQuestion = (fromIdx, toIdx) => {
    setDraftQuestions(qs => {
      const arr = [...qs];
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return arr.map((q, i) => ({ ...q, order: i + 1 }));
    });
  };

  // Przesuwanie odpowiedzi w pytaniu
  const moveAnswer = (qIdx, fromAIdx, toAIdx) => {
    setDraftQuestions(qs => qs.map((q, i) => {
      if (i !== qIdx) return q;
      const answers = [...q.answers];
      const [moved] = answers.splice(fromAIdx, 1);
      answers.splice(toAIdx, 0, moved);
      return { ...q, answers: answers.map((a, idx) => ({ ...a, order: idx + 1 })) };
    }));
    setIsDraftSaved(false);
  };

  // Dodawanie/edycja pytań
  const [localIdCounter, setLocalIdCounter] = useState(1);
  const handleAddQuestion = () => {
    setEditQIdx(draftQuestions.length);
    setShowQModal(true);
  };
  const handleEditQuestion = (idx) => {
    setEditQIdx(idx);
    setShowQModal(true);
  };
  const handleSaveQuestion = (text) => {
    if (!text.trim()) return;
    setDraftQuestions(qs => {
      if (editQIdx === qs.length) {
        // Dodaj nowe z unikalnym localId
        const newLocalId = `local-${Date.now()}-${localIdCounter}`;
        setLocalIdCounter(c => c + 1);
        return [...qs, { id: undefined, localId: newLocalId, text, order: qs.length + 1, answers: [] }];
      } else {
        // Edytuj
        return qs.map((q, i) => i === editQIdx ? { ...q, text } : q);
      }
    });
    setShowQModal(false);
  };
  const handleDeleteQuestion = (idx) => {
    setDraftQuestions(qs => qs.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order: i + 1 })));
  };

  // Dodawanie/edycja odpowiedzi
  const handleAddAnswer = (qIdx) => {
    setEditAIdx({ qIdx, aIdx: draftQuestions[qIdx].answers.length });
    setShowAModal(true);
  };
  const handleEditAnswer = (qIdx, aIdx) => {
    setEditAIdx({ qIdx, aIdx });
    setShowAModal(true);
  };
  const handleSaveAnswer = (text, tags) => {
    if (!text.trim()) return;
    const validTags = (tags || []).filter(tagId => availableTags.some(t => t.id === tagId));
    setDraftQuestions(qs => qs.map((q, i) => {
      if (i !== editAIdx.qIdx) return q;
      const answers = [...q.answers];
      if (editAIdx.aIdx === answers.length) {
        answers.push({ id: undefined, text, order: answers.length + 1, tags: validTags });
      } else {
        answers[editAIdx.aIdx] = { ...answers[editAIdx.aIdx], text, tags: validTags };
      }
      return { ...q, answers };
    }));
    setIsDraftSaved(false);
    setShowAModal(false);
  };

  // Usuwanie odpowiedzi
  const handleDeleteAnswer = (qIdx, aIdx) => {
    setDraftQuestions(qs => qs.map((q, i) => {
      if (i !== qIdx) return q;
      const answers = q.answers.filter((_, idx) => idx !== aIdx).map((a, idx) => ({ ...a, order: idx + 1 }));
      return { ...q, answers };
    }));
    setIsDraftSaved(false);
  };

  // Nowa funkcja: zapisuje draft do bazy przez mikroserwis
  const handleSaveDraft = () => {
    // Walidacja: każde pytanie musi mieć co najmniej 2 odpowiedzi
    const invalidIndexes = draftQuestions
      .map((q, idx) => (!q.answers || q.answers.length < 2 ? idx + 1 : null))
      .filter(idx => idx !== null);
    if (invalidIndexes.length > 0) {
      setValidationError(`Pytanie${invalidIndexes.length > 1 ? ' ' : ' '}${invalidIndexes.join(', ')} musi mieć co najmniej 2 odpowiedzi.`);
      return;
    }
    setValidationError("");
    setShowSaveDraftModal(true);
  };

  const handleSaveDraftWithMeta = async ({ mode, name, author }) => {
    if (!quiz) return;
    setIsSaving(true);
    try {
      if (mode === 'overwrite' && loadedDraft && !isPublishedDraft) {
        // Nadpisz aktualny draft (PUT)
        await updateQuizDraft(quiz.id, loadedDraft.id, { name: loadedDraft.name, author: loadedDraft.author, questions: draftQuestions });
      } else {
        // Zapisz jako nowy draft (POST)
        await saveQuizDraft(quiz.id, { name, author, questions: draftQuestions });
      }
      // Odśwież drafty i ustaw aktualny draft jako edytowany
      const drafts = await getQuizDrafts(quiz.id);
      setDrafts(drafts);
      setDraftInUseId(drafts[0]?.id);
      initialStateRef.current = JSON.stringify(draftQuestions);
      setHasChanges(false);
      setIsDraftSaved(true);
      setShowSaveDraftModal(false);
    } catch (err) {
      alert('Błąd podczas zapisywania wersji roboczej quizu!');
    } finally {
      setIsSaving(false);
    }
  };

  // Publikacja quizu: ustaw publishedDraftId na aktualny draft
  const handlePublish = async () => {
    if (!quiz || !draftInUseId) return;
    setIsSaving(true);
    try {
      // Ustaw publishedDraftId w quizie
      await updateQuiz(quiz.id, { publishedDraftId: draftInUseId });
      // Odśwież quiz i drafty
      const refreshedQuiz = await getQuiz(quiz.id);
      setQuiz(refreshedQuiz);
      setPublishedDraftId(refreshedQuiz.publishedDraftId);
      const drafts = await getQuizDrafts(quiz.id);
      setDrafts(drafts);
      // Ustaw opublikowane pytania do porównań
      const published = drafts.find(d => d.id === refreshedQuiz.publishedDraftId);
      setPublishedQuestions(published ? published.data.questions : []);
      setHasChanges(false);
      setIsDraftSaved(true);
      setValidationError("");
    } catch (err) {
      setValidationError('Błąd podczas publikacji: ' + (err?.response?.data?.error || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  // Walidacja
  const validateQuiz = () => {
    for (let i = 0; i < draftQuestions.length; ++i) {
      const q = draftQuestions[i];
      if (!q.text || !q.text.trim()) return `Pytanie ${i + 1} nie ma treści.`;
      if (!q.answers.length) return `Pytanie ${i + 1} nie ma żadnej odpowiedzi.`;
      for (let j = 0; j < q.answers.length; ++j) {
        if (!q.answers[j].text || !q.answers[j].text.trim()) return `Odpowiedź ${j + 1} w pytaniu ${i + 1} jest pusta.`;
      }
    }
    return null;
  };

  // Obsługa usuwania draftu
  const handleAskDeleteDraft = (draft) => {
    setDraftToDelete(draft);
    setShowDeleteDraftModal(true);
  };
  const handleDeleteDraft = async () => {
    if (!draftToDelete) return;
    try {
      await deleteQuizDraft(quiz.id, draftToDelete.id); // faktyczne usunięcie w backendzie
      // Odśwież listę draftów z backendu
      const ds = await getQuizDrafts(quiz.id);
      setDrafts(ds);
    } catch (err) {
      alert('Błąd podczas usuwania wersji roboczej!');
    } finally {
      setShowDeleteDraftModal(false);
      setDraftToDelete(null);
    }
  };

  // Obsługa ładowania draftu
  const handleLoadDraft = (draft) => {
    if (hasChanges) {
      if (!window.confirm('Masz niezapisane zmiany. Czy na pewno chcesz załadować wybraną wersję?')) return;
    }
    setDraftQuestions(draft.data.questions);
    setShowDraftsList(false);
    setDraftInUseId(draft.id);
    initialStateRef.current = JSON.stringify(draft.data.questions);
    setHasChanges(false); // zawsze po załadowaniu draftu brak zmian
    setIsDraftSaved(true);
  };

  // Dodaj referencję do aktualnie załadowanego draftu
  const loadedDraft = drafts.find(d => d.id === draftInUseId) || null;
  const isPublishedDraft = draftInUseId === publishedDraftId;

  // --- ODŚWIEŻANIE DRAFTU Z BACKENDU (np. po usunięciu tagu) ---
  const refreshDraftFromBackend = async () => {
    if (!quiz || !draftInUseId) return;
    const drafts = await getQuizDrafts(quiz.id);
    setDrafts(drafts);
    const loaded = drafts.find(d => d.id === draftInUseId);
    if (loaded) {
      setDraftQuestions(loaded.data.questions);
      initialStateRef.current = JSON.stringify(loaded.data.questions);
    }
  };

  // 1. Automatyczne czyszczenie tagów w draftQuestions po zmianie availableTags
  useEffect(() => {
    setDraftQuestions(qs =>
      qs.map(q => ({
        ...q,
        tags: Array.isArray(q.tags) ? q.tags.filter(tagId => availableTags.some(t => t.id === tagId)) : [],
        answers: (q.answers || []).map(a => ({
          ...a,
          tags: Array.isArray(a.tags) ? a.tags.filter(tagId => availableTags.some(t => t.id === tagId)) : []
        }))
      }))
    );
  }, [availableTags]);

  return (
    <div className="p-4">
      {sessionExpired && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Sesja administratora wygasła z powodu braku aktywności. Zaloguj się ponownie.
        </div>
      )}
      <div className="p-4 pb-32">
        <h2 className="text-2xl font-bold mb-4">Zarządzanie quizem</h2>
        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">Strona powitalna (nieedytowalna)</h3>
          <Welcome onStart={() => {}} />
        </div>
        {!quiz ? (
          <div className="mb-6 border rounded-lg p-4 bg-white text-center text-red-600 font-semibold">
            Quiz nie został jeszcze utworzony. Skontaktuj się z administratorem lub utwórz quiz w backendzie.
          </div>
        ) : draftQuestions.length === 0 ? (
          <div className="mb-6 border rounded-lg p-4 bg-white text-center">
            <p className="mb-4 text-gray-500">Brak pytań w quizie. Dodaj pierwsze pytanie!</p>
            <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleAddQuestion}>Dodaj pierwsze pytanie</button>
          </div>
        ) : (
          <div className="relative">
            <div ref={scrollContainerRef} style={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }}>
              {draftQuestions.map((q, idx) => (
                <div
                  key={q.id || q.localId}
                  className="mb-6 border rounded-lg p-4 bg-white transition-shadow select-none hover:bg-blue-50"
                  style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', userSelect: 'none' }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Pytanie {idx + 1}:</h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="text-red-600 hover:text-red-800 p-1 ml-1 text-2xl font-bold flex items-center justify-center"
                        onClick={() => handleDeleteQuestion(idx)}
                        title="Usuń pytanie"
                        style={{ lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center mr-2">
                      <button
                        className="text-blue-500 hover:text-blue-700 p-1"
                        onClick={() => handleEditQuestion(idx)}
                        title="Edytuj pytanie"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="font-bold">{q.text}</div>
                  </div>
                  <ul className="list-none ml-0">
                    {q.answers.map((ans, aIdx) => (
                      <li key={ans.id || `draft-a-${aIdx}`} className="mb-1 flex items-center">
                        <div className="flex items-center mr-2">
                          <button className="text-blue-500 hover:text-blue-700 p-1" onClick={() => handleEditAnswer(idx, aIdx)} title="Edytuj odpowiedź">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-800 p-0 ml-0.5 text-xl font-bold flex items-center justify-center" onClick={() => handleDeleteAnswer(idx, aIdx)} title="Usuń odpowiedź" style={{ lineHeight: 1 }}>
                            ×
                          </button>
                          {/* Strzałki przesuwania odpowiedzi */}
                          <div className="flex flex-col ml-1">
                            {aIdx > 0 && (
                              <button
                                className="p-0.5 rounded bg-gray-200 hover:bg-blue-200 text-gray-700 flex items-center justify-center"
                                title="Przesuń odpowiedź wyżej"
                                onClick={() => moveAnswer(idx, aIdx, aIdx - 1)}
                                style={{ fontSize: 14 }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                              </button>
                            )}
                            {aIdx < q.answers.length - 1 && (
                              <button
                                className="p-0.5 rounded bg-gray-200 hover:bg-blue-200 text-gray-700 flex items-center justify-center mt-0.5"
                                title="Przesuń odpowiedź niżej"
                                onClick={() => moveAnswer(idx, aIdx, aIdx + 1)}
                                style={{ fontSize: 14 }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                              </button>
                            )}
                          </div>
                        </div>
                        <span className="before:content-['•'] before:mr-2 before:text-gray-400"></span>
                        <span>{ans.text}</span>
                        {ans.tags && ans.tags.length > 0 && (
                          <span className="flex flex-wrap gap-1 ml-2">
                            {ans.tags.map(tagId => {
                              const tag = availableTags.find(t => t.id === tagId);
                              return tag ? (
                                <span key={tag.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">{tag.name}</span>
                              ) : null;
                            })}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <button className="mt-2 px-3 py-1 bg-green-600 text-white rounded" onClick={() => handleAddAnswer(idx)}>Dodaj odpowiedź</button>
                  {/* Strzałki przesuwania */}
                  <div className="flex gap-2 justify-end mt-4">
                    {idx > 0 && (
                      <button
                        className="p-1 rounded bg-gray-200 hover:bg-blue-200 text-gray-700 flex items-center justify-center"
                        title="Przesuń wyżej"
                        onClick={() => moveQuestion(idx, idx - 1)}
                        style={{ fontSize: 18 }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                      </button>
                    )}
                    {idx < draftQuestions.length - 1 && (
                      <button
                        className="p-1 rounded bg-gray-200 hover:bg-blue-200 text-gray-700 flex items-center justify-center"
                        title="Przesuń niżej"
                        onClick={() => moveQuestion(idx, idx + 1)}
                        style={{ fontSize: 18 }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Walidacja */}
        {validationError && (
          <div className="mt-4 mb-2 text-red-600 font-semibold text-center">{validationError}</div>
        )}
        {/* Przyciski na dole */}
        {quiz && draftQuestions.length > 0 && (
          <div className="flex justify-center gap-4 mt-8 mb-2">
            <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleAddQuestion}>Dodaj nowe pytanie</button>
            <button
              className={`px-4 py-2 rounded text-white ${!hasChanges ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600'}`}
              onClick={handleSaveDraft}
              disabled={!hasChanges || isSaving}
            >
              Zapisz zmiany
            </button>
            <button
              className="px-4 py-2 rounded text-white bg-gray-500"
              onClick={() => setShowDraftsList(prev => !prev)}
              disabled={isSaving}
            >
              Poprzednie wersje
            </button>
            <button
              className={`px-4 py-2 rounded text-white ${(draftInUseId === publishedDraftId || !isDraftSaved || hasChanges || isSaving) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600'}`}
              onClick={handlePublish}
              disabled={draftInUseId === publishedDraftId || !isDraftSaved || hasChanges || isSaving}
            >
              Opublikuj
            </button>
          </div>
        )}
        {/* Modale */}
        <EditQuestionModal
          open={showQModal}
          onClose={() => setShowQModal(false)}
          onSave={handleSaveQuestion}
          initialText={editQIdx !== null && draftQuestions[editQIdx] ? draftQuestions[editQIdx].text : ""}
        />
        <EditAnswerModal
          open={showAModal}
          onClose={() => setShowAModal(false)}
          onSave={handleSaveAnswer}
          initialText={editAIdx.qIdx !== null && draftQuestions[editAIdx.qIdx]?.answers[editAIdx.aIdx]?.text ? draftQuestions[editAIdx.qIdx].answers[editAIdx.aIdx].text : ""}
          initialTags={
            editAIdx.qIdx !== null && draftQuestions[editAIdx.qIdx]?.answers[editAIdx.aIdx]?.tags
              ? draftQuestions[editAIdx.qIdx].answers[editAIdx.aIdx].tags.filter(tagId =>
                  availableTags.some(tag => tag.id === tagId)
                )
              : []
          }
          availableTags={availableTags}
        />
        <SaveDraftModal 
          open={showSaveDraftModal} 
          onClose={() => setShowSaveDraftModal(false)} 
          onSave={handleSaveDraftWithMeta} 
          loadedDraft={loadedDraft}
          isPublishedDraft={isPublishedDraft}
          allDrafts={drafts}
        />
      </div>
      {/* Info o aktualnie załadowanym drafcie */}
      {loadedDraft && (
        <div className="mb-1 text-xs text-gray-500">
          Wersja: <span className="font-semibold">{loadedDraft.name}</span> • {loadedDraft.author} • {new Date(loadedDraft.createdAt).toLocaleString()}
          {isPublishedDraft && <span className="ml-2 text-green-600">[opublikowany]</span>}
        </div>
      )}
      {/* Status zmian */}
      {hasChanges ? (
        <div className="mb-2 text-orange-600 font-semibold">Masz niezapisane zmiany!</div>
      ) : (
        <div className="mb-2 text-green-700">Wszystkie zmiany zapisane</div>
      )}
      {/* Loader na czas zapisu */}
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <div className="text-blue-700 font-semibold">Zapisywanie zmian...</div>
          </div>
        </div>
      )}
      {/* Modal ostrzegający o niezapisanych zmianach */}
      {showUnsavedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="font-bold mb-2">Masz niezapisane zmiany</h3>
            <p className="mb-4">Czy na pewno chcesz opuścić edycję quizu? Wszystkie niezapisane zmiany zostaną utracone.</p>
            <div className="flex gap-3 justify-end">
              <button className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50" onClick={cancelLeave}>Anuluj</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={confirmLeave}>Opuść bez zapisywania</button>
            </div>
          </div>
        </div>
      )}
      {/* Lista wersji roboczych */}
      {showDraftsList && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
            <h3 className="font-bold mb-4">Poprzednie wersje quizu</h3>
            {loadingDrafts ? (
              <div className="text-center">Ładowanie...</div>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                {drafts.map(draft => (
                  <li key={draft.id} className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-semibold">{draft.name}
                        {publishedDraftId === draft.id && <span className="text-xs text-green-600 ml-2">[opublikowany]</span>}
                      </div>
                      <div className="text-xs text-gray-500">{draft.author} • {new Date(draft.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:underline text-xs" onClick={() => handleLoadDraft(draft)}>
                        Załaduj
                      </button>
                      {publishedDraftId !== draft.id && (
                        <button
                          className="text-red-500 hover:text-red-700 text-xs"
                          onClick={() => handleAskDeleteDraft(draft)}
                        >
                          X
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end mt-4">
              <button className="px-4 py-2 border rounded" onClick={() => setShowDraftsList(false)}>Zamknij</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal potwierdzający usunięcie draftu */}
      {showDeleteDraftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="font-bold mb-2">Usuń wersję roboczą</h3>
            <p className="mb-4">Czy na pewno chcesz usunąć wersję "{draftToDelete?.name}"?</p>
            <div className="flex gap-3 justify-end">
              <button className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50" onClick={() => setShowDeleteDraftModal(false)}>Anuluj</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={handleDeleteDraft}>Usuń</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default QuizManager;
