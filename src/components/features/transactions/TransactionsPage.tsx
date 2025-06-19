import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { useTransactions, useUsers } from '../../../hooks/useQuery';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { CreateTransactionModal } from './CreateTransactionModal';
import { TransactionHistory } from './TransactionHistory';
import { TransactionSummary } from './TransactionSummary';
import { DollarSign, Plus, TrendingUp, History, Users, Filter } from 'lucide-react';

const TransactionsContainer = styled.div`
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
    animation: shimmer 3s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  position: relative;
  z-index: 1;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  position: relative;
  z-index: 1;
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  opacity: 0.9;
  position: relative;
  z-index: 1;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const QuickActionCard = styled(Card)`
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const QuickActionIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const QuickActionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const QuickActionDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
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

type ViewMode = 'overview' | 'history' | 'summary';

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [transactionType, setTransactionType] = useState<string>('');
  
  const userHouseholdId = user?.households?.[0];
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
  const { data: householdMembers = [] } = useUsers(
    userHouseholdId ? { household_id: userHouseholdId } : undefined
  );

  if (!user) return null;

  const isParent = user.profile.role === 'parent';

  // Redirect non-parents
  if (!isParent) {
    return (
      <TransactionsContainer>
        <EmptyState>
          <EmptyIcon>🔒</EmptyIcon>
          <h3>Access Restricted</h3>
          <p>Only parents can access the transactions page.</p>
        </EmptyState>
      </TransactionsContainer>
    );
  }

  // Calculate stats from transactions
  const calculateStats = () => {
    const thisMonth = transactions.filter(t => {
      const transactionDate = new Date(t.created_at);
      const now = new Date();
      return transactionDate.getMonth() === now.getMonth() && 
             transactionDate.getFullYear() === now.getFullYear();
    });

    const totalTransactions = transactions.length;
    const monthlyTransactions = thisMonth.length;
    const totalPointsDistributed = transactions
      .filter(t => t.amount_points > 0)
      .reduce((sum, t) => sum + t.amount_points, 0);
    const totalDollarsDistributed = transactions
      .filter(t => t.amount_dollars > 0)
      .reduce((sum, t) => sum + t.amount_dollars, 0);

    return {
      totalTransactions,
      monthlyTransactions,
      totalPointsDistributed,
      totalDollarsDistributed
    };
  };

  const stats = calculateStats();

  const quickActions = [
    {
      id: 'bonus',
      title: 'Award Bonus',
      description: 'Give extra points or money for good behavior',
      icon: '🎁',
      color: '#10B981'
    },
    {
      id: 'allowance',
      title: 'Weekly Allowance',
      description: 'Distribute regular allowance to family members',
      icon: '💰',
      color: '#3B82F6'
    },
    {
      id: 'penalty',
      title: 'Apply Penalty',
      description: 'Deduct points or money for rule violations',
      icon: '⚠️',
      color: '#EF4444'
    },
    {
      id: 'gift',
      title: 'Special Gift',
      description: 'Give money for birthdays or achievements',
      icon: '🎉',
      color: '#8B5CF6'
    },
    {
      id: 'manual_adjustment',
      title: 'Manual Adjustment',
      description: 'Make corrections or custom adjustments',
      icon: '⚙️',
      color: '#6B7280'
    }
  ];

  const handleQuickAction = (actionType: string) => {
    setTransactionType(actionType);
    setShowCreateModal(true);
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'history':
        return <TransactionHistory transactions={transactions} householdMembers={householdMembers} />;
      case 'summary':
        return <TransactionSummary transactions={transactions} householdMembers={householdMembers} />;
      case 'overview':
      default:
        return (
          <>
            <Card padding="lg">
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                ⚡ Quick Actions
              </h2>
              <QuickActionsGrid>
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <QuickActionCard 
                      padding="lg" 
                      hover
                      onClick={() => handleQuickAction(action.id)}
                    >
                      <QuickActionIcon>{action.icon}</QuickActionIcon>
                      <QuickActionTitle>{action.title}</QuickActionTitle>
                      <QuickActionDescription>{action.description}</QuickActionDescription>
                    </QuickActionCard>
                  </motion.div>
                ))}
              </QuickActionsGrid>
            </Card>

            <TransactionHistory 
              transactions={transactions.slice(0, 10)} 
              householdMembers={householdMembers}
              showViewAll={true}
              onViewAll={() => setViewMode('history')}
            />
          </>
        );
    }
  };

  if (transactionsLoading) {
    return (
      <TransactionsContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          fontSize: '18px'
        }}>
          Loading transactions...
        </div>
      </TransactionsContainer>
    );
  }

  return (
    <TransactionsContainer>
      <Header>
        <Title>
          <DollarSign size={32} />
          Family Transactions
        </Title>
        
        <Controls>
          <ViewToggle>
            <ViewButton
              active={viewMode === 'overview'}
              onClick={() => setViewMode('overview')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users size={16} />
              Overview
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
              active={viewMode === 'summary'}
              onClick={() => setViewMode('summary')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <TrendingUp size={16} />
              Summary
            </ViewButton>
          </ViewToggle>
          
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            New Transaction
          </Button>
        </Controls>
      </Header>

      <StatsGrid>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatCard>
            <StatIcon>📊</StatIcon>
            <StatValue>{stats.totalTransactions}</StatValue>
            <StatLabel>Total Transactions</StatLabel>
          </StatCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatCard>
            <StatIcon>📅</StatIcon>
            <StatValue>{stats.monthlyTransactions}</StatValue>
            <StatLabel>This Month</StatLabel>
          </StatCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatCard>
            <StatIcon>⭐</StatIcon>
            <StatValue>{stats.totalPointsDistributed.toLocaleString()}</StatValue>
            <StatLabel>Points Distributed</StatLabel>
          </StatCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatCard>
            <StatIcon>💰</StatIcon>
            <StatValue>${Number(stats?.totalDollarsDistributed ?? 0).toFixed(2)}</StatValue>
            <StatLabel>Money Distributed</StatLabel>
          </StatCard>
        </motion.div>
      </StatsGrid>

      <ContentArea>
        {renderContent()}
      </ContentArea>

      <AnimatePresence>
        {showCreateModal && (
          <CreateTransactionModal
            onClose={() => {
              setShowCreateModal(false);
              setTransactionType('');
            }}
            onSuccess={() => {
              setShowCreateModal(false);
              setTransactionType('');
              // Refetch transactions
            }}
            householdMembers={householdMembers}
            initialType={transactionType}
          />
        )}
      </AnimatePresence>
    </TransactionsContainer>
  );
};