import { create } from 'zustand';

export const useAuraStore = create((set) => ({
  user: null,
  habits: [],
  foodLogs: [],
  activityLogs: [],
  dailyScore: null,
  isLoading: true,
  
  // Actions
  setDashboardData: (data) => set({
    user: data.user,
    habits: data.habits,
    foodLogs: data.foodLogs,
    activityLogs: data.activityLogs,
    dailyScore: data.dailyScore,
    isLoading: false,
  }),
  
  addFoodLog: (log) => set((state) => ({ 
    foodLogs: [log, ...state.foodLogs] 
  })),
  
  addActivityLog: (log) => set((state) => ({ 
    activityLogs: [log, ...state.activityLogs] 
  })),

  addHabit: (habit) => set((state) => ({
    habits: [...state.habits, habit]
  })),

  // We will pass the full habits array from the server including its logs
  updateHabitLogs: (habitId, newLogs) => set((state) => ({
    habits: state.habits.map(h => 
      h.id === habitId ? { ...h, logs: newLogs } : h
    )
  }))
}));
