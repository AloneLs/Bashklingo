export interface UserProfile {
    id: number;
    telegram_id: number;
    username: string;
    first_name: string;
    class_name: string;
    streak_days: number;
    honey_drops: number;
    words_learned: number;
    accuracy_percent: number;
    explorer_xp: number;
    guide_xp: number;
    hearts: number;
    streak_freeze_count: number;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    target_val: number;
    unlocked: boolean;
    progress: number;
}

export type BiomeKey = 'shulgan-tash' | 'agidel' | 'toratau' | 'iremel';

export interface TrailNode {
    id: number;
    node_key: string;
    title: string;
    biome: BiomeKey;
    order_index: number;
    icon: string;
    lesson_type: 'lesson' | 'chest' | 'gate' | 'blitz' | 'research';
    status?: 'completed' | 'active' | 'locked';
}

export interface Question {
    id: number;
    node_id: number;
    type: 'word_match' | 'sentence_builder' | 'keyboard_input' | 'listening' | 'affix_harmony';
    prompt_ba: string;
    prompt_ru: string;
    audio_text?: string;
    correct_answer: string;
    options?: string[];
    word_bank?: string[];
}

export interface TranslationFragment {
    id: number;
    fragment_id: string;
    text_ba: string;
    lang_pair: string;
    translation: string;
    source_title: string;
    source_chapter?: string;
    confirmed_count: number;
    status: 'new' | 'confirmed' | 'expert_review';
}

export interface LeaderboardUser {
    id: number;
    first_name: string;
    username: string;
    class_name: string;
    explorer_xp: number;
    guide_xp: number;
    honey_drops: number;
    streak_days: number;
    school_name?: string;
    city?: string;
}

export interface LeaderboardSchool {
    id: number;
    name: string;
    city: string;
    total_score: number;
}
