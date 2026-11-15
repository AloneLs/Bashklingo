import { useState } from 'preact/hooks';
import { isAiOpen } from '../state';
import { askAi } from '../api';

export function AiTutorModal() {
    const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
        { sender: 'ai', text: 'Һаумыһығыҙ! Мин — «Тел-Остаһы» (мастер языка). Чем помочь по грамматике, сингармонизму или переводу башкирских слов?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isAiOpen.value) return null;

    const handleSend = async (textToSend?: string) => {
        const query = (textToSend || input).trim();
        if (!query || isLoading) return;

        setInput('');
        setMessages(prev => [...prev, { sender: 'user', text: query }]);
        setIsLoading(true);

        const answer = await askAi(query);
        setMessages(prev => [...prev, { sender: 'ai', text: answer }]);
        setIsLoading(false);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-sheet" style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#025E73', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            🦉
                        </div>
                        <div>
                            <div style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A' }}>«Тел-Остаһы»</div>
                            <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>AI-тьютор (DeepSeek V4.1)</div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => isAiOpen.value = false}
                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748B' }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px' }}>
                    {[
                        'Закон сингармонизма',
                        'Аффиксы -лар/-ләр',
                        '9 уникальных букв'
                    ].map((topic) => (
                        <button
                            key={topic}
                            type="button"
                            onClick={() => handleSend(topic)}
                            style={{
                                whiteSpace: 'nowrap',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                border: '1px solid #CBD5E1',
                                background: '#F8FAFC',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#025E73',
                                cursor: 'pointer'
                            }}
                        >
                            {topic}
                        </button>
                    ))}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
                    {messages.map((m, idx) => (
                        <div
                            key={idx}
                            style={{
                                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '82%',
                                background: m.sender === 'user' ? '#025E73' : '#F1F5F9',
                                color: m.sender === 'user' ? '#FFFFFF' : '#1E293B',
                                padding: '10px 14px',
                                borderRadius: '14px',
                                fontSize: '14px',
                                lineHeight: 1.35
                            }}
                        >
                            {m.text}
                        </div>
                    ))}
                    {isLoading && (
                        <div style={{ alignSelf: 'flex-start', background: '#F1F5F9', padding: '8px 12px', borderRadius: '12px', fontSize: '12px', color: '#64748B' }}>
                            «Тел-Остаһы» думает...
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <input
                        type="text"
                        value={input}
                        onInput={(e) => setInput((e.target as HTMLInputElement).value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                        placeholder="Задайте вопрос по башкирскому..."
                        style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: '12px',
                            border: '1.5px solid #CBD5E1',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => handleSend()}
                        className="btn-3d btn-blue"
                        style={{ padding: '10px 16px' }}
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
}
