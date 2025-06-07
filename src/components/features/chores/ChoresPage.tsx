import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { useChores, useUsers, useCompleteChore, useApproveChore } from '../../../hooks/useQuery';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { CreateChoreModal } from './CreateChoreModal';
import { ChoreCard } from './ChoreCard';
import { ChoreFilters } from './ChoreFilters';
import { Plus, Filter, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const ChoresContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
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
`;

const StatIcon = styled.div`
  font-size: 2rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ContentArea = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xl};
  align-items: flex-start;
`;

const FiltersPanel = styled(Card)<{ isOpen: boolean }>`
  width: 300px;
  padding: ${({ theme }) => theme.spacing.lg};
  position: sticky;
  top: ${({ theme }) => theme.spacing.xl};
  transition: all 0.3s ease;
  
  @media (max-width: 1024px) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    z-index: 1000;
    transform: ${({ isOpen }) => isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  }
`;

const ChoresGrid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FilterOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  
  @media (min-width: 1025px) {
    display: none;
  }
`;

interface ChoreFiltersState {
  status: string[];
  assignedTo: string[];
  dateRange: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const ChoresPage: React.FC = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ChoreFiltersState>({
    status: [],
    assignedTo: [],
    dateRange: 'all',
    sortBy: 'due_date',
    sortOrder: 'asc',
  });

  const { data: allChores = [], refetch: refetchChores } = useChores();
  const { data: householdMembers = [] } = useUsers({ 
    household_id: user?.households[0] 
  });
  const completeChore = useCompleteChore();
  const approveChore = useApproveChore();

  if (!user) return null;

  const isParent = user.profile.role === 'parent';

  // Filter chores based on current filters and user role
  const filteredChores = allChores.filter(chore => {
    // Role-based filtering
    if (!isParent && chore.assigned_to !== user.id) {
      return false;
    }

    // Status filtering
    if (filters.status.length > 0 && !filters.status.includes(chore.status)) {
      return false;
    }

    // Assigned to filtering
    if (filters.assignedTo.length > 0 && !filters.assignedTo.includes(chore.assigned_to?.toString() || '')) {
      return false;
    }

    // Date range filtering
    if (filters.dateRange !== 'all') {
      const dueDate = new Date(chore.due_date);
      const now = new Date();
      const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      switch (filters.dateRange) {
        case 'overdue':
          if (daysDiff >= 0) return false;
          break;
        case 'today':
          if (daysDiff !== 0) return false;
          break;
        case 'week':
          if (daysDiff < 0 || daysDiff > 7) return false;
          break;
        case 'month':
          if (daysDiff < 0 || daysDiff > 30) return false;
          break;
      }
    }

    return true;
  });

  // Sort chores
  const sortedChores = [...filteredChores].sort((a, b) => {
    let aValue, bValue;

    switch (filters.sortBy) {
      case 'due_date':
        aValue = new Date(a.due_date).getTime();
        bValue = new Date(b.due_date).getTime();
        break;
      case 'point_value':
        aValue = a.point_value;
        bValue = b.point_value;
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate stats
  const stats = {
    total: allChores.length,
    pending: allChores.filter(c => c.status === 'pending').length,
    completed: allChores.filter(c => c.status === 'completed').length,
    overdue: allChores.filter(c => {
      const dueDate = new Date(c.due_date);
      const now = new Date();
      return dueDate < now && c.status === 'incomplete';
    }).length,
  };

  const handleCompleteChore = async (choreId: number, notes?: string) => {
    try {
      await completeChore.mutateAsync({ choreId, notes });
      refetchChores();
    } catch (error) {
      console.error('Failed to complete chore:', error);
    }
  };

  const handleApproveChore = async (choreId: number, approved: boolean, feedback?: string) => {
    try {
      await approveChore.mutateAsync({ choreId, approved, feedback });
      refetchChores();
    } catch (error) {
      console.error('Failed to approve chore:', error);
    }
  };

  return (
    <ChoresContainer>
      <Header>
        <Title>Chores</Title>
        <HeaderActions>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
          </Button>
          {isParent && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              Add Chore
            </Button>
          )}
        </HeaderActions>
      </Header>

      <StatsGrid>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatCard>
            <StatIcon>📋</StatIcon>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Chores</StatLabel>
          </StatCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatCard>
            <StatIcon>⏳</StatIcon>
            <StatValue>{stats.pending}</StatValue>
            <StatLabel>Pending Approval</StatLabel>
          </StatCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatCard>
            <StatIcon>✅</StatIcon>
            <StatValue>{stats.completed}</StatValue>
            <StatLabel>Completed</StatLabel>
          </StatCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatCard>
            <StatIcon>🚨</StatIcon>
            <StatValue>{stats.overdue}</StatValue>
            <StatLabel>Overdue</StatLabel>
          </StatCard>
        </motion.div>
      </StatsGrid>

      <ContentArea>
        <AnimatePresence>
          {showFilters && (
            <>
              <FilterOverlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
              />
              <FiltersPanel isOpen={showFilters}>
                <ChoreFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  householdMembers={householdMembers}
                  onClose={() => setShowFilters(false)}
                />
              </FiltersPanel>
            </>
          )}
        </AnimatePresence>

        <ChoresGrid>
          <AnimatePresence>
            {sortedChores.length > 0 ? (
              sortedChores.map((chore, index) => (
                <motion.div
                  key={chore.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ChoreCard
                    chore={chore}
                    currentUser={user}
                    onComplete={handleCompleteChore}
                    onApprove={handleApproveChore}
                    householdMembers={householdMembers}
                  />
                </motion.div>
              ))
            ) : (
              <EmptyState>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
                  <h3>No chores found</h3>
                  <p>
                    {isParent 
                      ? "Get started by creating your first chore!"
                      : "No chores assigned to you right now."
                    }
                  </p>
                  {isParent && (
                    <Button 
                      onClick={() => setShowCreateModal(true)}
                      style={{ marginTop: '1rem' }}
                    >
                      <Plus size={16} />
                      Create Chore
                    </Button>
                  )}
                </motion.div>
              </EmptyState>
            )}
          </AnimatePresence>
        </ChoresGrid>
      </ContentArea>

      <AnimatePresence>
        {showCreateModal && (
          <CreateChoreModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              refetchChores();
            }}
            householdMembers={householdMembers}
          />
        )}
      </AnimatePresence>
    </ChoresContainer>
  );
};