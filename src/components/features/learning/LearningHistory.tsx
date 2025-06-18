import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { formatDate, formatDateTime } from '../../../utils/api';
import { Calendar, Clock, Target, Award, TrendingUp, Filter } from 'lucide-react';

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const HistoryTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0;
`;

const FilterControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`;

const FilterSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const HistoryGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const TaskHistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const TaskHistoryCard = styled(Card)`
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const TaskInfo = styled.div`
  flex: 1;
`;

const TaskTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const TaskMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TaskStatus = styled.div<{ status: string }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: uppercase;
  
  ${({ status, theme }) => {
    switch (status) {
      case 'completed':
        return `
          background-color: ${theme.colors.success}20;
          color: ${theme.colors.success};
        `;
      case 'reviewed':
        return `
          background-color: ${theme.colors.primary}20;
          color: ${theme.colors.primary};
        `;
      default:
        return `
          background-color: ${theme.colors.gray[200]};
          color: ${theme.colors.gray[600]};
        `;
    }
  }}
`;

const TaskStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SummaryPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SummaryCard = styled(Card)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
`;

const SummaryTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SummaryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

const SummaryStatItem = styled.div`
  text-align: center;
`;

const SummaryStatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const SummaryStatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  opacity: 0.9;
`;

const AchievementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const AchievementItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const AchievementIcon = styled.div`
  font-size: 1.5rem;
`;

const AchievementText = styled.div`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
`;

// Mock data for demonstration
const mockTaskHistory = [
  {
    id: 1,
    title: 'Morning Sudoku Challenge',
    task_type: 'sudoku_3x3',
    difficulty_level: 'easy',
    status: 'completed',
    completed_at: '2024-01-15T10:30:00Z',
    time_spent_seconds: 180,
    score: 85,
    mistakes: 2,
    point_value: 10,
    attempts: 1
  },
  {
    id: 2,
    title: 'Logic Puzzle Practice',
    task_type: 'sudoku_3x3',
    difficulty_level: 'medium',
    status: 'completed',
    completed_at: '2024-01-14T14:15:00Z',
    time_spent_seconds: 240,
    score: 92,
    mistakes: 1,
    point_value: 15,
    attempts: 1
  },
  {
    id: 3,
    title: 'Brain Teaser Time',
    task_type: 'sudoku_3x3',
    difficulty_level: 'hard',
    status: 'reviewed',
    completed_at: '2024-01-13T16:45:00Z',
    time_spent_seconds: 420,
    score: 78,
    mistakes: 4,
    point_value: 20,
    attempts: 2
  }
];

const mockAchievements = [
  { icon: '🏆', text: 'Completed first Sudoku puzzle' },
  { icon: '⚡', text: 'Solved puzzle in under 3 minutes' },
  { icon: '🎯', text: 'Perfect score on easy difficulty' },
  { icon: '📚', text: '5 tasks completed this week' }
];

const getTaskTypeIcon = (type: string) => {
  switch (type) {
    case 'sudoku_3x3': return '🧩';
    case 'math': return '🔢';
    case 'reading': return '📚';
    case 'writing': return '✍️';
    case 'science': return '🔬';
    default: return '📝';
  }
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const LearningHistory: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredHistory = mockTaskHistory.filter(task => {
    if (typeFilter !== 'all' && task.task_type !== typeFilter) return false;
    
    if (timeFilter !== 'all') {
      const taskDate = new Date(task.completed_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (timeFilter) {
        case 'week':
          return daysDiff <= 7;
        case 'month':
          return daysDiff <= 30;
        default:
          return true;
      }
    }
    
    return true;
  });

  const calculateSummaryStats = () => {
    const completed = filteredHistory.filter(task => task.status === 'completed').length;
    const totalTime = filteredHistory.reduce((sum, task) => sum + task.time_spent_seconds, 0);
    const avgScore = filteredHistory.reduce((sum, task) => sum + task.score, 0) / filteredHistory.length || 0;
    const totalPoints = filteredHistory.reduce((sum, task) => sum + task.point_value, 0);
    
    return {
      completed,
      totalTime: Math.round(totalTime / 60), // in minutes
      avgScore: Math.round(avgScore),
      totalPoints
    };
  };

  const stats = calculateSummaryStats();

  return (
    <HistoryContainer>
      <HistoryHeader>
        <HistoryTitle>
          <Calendar size={24} />
          Learning History
        </HistoryTitle>
        
        <FilterControls>
          <Filter size={16} />
          <FilterSelect
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </FilterSelect>
          
          <FilterSelect
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="sudoku_3x3">Sudoku</option>
            <option value="math">Math</option>
            <option value="reading">Reading</option>
          </FilterSelect>
        </FilterControls>
      </HistoryHeader>

      <HistoryGrid>
        <TaskHistoryList>
          {filteredHistory.length > 0 ? (
            filteredHistory.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <TaskHistoryCard padding="lg">
                  <TaskHeader>
                    <TaskInfo>
                      <TaskTitle>
                        {getTaskTypeIcon(task.task_type)} {task.title}
                      </TaskTitle>
                      <TaskMeta>
                        <div>📊 Difficulty: {task.difficulty_level}</div>
                        <div>📅 Completed: {formatDateTime(task.completed_at)}</div>
                        <div>🎯 Attempts: {task.attempts}</div>
                      </TaskMeta>
                    </TaskInfo>
                    <TaskStatus status={task.status}>
                      {task.status}
                    </TaskStatus>
                  </TaskHeader>

                  <TaskStats>
                    <StatItem>
                      <StatValue>{formatTime(task.time_spent_seconds)}</StatValue>
                      <StatLabel>Time</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue>{task.score}/100</StatValue>
                      <StatLabel>Score</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue>{task.mistakes}</StatValue>
                      <StatLabel>Mistakes</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue>{task.point_value}</StatValue>
                      <StatLabel>Points</StatLabel>
                    </StatItem>
                  </TaskStats>
                </TaskHistoryCard>
              </motion.div>
            ))
          ) : (
            <Card padding="lg" style={{ textAlign: 'center', color: '#6B7280' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <h3>No History Found</h3>
              <p>No completed tasks match your current filters.</p>
            </Card>
          )}
        </TaskHistoryList>

        <SummaryPanel>
          <SummaryCard padding="lg">
            <SummaryTitle>
              <TrendingUp size={20} />
              Summary Stats
            </SummaryTitle>
            <SummaryStats>
              <SummaryStatItem>
                <SummaryStatValue>{stats.completed}</SummaryStatValue>
                <SummaryStatLabel>Completed</SummaryStatLabel>
              </SummaryStatItem>
              <SummaryStatItem>
                <SummaryStatValue>{stats.totalTime}m</SummaryStatValue>
                <SummaryStatLabel>Study Time</SummaryStatLabel>
              </SummaryStatItem>
              <SummaryStatItem>
                <SummaryStatValue>{stats.avgScore}%</SummaryStatValue>
                <SummaryStatLabel>Avg Score</SummaryStatLabel>
              </SummaryStatItem>
              <SummaryStatItem>
                <SummaryStatValue>{stats.totalPoints}</SummaryStatValue>
                <SummaryStatLabel>Points</SummaryStatLabel>
              </SummaryStatItem>
            </SummaryStats>
          </SummaryCard>

          <Card padding="lg">
            <SummaryTitle>
              <Award size={20} />
              Recent Achievements
            </SummaryTitle>
            <AchievementsList>
              {mockAchievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <AchievementItem>
                    <AchievementIcon>{achievement.icon}</AchievementIcon>
                    <AchievementText>{achievement.text}</AchievementText>
                  </AchievementItem>
                </motion.div>
              ))}
            </AchievementsList>
          </Card>
        </SummaryPanel>
      </HistoryGrid>
    </HistoryContainer>
  );
};