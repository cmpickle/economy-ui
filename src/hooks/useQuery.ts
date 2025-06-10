import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { Chore, Reward, Event, LeaderboardEntry, UserSummary, User } from '../types/api';

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