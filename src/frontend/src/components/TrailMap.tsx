import { trailNodes, selectedLessonNode, isLessonOpen, isDailyOpen } from '../state';
import { TrailNode, BiomeKey } from '../types';

const BIOMES: Record<BiomeKey, { title: string; subtitle: string; color: string; badge: string }> = {
    'shulgan-tash': { title: 'Шүлгән-Таш', subtitle: 'Пещера и колыбель истории · Вводный курс', color: '#025E73', badge: 'Биом 1' },
    'agidel': { title: 'Ағиҙел', subtitle: 'Река Белая · Природа, бортевой мёд и флора', color: '#14532D', badge: 'Биом 2' },
    'toratau': { title: 'Торатау', subtitle: 'Священный шихан · Закон сингармонизма', color: '#B45309', badge: 'Биом 3' },
    'iremel': { title: 'Ирәмәл', subtitle: 'Пик Урала · Эпос Урал-батыр и диалекты', color: '#4C1D95', badge: 'Биом 4' }
};

export function TrailMap() {
    const nodes = trailNodes.value;

    const grouped: Record<BiomeKey, TrailNode[]> = {
        'shulgan-tash': [],
        'agidel': [],
        'toratau': [],
        'iremel': []
    };

    for (const node of nodes) {
        if (grouped[node.biome]) grouped[node.biome].push(node);
    }

    const handleNodeClick = (node: TrailNode) => {
        if (node.lesson_type === 'chest') {
            alert(`🎁 Сундук открыт!\nВам начислено +50 капель мёда 💧 и культурная заметка о заповеднике!`);
            return;
        }
        selectedLessonNode.value = node;
        isLessonOpen.value = true;
    };

    return (
        <div style={{ padding: '16px 12px 30px' }}>
            <div style={{
                background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                border: '2px solid #FCD34D',
                borderRadius: '16px',
                padding: '14px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 0 #F59E0B'
            }}>
                <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase' }}>ТЗ №3 Хакатона</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#78350F' }}>Фрагмент дня (УФИЦ РАН)</div>
                    <div style={{ fontSize: '12px', color: '#92400E' }}>Верифицируйте перевод и получите +35 XP</div>
                </div>
                <button
                    type="button"
                    onClick={() => isDailyOpen.value = true}
                    className="btn-3d btn-honey"
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                >
                    Открыть
                </button>
            </div>

            {(['shulgan-tash', 'agidel', 'toratau', 'iremel'] as BiomeKey[]).map((biomeKey) => {
                const info = BIOMES[biomeKey];
                const biomeNodes = grouped[biomeKey];

                return (
                    <div key={biomeKey} style={{ marginBottom: '32px' }}>
                        <div style={{
                            background: info.color,
                            color: '#FFFFFF',
                            borderRadius: '14px',
                            padding: '12px 16px',
                            marginBottom: '20px',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.85, textTransform: 'uppercase' }}>{info.badge}</span>
                                <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px' }}>
                                    {biomeNodes.length} узлов
                                </span>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 900, marginTop: '2px' }}>{info.title}</div>
                            <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '2px' }}>{info.subtitle}</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', position: 'relative' }}>
                            {biomeNodes.map((node, idx) => {
                                const offset = idx % 2 === 0 ? '-25px' : '25px';
                                const isCompleted = idx === 0;
                                const isActive = idx === 1;

                                let hexClass = 'hex-locked';
                                if (node.lesson_type === 'chest') hexClass = 'hex-chest';
                                else if (isCompleted) hexClass = 'hex-completed';
                                else if (isActive) hexClass = 'hex-active';

                                let iconSymbol = '📖';
                                if (node.lesson_type === 'chest') iconSymbol = '🎁';
                                else if (node.lesson_type === 'gate') iconSymbol = '⛩';
                                else if (isCompleted) iconSymbol = '⭐';

                                return (
                                    <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateX(${offset})` }}>
                                        <div
                                            className={`hexagon ${hexClass}`}
                                            onClick={() => handleNodeClick(node)}
                                        >
                                            <span style={{ fontSize: '24px' }}>{iconSymbol}</span>
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            fontWeight: 800,
                                            marginTop: '6px',
                                            textAlign: 'center',
                                            maxWidth: '140px',
                                            color: '#334155'
                                        }}>
                                            {node.title.split(':')[0]}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
