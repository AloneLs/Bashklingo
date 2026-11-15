import { activeTab, userProfile, isDailyOpen, isAiOpen, isShopOpen, isSoundEnabled } from '../state';

export function TopNavbar() {
    const profile = userProfile.value;
    const streak = profile?.streak_days || 1;
    const honey = profile?.honey_drops || 92;
    const hearts = profile?.hearts || 5;

    return (
        <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            background: 'linear-gradient(180deg, #025E73 0%, #014352 100%)',
            color: '#FFFFFF',
            padding: '10px 16px',
            boxShadow: '0 4px 12px rgba(2, 94, 115, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#B45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '16px',
                    boxShadow: '0 0 10px rgba(245, 158, 11, 0.4)'
                }}>
                    🌾
                </div>
                <div>
                    <div style={{ fontWeight: 900, fontSize: '16px', letterSpacing: '0.3px', lineHeight: 1.1 }}>Basklingo</div>
                    <div style={{ fontSize: '11px', color: '#BAE6FD', fontWeight: 600 }}>Тел-суҡмаҡ</div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                    type="button"
                    onClick={() => isDailyOpen.value = true}
                    title="Ежедневный фрагмент корпуса"
                    style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: 'none',
                        color: '#FFFFFF',
                        borderRadius: '20px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    📜 <span style={{ fontSize: '11px' }}>ТЗ №3</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0, 0, 0, 0.2)', padding: '4px 8px', borderRadius: '16px', fontSize: '13px', fontWeight: 800 }}>
                    🔥 <span>{streak}</span>
                </div>

                <button
                    type="button"
                    onClick={() => isShopOpen.value = true}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(217, 119, 6, 0.3)',
                        border: '1px solid rgba(245, 158, 11, 0.5)',
                        padding: '4px 8px',
                        borderRadius: '16px',
                        fontSize: '13px',
                        fontWeight: 800,
                        color: '#FEF3C7',
                        cursor: 'pointer'
                    }}
                >
                    💧 <span>{honey}</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '13px', fontWeight: 800, color: '#FCA5A5' }}>
                    ❤️ <span>{hearts}</span>
                </div>

                <button
                    type="button"
                    onClick={() => isAiOpen.value = true}
                    title="AI-тьютор Тел-Остаһы"
                    style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px'
                    }}
                >
                    🦉
                </button>
            </div>
        </header>
    );
}

export function BottomNavbar() {
    const current = activeTab.value;

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '480px',
            background: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
            boxShadow: '0 -4px 15px rgba(0, 0, 0, 0.05)',
            zIndex: 40
        }}>
            <button
                type="button"
                onClick={() => activeTab.value = 'study'}
                style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    cursor: 'pointer',
                    color: current === 'study' ? '#025E73' : '#94A3B8',
                    fontWeight: current === 'study' ? 800 : 600,
                    fontSize: '12px'
                }}
            >
                <span style={{ fontSize: '20px' }}>🏠</span>
                <span>Учёба</span>
            </button>

            <button
                type="button"
                onClick={() => activeTab.value = 'leaderboard'}
                style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    cursor: 'pointer',
                    color: current === 'leaderboard' ? '#025E73' : '#94A3B8',
                    fontWeight: current === 'leaderboard' ? 800 : 600,
                    fontSize: '12px'
                }}
            >
                <span style={{ fontSize: '20px' }}>🏆</span>
                <span>Рейтинг</span>
            </button>

            <button
                type="button"
                onClick={() => activeTab.value = 'profile'}
                style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    cursor: 'pointer',
                    color: current === 'profile' ? '#025E73' : '#94A3B8',
                    fontWeight: current === 'profile' ? 800 : 600,
                    fontSize: '12px'
                }}
            >
                <span style={{ fontSize: '20px' }}>👤</span>
                <span>Профиль</span>
            </button>
        </nav>
    );
}
