import { useState, useEffect } from 'preact/hooks';
import { selectedLessonNode, isLessonOpen, userProfile, lessonQuestions } from '../state';
import { Question } from '../types';
import { fetchQuestions, submitLessonResults } from '../api';
import { VirtualKeyboard } from './VirtualKeyboard';

export function LessonModal() {
    const node = selectedLessonNode.value;
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [typedAnswer, setTypedAnswer] = useState('');
    const [sentenceTokens, setSentenceTokens] = useState<string[]>([]);
    const [isVerified, setIsVerified] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (!node) return;
        fetchQuestions(node.id).then((qs) => {
            setQuestions(qs);
            lessonQuestions.value = qs;
        });
    }, [node]);

    if (!node || questions.length === 0) return null;

    const currentQ = questions[currentIndex];

    const playAudio = (text: string) => {
        if (!('speechSynthesis' in window)) return;
        const ut = new SpeechSynthesisUtterance(text);
        ut.rate = 0.95;
        window.speechSynthesis.speak(ut);
    };

    const handleVerify = () => {
        let answerUser = '';
        if (currentQ.type === 'word_match' || currentQ.type === 'listening') {
            answerUser = selectedOption || '';
        } else if (currentQ.type === 'sentence_builder') {
            answerUser = sentenceTokens.join(' ').trim();
        } else if (currentQ.type === 'keyboard_input') {
            answerUser = typedAnswer.trim();
        }

        const normUser = answerUser.toLowerCase().replace(/[.,!?-]/g, '').trim();
        const normTarget = currentQ.correct_answer.toLowerCase().replace(/[.,!?-]/g, '').trim();
        const correct = normUser === normTarget;

        setIsCorrect(correct);
        setIsVerified(true);
        if (correct) setCorrectCount(prev => prev + 1);

        try {
            if (window.Telegram?.WebApp?.HapticFeedback) {
                if (correct) window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                else window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
            }
        } catch (_) { /* ignored */ }
    };

    const handleNext = () => {
        setIsVerified(false);
        setSelectedOption(null);
        setTypedAnswer('');
        setSentenceTokens([]);

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(prev => prev + 1);
            return;
        }

        setIsFinished(true);
        const profile = userProfile.value;
        const uid = profile?.id || 1;
        submitLessonResults(uid, node.id, correctCount + (isCorrect ? 1 : 0), questions.length).then((res) => {
            if (profile) {
                profile.honey_drops += res.honey_reward;
                profile.explorer_xp += res.xp_reward;
                profile.words_learned += 3;
                userProfile.value = { ...profile };
            }
        });
    };

    const handleClose = () => {
        isLessonOpen.value = false;
        selectedLessonNode.value = null;
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-sheet" style={{ maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ flex: 1, height: '12px', background: '#E2E8F0', borderRadius: '6px', overflow: 'hidden', marginRight: '16px' }}>
                        <div style={{
                            height: '100%',
                            width: `${((currentIndex + 1) / questions.length) * 100}%`,
                            background: '#16A34A',
                            transition: 'width 0.25s ease'
                        }} />
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748B' }}
                    >
                        ✕
                    </button>
                </div>

                {!isFinished ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#025E73', textTransform: 'uppercase' }}>
                            {currentQ.type === 'word_match' && 'Выберите правильный перевод'}
                            {currentQ.type === 'sentence_builder' && 'Соберите фразу на башкирском'}
                            {currentQ.type === 'keyboard_input' && 'Напишите перевод на башкирском'}
                            {currentQ.type === 'listening' && 'Прослушайте и выберите ответ'}
                        </div>

                        <div style={{
                            margin: '18px 0',
                            padding: '16px',
                            background: '#F8FAFC',
                            borderRadius: '16px',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <div style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A' }}>{currentQ.prompt_ba}</div>
                                <div style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>{currentQ.prompt_ru}</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => playAudio(currentQ.audio_text || currentQ.prompt_ba)}
                                style={{
                                    background: '#025E73',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '42px',
                                    height: '42px',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 3px 0 #014352'
                                }}
                            >
                                🔊
                            </button>
                        </div>

                        {(currentQ.type === 'word_match' || currentQ.type === 'listening') && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginTop: '10px' }}>
                                {(currentQ.options || []).map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setSelectedOption(opt)}
                                        className={`duo-chip ${selectedOption === opt ? 'duo-chip-selected' : ''}`}
                                        style={{ textAlign: 'left', padding: '14px 18px' }}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}

                        {currentQ.type === 'sentence_builder' && (
                            <div>
                                <div style={{
                                    minHeight: '60px',
                                    borderBottom: '2px dashed #CBD5E1',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                    padding: '10px 0',
                                    marginBottom: '16px'
                                }}>
                                    {sentenceTokens.map((token, tIdx) => (
                                        <button
                                            key={tIdx}
                                            type="button"
                                            onClick={() => setSentenceTokens(prev => prev.filter((_, i) => i !== tIdx))}
                                            className="duo-chip duo-chip-selected"
                                        >
                                            {token}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {(currentQ.word_bank || []).map((word, wIdx) => {
                                        const isUsed = sentenceTokens.includes(word);
                                        return (
                                            <button
                                                key={wIdx}
                                                type="button"
                                                disabled={isUsed}
                                                onClick={() => setSentenceTokens(prev => [...prev, word])}
                                                className="duo-chip"
                                                style={{ opacity: isUsed ? 0.35 : 1 }}
                                            >
                                                {word}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {currentQ.type === 'keyboard_input' && (
                            <div>
                                <input
                                    type="text"
                                    value={typedAnswer}
                                    onInput={(e) => setTypedAnswer((e.target as HTMLInputElement).value)}
                                    placeholder="Введите ответ на башкирском..."
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        fontSize: '17px',
                                        fontWeight: 700,
                                        borderRadius: '12px',
                                        border: '2px solid #CBD5E1',
                                        outline: 'none',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                                    }}
                                />
                                <VirtualKeyboard
                                    onInsertChar={(ch) => setTypedAnswer(prev => prev + ch)}
                                    onBackspace={() => setTypedAnswer(prev => prev.slice(0, -1))}
                                />
                            </div>
                        )}

                        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                            {!isVerified ? (
                                <button
                                    type="button"
                                    onClick={handleVerify}
                                    className="btn-3d btn-green"
                                    style={{ width: '100%', padding: '14px', fontSize: '16px' }}
                                >
                                    Проверить
                                </button>
                            ) : (
                                <div style={{
                                    background: isCorrect ? '#DCFCE7' : '#FEE2E2',
                                    borderRadius: '16px',
                                    padding: '14px 16px',
                                    border: `2px solid ${isCorrect ? '#86EFAC' : '#FCA5A5'}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '20px' }}>{isCorrect ? '🎉' : '❌'}</span>
                                        <span style={{ fontSize: '16px', fontWeight: 900, color: isCorrect ? '#14532D' : '#991B1B' }}>
                                            {isCorrect ? 'Бик яҡшы! (Отлично!)' : 'Дөрөҫ түгел (Неверно)'}
                                        </span>
                                    </div>
                                    {!isCorrect && (
                                        <div style={{ fontSize: '13px', color: '#7F1D1D', marginBottom: '10px' }}>
                                            Правильный ответ: <b>{currentQ.correct_answer}</b>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className={`btn-3d ${isCorrect ? 'btn-green' : 'btn-slate'}`}
                                        style={{ width: '100%', marginTop: '8px' }}
                                    >
                                        Продолжить
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
                        <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A' }}>Урок пройден!</div>
                        <div style={{ fontSize: '15px', color: '#64748B', marginTop: '4px' }}>{node.title}</div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px',
                            margin: '24px 0'
                        }}>
                            <div style={{ background: '#FEF3C7', padding: '14px', borderRadius: '16px', border: '1px solid #FCD34D' }}>
                                <div style={{ fontSize: '20px' }}>💧</div>
                                <div style={{ fontSize: '20px', fontWeight: 900, color: '#B45309' }}>+{correctCount * 4}</div>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400E' }}>Капель мёда</div>
                            </div>
                            <div style={{ background: '#E0F2FE', padding: '14px', borderRadius: '16px', border: '1px solid #BAE6FD' }}>
                                <div style={{ fontSize: '20px' }}>🧭</div>
                                <div style={{ fontSize: '20px', fontWeight: 900, color: '#025E73' }}>+{correctCount * 10}</div>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0369A1' }}>Опыт исследователя</div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn-3d btn-blue"
                            style={{ width: '100%', padding: '14px', fontSize: '16px' }}
                        >
                            Вернуться на экотропу
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
