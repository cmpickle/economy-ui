import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { RewardCard } from './RewardCard';
import { Reward, User } from '../../../types/api';
import { Filter, Search, Star, DollarSign, Grid, List } from 'lucide-react';

const ShopContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ShopHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ShopTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0;
`;

const ShopControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  width: 250px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const FilterSelect = styled.select`
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

const ViewToggle = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 2px;
`;

const ViewButton = styled(motion.button)<{ active: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ active, theme }) => 
    active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => 
    active ? theme.colors.white : theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RewardsGrid = styled.div<{ viewMode: 'grid' | 'list' }>`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  
  ${({ viewMode }) => 
    viewMode === 'grid' 
      ? 'grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));'
      : 'grid-template-columns: 1fr;'
  }
`;

const FilterSummary = styled(Card)`
  padding: ${({ theme }) => theme.spacing.md};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FilterInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FilterStats = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: center;
`;

const FilterStat = styled.div`
  text-align: center;
`;

const FilterStatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: 2px;
`;

const FilterStatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

interface RewardShopProps {
  rewards: Reward[];
  user: User;
  cart: any[];
  onAddToCart: (reward: Reward) => void;
  onRemoveFromCart: (rewardId: number) => void;
}

export const RewardShop: React.FC<RewardShopProps> = ({
  rewards,
  user,
  cart,
  onAddToCart,
  onRemoveFromCart
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [affordabilityFilter, setAffordabilityFilter] = useState('all');
  const [costFilter, setCostFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Calculate cart total to determine what user can still afford
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => ({
      points: total.points + (item.cost_points || 0),
      money: total.money + (item.cost_dollars || 0)
    }), { points: 0, money: 0 });
  }, [cart]);

  const remainingBudget = {
    points: user.profile.total_points - cartTotal.points,
    money: user.profile.total_money - cartTotal.money
  };

  // Filter and sort rewards
  const filteredRewards = useMemo(() => {
    return rewards.filter(reward => {
      // Only show active rewards
      if (!reward.is_active) return false;

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!reward.title.toLowerCase().includes(searchLower) &&
            !reward.description?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Affordability filter
      if (affordabilityFilter !== 'all') {
        const canAffordPoints = !reward.cost_points || remainingBudget.points >= reward.cost_points;
        const canAffordMoney = !reward.cost_dollars || remainingBudget.money >= reward.cost_dollars;
        const canAfford = canAffordPoints && canAffordMoney;
        
        if (affordabilityFilter === 'affordable' && !canAfford) return false;
        if (affordabilityFilter === 'unaffordable' && canAfford) return false;
      }

      // Cost filter
      if (costFilter !== 'all') {
        if (costFilter === 'points' && !reward.cost_points) return false;
        if (costFilter === 'money' && !reward.cost_dollars) return false;
        if (costFilter === 'both' && (!reward.cost_points || !reward.cost_dollars)) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by affordability first, then by cost
      const aCanAfford = (!a.cost_points || remainingBudget.points >= a.cost_points) &&
                        (!a.cost_dollars || remainingBudget.money >= a.cost_dollars);
      const bCanAfford = (!b.cost_points || remainingBudget.points >= b.cost_points) &&
                        (!b.cost_dollars || remainingBudget.money >= b.cost_dollars);
      
      if (aCanAfford && !bCanAfford) return -1;
      if (!aCanAfford && bCanAfford) return 1;
      
      // Then sort by total cost (points + money converted to points)
      const aCost = (a.cost_points || 0) + (a.cost_dollars || 0) * 10;
      const bCost = (b.cost_points || 0) + (b.cost_dollars || 0) * 10;
      return aCost - bCost;
    });
  }, [rewards, searchTerm, affordabilityFilter, costFilter, remainingBudget]);

  // Calculate stats for filtered rewards
  const stats = useMemo(() => {
    const affordable = filteredRewards.filter(reward => {
      const canAffordPoints = !reward.cost_points || remainingBudget.points >= reward.cost_points;
      const canAffordMoney = !reward.cost_dollars || remainingBudget.money >= reward.cost_dollars;
      return canAffordPoints && canAffordMoney;
    }).length;

    return {
      total: filteredRewards.length,
      affordable,
      inCart: cart.length
    };
  }, [filteredRewards, remainingBudget, cart]);

  return (
    <ShopContainer>
      <ShopHeader>
        <ShopTitle>
          🛍️ Reward Shop
        </ShopTitle>
        
        <ShopControls>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={16} />
            <SearchInput
              type="text"
              placeholder="Search rewards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <FilterSelect
            value={affordabilityFilter}
            onChange={(e) => setAffordabilityFilter(e.target.value)}
          >
            <option value="all">All Rewards</option>
            <option value="affordable">Can Afford</option>
            <option value="unaffordable">Can't Afford</option>
          </FilterSelect>
          
          <FilterSelect
            value={costFilter}
            onChange={(e) => setCostFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="points">Points Only</option>
            <option value="money">Money Only</option>
            <option value="both">Points & Money</option>
          </FilterSelect>
          
          <ViewToggle>
            <ViewButton
              active={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Grid size={16} />
            </ViewButton>
            <ViewButton
              active={viewMode === 'list'}
              onClick={() => setViewMode('list')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <List size={16} />
            </ViewButton>
          </ViewToggle>
        </ShopControls>
      </ShopHeader>

      <FilterSummary>
        <FilterInfo>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
              Shopping Summary
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
              {stats.total} rewards found • {stats.affordable} you can afford
            </p>
          </div>
          
          <FilterStats>
            <FilterStat>
              <FilterStatValue>⭐ {remainingBudget.points.toLocaleString()}</FilterStatValue>
              <FilterStatLabel>Available Points</FilterStatLabel>
            </FilterStat>
            <FilterStat>
              <FilterStatValue>💰 ${remainingBudget.money.toFixed(2)}</FilterStatValue>
              <FilterStatLabel>Available Money</FilterStatLabel>
            </FilterStat>
            <FilterStat>
              <FilterStatValue>🛒 {stats.inCart}</FilterStatValue>
              <FilterStatLabel>In Cart</FilterStatLabel>
            </FilterStat>
          </FilterStats>
        </FilterInfo>
      </FilterSummary>

      <RewardsGrid viewMode={viewMode}>
        {filteredRewards.length > 0 ? (
          filteredRewards.map((reward, index) => {
            const isInCart = cart.some(item => item.id === reward.id);
            const canAffordPoints = !reward.cost_points || remainingBudget.points >= reward.cost_points;
            const canAffordMoney = !reward.cost_dollars || remainingBudget.money >= reward.cost_dollars;
            const canAfford = canAffordPoints && canAffordMoney;
            const isGrayedOut = !canAfford && !isInCart;
            
            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <RewardCard
                  reward={reward}
                  user={user}
                  isInCart={isInCart}
                  isGrayedOut={isGrayedOut}
                  onAddToCart={() => onAddToCart(reward)}
                  onRemoveFromCart={() => onRemoveFromCart(reward.id)}
                />
              </motion.div>
            );
          })
        ) : (
          <EmptyState>
            <EmptyIcon>🔍</EmptyIcon>
            <h3>No Rewards Found</h3>
            <p>
              {searchTerm || affordabilityFilter !== 'all' || costFilter !== 'all'
                ? "No rewards match your current filters."
                : "No rewards are available right now."
              }
            </p>
          </EmptyState>
        )}
      </RewardsGrid>
    </ShopContainer>
  );
};