import { signal } from '@preact/signals';
import { UserProfile, TrailNode, Question, LeaderboardUser, LeaderboardSchool, Achievement, TranslationFragment } from './types';

export const activeTab = signal<'study' | 'leaderboard' | 'profile'>('study');
export const userProfile = signal<UserProfile | null>(null);
export const achievementsList = signal<Achievement[]>([]);
export const trailNodes = signal<TrailNode[]>([]);
export const selectedLessonNode = signal<TrailNode | null>(null);
export const lessonQuestions = signal<Question[]>([]);
export const isLessonOpen = signal<boolean>(false);
export const isAiOpen = signal<boolean>(false);
export const isShopOpen = signal<boolean>(false);
export const isDailyOpen = signal<boolean>(false);
export const dailyFragment = signal<TranslationFragment | null>(null);
export const leaderboardUsers = signal<LeaderboardUser[]>([]);
export const leaderboardSchools = signal<LeaderboardSchool[]>([]);
export const isSoundEnabled = signal<boolean>(true);
