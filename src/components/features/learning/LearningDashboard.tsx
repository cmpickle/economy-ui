import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { ProgressBar } from '../../ui/ProgressBar';
import { formatDate } from '../../../utils/api';

interface LearningDashboardProps {
  tasks: any[];
  stats: any;
}

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TaskItem = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.border};
    transform: translateX(4px);
  }
`;

const TaskInfo = styled.div`
  flex: 1;
`;

const TaskTitle = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2px;
`;

const TaskMeta = styled.div`
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
      case 'in_progress':
        return `
          background-color: ${theme.colors.warning}20;
          color: ${theme.colors.warning};
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

const ProgressCard = styled(Card)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
`;

const ProgressTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProgressItem = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const ActivityChart = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const ActivityDay = styled.div<{ activity: number }>`
  width: 100%;
  height: 30px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ activity, theme }) => {
    if (activity === 0) return theme.colors.gray[200];
    if (activity <= 2) return theme.colors.primary + '40';
    if (activity <= 4) return theme.colors.primary + '70';
    return theme.colors.primary;
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ activity, theme }) => activity > 2 ? theme.colors.white : theme.colors.text};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

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

export const LearningDashboard: React.FC<LearningDashboardProps> = ({ tasks, stats }) => {
  const recentTasks = tasks.slice(0, 5);
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress' || task.status === 'assigned');
  
  // Generate mock activity data for the past week
  const generateActivityData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      activity: Math.floor(Math.random() * 6) // 0-5 tasks per day
    }));
  };

  const activityData = generateActivityData();

  return (
    <DashboardContainer>
      <MainContent>
        <Card padding="lg">
          <SectionTitle>
            📋 Recent Tasks
          </SectionTitle>
          {recentTasks.length > 0 ? (
            recentTasks.map((task, index) => (
              <TaskItem
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <TaskInfo>
                  <TaskTitle>
                    {getTaskTypeIcon(task.task_type)} {task.title}
                  </TaskTitle>
                  <TaskMeta>
                    {task.difficulty_level} • {task.point_value} points
                    {task.due_date && ` • Due ${formatDate(task.due_date)}`}
                  </TaskMeta>
                </TaskInfo>
                <TaskStatus status={task.status}>
                  {task.status.replace('_', ' ')}
                </TaskStatus>
              </TaskItem>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: '#6B7280'
            }}>
              No tasks assigned yet
            </div>
          )}
        </Card>

        <Card padding="lg">
          <SectionTitle>
            📊 Weekly Activity
          </SectionTitle>
          <ActivityChart>
            {activityData.map((day, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '0.75rem', 
                  marginBottom: '4px',
                  color: '#6B7280'
                }}>
                  {day.day}
                </div>
                <ActivityDay activity={day.activity}>
                  {day.activity > 0 ? day.activity : ''}
                </ActivityDay>
              </div>
            ))}
          </ActivityChart>
          <div style={{ 
            fontSize: '0.75rem', 
            color: '#6B7280', 
            marginTop: '1rem',
            textAlign: 'center'
          }}>
            Tasks completed per day
          </div>
        </Card>
      </MainContent>

      <Sidebar>
        <ProgressCard padding="lg">
          <ProgressTitle>📈 Progress Overview</ProgressTitle>
          
          {stats && (
            <>
              <ProgressItem>
                <ProgressLabel>
                  <span>Completion Rate</span>
                  <span>{Math.round(stats.completion_rate)}%</span>
                </ProgressLabel>
                <ProgressBar
                  value={stats.completion_rate}
                  max={100}
                  color="#10B981"
                  height="8px"
                />
              </ProgressItem>

              <ProgressItem>
                <ProgressLabel>
                  <span>Tasks This Week</span>
                  <span>{stats.tasks_completed}/10</span>
                </ProgressLabel>
                <ProgressBar
                  value={stats.tasks_completed}
                  max={10}
                  color="#F59E0B"
                  height="8px"
                />
              </ProgressItem>

              <ProgressItem>
                <ProgressLabel>
                  <span>Study Time Goal</span>
                  <span>{Math.round(stats.total_time_spent_minutes)}/120 min</span>
                </ProgressLabel>
                <ProgressBar
                  value={stats.total_time_spent_minutes}
                  max={120}
                  color="#8B5CF6"
                  height="8px"
                />
              </ProgressItem>
            </>
          )}
        </ProgressCard>

        <Card padding="lg">
          <SectionTitle>
            🎯 Active Tasks
          </SectionTitle>
          {inProgressTasks.length > 0 ? (
            inProgressTasks.map((task, index) => (
              <TaskItem
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <TaskInfo>
                  <TaskTitle>
                    {getTaskTypeIcon(task.task_type)} {task.title}
                  </TaskTitle>
                  <TaskMeta>
                    {task.point_value} points
                  </TaskMeta>
                </TaskInfo>
                <TaskStatus status={task.status}>
                  {task.status === 'assigned' ? 'Start' : 'Continue'}
                </TaskStatus>
              </TaskItem>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '1rem',
              color: '#6B7280',
              fontSize: '0.875rem'
            }}>
              All caught up! 🎉
            </div>
          )}
        </Card>
      </Sidebar>
    </DashboardContainer>
  );
};