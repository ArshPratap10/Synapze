import { create } from 'zustand';

export const useSynapzeStore = create((set, get) => ({
  // --- State ------------------------------------------------------------------
  user: null,
  habits: [],
  foodLogs: [],
  activityLogs: [],
  dailyScore: null,
  analytics: [],
  isLoading: true,
  error: null,

  // --- Bulk Loaders -----------------------------------------------------------
  setDashboardData: (data) => set({
    user: data.user,
    habits: data.habits || [],
    foodLogs: data.foodLogs || [],
    activityLogs: data.activityLogs || [],
    dailyScore: data.dailyScore,
    isLoading: false,
    error: null,
  }),

  setAnalyticsData: (analytics) => set({ analytics: analytics || [] }),

  setLoading: (v) => set({ isLoading: v }),

  setError: (msg) => set({ error: msg, isLoading: false }),

  // --- Food Logs --------------------------------------------------------------
  addFoodLog: (log) => set((state) => ({
    foodLogs: [log, ...state.foodLogs],
  })),

  removeFoodLog: (logId) => set((state) => ({
    foodLogs: state.foodLogs.filter(f => f.id !== logId),
  })),

  // --- Activity Logs ----------------------------------------------------------
  addActivityLog: (log) => set((state) => ({
    activityLogs: [log, ...state.activityLogs],
  })),

  removeActivityLog: (logId) => set((state) => ({
    activityLogs: state.activityLogs.filter(a => a.id !== logId),
  })),

  // --- Habits -----------------------------------------------------------------
  addHabit: (habit) => set((state) => ({
    habits: [...state.habits, { ...habit, logs: habit.logs || [] }],
  })),

  removeHabit: (habitId) => set((state) => ({
    habits: state.habits.filter(h => h.id !== habitId),
  })),

  // Optimistic toggle — immediately shows checkmark, syncs in background
  toggleHabitCompletion: (habitId) => set((state) => {
    const todayStr = new Date().toDateString();
    return {
      habits: state.habits.map(h => {
        if (h.id !== habitId) return h;
        const alreadyDone = (h.logs || []).some(
          l => new Date(l.completedDate).toDateString() === todayStr
        );
        if (alreadyDone) {
          return {
            ...h,
            currentStreak: Math.max(0, (h.currentStreak || 0) - 1),
            logs: (h.logs || []).filter(l => new Date(l.completedDate).toDateString() !== todayStr)
          };
        }
        return {
          ...h,
          currentStreak: (h.currentStreak || 0) + 1,
          logs: [...(h.logs || []), {
            id: `temp-${Date.now()}`,
            completedDate: new Date().toISOString(),
            habitId,
          }],
        };
      }),
    };
  }),

  // --- Daily Score ------------------------------------------------------------
  setDailyScore: (scoreData) => set({ dailyScore: scoreData }),

  // --- User -------------------------------------------------------------------
  setUser: (userData) => set({ user: userData }),

  // --- Computed helpers (getters) ---------------------------------------------
  getTotalCaloriesIn: () => {
    const { foodLogs } = get();
    return foodLogs.reduce((sum, f) => sum + (f.calories || 0), 0);
  },

  getTotalCaloriesBurned: () => {
    const { activityLogs } = get();
    return activityLogs.reduce((sum, a) => sum + (a.caloriesBurned || 0), 0);
  },

  getCompletedHabitsCount: () => {
    const { habits } = get();
    const todayStr = new Date().toDateString();
    return habits.filter(h =>
      (h.logs || []).some(l => new Date(l.completedDate).toDateString() === todayStr)
    ).length;
  },

  getMaxStreak: () => {
    const { habits } = get();
    return Math.max(...habits.map(h => h.currentStreak || 0), 0);
  },
}));