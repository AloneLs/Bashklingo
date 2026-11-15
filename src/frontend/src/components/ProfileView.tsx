import { userProfile, achievementsList, isShopOpen } from '../state';

export function ProfileView() {
    const profile = userProfile.value;
    const achievements = achievementsList.value;

    const streak = profile?.streak_days || 1;
    const honey = profile?.honey_drops || 92;
    const words = profile?.words_learned || 14;
    const accuracy = profile?.accuracy_percent || 43;
    const name = profile?.first_name || 'Андрей';
    const username = profile?.username ? `@${profile.username}` : '@aanagke';
    const className = profile?.class_name ? `${profile.class_name} класс` : 'Без класса';

    return (
        <div style={{ padding: '16px 14px 30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#DBEAFE',
                    color: '#1D4ED8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    fontWeight: 900
                }}>
                    {name.charAt(0)}
                </div>
                <div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>{name}</div>
                    <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                        {className} · <span style={{ color: '#025E73' }}>{username}</span>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>
                    <span style={{ color: '#0F172A' }}>Уровень 1 · Новичок</span>
                    <span style={{ color: '#64748B' }}>ещё 108 до следующего</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: '45%', height: '100%', background: '#F59E0B' }} />
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '28px'
            }}>
                <div style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}>
                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>🔥</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>{streak} дн.</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Серия</div>
                </div>

                <div style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}>
                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>💧</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>{honey}</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Капли мёда</div>
                </div>

                <div style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}>
                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>📱</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>{words} слов</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Словарный запас</div>
                </div>

                <div style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}>
                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>✔️</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>{accuracy}%</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Точность</div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>Достижения</div>
                <button
                    type="button"
                    onClick={() => isShopOpen.value = true}
                    style={{
                        background: '#FEF3C7',
                        border: '1px solid #FCD34D',
                        color: '#B45309',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '12px',
                        cursor: 'pointer'
                    }}
                >
                    🛒 Пасека (Магазин)
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px 8px',
                textAlign: 'center'
            }}>
                {achievements.map((ach) => {
                    const isUnlocked = ach.unlocked;
                    return (
                        <div key={ach.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div
                                className={`hexagon ${isUnlocked ? 'hex-completed' : 'hex-locked'}`}
                                style={{ width: '60px', height: '68px' }}
                            >
                                <span style={{ fontSize: '20px' }}>{isUnlocked ? '⭐' : '🔒'}</span>
                            </div>
                            <div style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                marginTop: '6px',
                                color: isUnlocked ? '#0F172A' : '#94A3B8',
                                maxWidth: '95px',
                                lineHeight: 1.2
                            }}>
                                {ach.title}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
