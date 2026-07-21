'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useTasks } from '@/lib/hooks/useTasks';
import { useMood } from '@/lib/hooks/useMood';
import { useAttendance } from '@/lib/hooks/useAttendance';
import { useCalendar } from '@/lib/hooks/useCalendar';
import { useSoulPet } from '@/lib/hooks/useSoulPet';
import MoodWidget from '@/components/dashboard/MoodWidget';
import TaskWidget from '@/components/dashboard/TaskWidget';
import EventCountdownWidget from '@/components/dashboard/EventCountdownWidget';
import WorkTimerWidget from '@/components/dashboard/WorkTimerWidget';
import AttendanceWidget from '@/components/dashboard/AttendanceWidget';
import SafeDayWidget from '@/components/dashboard/SafeDayWidget';
import MVDWidget from '@/components/dashboard/MVDWidget';
import DebtTrackerWidget from '@/components/dashboard/DebtTrackerWidget';
import QuickActions from '@/components/dashboard/QuickActions';
import DailyTarot from '@/components/tarot/DailyTarot';
import SoulPet from '@/components/pet/SoulPet';
import styles from './dashboard.module.css';

export default function DashboardPage() {
    const { user, userData } = useAuth();
    const { tasks } = useTasks();
    const { todayMood, streak: moodStreak } = useMood();
    const {
        todayAttendance,
        hasCheckedInToday,
        streak: attendanceStreak,
        isWorking,
        isPaused,
        pause,
        resume,
        endWorkDay,
        totalWorkHours,
        totalWorkDays
    } = useAttendance();
    const { events } = useCalendar();
    const { petState, getPetMood, feedPet } = useSoulPet();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    };

    const displayName = userData?.displayName || user?.displayName || 'bạn';

    return (
        <div className={styles.dashboard}>
            <header className={styles.pageHeader}>
                <h1>{getGreeting()}, {displayName}! 👋</h1>
                <p>Hãy cùng có một ngày làm việc hiệu quả nhé!</p>
            </header>

            {/* Minimum Viable Day - Full Width */}
            <MVDWidget />

            {/* Stats Grid - 6 widgets */}
            <div className={styles.dashboardGrid}>
                <MoodWidget todayMood={todayMood} streak={moodStreak} />
                <TaskWidget tasks={tasks} />
                <EventCountdownWidget events={events} />
                <WorkTimerWidget
                    todayAttendance={todayAttendance}
                    isWorking={isWorking}
                    isPaused={isPaused}
                    onPause={pause}
                    onResume={resume}
                    onEnd={endWorkDay}
                    totalWorkHours={totalWorkHours}
                    totalWorkDays={totalWorkDays}
                />
                <AttendanceWidget
                    hasCheckedIn={hasCheckedInToday}
                    streak={attendanceStreak}
                />
                <DebtTrackerWidget />
                <SafeDayWidget />
            </div>

            {/* Gamification Section */}
            <section className={styles.gamificationSection}>
                <div className={styles.gamificationGrid}>
                    <DailyTarot />
                    <SoulPet
                        petState={petState}
                        mood={getPetMood()}
                        onFeed={feedPet}
                    />
                </div>
            </section>

            {/* Quick Actions */}
            <QuickActions />
        </div>
    );
}

