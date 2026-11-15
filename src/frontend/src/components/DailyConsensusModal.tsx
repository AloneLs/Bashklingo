import { useState, useEffect } from 'preact/hooks';
import { isDailyOpen, userProfile, dailyFragment } from '../state';
import { fetchDailyFragment, voteTranslation } from '../api';
import { TranslationFragment } from '../types';

export function DailyConsensusModal() {
    const [fragment, setFragment] = useState<TranslationFragment | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [correctedText, setCorrectedText] = useState('');
    const [votedStatus, setVotedStatus] = useState<string | null>(null);

    useEffect(() => {
        fetchDailyFragment().then((f) => {
            setFragment(f);
            dailyFragment.value = f;
        });
    }, []);

    if (!isDailyOpen.value) return null;

    const handleConfirm = async () => {
        if (!fragment) return;
        const profile = userProfile.value;
        const uid = profile?.id || 1;
        await voteTranslation(uid, fragment.id, 'confirm');
        setVotedStatus('confirmed');
        if (profile) {
            profile.honey_drops += 10;
            profile.guide_xp += 15;
            userProfile.value = { ...profile };
        }
    };

    const handleSuggestEdit = async () => {
        if (!fragment || !correctedText.trim()) return;
        const profile = userProfile.value;
        const uid = profile?.id || 1;
        await voteTranslation(uid, fragment.id, 'suggest_edit', correctedText.trim());
        setVotedStatus('edited');
        if (profile) {
            profile.honey_drops += 20;
            profile.guide_xp += 35;
            userProfile.value = { ...profile };
        }
    };

    const playAudio = (text: string) => {
        if (!('speechSynthesis' in window)) return;
        const ut = new SpeechSynthesisUtterance(text);
        ut.rate = 0.95;
        window.speechSynthesis.speak(ut);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-sheet">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase' }}>
                        ТЗ №3: Консенсус переводов
                    </div>
                    <button
                        type="button"
                        onClick={() => isDailyOpen.value = false}
                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748B' }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
                    Ежедневный фрагмент корпуса
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '18px' }}>
                    Проверьте точность машинного перевода для передачи в Институт языка и литературы УФИЦ РАН.
                </div>

                {fragment && !votedStatus ? (
                    <div>
                        <div style={{
                            background: '#F8FAFC',
                            borderRadius: '16px',
                            padding: '16px',
                            border: '1.5px solid #E2E8F0',
                            marginBottom: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#025E73', background: '#E0F2FE', padding: '2px 8px', borderRadius: '8px' }}>
                                    {fragment.lang_pair.toUpperCase()} · {fragment.source_title}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => playAudio(fragment.text_ba)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                                >
                                    🔊
                                </button>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                                «{fragment.text_ba}»
                            </div>
                            <div style={{ fontSize: '14px', color: '#475569', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
                                <b>Автоперевод:</b> «{fragment.translation}»
                            </div>
                            <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '6px' }}>
                                👥 Подтвердили {fragment.confirmed_count} носителей языка
                            </div>
                        </div>

                        {!isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    className="btn-3d btn-green"
                                    style={{ width: '100%', padding: '12px' }}
                                >
                                    ✅ Перевод точен (+15 XP, +10 💧)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="btn-3d btn-honey"
                                    style={{ width: '100%', padding: '12px' }}
                                >
                                    ✏️ Исправить ошибку (+35 XP, +20 💧)
                                </button>
                            </div>
                        ) : (
                            <div>
                                <textarea
                                    value={correctedText}
                                    onInput={(e) => setCorrectedText((e.target as HTMLTextAreaElement).value)}
                                    placeholder="Введите правильный перевод на русский..."
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: '2px solid #CBD5E1',
                                        fontSize: '14px',
                                        marginBottom: '10px'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="btn-3d btn-slate"
                                        style={{ flex: 1 }}
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSuggestEdit}
                                        className="btn-3d btn-green"
                                        style={{ flex: 2 }}
                                    >
                                        Отправить в УФИЦ РАН
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎉</div>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>
                            {votedStatus === 'confirmed' ? 'Перевод подтверждён!' : 'Исправление отправлено!'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748B', margin: '8px 0 20px' }}>
                            {votedStatus === 'confirmed'
                                ? 'Ваш голос учтён в общем консенсусе. Начислено +10 капель мёда и +15 опыта проводника!'
                                : 'Фрагмент отправлен на экспертную валидацию. Начислено +20 капель мёда и +35 опыта проводника!'}
                        </div>
                        <button
                            type="button"
                            onClick={() => isDailyOpen.value = false}
                            className="btn-3d btn-blue"
                            style={{ width: '100%', padding: '12px' }}
                        >
                            Закрыть
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
