import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { useChores, useRewards, useEvents, useUserSummary } from '../../../hooks/useQuery';
import { Card } from '../../ui/Card';
import { ProgressBar } from '../../ui/ProgressBar';
import { CountdownTimer } from '../../ui/CountdownTimer';
import { FamilyDashboard } from './FamilyDashboard';
import { formatCurrency, formatPoints } from '../../../utils/api';
import { Users, User, Target, Activity } from 'lucide-react';

const DashboardContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
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

const WelcomeSection = styled(motion.div)`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const WelcomeTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const WelcomeSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatCard = styled(Card)`
  text-align: center;
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

const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SectionCard = styled(Card)`
  height: fit-content;
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

const ChoreItem = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ChoreInfo = styled.div`
  flex: 1;
`;

const ChoreName = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2px;
`;

const ChoreDetails = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ChorePoints = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.primary};
`;

const RewardItem = styled(motion.div)<{ canAfford: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  opacity: ${({ canAfford }) => (canAfford ? 1 : 0.6)};
  border: 2px solid ${({ canAfford, theme }) => 
    canAfford ? theme.colors.success : 'transparent'};
`;

const EventItem = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
`;

const EventTitle = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

type DashboardView = 'personal' | 'family';
type FamilyViewMode = 'overview' | 'detailed';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardView, setDashboardView] = useState<DashboardView>('personal');
  const [familyViewMode, setFamilyViewMode] = useState<FamilyViewMode>('overview');
  
  const { data: chores = [] } = useChores({ assigned_to: user?.id, status: 'incomplete' });
  const { data: rewards = [] } = useRewards({ available_only: false });
  const { data: events = [] } = useEvents({ upcoming_only: true });
  const { data: userSummary } = useUserSummary();

  if (!user) return null;

  const isParent = user.profile.role === 'parent';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const affordableRewards = rewards.filter(reward => reward.user_can_afford);
  const upcomingChores = chores.slice(0, 5);
  const upcomingEvents = events.slice(0, 3);

  const renderPersonalDashboard = () => (
    <>
      <WelcomeSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <WelcomeTitle>
          {getGreeting()}, {user.first_name}! 👋
        </WelcomeTitle>
        <WelcomeSubtitle>
          Ready to earn some points today?
        </WelcomeSubtitle>
      </WelcomeSection>

      <StatsGrid>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <StatCard>
            <StatValue>{formatPoints(user.profile.total_points)}</StatValue>
            <StatLabel>Total Points</StatLabel>
          </StatCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <StatCard>
            <StatValue>{formatCurrency(user.profile.total_money)}</StatValue>
            <StatLabel>Total Earnings</StatLabel>
          </StatCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <StatCard>
            <StatValue>{chores.length}</StatValue>
            <StatLabel>Pending Chores</StatLabel>
          </StatCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <StatCard>
            <StatValue>{affordableRewards.length}</StatValue>
            <StatLabel>Available Rewards</StatLabel>
          </StatCard>
        </motion.div>
      </StatsGrid>

      <SectionsGrid>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <SectionCard>
            <SectionTitle>
              ✅ Upcoming Chores
            </SectionTitle>
            {upcomingChores.length > 0 ? (
              upcomingChores.map((chore, index) => (
                <ChoreItem
                  key={chore.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ChoreInfo>
                    <ChoreName>{chore.name}</ChoreName>
                    <ChoreDetails>Due: {new Date(chore.due_date).toLocaleDateString()}</ChoreDetails>
                  </ChoreInfo>
                  <ChorePoints>{formatPoints(chore.point_value)}</ChorePoints>
                </ChoreItem>
              ))
            ) : (
              <p style={{ color: '#6B7280', textAlign: 'center', padding: '20px' }}>
                No pending chores! 🎉
              </p>
            )}
          </SectionCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <SectionCard>
            <SectionTitle>
              🎁 Available Rewards
            </SectionTitle>
            {rewards.slice(0, 5).map((reward, index) => (
              <RewardItem
                key={reward.id}
                canAfford={reward.user_can_afford}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ChoreInfo>
                  <ChoreName>{reward.title}</ChoreName>
                  <ChoreDetails>
                    {reward.cost_points && formatPoints(reward.cost_points)}
                    {reward.cost_dollars && formatCurrency(reward.cost_dollars)}
                  </ChoreDetails>
                </ChoreInfo>
                {reward.user_can_afford && <span>✅</span>}
              </RewardItem>
            ))}
          </SectionCard>
        </motion.div>

        {upcomingEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <SectionCard>
              <SectionTitle>
                📅 Upcoming Events
              </SectionTitle>
              {upcomingEvents.map((event, index) => (
                <EventItem key={event.id}>
                  <EventTitle>{event.title}</EventTitle>
                  <CountdownTimer
                    targetDate={event.event_date}
                    showProgress={true}
                  />
                </EventItem>
              ))}
            </SectionCard>
          </motion.div>
        )}
      </SectionsGrid>
    </>
  );

  return (
    <DashboardContainer>
      {isParent && (
        <DashboardHeader>
          <WelcomeTitle style={{ margin: 0 }}>
            Dashboard
          </WelcomeTitle>
          
          <ViewToggle>
            <ViewButton
              active={dashboardView === 'personal'}
              onClick={() => setDashboardView('personal')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <User size={16} />
              Personal
            </ViewButton>
            <ViewButton
              active={dashboardView === 'family'}
              onClick={() => setDashboardView('family')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users size={16} />
              Family
            </ViewButton>
          </ViewToggle>
        </DashboardHeader>
      )}

      <AnimatePresence mode="wait">
        {dashboardView === 'family' && isParent ? (
          <motion.div
            key="family-dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FamilyDashboard 
              viewMode={familyViewMode}
              onViewModeChange={setFamilyViewMode}
            />
          </motion.div>
        ) : (
          <motion.div
            key="personal-dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderPersonalDashboard()}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardContainer>
  );
};