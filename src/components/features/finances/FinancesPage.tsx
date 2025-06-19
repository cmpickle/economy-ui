import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { useUsers, useTransactions } from '../../../hooks/useQuery';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { AccountCard } from './AccountCard';
import { TransactionEditor } from './TransactionEditor';
import { SavingsManager } from './SavingsManager';
import { CreateTransactionModal } from '../transactions/CreateTransactionModal';
import { 
  DollarSign, 
  Plus, 
  Edit3, 
  PiggyBank, 
  TrendingUp, 
  Users,
  Calculator,
  History,
  Settings
} from 'lucide-react';

const FinancesContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1600px;
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

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SummaryCard = styled(Card)`
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

const SummaryIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  position: relative;
  z-index: 1;
`;

const SummaryValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  position: relative;
  z-index: 1;
`;

const SummaryLabel = styled.div`
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

const AccountsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
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

type ViewMode = 'accounts' | 'transactions' | 'savings';

export const FinancesPage: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('accounts');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const userHouseholdId = user?.households?.[0];
  const { data: householdMembers = [] } = useUsers(
    userHouseholdId ? { household_id: userHouseholdId } : undefined
  );
  const { data: transactions = [] } = useTransactions();

  if (!user) return null;

  const isParent = user.profile.role === 'parent';

  // Redirect non-parents
  if (!isParent) {
    return (
      <FinancesContainer>
        <EmptyState>
          <EmptyIcon>🔒</EmptyIcon>
          <h3>Access Restricted</h3>
          <p>Only parents can access the family finances page.</p>
        </EmptyState>
      </FinancesContainer>
    );
  }

  // Filter family members (exclude parents)
  const familyMembers = householdMembers.filter(member => member.profile.role !== 'parent');

  // Calculate summary statistics
  const calculateSummary = () => {
    const totalFamilyMoney = familyMembers.reduce((sum, member) => sum + member.profile.total_money, 0);
    const totalFamilyPoints = familyMembers.reduce((sum, member) => sum + member.profile.total_points, 0);
    
    const thisMonthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.created_at);
      const now = new Date();
      return transactionDate.getMonth() === now.getMonth() && 
             transactionDate.getFullYear() === now.getFullYear();
    });

    const monthlyIncome = thisMonthTransactions
      .filter(t => t.amount_dollars > 0)
      .reduce((sum, t) => sum + t.amount_dollars, 0);

    const monthlyExpenses = thisMonthTransactions
      .filter(t => t.amount_dollars < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount_dollars), 0);

    return {
      totalFamilyMoney,
      totalFamilyPoints,
      monthlyIncome,
      monthlyExpenses,
      netChange: monthlyIncome - monthlyExpenses,
      totalAccounts: familyMembers.length
    };
  };

  const summary = calculateSummary();

  const renderContent = () => {
    switch (viewMode) {
      case 'accounts':
        return (
          <div>
            <SectionTitle>
              <Users size={24} />
              Family Accounts
            </SectionTitle>
            <AccountsGrid>
              {familyMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <AccountCard
                    member={member}
                    transactions={transactions.filter(t => t.user === member.id)}
                    editMode={editMode}
                    onTransactionUpdate={() => {
                      // Refetch data
                    }}
                  />
                </motion.div>
              ))}
            </AccountsGrid>
          </div>
        );

      case 'transactions':
        return (
          <TransactionEditor
            transactions={transactions}
            householdMembers={householdMembers}
            onTransactionUpdate={() => {
              // Refetch data
            }}
          />
        );

      case 'savings':
        return (
          <SavingsManager
            familyMembers={familyMembers}
            transactions={transactions}
            onSavingsUpdate={() => {
              // Refetch data
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <FinancesContainer>
      <Header>
        <Title>
          <DollarSign size={32} />
          Family Finances
        </Title>
        
        <Controls>
          <ViewToggle>
            <ViewButton
              active={viewMode === 'accounts'}
              onClick={() => setViewMode('accounts')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users size={16} />
              Accounts
            </ViewButton>
            <ViewButton
              active={viewMode === 'transactions'}
              onClick={() => setViewMode('transactions')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <History size={16} />
              Transactions
            </ViewButton>
            <ViewButton
              active={viewMode === 'savings'}
              onClick={() => setViewMode('savings')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PiggyBank size={16} />
              Savings
            </ViewButton>
          </ViewToggle>
          
          {viewMode === 'accounts' && (
            <Button
              variant={editMode ? 'danger' : 'ghost'}
              onClick={() => setEditMode(!editMode)}
            >
              <Edit3 size={16} />
              {editMode ? 'Exit Edit' : 'Edit Mode'}
            </Button>
          )}
          
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            New Transaction
          </Button>
        </Controls>
      </Header>

      <SummaryGrid>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SummaryCard>
            <SummaryIcon>💰</SummaryIcon>
            <SummaryValue>${summary.totalFamilyMoney.toFixed(2)}</SummaryValue>
            <SummaryLabel>Total Family Money</SummaryLabel>
          </SummaryCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SummaryCard>
            <SummaryIcon>⭐</SummaryIcon>
            <SummaryValue>{summary.totalFamilyPoints.toLocaleString()}</SummaryValue>
            <SummaryLabel>Total Family Points</SummaryLabel>
          </SummaryCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SummaryCard>
            <SummaryIcon>📈</SummaryIcon>
            <SummaryValue>${summary.monthlyIncome.toFixed(2)}</SummaryValue>
            <SummaryLabel>Monthly Income</SummaryLabel>
          </SummaryCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SummaryCard>
            <SummaryIcon>📊</SummaryIcon>
            <SummaryValue>
              {summary.netChange >= 0 ? '+' : ''}${summary.netChange.toFixed(2)}
            </SummaryValue>
            <SummaryLabel>Monthly Net Change</SummaryLabel>
          </SummaryCard>
        </motion.div>
      </SummaryGrid>

      <ContentArea>
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </ContentArea>

      <AnimatePresence>
        {showCreateModal && (
          <CreateTransactionModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              // Refetch data
            }}
            householdMembers={householdMembers}
          />
        )}
      </AnimatePresence>
    </FinancesContainer>
  );
};