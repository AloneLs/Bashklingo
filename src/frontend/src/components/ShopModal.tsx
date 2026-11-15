import { isShopOpen, userProfile } from '../state';
import { buyShopItem } from '../api';

export function ShopModal() {
    if (!isShopOpen.value) return null;

    const profile = userProfile.value;
    const honey = profile?.honey_drops || 92;

    const handleBuy = async (itemId: string, cost: number) => {
        if (!profile || profile.honey_drops < cost) {
            alert('Недостаточно капель мёда 💧');
            return;
        }
        const ok = await buyShopItem(profile.id, itemId);
        if (ok) {
            profile.honey_drops -= cost;
            if (itemId === 'freeze') profile.streak_freeze_count += 1;
            if (itemId === 'refill_hearts') profile.hearts = 5;
            userProfile.value = { ...profile };
            alert('Покупка успешно совершена!');
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-sheet">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '24px' }}>🐝</span>
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>Бортевая пасека</div>
                            <div style={{ fontSize: '12px', color: '#B45309', fontWeight: 700 }}>Баланс: {honey} 💧 капель мёда</div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => isShopOpen.value = false}
                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748B' }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                        border: '1.5px solid #E2E8F0',
                        borderRadius: '16px',
                        padding: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '28px' }}>🧊</div>
                            <div>
                                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Заморозка серии</div>
                                <div style={{ fontSize: '12px', color: '#64748B' }}>Сохраняет серию при пропуске 1 дня</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleBuy('freeze', 50)}
                            className="btn-3d btn-honey"
                            style={{ padding: '8px 14px', fontSize: '13px' }}
                        >
                            50 💧
                        </button>
                    </div>

                    <div style={{
                        border: '1.5px solid #E2E8F0',
                        borderRadius: '16px',
                        padding: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '28px' }}>❤️</div>
                            <div>
                                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Восстановление сот</div>
                                <div style={{ fontSize: '12px', color: '#64748B' }}>Пополняет жизни до 5 сердец</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleBuy('refill_hearts', 25)}
                            className="btn-3d btn-green"
                            style={{ padding: '8px 14px', fontSize: '13px' }}
                        >
                            25 💧
                        </button>
                    </div>

                    <div style={{
                        border: '1.5px dashed #CBD5E1',
                        borderRadius: '16px',
                        padding: '14px',
                        background: '#F8FAFC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        opacity: 0.75
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '28px' }}>🎟</div>
                            <div>
                                <div style={{ fontSize: '15px', fontWeight: 800, color: '#475569' }}>Обмен тамъя на призы</div>
                                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Мерч и музеи РБ · Регламент хакатона</div>
                            </div>
                        </div>
                        <span style={{
                            background: '#E2E8F0',
                            color: '#475569',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '6px 10px',
                            borderRadius: '10px'
                        }}>
                            WIP (В разработке)
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
