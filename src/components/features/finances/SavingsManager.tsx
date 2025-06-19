import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Avatar } from '../../ui/Avatar';
import { ProgressBar } from '../../ui/ProgressBar';
import { User, Transaction } from '../../../types/api';
import { formatCurrency } from '../../../utils/api';
import { 
  PiggyBank, 
  Target, 
  TrendingUp, 
  Plus,
  Minus,
  Settings,
  Award
} from 'lucide-react';

const SavingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SavingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SavingsTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0;
`;

const SavingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SavingsCard = styled(Card)`
  position: relative;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white;
  border: none;
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

const SavingsCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  position: relative;
  z-index: 1;
`;

const SavingsInfo = styled.div`
  flex: 1;
`;

const SavingsName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const SavingsRole = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  opacity: 0.9;
  text-transform: capitalize;
`;

const SavingsStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  position: relative;
  z-index: 1;
`;

const SavingsStat = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  backdrop-filter: blur(10px);
`;

const SavingsStatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const SavingsStatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  opacity: 0.9;
`;

const GoalSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  position: relative;
  z-index: 1;
`;

const GoalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const GoalTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const GoalAmount = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  opacity: 0.9;
`;

const ProgressSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const SavingsActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  position: relative;
  z-index: 1;
`;

const SavingsButton = styled(Button)`
  flex: 1;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
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

interface SavingsManagerProps {
  familyMembers: User[];
  transactions: Transaction[];
  onSavingsUpdate: () => void;
}

export const SavingsManager: React.FC<SavingsManagerProps> = ({
  familyMembers,
  transactions,
  onSavingsUpdate
}) => {
  const [editingGoals, setEditingGoals] = useState(false);

  // Filter to only children who should have savings accounts
  const childrenWithSavings = familyMembers.filter(member => 
    member.profile.role === 'child' || member.profile.role === 'teen'
  );

  const calculateSavingsData = (member: User) => {
    // Calculate current savings (20% of total money)
    const currentSavings = member.profile.total_money * 0.2;
    
    // Mock savings goal (this would come from user preferences)
    const savingsGoal = 100; // $100 goal
    
    // Calculate savings from transactions
    const savingsTransactions = transactions.filter(t => 
      t.user === member.id && t.transaction_type === 'savings'
    );
    
    const totalDeposited = savingsTransactions
      .filter(t => t.amount_dollars > 0)
      .reduce((sum, t) => sum + t.amount_dollars, 0);
    
    const totalWithdrawn = savingsTransactions
      .filter(t => t.amount_dollars < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount_dollars), 0);
    
    const progressPercentage = (currentSavings / savingsGoal) * 100;
    
    return {
      currentSavings,
      savingsGoal,
      totalDeposited,
      totalWithdrawn,
      progressPercentage: Math.min(progressPercentage, 100),
      isGoalReached: currentSavings >= savingsGoal
    };
  };

  const handleSavingsAction = (memberId: number, action: 'deposit' | 'withdraw', amount: number) => {
    console.log(`${action} $${amount} for member ${memberId}`);
    onSavingsUpdate();
  };

  const handleSetGoal = (memberId: number, goalAmount: number) => {
    console.log(`Set savings goal of $${goalAmount} for member ${memberId}`);
    onSavingsUpdate();
  };

  if (childrenWithSavings.length === 0) {
    return (
      <EmptyState>
        <EmptyIcon>🐷</EmptyIcon>
        <h3>No Savings Accounts</h3>
        <p>Add children to the family to set up savings accounts.</p>
      </EmptyState>
    );
  }

  return (
    <SavingsContainer>
      <SavingsHeader>
        <SavingsTitle>
          <PiggyBank size={24} />
          Family Savings
        </SavingsTitle>
        
        <Button
          variant="ghost"
          onClick={() => setEditingGoals(!editingGoals)}
        >
          <Settings size={16} />
          {editingGoals ? 'Done Editing' : 'Edit Goals'}
        </Button>
      </SavingsHeader>

      <SavingsGrid>
        {childrenWithSavings.map((member, index) => {
          const savingsData = calculateSavingsData(member);
          
          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <SavingsCard padding="lg">
                <SavingsCardHeader>
                  <Avatar
                    avatar={member.profile.avatar}
                    name={`${member.first_name} ${member.last_name}`}
                    size="lg"
                  />
                  <SavingsInfo>
                    <SavingsName>{member.first_name}'s Savings</SavingsName>
                    <SavingsRole>{member.profile.role} • Age {member.profile.age}</SavingsRole>
                  </SavingsInfo>
                  {savingsData.isGoalReached && (
                    <Award size={24} style={{ color: '#FFD700' }} />
                  )}
                </SavingsCardHeader>

                <SavingsStats>
                  <SavingsStat>
                    <SavingsStatValue>{formatCurrency(savingsData.currentSavings)}</SavingsStatValue>
                    <SavingsStatLabel>Current Savings</SavingsStatLabel>
                  </SavingsStat>
                  <SavingsStat>
                    <SavingsStatValue>{formatCurrency(savingsData.savingsGoal)}</SavingsStatValue>
                    <SavingsStatLabel>Savings Goal</SavingsStatLabel>
                  </SavingsStat>
                </SavingsStats>

                <GoalSection>
                  <GoalHeader>
                    <GoalTitle>
                      <Target size={16} />
                      Progress to Goal
                    </GoalTitle>
                    <GoalAmount>
                      {Math.round(savingsData.progressPercentage)}%
                    </GoalAmount>
                  </GoalHeader>
                  
                  <ProgressSection>
                    <ProgressBar
                      value={savingsData.progressPercentage}
                      max={100}
                      color="#FFD700"
                      height="12px"
                    />
                  </ProgressSection>
                  
                  {savingsData.isGoalReached && (
                    <div style={{ 
                      textAlign: 'center', 
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#FFD700'
                    }}>
                      🎉 Goal Reached! 🎉
                    </div>
                  )}
                </GoalSection>

                <SavingsActions>
                  <SavingsButton
                    onClick={() => handleSavingsAction(member.id, 'deposit', 5)}
                  >
                    <Plus size={14} />
                    Add $5
                  </SavingsButton>
                  <SavingsButton
                    onClick={() => handleSavingsAction(member.id, 'deposit', 10)}
                  >
                    <Plus size={14} />
                    Add $10
                  </SavingsButton>
                  <SavingsButton
                    onClick={() => handleSavingsAction(member.id, 'withdraw', 5)}
                    disabled={savingsData.currentSavings < 5}
                  >
                    <Minus size={14} />
                    Take $5
                  </SavingsButton>
                </SavingsActions>
              </SavingsCard>
            </motion.div>
          );
        })}
      </SavingsGrid>
    </SavingsContainer>
  );
};