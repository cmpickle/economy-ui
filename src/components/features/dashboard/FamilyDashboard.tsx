import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { useChores, useRewards, useEvents, useUsers, useTransactions } from '../../../hooks/useQuery';
import { Card } from '../../ui/Card';
import { Avatar } from '../../ui/Avatar';
import { ProgressBar } from '../../ui/ProgressBar';
import { formatCurrency, formatPoints, formatDate } from '../../../utils/api';
import { 
  Users, 
  DollarSign, 
  Star, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Award,
  Activity
} from 'lucide-react';

const FamilyContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const FamilyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FamilyTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0;
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

const FamilyOverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const OverviewCard = styled(Card)`
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

const OverviewIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  position: relative;
  z-index: 1;
`;

const OverviewValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  position: relative;
  z-index: 1;
`;

const OverviewLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  opacity: 0.9;
  position: relative;
  z-index: 1;
`;

const MembersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const MemberCard = styled(Card)`
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
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

const MemberStatus = styled.div<{ status: 'active' | 'inactive' }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: uppercase;
  
  ${({ status, theme }) =>
    status === 'active'
      ? `
        background-color: ${theme.colors.success}20;
        color: ${theme.colors.success};
      `
      : `
        background-color: ${theme.colors.gray[200]};
        color: ${theme.colors.gray[600]};
      `}
`;

const FinancialSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FinancialItem = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const FinancialValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const FinancialLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ActivitySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ActivityTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ActivityStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ActivityStat = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const ActivityStatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2px;
`;

const ActivityStatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProgressSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const RecentActivity = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs} 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ActivityIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
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

interface FamilyDashboardProps {
  viewMode: 'overview' | 'detailed';
  onViewModeChange: (mode: 'overview' | 'detailed') => void;
}

export const FamilyDashboard: React.FC<FamilyDashboardProps> = ({
  viewMode,
  onViewModeChange
}) => {
  const { user } = useAuth();
  const userHouseholdId = user?.households?.[0];
  
  const { data: householdMembers = [] } = useUsers(
    userHouseholdId ? { household_id: userHouseholdId } : undefined
  );
  const { data: allChores = [] } = useChores();
  const { data: allRewards = [] } = useRewards();
  const { data: allEvents = [] } = useEvents();
  const { data: allTransactions = [] } = useTransactions();

  if (!user) return null;

  // Filter out parents for family member display
  const familyMembers = householdMembers.filter(member => member.profile.role !== 'parent');

  // Calculate family overview stats
  const calculateFamilyStats = () => {
    const totalPoints = familyMembers.reduce((sum, member) => sum + member.profile.total_points, 0);
    const totalMoney = familyMembers.reduce((sum, member) => sum + member.profile.total_money, 0);
    
    const activeChores = allChores.filter(chore => chore.status === 'incomplete').length;
    const completedChores = allChores.filter(chore => chore.status === 'completed').length;
    const pendingChores = allChores.filter(chore => chore.status === 'pending').length;
    
    const upcomingEvents = allEvents.filter(event => {
      const eventDate = new Date(event.event_date);
      return eventDate > new Date();
    }).length;

    const thisWeekTransactions = allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return transactionDate >= weekAgo;
    }).length;

    return {
      totalPoints,
      totalMoney,
      activeChores,
      completedChores,
      pendingChores,
      upcomingEvents,
      thisWeekTransactions,
      totalMembers: familyMembers.length
    };
  };

  const calculateMemberStats = (memberId: number) => {
    const memberChores = allChores.filter(chore => chore.assigned_to === memberId);
    const memberTransactions = allTransactions.filter(transaction => transaction.user === memberId);
    
    const activeChores = memberChores.filter(chore => chore.status === 'incomplete').length;
    const completedChores = memberChores.filter(chore => chore.status === 'completed').length;
    const pendingChores = memberChores.filter(chore => chore.status === 'pending').length;
    
    const recentTransactions = memberTransactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return transactionDate >= weekAgo;
      })
      .slice(0, 3);

    const completionRate = memberChores.length > 0 
      ? (completedChores / memberChores.length) * 100 
      : 0;

    return {
      activeChores,
      completedChores,
      pendingChores,
      recentTransactions,
      completionRate,
      totalChores: memberChores.length
    };
  };

  const familyStats = calculateFamilyStats();

  const getActivityStatus = (member: any) => {
    const memberStats = calculateMemberStats(member.id);
    return memberStats.activeChores > 0 || memberStats.pendingChores > 0 ? 'active' : 'inactive';
  };

  const getRecentActivityItems = (memberId: number) => {
    const memberTransactions = allTransactions
      .filter(transaction => transaction.user === memberId)
      .slice(0, 3);

    return memberTransactions.map(transaction => ({
      icon: transaction.amount_points > 0 || transaction.amount_dollars > 0 ? '📈' : '📉',
      text: transaction.description,
      date: formatDate(transaction.created_at)
    }));
  };

  if (familyMembers.length === 0) {
    return (
      <EmptyState>
        <EmptyIcon>👨‍👩‍👧‍👦</EmptyIcon>
        <h3>No Family Members Found</h3>
        <p>Add family members to see their dashboard overview.</p>
      </EmptyState>
    );
  }

  return (
    <FamilyContainer>
      <FamilyHeader>
        <FamilyTitle>
          <Users size={24} />
          Family Overview
        </FamilyTitle>
        
        <ViewToggle>
          <ViewButton
            active={viewMode === 'overview'}
            onClick={() => onViewModeChange('overview')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Target size={16} />
            Overview
          </ViewButton>
          <ViewButton
            active={viewMode === 'detailed'}
            onClick={() => onViewModeChange('detailed')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Activity size={16} />
            Detailed
          </ViewButton>
        </ViewToggle>
      </FamilyHeader>

      {/* Family Overview Stats */}
      <FamilyOverviewGrid>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <OverviewCard>
            <OverviewIcon>💰</OverviewIcon>
            <OverviewValue>{formatCurrency(familyStats.totalMoney)}</OverviewValue>
            <OverviewLabel>Total Family Money</OverviewLabel>
          </OverviewCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <OverviewCard>
            <OverviewIcon>⭐</OverviewIcon>
            <OverviewValue>{familyStats.totalPoints.toLocaleString()}</OverviewValue>
            <OverviewLabel>Total Family Points</OverviewLabel>
          </OverviewCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <OverviewCard>
            <OverviewIcon>✅</OverviewIcon>
            <OverviewValue>{familyStats.activeChores}</OverviewValue>
            <OverviewLabel>Active Chores</OverviewLabel>
          </OverviewCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <OverviewCard>
            <OverviewIcon>⏳</OverviewIcon>
            <OverviewValue>{familyStats.pendingChores}</OverviewValue>
            <OverviewLabel>Pending Approval</OverviewLabel>
          </OverviewCard>
        </motion.div>
      </FamilyOverviewGrid>

      {/* Individual Family Members */}
      <MembersGrid>
        {familyMembers.map((member, index) => {
          const memberStats = calculateMemberStats(member.id);
          const recentActivity = getRecentActivityItems(member.id);
          const activityStatus = getActivityStatus(member);
          
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
                    <MemberRole>{member.profile.role} • Age {member.profile.age}</MemberRole>
                  </MemberInfo>
                  <MemberStatus status={activityStatus}>
                    {activityStatus}
                  </MemberStatus>
                </MemberHeader>

                <FinancialSection>
                  <FinancialItem>
                    <FinancialValue>
                      <Star size={16} />
                      {formatPoints(member.profile.total_points)}
                    </FinancialValue>
                    <FinancialLabel>Points</FinancialLabel>
                  </FinancialItem>
                  <FinancialItem>
                    <FinancialValue>
                      <DollarSign size={16} />
                      {formatCurrency(member.profile.total_money)}
                    </FinancialValue>
                    <FinancialLabel>Money</FinancialLabel>
                  </FinancialItem>
                </FinancialSection>

                <ActivitySection>
                  <ActivityTitle>
                    <CheckCircle size={16} />
                    Chore Activity
                  </ActivityTitle>
                  
                  <ActivityStats>
                    <ActivityStat>
                      <ActivityStatValue>{memberStats.activeChores}</ActivityStatValue>
                      <ActivityStatLabel>Active</ActivityStatLabel>
                    </ActivityStat>
                    <ActivityStat>
                      <ActivityStatValue>{memberStats.pendingChores}</ActivityStatValue>
                      <ActivityStatLabel>Pending</ActivityStatLabel>
                    </ActivityStat>
                    <ActivityStat>
                      <ActivityStatValue>{memberStats.completedChores}</ActivityStatValue>
                      <ActivityStatLabel>Completed</ActivityStatLabel>
                    </ActivityStat>
                  </ActivityStats>

                  {viewMode === 'detailed' && memberStats.totalChores > 0 && (
                    <ProgressSection>
                      <ProgressLabel>
                        <span>Completion Rate</span>
                        <span>{Math.round(memberStats.completionRate)}%</span>
                      </ProgressLabel>
                      <ProgressBar
                        value={memberStats.completionRate}
                        max={100}
                        color="#10B981"
                        height="8px"
                      />
                    </ProgressSection>
                  )}
                </ActivitySection>

                {viewMode === 'detailed' && recentActivity.length > 0 && (
                  <RecentActivity>
                    <ActivityTitle>
                      <TrendingUp size={16} />
                      Recent Activity
                    </ActivityTitle>
                    {recentActivity.map((activity, activityIndex) => (
                      <ActivityItem key={activityIndex}>
                        <ActivityIcon>{activity.icon}</ActivityIcon>
                        <span style={{ flex: 1 }}>{activity.text}</span>
                        <span>{activity.date}</span>
                      </ActivityItem>
                    ))}
                  </RecentActivity>
                )}
              </MemberCard>
            </motion.div>
          );
        })}
      </MembersGrid>
    </FamilyContainer>
  );
};