import { useState } from 'preact/hooks';

interface VirtualKeyboardProps {
    onInsertChar: (char: string) => void;
    onBackspace: () => void;
}

const BASHKIR_LETTERS_LOWER = ['ә', 'ө', 'ү', 'ҡ', 'ғ', 'ҙ', 'ҫ', 'һ', 'ң'];
const BASHKIR_LETTERS_UPPER = ['Ә', 'Ө', 'Ү', 'Ҡ', 'Ғ', 'Ҙ', 'Ҫ', 'Һ', 'Ң'];

const FULL_LAYOUTS: Record<string, string[][]> = {
    'БАШ': [
        ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х'],
        ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
        ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю']
    ],
    'РУС': [
        ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
        ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
        ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю']
    ],
    'ENG': [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ],
    'ҚАЗ': [
        ['ә', 'і', 'ң', 'ғ', 'ү', 'ұ', 'қ', 'ө', 'һ'],
        ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'з'],
        ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д'],
        ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю']
    ]
};

export function VirtualKeyboard({ onInsertChar, onBackspace }: VirtualKeyboardProps) {
    const [isShift, setIsShift] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState<'БАШ' | 'РУС' | 'ENG' | 'ҚАЗ'>('БАШ');

    const quickLetters = isShift ? BASHKIR_LETTERS_UPPER : BASHKIR_LETTERS_LOWER;
    const fullRows = FULL_LAYOUTS[currentLang] || FULL_LAYOUTS['БАШ'];

    return (
        <div style={{ width: '100%', marginTop: '10px' }}>
            <div style={{
                display: 'flex',
                gap: '4px',
                background: '#E0F2FE',
                padding: '6px',
                borderRadius: '12px',
                alignItems: 'center',
                overflowX: 'auto',
                border: '1px solid #BAE6FD'
            }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#025E73', padding: '0 4px' }}>БАШ:</span>
                {quickLetters.map((char) => (
                    <button
                        key={char}
                        type="button"
                        onClick={() => onInsertChar(char)}
                        style={{
                            flex: 1,
                            minWidth: '28px',
                            height: '34px',
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            fontWeight: 800,
                            fontSize: '15px',
                            color: '#025E73',
                            cursor: 'pointer',
                            boxShadow: '0 2px 0 #CBD5E1'
                        }}
                    >
                        {char}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => setIsShift(!isShift)}
                    style={{
                        padding: '0 8px',
                        height: '34px',
                        background: isShift ? '#025E73' : '#FFFFFF',
                        color: isShift ? '#FFFFFF' : '#025E73',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 0 #CBD5E1'
                    }}
                >
                    ⇧
                </button>
                <button
                    type="button"
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    style={{
                        padding: '0 8px',
                        height: '34px',
                        background: isDrawerOpen ? '#B45309' : '#FEF3C7',
                        color: isDrawerOpen ? '#FFFFFF' : '#B45309',
                        border: '1px solid #FCD34D',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '12px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 0 #F59E0B'
                    }}
                >
                    ⌨️
                </button>
            </div>

            {isDrawerOpen && (
                <div style={{
                    marginTop: '8px',
                    background: '#F1F5F9',
                    padding: '8px',
                    borderRadius: '14px',
                    border: '1px solid #CBD5E1'
                }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', justifyContent: 'center' }}>
                        {(['БАШ', 'РУС', 'ENG', 'ҚАЗ'] as const).map((lang) => (
                            <button
                                key={lang}
                                type="button"
                                onClick={() => setCurrentLang(lang)}
                                style={{
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    fontSize: '12px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    background: currentLang === lang ? '#025E73' : '#E2E8F0',
                                    color: currentLang === lang ? '#FFFFFF' : '#475569'
                                }}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {fullRows.map((row, rIdx) => (
                            <div key={rIdx} style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
                                {row.map((k) => {
                                    const displayChar = isShift ? k.toUpperCase() : k;
                                    return (
                                        <button
                                            key={k}
                                            type="button"
                                            onClick={() => onInsertChar(displayChar)}
                                            style={{
                                                flex: 1,
                                                maxWidth: '36px',
                                                height: '36px',
                                                background: '#FFFFFF',
                                                border: '1px solid #CBD5E1',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                fontWeight: 700,
                                                color: '#1E293B',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 0 #CBD5E1'
                                            }}
                                        >
                                            {displayChar}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
                            <button
                                type="button"
                                onClick={() => onInsertChar(' ')}
                                style={{
                                    flex: 3,
                                    height: '36px',
                                    background: '#FFFFFF',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: '#64748B',
                                    cursor: 'pointer'
                                }}
                            >
                                Пробел
                            </button>
                            <button
                                type="button"
                                onClick={onBackspace}
                                style={{
                                    flex: 1,
                                    height: '36px',
                                    background: '#FEE2E2',
                                    border: '1px solid #FCA5A5',
                                    borderRadius: '6px',
                                    fontSize: '15px',
                                    fontWeight: 800,
                                    color: '#DC2626',
                                    cursor: 'pointer'
                                }}
                            >
                                ⌫
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
