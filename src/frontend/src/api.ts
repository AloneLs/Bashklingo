import { UserProfile, TrailNode, Question, LeaderboardUser, LeaderboardSchool, Achievement, TranslationFragment } from './types';

const API_BASE = '/api';

export async function fetchUserProfile(telegramId = 100001): Promise<{ user: UserProfile; achievements: Achievement[] }> {
    try {
        const res = await fetch(`${API_BASE}/user/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: telegramId })
        });
        if (res.ok) return await res.json();
    } catch (_) {  }

    return {
        user: {
            id: 1,
            telegram_id: 100001,
            username: 'aanagke',
            first_name: 'Андрей',
            class_name: '7А',
            streak_days: 1,
            honey_drops: 92,
            words_learned: 14,
            accuracy_percent: 43,
            explorer_xp: 120,
            guide_xp: 35,
            hearts: 5,
            streak_freeze_count: 1
        },
        achievements: [
            { id: 'first_step', title: 'Первый шаг', description: 'Пройдите первый урок', icon: 'star', category: 'lesson', target_val: 1, unlocked: true, progress: 1 },
            { id: 'daily_goal', title: 'Цель дня', description: 'Завершите задание дня', icon: 'target', category: 'daily', target_val: 1, unlocked: true, progress: 1 },
            { id: 'streak_3', title: '3 дня подряд', description: 'Удерживайте серию', icon: 'fire', category: 'streak', target_val: 3, unlocked: false, progress: 1 },
            { id: 'honey_week', title: 'Неделя с мёдом', description: 'Соберите 100 капель', icon: 'drop', category: 'honey', target_val: 100, unlocked: false, progress: 92 },
            { id: 'streak_5', title: 'Серия из 5', description: '5 уроков без ошибок', icon: 'shield', category: 'lesson', target_val: 5, unlocked: false, progress: 2 },
            { id: 'sharp_eye', title: 'Зоркий глаз', description: 'Исправьте перевод', icon: 'eye', category: 'corpus', target_val: 1, unlocked: false, progress: 0 },
            { id: 'editor', title: 'Редактор', description: 'Верифицируйте 10 цитат', icon: 'edit', category: 'corpus', target_val: 10, unlocked: false, progress: 3 },
            { id: 'vocab_50', title: 'Словарь: 50 слов', description: '50 новых слов', icon: 'book', category: 'vocab', target_val: 50, unlocked: false, progress: 14 },
            { id: 'fragments_50', title: '50 фрагментов', description: '50 переводов', icon: 'archive', category: 'corpus', target_val: 50, unlocked: false, progress: 6 }
        ]
    };
}

export async function fetchTrailNodes(): Promise<TrailNode[]> {
    try {
        const res = await fetch(`${API_BASE}/trail/nodes`);
        if (res.ok) {
            const data = await res.json();
            return data.nodes;
        }
    } catch (_) {  }

    return [
        { id: 1, node_key: 'shulgan_1', title: 'Вход в пещеру: Сәләмләү', biome: 'shulgan-tash', order_index: 1, icon: 'cave', lesson_type: 'lesson', status: 'completed' },
        { id: 2, node_key: 'shulgan_2', title: 'Наскальные рисунки: Ғаилә', biome: 'shulgan-tash', order_index: 2, icon: 'paint', lesson_type: 'lesson', status: 'active' },
        { id: 3, node_key: 'shulgan_3', title: 'Сундук предков: 9 уникальных букв', biome: 'shulgan-tash', order_index: 3, icon: 'chest', lesson_type: 'chest', status: 'locked' },
        { id: 4, node_key: 'shulgan_4', title: 'Зал рисунков: Сандар (1-10)', biome: 'shulgan-tash', order_index: 4, icon: 'calc', lesson_type: 'lesson', status: 'locked' },
        { id: 5, node_key: 'shulgan_5', title: 'Врата Шульган-Таш: Зачёт', biome: 'shulgan-tash', order_index: 5, icon: 'gate', lesson_type: 'gate', status: 'locked' }
    ];
}

export async function fetchQuestions(nodeId: number): Promise<Question[]> {
    try {
        const res = await fetch(`${API_BASE}/trail/questions?node_id=${nodeId}`);
        if (res.ok) {
            const data = await res.json();
            if (data.questions && data.questions.length > 0) return data.questions;
        }
    } catch (_) {  }

    return [
        { id: 101, node_id: nodeId, type: 'word_match', prompt_ba: 'Һаумыһығыҙ', prompt_ru: 'Здравствуйте (уважительно)', audio_text: 'Һаумыһығыҙ', correct_answer: 'Здравствуйте', options: ['Здравствуйте', 'До свидания', 'Спасибо', 'Пожалуйста'] },
        { id: 102, node_id: nodeId, type: 'sentence_builder', prompt_ba: 'Сәләм, дуҫым!', prompt_ru: 'Привет, мой друг!', audio_text: 'Сәләм, дуҫым!', correct_answer: 'Сәләм дуҫым', word_bank: ['Сәләм', 'дуҫым', 'һаумы', 'хәйерле', 'көн'] },
        { id: 103, node_id: nodeId, type: 'keyboard_input', prompt_ba: 'Хәйерле иртә', prompt_ru: 'Доброе утро', audio_text: 'Хәйерле иртә', correct_answer: 'Хәйерле иртә' },
        { id: 104, node_id: nodeId, type: 'listening', prompt_ba: 'Рәхим итегеҙ!', prompt_ru: 'Добро пожаловать!', audio_text: 'Рәхим итегеҙ', correct_answer: 'Добро пожаловать', options: ['Добро пожаловать', 'Счастливого пути', 'Спокойной ночи', 'До встречи'] }
    ];
}

export async function submitLessonResults(userId: number, nodeId: number, correct: number, total: number): Promise<{ honey_reward: number; xp_reward: number; accuracy: number }> {
    try {
        const res = await fetch(`${API_BASE}/trail/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, node_id: nodeId, correct_count: correct, total_count: total })
        });
        if (res.ok) return await res.json();
    } catch (_) {  }
    return { honey_reward: correct * 4, xp_reward: correct * 10, accuracy: 100 };
}

export async function fetchDailyFragment(): Promise<TranslationFragment | null> {
    try {
        const res = await fetch(`${API_BASE}/translations/daily`);
        if (res.ok) {
            const data = await res.json();
            return data.fragment || null;
        }
    } catch (_) {  }
    return {
        id: 1,
        fragment_id: 'FRAG_001',
        text_ba: 'Башҡортостан — дуҫлыҡ һәм берҙәмлек төйәге.',
        lang_pair: 'ba-ru',
        translation: 'Башкортостан — край дружбы и единства.',
        source_title: 'Башҡорт энциклопедияһы',
        source_chapter: 'Том 1',
        confirmed_count: 12,
        status: 'confirmed'
    };
}

export async function voteTranslation(userId: number, fragmentId: number, action: 'confirm' | 'suggest_edit', text?: string): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/translations/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, fragment_id: fragmentId, action, suggested_text: text })
        });
        return res.ok;
    } catch (_) {  }
    return true;
}

export async function fetchLeaderboards(): Promise<{ users: LeaderboardUser[]; schools: LeaderboardSchool[] }> {
    try {
        const res = await fetch(`${API_BASE}/leaderboard`);
        if (res.ok) return await res.json();
    } catch (_) {  }

    return {
        users: [
            { id: 1, first_name: 'Андрей', username: 'aanagke', class_name: '7А', explorer_xp: 340, guide_xp: 90, honey_drops: 92, streak_days: 1, school_name: 'Гимназия №1', city: 'Уфа' },
            { id: 2, first_name: 'Айгөл', username: 'aigul_rb', class_name: '7А', explorer_xp: 310, guide_xp: 60, honey_drops: 84, streak_days: 5, school_name: 'Гимназия №1', city: 'Уфа' },
            { id: 3, first_name: 'Ильгиз', username: 'ilgiz_u', class_name: '7Б', explorer_xp: 280, guide_xp: 40, honey_drops: 75, streak_days: 3, school_name: 'Лицей №3', city: 'Стерлитамак' }
        ],
        schools: [
            { id: 1, name: 'Полилингвальная гимназия № 1', city: 'Уфа', total_score: 12450 },
            { id: 2, name: 'Башкирский лицей-интернат № 3', city: 'Стерлитамак', total_score: 9820 },
            { id: 3, name: 'Башкирская гимназия им. Ш. Бабича', city: 'Сибай', total_score: 8740 }
        ]
    };
}

export async function buyShopItem(userId: number, itemId: string): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/shop/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, item_id: itemId })
        });
        return res.ok;
    } catch (_) {  }
    return true;
}

export async function askAi(question: string, context?: string): Promise<string> {
    try {
        const res = await fetch(`${API_BASE}/ai/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, context })
        });
        if (res.ok) {
            const data = await res.json();
            return data.answer || 'Ответ не получен';
        }
    } catch (_) {  }
    return 'Башҡорт телендә үндәшлек (сингармонизм) законы буйынса һүҙҙәр ҡалын йәки йомшаҡ булып бүленә.';
}
