import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { useRewards, useUsers } from '../../../hooks/useQuery';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { RewardCard } from './RewardCard';
import { CreateRewardModal } from './CreateRewardModal';
import { RewardRequestModal } from './RewardRequestModal';
import { ShoppingCart } from './ShoppingCart';
import { RewardShop } from './RewardShop';
import { Gift, Plus, ShoppingBag, Lightbulb, Store, List } from 'lucide-react';

const RewardsContainer = styled.div`
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

const CartIndicator = styled(motion.div)`
  position: relative;
  cursor: pointer;
`;

const CartBadge = styled(motion.div)`
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #EF4444, #DC2626);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
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

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

type ViewMode = 'shop' | 'manage';

export const RewardsPage: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('shop');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  
  const userHouseholdId = user?.households?.[0];
  const { data: rewards = [], isLoading } = useRewards();
  const { data: householdMembers = [] } = useUsers(
    userHouseholdId ? { household_id: userHouseholdId } : undefined
  );

  if (!user) return null;

  const isParent = user.profile.role === 'parent';

  // Calculate stats
  const calculateStats = () => {
    const totalRewards = rewards.length;
    const affordableRewards = rewards.filter(reward => reward.user_can_afford).length;
    const totalPointsCost = rewards.reduce((sum, reward) => sum + (reward.cost_points || 0), 0);
    const totalMoneyCost = rewards.reduce((sum, reward) => sum + (reward.cost_dollars || 0), 0);

    return {
      totalRewards,
      affordableRewards,
      totalPointsCost,
      totalMoneyCost,
      cartItems: cart.length
    };
  };

  const stats = calculateStats();

  const addToCart = (reward: any) => {
    if (!cart.find(item => item.id === reward.id)) {
      setCart(prev => [...prev, { ...reward, quantity: 1 }]);
    }
  };

  const removeFromCart = (rewardId: number) => {
    setCart(prev => prev.filter(item => item.id !== rewardId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handlePurchase = async (cartItems: any[]) => {
    try {
      // Process purchase for each item
      for (const item of cartItems) {
        console.log('Purchasing reward:', item);
        // API call would go here
      }
      clearCart();
      setShowCart(false);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'shop':
        return (
          <RewardShop
            rewards={rewards}
            user={user}
            cart={cart}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
          />
        );
      case 'manage':
        return (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <List size={24} />
                Manage Rewards
              </h2>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {rewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <RewardCard
                    reward={reward}
                    user={user}
                    isInCart={cart.some(item => item.id === reward.id)}
                    onAddToCart={() => addToCart(reward)}
                    onRemoveFromCart={() => removeFromCart(reward.id)}
                    showManageControls={true}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <RewardsContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          fontSize: '18px'
        }}>
          Loading rewards...
        </div>
      </RewardsContainer>
    );
  }

  return (
    <RewardsContainer>
      <Header>
        <Title>
          <Gift size={32} />
          Family Rewards
        </Title>
        
        <Controls>
          <ViewToggle>
            <ViewButton
              active={viewMode === 'shop'}
              onClick={() => setViewMode('shop')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Store size={16} />
              Shop
            </ViewButton>
            {isParent && (
              <ViewButton
                active={viewMode === 'manage'}
                onClick={() => setViewMode('manage')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <List size={16} />
                Manage
              </ViewButton>
            )}
          </ViewToggle>
          
          {!isParent && (
            <Button
              variant="ghost"
              onClick={() => setShowRequestModal(true)}
            >
              <Lightbulb size={16} />
              Request Reward
            </Button>
          )}
          
          {viewMode === 'shop' && (
            <CartIndicator onClick={() => setShowCart(true)}>
              <Button variant="ghost">
                <ShoppingBag size={20} />
              </Button>
              <AnimatePresence>
                {cart.length > 0 && (
                  <CartBadge
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {cart.length}
                  </CartBadge>
                )}
              </AnimatePresence>
            </CartIndicator>
          )}
          
          {isParent && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              Create Reward
            </Button>
          )}
        </Controls>
      </Header>

      <StatsGrid>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatCard>
            <StatIcon>🎁</StatIcon>
            <StatValue>{stats.totalRewards}</StatValue>
            <StatLabel>Total Rewards</StatLabel>
          </StatCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatCard>
            <StatIcon>✅</StatIcon>
            <StatValue>{stats.affordableRewards}</StatValue>
            <StatLabel>You Can Afford</StatLabel>
          </StatCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatCard>
            <StatIcon>⭐</StatIcon>
            <StatValue>{user.profile.total_points.toLocaleString()}</StatValue>
            <StatLabel>Your Points</StatLabel>
          </StatCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatCard>
            <StatIcon>💰</StatIcon>
            <StatValue>${Number(user.profile.total_money).toFixed(2)}</StatValue>
            <StatLabel>Your Money</StatLabel>
          </StatCard>
        </motion.div>
      </StatsGrid>

      <ContentArea>
        {renderContent()}
      </ContentArea>

      <AnimatePresence>
        {showCreateModal && (
          <CreateRewardModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              // Refetch rewards
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRequestModal && (
          <RewardRequestModal
            onClose={() => setShowRequestModal(false)}
            onSuccess={() => {
              setShowRequestModal(false);
              // Handle request submission
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCart && (
          <ShoppingCart
            cart={cart}
            user={user}
            onClose={() => setShowCart(false)}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            onPurchase={handlePurchase}
          />
        )}
      </AnimatePresence>
    </RewardsContainer>
  );
};