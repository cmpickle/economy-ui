import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { Chore, Reward, Event, LeaderboardEntry, UserSummary, User, LearningTask, LearningStats, Transaction } from '../types/api';

// Users
export const useUsers = (params?: any) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => apiService.getUsers(params),
    select: (data) => data.data as User[],
  });
};

export const useUser = (userId: number) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiService.getUser(userId),
    select: (data) => data.data as User,
  });
};

// Chores
export const useChores = (params?: any) => {
  return useQuery({
    queryKey: ['chores', params],
    queryFn: () => apiService.getChores(params),
    select: (data) => data.data as Chore[],
  });
};

export const useChore = (choreId: number) => {
  return useQuery({
    queryKey: ['chore', choreId],
    queryFn: () => apiService.getChore(choreId),
    select: (data) => data.data as Chore,
  });
};

export const useCreateChore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiService.createChore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
    },
  });
};

export const useUpdateChore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ choreId, data }: { choreId: number; data: any }) =>
      apiService.updateChore(choreId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
    },
  });
};

export const useCompleteChore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ choreId, notes }: { choreId: number; notes?: string }) =>
      apiService.completeChore(choreId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
    },
  });
};

export const useApproveChore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ choreId, approved, feedback }: { choreId: number; approved: boolean; feedback?: string }) =>
      apiService.approveChore(choreId, approved, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
    },
  });
};

// Rewards
export const useRewards = (params?: any) => {
  return useQuery({
    queryKey: ['rewards', params],
    queryFn: () => apiService.getRewards(params),
    select: (data) => data.data as Reward[],
  });
};

export const useCreateReward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiService.createReward(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
};

export const useRedeemReward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (rewardId: number) => apiService.redeemReward(rewardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['user-summary'] });
    },
  });
};

// Events
export const useEvents = (params?: any) => {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => apiService.getEvents(params),
    select: (data) => data.data as Event[],
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// Transactions
export const useTransactions = (params?: any) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => {
      // Mock API call - replace with actual implementation
      return Promise.resolve({
        data: [
          {
            id: 1,
            user: 3,
            user_name: 'Emma Johnson',
            household: 1,
            household_name: 'Johnson Family',
            transaction_type: 'bonus',
            amount_points: 50,
            amount_dollars: 0,
            description: 'Bonus for helping with dishes without being asked',
            status: 'approved',
            created_at: '2024-01-15T10:30:00Z',
            created_by: 1,
            created_by_name: 'John Johnson',
            notes: 'Great initiative!'
          },
          {
            id: 2,
            user: 4,
            user_name: 'Alex Johnson',
            household: 1,
            household_name: 'Johnson Family',
            transaction_type: 'allowance',
            amount_points: 0,
            amount_dollars: 10.00,
            description: 'Weekly allowance',
            status: 'approved',
            created_at: '2024-01-14T09:00:00Z',
            created_by: 1,
            created_by_name: 'John Johnson'
          },
          {
            id: 3,
            user: 3,
            user_name: 'Emma Johnson',
            household: 1,
            household_name: 'Johnson Family',
            transaction_type: 'penalty',
            amount_points: -25,
            amount_dollars: 0,
            description: 'Penalty for not cleaning room after reminder',
            status: 'approved',
            created_at: '2024-01-13T16:45:00Z',
            created_by: 1,
            created_by_name: 'John Johnson',
            notes: 'Room must be cleaned by tomorrow'
          },
          {
            id: 4,
            user: 4,
            user_name: 'Alex Johnson',
            household: 1,
            household_name: 'Johnson Family',
            transaction_type: 'chore_completion',
            amount_points: 15,
            amount_dollars: 0,
            description: 'Completed: Take out trash',
            related_chore: 1,
            status: 'approved',
            created_at: '2024-01-12T18:20:00Z',
            created_by: 4,
            created_by_name: 'Alex Johnson'
          },
          {
            id: 5,
            user: 3,
            user_name: 'Emma Johnson',
            household: 1,
            household_name: 'Johnson Family',
            transaction_type: 'gift',
            amount_points: 0,
            amount_dollars: 20.00,
            description: 'Birthday gift money',
            status: 'approved',
            created_at: '2024-01-10T12:00:00Z',
            created_by: 1,
            created_by_name: 'John Johnson',
            notes: 'Happy 13th birthday!'
          }
        ]
      });
    },
    select: (data) => data.data as Transaction[],
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => {
      // Mock API call - replace with actual implementation
      console.log('Creating transaction:', data);
      return Promise.resolve({ 
        data: {
          id: Date.now(), 
          ...data,
          status: 'approved',
          created_at: new Date().toISOString(),
          created_by_name: 'Current User'
        } 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Learning
export const useLearningTasks = (params?: any) => {
  return useQuery({
    queryKey: ['learning-tasks', params],
    queryFn: () => {
      // Mock API call - replace with actual implementation
      return Promise.resolve({
        data: [
          {
            id: 1,
            title: 'Morning Sudoku Challenge',
            description: 'Start your day with a fun logic puzzle!',
            task_type: 'sudoku_3x3',
            difficulty_level: 'easy',
            point_value: 10,
            assigned_to: 1,
            assigned_by: 2,
            household: 1,
            due_date: '2024-01-20T00:00:00Z',
            status: 'assigned',
            task_data: {},
            created_at: '2024-01-15T08:00:00Z',
            attempts: 0,
            max_attempts: 3
          },
          {
            id: 2,
            title: 'Logic Puzzle Practice',
            description: 'Medium difficulty Sudoku for skill building',
            task_type: 'sudoku_3x3',
            difficulty_level: 'medium',
            point_value: 15,
            assigned_to: 1,
            assigned_by: 2,
            household: 1,
            status: 'completed',
            task_data: {},
            created_at: '2024-01-14T10:00:00Z',
            completed_at: '2024-01-14T10:30:00Z',
            attempts: 1,
            max_attempts: 3
          }
        ]
      });
    },
    select: (data) => data.data as LearningTask[],
  });
};

export const useLearningStats = (userId?: number, period: string = 'month') => {
  return useQuery({
    queryKey: ['learning-stats', userId, period],
    queryFn: () => {
      // Mock API call - replace with actual implementation
      return Promise.resolve({
        data: {
          user_id: userId || 1,
          period,
          tasks_assigned: 8,
          tasks_completed: 6,
          completion_rate: 75,
          average_score: 87,
          total_time_spent_minutes: 180,
          points_earned: 85,
          favorite_subject: 'sudoku_3x3',
          improvement_areas: ['speed', 'accuracy'],
          daily_activity: [
            { date: '2024-01-15', tasks_completed: 2, time_spent_minutes: 30, points_earned: 25 },
            { date: '2024-01-14', tasks_completed: 1, time_spent_minutes: 15, points_earned: 10 },
            { date: '2024-01-13', tasks_completed: 3, time_spent_minutes: 45, points_earned: 50 }
          ]
        }
      });
    },
    select: (data) => data.data as LearningStats,
  });
};

export const useCreateLearningTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => {
      // Mock API call - replace with actual implementation
      console.log('Creating learning task:', data);
      return Promise.resolve({ data: { id: Date.now(), ...data } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-tasks'] });
    },
  });
};

export const useCompleteLearningTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, result }: { taskId: number; result: any }) => {
      // Mock API call - replace with actual implementation
      console.log('Completing learning task:', taskId, result);
      return Promise.resolve({ data: { success: true } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['learning-stats'] });
    },
  });
};

// Analytics
export const useLeaderboard = (householdId: number, period: string = 'month') => {
  return useQuery({
    queryKey: ['leaderboard', householdId, period],
    queryFn: () => apiService.getLeaderboard(householdId, period),
    select: (data) => data.data.leaderboard as LeaderboardEntry[],
  });
};

export const useUserSummary = (userId?: number, period: string = 'month') => {
  return useQuery({
    queryKey: ['user-summary', userId, period],
    queryFn: () => apiService.getUserSummary(userId, period),
    select: (data) => data.data as UserSummary,
  });
};