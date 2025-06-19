export interface ApiResponse<T = any> {
  errorMessage?: string;
  traceId: string;
  data?: T;
  per_page?: number;
  current_page?: number;
  total?: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: {
    role: 'parent' | 'teen' | 'child';
    age: number;
    avatar?: string;
    total_points: number;
    total_money: number;
    date_joined: string;
  };
  households: number[];
}

export interface Household {
  id: number;
  name: string;
  address?: string;
  settings: {
    point_to_dollar_rate: number;
    auto_approve_rewards: boolean;
    chore_approval_required: boolean;
    teen_privileges: {
      can_create_events: boolean;
      can_redeem_rewards: boolean;
      max_reward_value?: number;
    };
    child_privileges: {
      can_create_events: boolean;
      can_redeem_rewards: boolean;
      max_reward_value: number;
    };
  };
  members: User[];
  heads: number[];
  created_at: string;
}

export interface Chore {
  id: number;
  name: string;
  description?: string;
  point_value: number;
  due_date: string;
  status: 'incomplete' | 'pending' | 'completed' | 'skipped';
  assigned_to?: number;
  assigned_to_user?: User;
  household: number;
  household_name: string;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'annually';
  creation_method: 'manual' | 'recurring' | 'system';
  created_at: string;
  created_by: number;
  completed_at?: string;
  approved_at?: string;
  notes?: string;
}

export interface Reward {
  id: number;
  title: string;
  description?: string;
  image?: string;
  cost_points?: number;
  cost_dollars?: number;
  household: number;
  household_name: string;
  is_active: boolean;
  age_restrictions?: {
    min_age?: number;
    max_age?: number;
    roles_allowed?: ('parent' | 'teen' | 'child')[];
  };
  created_at: string;
  created_by: number;
  user_can_afford: boolean;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  event_date: string;
  event_type?: 'same_day' | 'scheduled'; // New field for event types
  created_by: number;
  created_at: string;
  notification_settings: {
    notify_1_day: boolean;
    notify_1_hour: boolean;
    notify_15_min: boolean;
    custom_notifications: {
      time_before: number;
      message: string;
    }[];
  };
  time_until_event: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total_seconds: number;
    progress_percentage: number;
  };
}

export interface Transaction {
  id: number;
  user: number;
  user_name: string;
  household: number;
  household_name: string;
  transaction_type: 'chore_completion' | 'reward_redemption' | 'manual_adjustment' | 'bonus' | 'penalty' | 'allowance' | 'gift';
  amount_points: number;
  amount_dollars: number;
  description: string;
  related_chore?: number;
  related_reward?: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  created_by: number;
  created_by_name: string;
  approved_at?: string;
  approved_by?: number;
  notes?: string;
}

export interface LeaderboardEntry {
  user_id: number;
  user_name: string;
  points_earned: number;
  chores_completed: number;
  money_earned: number;
  rank: number;
}

export interface UserSummary {
  user_id: number;
  period: string;
  total_points: number;
  points_earned: number;
  points_spent: number;
  money_earned: number;
  money_spent: number;
  chores_completed: number;
  chores_assigned: number;
  completion_rate: number;
  rewards_redeemed: number;
}

// Learning-related types
export interface LearningTask {
  id: number;
  title: string;
  description?: string;
  task_type: 'sudoku_3x3' | 'math' | 'reading' | 'writing' | 'science';
  difficulty_level: 'easy' | 'medium' | 'hard';
  point_value: number;
  assigned_to: number;
  assigned_by: number;
  household: number;
  due_date?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'reviewed';
  task_data: any; // Specific data for each task type
  created_at: string;
  started_at?: string;
  completed_at?: string;
  reviewed_at?: string;
  time_spent_seconds?: number;
  attempts: number;
  max_attempts?: number;
}

export interface LearningProgress {
  id: number;
  user_id: number;
  task_id: number;
  progress_data: any; // Current state of the task
  started_at: string;
  last_updated: string;
  is_completed: boolean;
  completion_time_seconds?: number;
  score?: number;
  mistakes_count: number;
}

export interface LearningStats {
  user_id: number;
  period: string;
  tasks_assigned: number;
  tasks_completed: number;
  completion_rate: number;
  average_score: number;
  total_time_spent_minutes: number;
  points_earned: number;
  favorite_subject: string;
  improvement_areas: string[];
  daily_activity: {
    date: string;
    tasks_completed: number;
    time_spent_minutes: number;
    points_earned: number;
  }[];
}

export interface SudokuPuzzle {
  grid: (number | null)[][];
  solution: number[][];
  prefilled_positions: { row: number; col: number }[];
  difficulty: 'easy' | 'medium' | 'hard';
}