import { useState, useEffect } from 'preact/hooks';
import { leaderboardUsers, leaderboardSchools } from '../state';
import { fetchLeaderboards } from '../api';
import { LeaderboardUser, LeaderboardSchool } from '../types';

export function LeaderboardView() {
    const [subTab, setSubTab] = useState<'users' | 'schools'>('users');
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [schools, setSchools] = useState<LeaderboardSchool[]>([]);

    useEffect(() => {
        fetchLeaderboards().then((data) => {
            setUsers(data.users);
            setSchools(data.schools);
            leaderboardUsers.value = data.users;
            leaderboardSchools.value = data.schools;
        });
    }, []);

    return (
        <div style={{ padding: '16px 14px 30px' }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
                Рейтинги Башкортостана
            </div>
            <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                Соревнование учеников и школ по верификации языка
            </div>

            <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '4px', borderRadius: '14px', marginBottom: '18px' }}>
                <button
                    type="button"
                    onClick={() => setSubTab('users')}
                    style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '10px',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        background: subTab === 'users' ? '#FFFFFF' : 'transparent',
                        color: subTab === 'users' ? '#025E73' : '#64748B',
                        boxShadow: subTab === 'users' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                    }}
                >
                    👤 Ученики
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab('schools')}
                    style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '10px',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        background: subTab === 'schools' ? '#FFFFFF' : 'transparent',
                        color: subTab === 'schools' ? '#025E73' : '#64748B',
                        boxShadow: subTab === 'schools' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                    }}
                >
                    🏫 Школы РБ
                </button>
            </div>

            {subTab === 'users' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {users.map((u, idx) => {
                        const rank = idx + 1;
                        let medal = `${rank}`;
                        if (rank === 1) medal = '🥇';
                        else if (rank === 2) medal = '🥈';
                        else if (rank === 3) medal = '🥉';

                        return (
                            <div key={u.id} style={{
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '14px',
                                padding: '12px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '28px', fontSize: rank <= 3 ? '18px' : '14px', fontWeight: 900, color: '#64748B', textAlign: 'center' }}>
                                        {medal}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{u.first_name}</div>
                                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                                            {u.class_name} · {u.school_name || 'Школа'} ({u.city || 'Уфа'})
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#025E73' }}>
                                        {u.explorer_xp + u.guide_xp} XP
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#B45309', fontWeight: 700 }}>
                                        💧 {u.honey_drops}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {schools.map((s, idx) => {
                        const rank = idx + 1;
                        return (
                            <div key={s.id} style={{
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '14px',
                                padding: '12px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '24px', fontWeight: 900, color: '#64748B', fontSize: '14px' }}>
                                        #{rank}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', maxWidth: '240px' }}>
                                            {s.name}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#64748B' }}>г. {s.city}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: 900, color: '#B45309' }}>
                                    {s.total_score} б.
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
