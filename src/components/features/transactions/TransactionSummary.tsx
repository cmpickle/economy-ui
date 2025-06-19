import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Avatar } from '../../ui/Avatar';
import { Transaction, User } from '../../../types/api';
import { formatCurrency, formatPoints } from '../../../utils/api';
import { TrendingUp, Calendar, Users, DollarSign, Star, BarChart3 } from 'lucide-react';

interface TransactionSummaryProps {
  transactions: Transaction[];
  householdMembers: User[];
}

const SummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SummaryTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0;
`;

const PeriodSelector = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
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

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SummaryCard = styled(Card)`
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

const SummaryCardTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  position: relative;
  z-index: 1;
`;

const SummaryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  position: relative;
  z-index: 1;
`;

const StatItem = styled.div`
  text-align: center;
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

const MemberSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const MemberCard = styled(Card)`
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const MemberHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const MemberInfo = styled.div`
  flex: 1;
`;

const MemberName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const MemberRole = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: capitalize;
`;

const MemberStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

const MemberStatItem = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const MemberStatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const MemberStatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TransactionTypeBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const TypeBreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const TypeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TypeIcon = styled.div`
  font-size: 1.25rem;
`;

const TypeLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const TypeCount = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'bonus': return '🎁';
    case 'allowance': return '💰';
    case 'penalty': return '⚠️';
    case 'gift': return '🎉';
    case 'manual_adjustment': return '⚙️';
    case 'chore_completion': return '✅';
    case 'reward_redemption': return '🏆';
    default: return '💳';
  }
};

const getTransactionTypeLabel = (type: string) => {
  switch (type) {
    case 'chore_completion': return 'Chore Completion';
    case 'reward_redemption': return 'Reward Redemption';
    case 'manual_adjustment': return 'Manual Adjustment';
    default: return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

export const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  transactions,
  householdMembers
}) => {
  const [period, setPeriod] = useState('month');

  const filterTransactionsByPeriod = (transactions: Transaction[], period: string) => {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return transactions;
    }

    return transactions.filter(t => new Date(t.created_at) >= startDate);
  };

  const filteredTransactions = filterTransactionsByPeriod(transactions, period);

  const calculateOverallStats = () => {
    const totalTransactions = filteredTransactions.length;
    const totalPointsDistributed = filteredTransactions
      .filter(t => t.amount_points > 0)
      .reduce((sum, t) => sum + t.amount_points, 0);
    const totalDollarsDistributed = filteredTransactions
      .filter(t => t.amount_dollars > 0)
      .reduce((sum, t) => sum + t.amount_dollars, 0);
    const avgTransactionValue = totalTransactions > 0 
      ? (totalPointsDistributed + totalDollarsDistributed * 10) / totalTransactions 
      : 0;

    return {
      totalTransactions,
      totalPointsDistributed,
      totalDollarsDistributed,
      avgTransactionValue
    };
  };

  const calculateMemberStats = (memberId: number) => {
    const memberTransactions = filteredTransactions.filter(t => t.user === memberId);
    
    const totalReceived = memberTransactions.length;
    const pointsReceived = memberTransactions.reduce((sum, t) => sum + Math.max(0, t.amount_points), 0);
    const dollarsReceived = memberTransactions.reduce((sum, t) => sum + Math.max(0, t.amount_dollars), 0);
    const pointsDeducted = memberTransactions.reduce((sum, t) => sum + Math.abs(Math.min(0, t.amount_points)), 0);
    const dollarsDeducted = memberTransactions.reduce((sum, t) => sum + Math.abs(Math.min(0, t.amount_dollars)), 0);

    const typeBreakdown = memberTransactions.reduce((acc, t) => {
      acc[t.transaction_type] = (acc[t.transaction_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalReceived,
      pointsReceived,
      dollarsReceived,
      pointsDeducted,
      dollarsDeducted,
      typeBreakdown
    };
  };

  const overallStats = calculateOverallStats();
  const eligibleMembers = householdMembers.filter(member => member.profile.role !== 'parent');

  return (
    <SummaryContainer>
      <Card padding="lg">
        <SummaryHeader>
          <SummaryTitle>
            <BarChart3 size={24} />
            Transaction Summary
          </SummaryTitle>
          
          <PeriodSelector
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </PeriodSelector>
        </SummaryHeader>

        <SummaryGrid>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SummaryCard padding="lg">
              <SummaryCardTitle>
                <Calendar size={20} />
                Overall Activity
              </SummaryCardTitle>
              <SummaryStats>
                <StatItem>
                  <StatValue>{overallStats.totalTransactions}</StatValue>
                  <StatLabel>Total Transactions</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{Math.round(overallStats.avgTransactionValue)}</StatValue>
                  <StatLabel>Avg Value (pts)</StatLabel>
                </StatItem>
              </SummaryStats>
            </SummaryCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <SummaryCard padding="lg">
              <SummaryCardTitle>
                <Star size={20} />
                Points Distributed
              </SummaryCardTitle>
              <SummaryStats>
                <StatItem>
                  <StatValue>{overallStats.totalPointsDistributed.toLocaleString()}</StatValue>
                  <StatLabel>Total Points</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>
                    {overallStats.totalTransactions > 0 
                      ? Math.round(overallStats.totalPointsDistributed / overallStats.totalTransactions)
                      : 0
                    }
                  </StatValue>
                  <StatLabel>Avg per Transaction</StatLabel>
                </StatItem>
              </SummaryStats>
            </SummaryCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SummaryCard padding="lg">
              <SummaryCardTitle>
                <DollarSign size={20} />
                Money Distributed
              </SummaryCardTitle>
              <SummaryStats>
                <StatItem>
                  <StatValue>${Number(overallStats.totalDollarsDistributed).toFixed(2)}</StatValue>
                  <StatLabel>Total Money</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>
                    ${overallStats.totalTransactions > 0 
                      ? Number(overallStats.totalDollarsDistributed / overallStats.totalTransactions).toFixed(2)
                      : '0.00'
                    }
                  </StatValue>
                  <StatLabel>Avg per Transaction</StatLabel>
                </StatItem>
              </SummaryStats>
            </SummaryCard>
          </motion.div>
        </SummaryGrid>
      </Card>

      <Card padding="lg">
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Users size={20} />
          Member Breakdown
        </h3>
        
        <MemberSummaryGrid>
          {eligibleMembers.map((member, index) => {
            const stats = calculateMemberStats(member.id);
            
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <MemberCard padding="lg">
                  <MemberHeader>
                    <Avatar
                      avatar={member.profile.avatar}
                      name={`${member.first_name} ${member.last_name}`}
                      size="lg"
                    />
                    <MemberInfo>
                      <MemberName>{member.first_name} {member.last_name}</MemberName>
                      <MemberRole>{member.profile.role}</MemberRole>
                    </MemberInfo>
                  </MemberHeader>

                  <MemberStats>
                    <MemberStatItem>
                      <MemberStatValue>{stats.totalReceived}</MemberStatValue>
                      <MemberStatLabel>Transactions</MemberStatLabel>
                    </MemberStatItem>
                    <MemberStatItem>
                      <MemberStatValue>+{formatPoints(stats.pointsReceived)}</MemberStatValue>
                      <MemberStatLabel>Points Earned</MemberStatLabel>
                    </MemberStatItem>
                    <MemberStatItem>
                      <MemberStatValue>+{formatCurrency(stats.dollarsReceived)}</MemberStatValue>
                      <MemberStatLabel>Money Earned</MemberStatLabel>
                    </MemberStatItem>
                    <MemberStatItem>
                      <MemberStatValue>
                        -{formatPoints(stats.pointsDeducted)} / -{formatCurrency(stats.dollarsDeducted)}
                      </MemberStatValue>
                      <MemberStatLabel>Deductions</MemberStatLabel>
                    </MemberStatItem>
                  </MemberStats>

                  {Object.keys(stats.typeBreakdown).length > 0 && (
                    <TransactionTypeBreakdown>
                      <h4 style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        color: '#374151',
                        margin: '0 0 0.5rem 0'
                      }}>
                        Transaction Types
                      </h4>
                      {Object.entries(stats.typeBreakdown).map(([type, count]) => (
                        <TypeBreakdownItem key={type}>
                          <TypeInfo>
                            <TypeIcon>{getTransactionIcon(type)}</TypeIcon>
                            <TypeLabel>{getTransactionTypeLabel(type)}</TypeLabel>
                          </TypeInfo>
                          <TypeCount>{count} transaction{count !== 1 ? 's' : ''}</TypeCount>
                        </TypeBreakdownItem>
                      ))}
                    </TransactionTypeBreakdown>
                  )}
                </MemberCard>
              </motion.div>
            );
          })}
        </MemberSummaryGrid>
      </Card>
    </SummaryContainer>
  );
};