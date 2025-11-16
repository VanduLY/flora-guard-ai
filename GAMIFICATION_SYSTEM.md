# 🏆 Complete Gamification System

## Overview
A comprehensive gamification system integrated into Flora-Guard that tracks achievements, XP, levels, streaks, and rewards users for plant care activities.

## Database Tables Created

### 1. `user_stats` Table
Tracks overall user progress and statistics:
- `total_xp`: Total experience points earned
- `level`: Current user level (calculated from XP)
- `current_streak_days`: Current daily activity streak
- `longest_streak_days`: Longest streak achieved
- `last_activity_date`: Last day user was active
- `tasks_completed`: Total tasks completed count
- `plants_added`: Total plants added count
- `achievements_earned`: Total achievements unlocked
- `perfect_weeks`: Count of perfect weeks (all tasks on time)
- `diseases_treated`: Count of successfully treated diseases

### 2. `achievement_definitions` Table
Defines all available achievements with:
- Achievement ID, title, description
- Icon name (Lucide icon)
- Achievement type (collection, task, streak, health, milestone, special, carbon)
- Color class for styling
- XP reward amount
- Requirement count

### Predefined Achievements
1. **Plant Parent** (50 XP) - Add first plant
2. **Growing Collection** (100 XP) - Manage 5 healthy plants
3. **Green Thumb** (250 XP) - Maintain 10 healthy plants
4. **Getting Started** (25 XP) - Complete first task
5. **Dedicated Gardener** (100 XP) - Complete 10 tasks
6. **Master Gardener** (500 XP) - Complete 50 tasks
7. **Perfect Week** (150 XP) - Complete all tasks on time for a week
8. **7-Day Streak** (100 XP) - Consistent care for 7 days
9. **30-Day Streak** (300 XP) - Consistent care for 30 days
10. **Pest Defender** (200 XP) - Successfully treat a disease
11. **First Bloom** (150 XP) - Log first flowering milestone
12. **Growth Tracker** (200 XP) - Log 10 growth milestones
13. **Early Bird** (75 XP) - Complete task before 8 AM
14. **Night Owl** (75 XP) - Complete task after 10 PM
15. **Carbon Conscious** (100 XP) - Track carbon footprint for 7 days

## Components Created

### 1. `useGamification.tsx` (Hook)
Core hook that manages all gamification logic:
- Fetches and syncs user stats, achievements, and definitions
- `addXp()` - Add experience points with level-up detection
- `updateStreak()` - Track daily activity streaks
- `incrementStat()` - Update specific stat counters
- `checkAndAwardAchievement()` - Award achievements with XP rewards
- `calculateLevel()` - Calculate level from total XP
- `getXpForNextLevel()` - Get XP required for next level
- Real-time sync via Supabase subscriptions

### 2. `LevelProgressBar.tsx`
Displays user's current level and progress:
- Level badge with icon
- Total XP display
- Progress bar showing XP progress to next level
- Quick stats grid (streak, tasks, achievements)
- Gradient styling consistent with theme

### 3. `AchievementsDashboard.tsx` (Updated)
Enhanced achievements display:
- Real data from database instead of mock data
- Level progress bar at top
- Weekly insights based on actual stats
- Achievement grid showing earned/locked badges
- XP rewards display
- Progress stats section

### 4. `GamificationContext.tsx`
Context provider for global gamification state:
- Wraps entire CarePlanner page
- Provides gamification hook data to all children
- Prevents prop drilling

### 5. `TaskCompletionHandler.tsx`
Automatic achievement detection component:
- Listens to task completion events via Supabase realtime
- Awards XP for each completed task
- Updates streaks automatically
- Checks and awards achievements based on:
  - Task count milestones (1st, 10th, 50th)
  - Time of completion (early bird, night owl)
- Triggers toast notifications

## Integration Points

### CarePlanner Page
- Wrapped with `GamificationProvider`
- Includes `TaskCompletionHandler` for automatic tracking
- Achievements tab displays full `AchievementsDashboard`

### Automatic Triggers
1. **Task Completion** → Awards 25 XP + checks achievements
2. **Daily Activity** → Updates streak counters
3. **Plant Addition** → Tracked via `plants_added` stat
4. **Disease Treatment** → Tracked via `diseases_treated` stat
5. **Milestone Logging** → Tracked via growth milestone events

## Level System

**Formula**: `Level = floor(sqrt(total_xp / 100)) + 1`

**XP Required for Level**:
- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 400 XP
- Level 4: 900 XP
- Level 5: 1,600 XP
- Level 10: 8,100 XP

Progress bar shows percentage progress within current level range.

## Future Enhancements

1. **Leaderboards** - Compare progress with other users
2. **Daily Challenges** - Time-limited achievement quests
3. **Seasonal Events** - Special limited-time achievements
4. **Badge Showcase** - Display earned badges on profile
5. **Achievement Sharing** - Share unlocked achievements
6. **Custom Avatars** - Unlock cosmetic rewards
7. **Plant Collection Badges** - Species-specific achievements
8. **Milestone Celebrations** - Special animations for major achievements
9. **Weekly Quests** - Rotating weekly objectives
10. **Achievement Categories** - Filter and browse by type

## Security

- All tables have RLS policies enabled
- Users can only view/modify their own stats
- Achievement definitions are publicly readable
- Stats are automatically initialized on first access

## Performance

- Real-time subscriptions for instant updates
- Efficient queries with proper indexing
- Stats cached in React state to minimize DB calls
- Batch updates for multiple stat changes

## Design Consistency

- Uses semantic tokens from theme system
- Lucide icons for all achievement badges
- Gradient effects and animations via Framer Motion
- Mobile-responsive grid layouts
- Toast notifications for user feedback
