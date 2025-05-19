import React, { useEffect, useState, useRef } from "react";
import Welcome from "../quiz/Welcome";
import { getAllQuizzes } from "../../services/quizService";
import { getQuestionsForQuiz, createQuestion, updateQuestion, deleteQuestion } from "../../services/questionService";
import { createAnswer, updateAnswer, deleteAnswer } from "../../services/answerService";
import { getAllTags, createTag, setGlobalAuthErrorHandler } from "../../services/tagService";
import { useAdminAuth } from './AdminAuthProvider';

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

const QuizManager = () => {
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

  useEffect(() => {
    setGlobalAuthErrorHandler(handleApiAuthError);
    return () => setGlobalAuthErrorHandler(null);
  }, [handleApiAuthError]);

  // Pobierz quiz i pytania z bazy
  useEffect(() => {
    const fetchData = async () => {
      const quizzes = await getAllQuizzes();
      if (!quizzes.length) { setQuiz(null); setDraftQuestions([]); return; }
      setQuiz(quizzes[0]);
      const questions = await getQuestionsForQuiz(quizzes[0].id);
      setDraftQuestions(
        questions.sort((a, b) => a.order - b.order).map(q => ({
          ...q,
          answers: (q.Answers || []).sort((a, b) => a.order - b.order)
        }))
      );
    };
    fetchData();
    getAllTags().then(setAvailableTags);
  }, []);

  // Zmiany?
  const initialStateRef = useRef();
  useEffect(() => {
    if (!initialStateRef.current) initialStateRef.current = JSON.stringify(draftQuestions);
    setHasChanges(JSON.stringify(draftQuestions) !== initialStateRef.current);
  }, [draftQuestions]);

  // Dodaj funkcję przesuwania pytań
  const moveQuestion = (fromIdx, toIdx) => {
    setDraftQuestions(qs => {
      const arr = [...qs];
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return arr.map((q, i) => ({ ...q, order: i + 1 }));
    });
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
    setDraftQuestions(qs => qs.map((q, i) => {
      if (i !== editAIdx.qIdx) return q;
      const answers = [...q.answers];
      if (editAIdx.aIdx === answers.length) {
        answers.push({ id: undefined, text, order: answers.length + 1, tags: tags || [] });
      } else {
        answers[editAIdx.aIdx] = { ...answers[editAIdx.aIdx], text, tags: tags || [] };
      }
      return { ...q, answers };
    }));
    setShowAModal(false);
  };
  const handleDeleteAnswer = (qIdx, aIdx) => {
    setDraftQuestions(qs => qs.map((q, i) => {
      if (i !== qIdx) return q;
      const answers = q.answers.filter((_, j) => j !== aIdx).map((a, j) => ({ ...a, order: j + 1 }));
      return { ...q, answers };
    }));
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

  // Zapisz zmiany
  const handleSaveAll = async () => {
    const err = validateQuiz();
    if (err) { setValidationError(err); return; }
    // Najpierw usuń pytania, które zniknęły
    const quizzes = await getAllQuizzes();
    const quizId = quizzes[0]?.id;
    const oldQuestions = await getQuestionsForQuiz(quizId);
    for (const oldQ of oldQuestions) {
      if (!draftQuestions.find(q => q.id === oldQ.id)) await deleteQuestion(oldQ.id);
    }
    // Dodaj/aktualizuj pytania i odpowiedzi
    for (const [qIdx, q] of draftQuestions.entries()) {
      let qId = q.id;
      if (!qId) {
        const created = await createQuestion({ quizId, text: q.text, order: q.order });
        qId = created.id;
        draftQuestions[qIdx].id = qId;
      } else {
        await updateQuestion(qId, { text: q.text, order: q.order });
      }
      // Odpowiedzi
      const oldAnswers = (oldQuestions.find(oq => oq.id === qId)?.Answers || []);
      for (const oldA of oldAnswers) {
        if (!q.answers.find(a => a.id === oldA.id)) await deleteAnswer(oldA.id);
      }
      for (const [aIdx, a] of q.answers.entries()) {
        if (!a.id) {
          const createdA = await createAnswer({ questionId: qId, text: a.text, order: a.order });
          draftQuestions[qIdx].answers[aIdx].id = createdA.id;
        } else {
          await updateAnswer(a.id, { text: a.text, order: a.order });
        }
      }
    }
    // Odśwież dane
    const refreshedQuestions = await getQuestionsForQuiz(quizId);
    setDraftQuestions(
      refreshedQuestions.sort((a, b) => a.order - b.order).map(q => ({
        ...q,
        answers: (q.Answers || []).sort((a, b) => a.order - b.order)
      }))
    );
    initialStateRef.current = JSON.stringify(draftQuestions);
    setHasChanges(false);
    setValidationError("");
  };

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
                      <button className="text-blue-600 hover:underline" onClick={() => handleEditQuestion(idx)}>Edytuj</button>
                      <button className="text-red-600 hover:underline" onClick={() => handleDeleteQuestion(idx)}>Usuń</button>
                    </div>
                  </div>
                  <div className="mb-2">{q.text}</div>
                  <ul className="list-disc ml-6">
                    {q.answers.map((ans, aIdx) => (
                      <li key={ans.id || `draft-a-${aIdx}`} className="mb-1 flex items-center gap-2">
                        <span>{ans.text}</span>
                        <button className="text-blue-600 hover:underline text-xs" onClick={() => handleEditAnswer(idx, aIdx)}>Edytuj</button>
                        <button className="text-red-600 hover:underline text-xs" onClick={() => handleDeleteAnswer(idx, aIdx)}>Usuń</button>
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
              className={`px-4 py-2 rounded text-white ${hasChanges ? 'bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
              onClick={handleSaveAll}
              disabled={!hasChanges}
            >
              Zapisz zmiany
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
          initialTags={editAIdx.qIdx !== null && draftQuestions[editAIdx.qIdx]?.answers[editAIdx.aIdx]?.tags ? draftQuestions[editAIdx.qIdx].answers[editAIdx.aIdx].tags : []}
          availableTags={availableTags}
        />
      </div>
    </div>
  );
};

export default QuizManager;
