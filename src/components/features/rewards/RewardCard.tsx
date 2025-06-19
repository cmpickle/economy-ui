import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Reward, User } from '../../../types/api';
import { formatCurrency, formatPoints } from '../../../utils/api';
import { 
  ShoppingCart, 
  Star, 
  DollarSign, 
  Check, 
  X,
  Edit3,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

const RewardContainer = styled(Card)<{ 
  canAfford: boolean; 
  isInCart: boolean;
  isGrayedOut: boolean;
}>`
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  
  ${({ canAfford, isInCart, isGrayedOut, theme }) => {
    if (isGrayedOut) {
      return `
        opacity: 0.4;
        filter: grayscale(70%);
        transform: scale(0.98);
      `;
    }
    if (isInCart) {
      return `
        border: 2px solid ${theme.colors.success};
        box-shadow: 0 0 20px ${theme.colors.success}40;
        transform: translateY(-2px);
      `;
    }
    if (canAfford) {
      return `
        border: 2px solid ${theme.colors.primary};
        &:hover {
          transform: translateY(-4px);
          box-shadow: ${theme.shadows.lg};
          border-color: ${theme.colors.primaryDark};
        }
      `;
    }
    return `
      border: 2px solid ${theme.colors.border};
      &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.md};
      }
    `;
  }}
`;

const RewardImage = styled.div<{ image?: string }>`
  width: 100%;
  height: 200px;
  background: ${({ image }) => 
    image 
      ? `url(${image}) center/cover` 
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ image }) => 
      !image ? 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)' : 'none'
    };
    animation: ${({ image }) => !image ? 'shimmer 3s infinite' : 'none'};
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const RewardPlaceholder = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 4rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const RewardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const RewardInfo = styled.div`
  flex: 1;
`;

const RewardTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
  line-height: 1.3;
`;

const RewardDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.4;
  margin: 0;
`;

const StatusBadge = styled.div<{ status: 'available' | 'unavailable' | 'in-cart' }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ status, theme }) => {
    switch (status) {
      case 'available':
        return `
          background-color: ${theme.colors.success}20;
          color: ${theme.colors.success};
        `;
      case 'in-cart':
        return `
          background-color: ${theme.colors.primary}20;
          color: ${theme.colors.primary};
        `;
      default:
        return `
          background-color: ${theme.colors.error}20;
          color: ${theme.colors.error};
        `;
    }
  }}
`;

const CostSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CostItem = styled.div<{ canAfford: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 2px solid ${({ canAfford, theme }) => 
    canAfford ? theme.colors.success : theme.colors.error};
`;

const CostLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const CostValue = styled.div<{ canAfford: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ canAfford, theme }) => 
    canAfford ? theme.colors.success : theme.colors.error};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const CartButton = styled(Button)<{ isInCart: boolean }>`
  flex: 1;
  ${({ isInCart, theme }) => isInCart && `
    background-color: ${theme.colors.success};
    &:hover {
      background-color: ${theme.colors.success};
    }
  `}
`;

const ManageControls = styled(motion.div)`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const AffordabilityIndicator = styled(motion.div)<{ canAfford: boolean }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ canAfford, theme }) => 
    canAfford ? theme.colors.success : theme.colors.error};
  color: white;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

interface RewardCardProps {
  reward: Reward;
  user: User;
  isInCart: boolean;
  isGrayedOut?: boolean;
  onAddToCart: () => void;
  onRemoveFromCart: () => void;
  showManageControls?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: () => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  user,
  isInCart,
  isGrayedOut = false,
  onAddToCart,
  onRemoveFromCart,
  showManageControls = false,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const canAffordPoints = !reward.cost_points || user.profile.total_points >= reward.cost_points;
  const canAffordMoney = !reward.cost_dollars || user.profile.total_money >= reward.cost_dollars;
  const canAfford = canAffordPoints && canAffordMoney && reward.is_active;

  const getStatus = () => {
    if (isInCart) return 'in-cart';
    if (canAfford) return 'available';
    return 'unavailable';
  };

  const getStatusText = () => {
    if (isInCart) return 'In Cart';
    if (!reward.is_active) return 'Inactive';
    if (canAfford) return 'Available';
    return 'Can\'t Afford';
  };

  const handleCartAction = () => {
    if (isInCart) {
      onRemoveFromCart();
    } else if (canAfford) {
      onAddToCart();
    }
  };

  return (
    <RewardContainer
      canAfford={canAfford}
      isInCart={isInCart}
      isGrayedOut={isGrayedOut}
      padding="lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AffordabilityIndicator
        canAfford={canAfford}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
      >
        {canAfford ? <Check size={20} /> : <X size={16} />}
      </AffordabilityIndicator>

      <RewardImage image={reward.image}>
        {!reward.image && <RewardPlaceholder>🎁</RewardPlaceholder>}
      </RewardImage>

      <RewardHeader>
        <RewardInfo>
          <RewardTitle>{reward.title}</RewardTitle>
          {reward.description && (
            <RewardDescription>{reward.description}</RewardDescription>
          )}
        </RewardInfo>
        <StatusBadge status={getStatus()}>
          {getStatusText()}
        </StatusBadge>
      </RewardHeader>

      <CostSection>
        {reward.cost_points && (
          <CostItem canAfford={canAffordPoints}>
            <CostLabel>
              <Star size={16} />
              Points Required
            </CostLabel>
            <CostValue canAfford={canAffordPoints}>
              {formatPoints(reward.cost_points)}
              {canAffordPoints ? <Check size={16} /> : <X size={16} />}
            </CostValue>
          </CostItem>
        )}
        
        {reward.cost_dollars && (
          <CostItem canAfford={canAffordMoney}>
            <CostLabel>
              <DollarSign size={16} />
              Money Required
            </CostLabel>
            <CostValue canAfford={canAffordMoney}>
              {formatCurrency(reward.cost_dollars)}
              {canAffordMoney ? <Check size={16} /> : <X size={16} />}
            </CostValue>
          </CostItem>
        )}
      </CostSection>

      {!showManageControls && (
        <ActionButtons>
          <CartButton
            isInCart={isInCart}
            onClick={handleCartAction}
            disabled={!canAfford && !isInCart}
            fullWidth
          >
            <ShoppingCart size={16} />
            {isInCart ? 'Remove from Cart' : canAfford ? 'Add to Cart' : 'Cannot Afford'}
          </CartButton>
        </ActionButtons>
      )}

      <AnimatePresence>
        {showManageControls && (
          <ManageControls
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleActive}
              style={{ flex: 1 }}
            >
              {reward.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
              {reward.is_active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              style={{ flex: 1 }}
            >
              <Edit3 size={14} />
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onDelete}
              style={{ flex: 1 }}
            >
              <Trash2 size={14} />
              Delete
            </Button>
          </ManageControls>
        )}
      </AnimatePresence>
    </RewardContainer>
  );
};