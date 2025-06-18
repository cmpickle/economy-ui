import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { useLearningTasks, useLearningStats } from '../../../hooks/useQuery';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { LearningDashboard } from './LearningDashboard';
import { TaskAssignmentModal } from './TaskAssignmentModal';
import { SudokuGame } from './SudokuGame';
import { LearningHistory } from './LearningHistory';
import { BookOpen, Plus, BarChart3, History, Brain, Target } from 'lucide-react';

const LearningContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ViewToggle = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 4px;
  gap: 4px;
`;

const ViewButton = styled(motion.button)<{ active: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: all 0.2s ease;
  
  ${({ active, theme }) =>
    active
      ? `
        background-color: ${theme.colors.primary};
        color: ${theme.colors.white};
        box-shadow: ${theme.shadows.sm};
      `
      : `
        background-color: transparent;
        color: ${theme.colors.textSecondary};
        &:hover {
          color: ${theme.colors.text};
        }
      `}
`;

const Controls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  opacity: 0.9;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const TasksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const TaskCard = styled(Card)`
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const TaskTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const TaskType = styled.div`
  background-color: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: uppercase;
`;

const TaskMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TaskStatus = styled.div<{ status: string }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
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

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

type ViewMode = 'dashboard' | 'tasks' | 'history' | 'analytics';

export const LearningPage: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  const { data: tasks = [], isLoading } = useLearningTasks();
  const { data: stats } = useLearningStats();

  if (!user) return null;

  const isParent = user.profile.role === 'parent';
  const isChild = user.profile.role === 'child';

  // Filter tasks based on user role
  const filteredTasks = isParent 
    ? tasks 
    : tasks.filter(task => task.assigned_to === user.id);

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

  const handleTaskClick = (task: any) => {
    if (task.task_type === 'sudoku_3x3' && (task.status === 'assigned' || task.status === 'in_progress')) {
      setSelectedTask(task);
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'dashboard':
        return <LearningDashboard tasks={filteredTasks} stats={stats} />;
      case 'history':
        return <LearningHistory />;
      case 'analytics':
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Analytics coming soon...</h2>
            <p>Detailed learning analytics and progress tracking will be available here.</p>
          </div>
        );
      case 'tasks':
      default:
        return (
          <TasksGrid>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <TaskCard 
                    padding="lg" 
                    hover
                    onClick={() => handleTaskClick(task)}
                  >
                    <TaskHeader>
                      <div>
                        <TaskTitle>
                          {getTaskTypeIcon(task.task_type)} {task.title}
                        </TaskTitle>
                        {task.description && (
                          <p style={{ 
                            fontSize: '0.875rem', 
                            color: '#6B7280', 
                            margin: '0.5rem 0 0 0' 
                          }}>
                            {task.description}
                          </p>
                        )}
                      </div>
                      <TaskType>{task.task_type.replace('_', ' ')}</TaskType>
                    </TaskHeader>

                    <TaskMeta>
                      <div>⭐ {task.point_value} points</div>
                      <div>📊 Difficulty: {task.difficulty_level}</div>
                      <div>🎯 Attempts: {task.attempts}/{task.max_attempts || '∞'}</div>
                      {task.due_date && (
                        <div>📅 Due: {new Date(task.due_date).toLocaleDateString()}</div>
                      )}
                    </TaskMeta>

                    <TaskStatus status={task.status}>
                      {task.status.replace('_', ' ')}
                    </TaskStatus>
                  </TaskCard>
                </motion.div>
              ))
            ) : (
              <EmptyState>
                <EmptyIcon>🎓</EmptyIcon>
                <h3>No Learning Tasks</h3>
                <p>
                  {isParent 
                    ? "Create your first learning task to get started!"
                    : "No learning tasks assigned to you yet."
                  }
                </p>
                {isParent && (
                  <Button 
                    onClick={() => setShowAssignmentModal(true)}
                    style={{ marginTop: '1rem' }}
                  >
                    <Plus size={16} />
                    Create Task
                  </Button>
                )}
              </EmptyState>
            )}
          </TasksGrid>
        );
    }
  };

  if (isLoading) {
    return (
      <LearningContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          fontSize: '18px'
        }}>
          Loading learning content...
        </div>
      </LearningContainer>
    );
  }

  return (
    <LearningContainer>
      <Header>
        <Title>
          <BookOpen size={32} />
          Learning Center
        </Title>
        
        <Controls>
          <ViewToggle>
            <ViewButton
              active={viewMode === 'dashboard'}
              onClick={() => setViewMode('dashboard')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Target size={16} />
              Dashboard
            </ViewButton>
            <ViewButton
              active={viewMode === 'tasks'}
              onClick={() => setViewMode('tasks')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Brain size={16} />
              Tasks
            </ViewButton>
            <ViewButton
              active={viewMode === 'history'}
              onClick={() => setViewMode('history')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <History size={16} />
              History
            </ViewButton>
            <ViewButton
              active={viewMode === 'analytics'}
              onClick={() => setViewMode('analytics')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BarChart3 size={16} />
              Analytics
            </ViewButton>
          </ViewToggle>
          
          {isParent && (
            <Button onClick={() => setShowAssignmentModal(true)}>
              <Plus size={16} />
              Assign Task
            </Button>
          )}
        </Controls>
      </Header>

      {stats && (
        <StatsGrid>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StatCard>
              <StatIcon>📚</StatIcon>
              <StatValue>{stats.tasks_completed}</StatValue>
              <StatLabel>Tasks Completed</StatLabel>
            </StatCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StatCard>
              <StatIcon>⭐</StatIcon>
              <StatValue>{stats.points_earned}</StatValue>
              <StatLabel>Points Earned</StatLabel>
            </StatCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StatCard>
              <StatIcon>📊</StatIcon>
              <StatValue>{Math.round(stats.completion_rate)}%</StatValue>
              <StatLabel>Completion Rate</StatLabel>
            </StatCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <StatCard>
              <StatIcon>⏱️</StatIcon>
              <StatValue>{Math.round(stats.total_time_spent_minutes)}</StatValue>
              <StatLabel>Minutes Studied</StatLabel>
            </StatCard>
          </motion.div>
        </StatsGrid>
      )}

      <ContentArea>
        {renderContent()}
      </ContentArea>

      <AnimatePresence>
        {showAssignmentModal && (
          <TaskAssignmentModal
            onClose={() => setShowAssignmentModal(false)}
            onSuccess={() => {
              setShowAssignmentModal(false);
              // Refetch tasks
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedTask && (
          <SudokuGame
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onComplete={() => {
              setSelectedTask(null);
              // Refetch tasks
            }}
          />
        )}
      </AnimatePresence>
    </LearningContainer>
  );
};