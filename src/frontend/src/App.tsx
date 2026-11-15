import { useEffect } from 'preact/hooks';
import { activeTab, userProfile, trailNodes, achievementsList } from './state';
import { fetchUserProfile, fetchTrailNodes } from './api';
import { TopNavbar, BottomNavbar } from './components/Navbar';
import { TrailMap } from './components/TrailMap';
import { LeaderboardView } from './components/Leaderboard';
import { ProfileView } from './components/ProfileView';
import { LessonModal } from './components/LessonModal';
import { DailyConsensusModal } from './components/DailyConsensusModal';
import { AiTutorModal } from './components/AiTutorModal';
import { ShopModal } from './components/ShopModal';

declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                ready: () => void;
                expand: () => void;
                setHeaderColor: (color: string) => void;
                HapticFeedback?: {
                    notificationOccurred: (type: 'success' | 'warning' | 'error') => void;
                    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
                };
                initDataUnsafe?: {
                    user?: {
                        id: number;
                        first_name: string;
                        username?: string;
                    };
                };
            };
        };
    }
}

export function App() {
    useEffect(() => {
        try {
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand();
                window.Telegram.WebApp.setHeaderColor('#025E73');
            }
        } catch (_) { /* ignored */ }

        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        const tgId = tgUser?.id || 100001;

        fetchUserProfile(tgId).then((res) => {
            userProfile.value = res.user;
            achievementsList.value = res.achievements;
        });

        fetchTrailNodes().then((nodes) => {
            trailNodes.value = nodes;
        });
    }, []);

    const tab = activeTab.value;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
            <TopNavbar />
            <main style={{ flex: 1, paddingBottom: '70px' }}>
                {tab === 'study' && <TrailMap />}
                {tab === 'leaderboard' && <LeaderboardView />}
                {tab === 'profile' && <ProfileView />}
            </main>
            <BottomNavbar />

            <LessonModal />
            <DailyConsensusModal />
            <AiTutorModal />
            <ShopModal />
        </div>
    );
}
