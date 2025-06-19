import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Avatar } from '../../ui/Avatar';
import { User, Transaction } from '../../../types/api';
import { formatCurrency, formatPoints, formatDate } from '../../../utils/api';
import { 
  DollarSign, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Edit3, 
  Plus,
  Minus,
  Calendar,
  PiggyBank
} from 'lucide-react';

const AccountContainer = styled(Card)`
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const AccountHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const AccountInfo = styled.div`
  flex: 1;
`;

const AccountName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const AccountRole = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: capitalize;
`;

const BalanceSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const BalanceCard = styled.div<{ type: 'money' | 'points' | 'savings' }>`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  text-align: center;
  position: relative;
  
  ${({ type, theme }) => {
    switch (type) {
      case 'money':
        return `
          background: linear-gradient(135deg, #10B981, #059669);
          color: white;
        `;
      case 'points':
        return `
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          color: white;
        `;
      case 'savings':
        return `
          background: linear-gradient(135deg, #8B5CF6, #7C3AED);
          color: white;
        `;
      default:
        return `
          background-color: ${theme.colors.surfaceLight};
          color: ${theme.colors.text};
        `;
    }
  }}
`;

const BalanceIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const BalanceValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const BalanceLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  opacity: 0.9;
`;

const TransactionHistory = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const HistoryTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  max-height: 200px;
  overflow-y: auto;
`;

const TransactionItem = styled(motion.div)<{ isPositive: boolean }>`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 4px solid ${({ isPositive, theme }) => 
    isPositive ? theme.colors.success : theme.colors.error};
`;

const TransactionInfo = styled.div`
  flex: 1;
`;

const TransactionDescription = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2px;
`;

const TransactionDate = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TransactionAmount = styled.div<{ isPositive: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ isPositive, theme }) => 
    isPositive ? theme.colors.success : theme.colors.error};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EditControls = styled(motion.div)`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const QuickActionButton = styled(Button)`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const EmptyTransactions = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
`;

interface AccountCardProps {
  member: User;
  transactions: Transaction[];
  editMode: boolean;
  onTransactionUpdate: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  member,
  transactions,
  editMode,
  onTransactionUpdate
}) => {
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // Calculate savings (for children, this could be a percentage of their money)
  const savingsAmount = member.profile.role === 'child' 
    ? member.profile.total_money * 0.2 // 20% goes to savings
    : 0;

  const allowanceAmount = member.profile.total_money - savingsAmount;

  // Get recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, showAllTransactions ? transactions.length : 5);

  const handleQuickTransaction = (type: 'add' | 'subtract', amount: number) => {
    // This would trigger a quick transaction creation
    console.log(`Quick ${type} $${amount} for ${member.first_name}`);
    onTransactionUpdate();
  };

  return (
    <AccountContainer padding="lg">
      <AccountHeader>
        <Avatar
          avatar={member.profile.avatar}
          name={`${member.first_name} ${member.last_name}`}
          size="lg"
        />
        <AccountInfo>
          <AccountName>{member.first_name} {member.last_name}</AccountName>
          <AccountRole>{member.profile.role} • Age {member.profile.age}</AccountRole>
        </AccountInfo>
      </AccountHeader>

      <BalanceSection>
        <BalanceCard type="money">
          <BalanceIcon>💰</BalanceIcon>
          <BalanceValue>{formatCurrency(allowanceAmount)}</BalanceValue>
          <BalanceLabel>Allowance</BalanceLabel>
        </BalanceCard>

        <BalanceCard type="points">
          <BalanceIcon>⭐</BalanceIcon>
          <BalanceValue>{member.profile.total_points.toLocaleString()}</BalanceValue>
          <BalanceLabel>Points</BalanceLabel>
        </BalanceCard>
      </BalanceSection>

      {member.profile.role === 'child' && savingsAmount > 0 && (
        <BalanceSection style={{ gridTemplateColumns: '1fr' }}>
          <BalanceCard type="savings">
            <BalanceIcon>🐷</BalanceIcon>
            <BalanceValue>{formatCurrency(savingsAmount)}</BalanceValue>
            <BalanceLabel>Savings</BalanceLabel>
          </BalanceCard>
        </BalanceSection>
      )}

      <TransactionHistory>
        <HistoryTitle>
          <Calendar size={16} />
          Recent Activity
          {transactions.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllTransactions(!showAllTransactions)}
              style={{ marginLeft: 'auto', fontSize: '0.75rem' }}
            >
              {showAllTransactions ? 'Show Less' : `View All (${transactions.length})`}
            </Button>
          )}
        </HistoryTitle>

        <TransactionList>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction, index) => {
              const isPositive = transaction.amount_dollars > 0 || transaction.amount_points > 0;
              
              return (
                <TransactionItem
                  key={transaction.id}
                  isPositive={isPositive}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <TransactionInfo>
                    <TransactionDescription>{transaction.description}</TransactionDescription>
                    <TransactionDate>{formatDate(transaction.created_at)}</TransactionDate>
                  </TransactionInfo>
                  
                  <TransactionAmount isPositive={isPositive}>
                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {transaction.amount_dollars !== 0 && (
                      <span>
                        {isPositive ? '+' : ''}{formatCurrency(transaction.amount_dollars)}
                      </span>
                    )}
                    {transaction.amount_points !== 0 && (
                      <span>
                        {isPositive ? '+' : ''}{formatPoints(transaction.amount_points)}
                      </span>
                    )}
                  </TransactionAmount>
                </TransactionItem>
              );
            })
          ) : (
            <EmptyTransactions>
              No transactions yet
            </EmptyTransactions>
          )}
        </TransactionList>
      </TransactionHistory>

      <AnimatePresence>
        {editMode && (
          <EditControls
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <QuickActionButton
              variant="ghost"
              onClick={() => handleQuickTransaction('add', 5)}
            >
              <Plus size={14} />
              +$5
            </QuickActionButton>
            <QuickActionButton
              variant="ghost"
              onClick={() => handleQuickTransaction('add', 10)}
            >
              <Plus size={14} />
              +$10
            </QuickActionButton>
            <QuickActionButton
              variant="ghost"
              onClick={() => handleQuickTransaction('subtract', 5)}
            >
              <Minus size={14} />
              -$5
            </QuickActionButton>
            <QuickActionButton
              variant="ghost"
              onClick={() => handleQuickTransaction('subtract', 10)}
            >
              <Minus size={14} />
              -$10
            </QuickActionButton>
          </EditControls>
        )}
      </AnimatePresence>
    </AccountContainer>
  );
};