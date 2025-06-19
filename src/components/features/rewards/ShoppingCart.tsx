import React, { useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { User } from '../../../types/api';
import { formatCurrency, formatPoints } from '../../../utils/api';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  CreditCard,
  Star,
  DollarSign,
  TrendingDown,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const CartOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const CartContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  display: flex;
  flex-direction: column;
`;

const CartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const CartTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const CartContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const CartItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CartItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 2px solid ${({ theme }) => theme.colors.border};
`;

const ItemImage = styled.div<{ image?: string }>`
  width: 60px;
  height: 60px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ image }) => 
    image 
      ? `url(${image}) center/cover` 
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const ItemCost = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const RemoveButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing.xs};
  min-width: auto;
`;

const CartSummary = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  border: none;
`;

const SummaryTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SummaryItem = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  backdrop-filter: blur(10px);
`;

const SummaryValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SummaryLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  opacity: 0.9;
`;

const BalanceCheck = styled.div<{ canAfford: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  ${({ canAfford, theme }) =>
    canAfford
      ? `
        background-color: ${theme.colors.success}20;
        color: ${theme.colors.success};
        border: 2px solid ${theme.colors.success};
      `
      : `
        background-color: ${theme.colors.error}20;
        color: ${theme.colors.error};
        border: 2px solid ${theme.colors.error};
      `}
`;

const BalanceDetails = styled.div`
  flex: 1;
`;

const BalanceTitle = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const BalanceBreakdown = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  opacity: 0.8;
`;

const CartActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
`;

const PurchaseButton = styled(Button)<{ canAfford: boolean }>`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  
  ${({ canAfford, theme }) => !canAfford && `
    background-color: ${theme.colors.error};
    &:hover {
      background-color: ${theme.colors.error};
    }
  `}
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

interface ShoppingCartProps {
  cart: any[];
  user: User;
  onClose: () => void;
  onRemoveItem: (itemId: number) => void;
  onClearCart: () => void;
  onPurchase: (items: any[]) => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  cart,
  user,
  onClose,
  onRemoveItem,
  onClearCart,
  onPurchase
}) => {
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => ({
      points: total.points + (item.cost_points || 0),
      money: total.money + (item.cost_dollars || 0)
    }), { points: 0, money: 0 });
  }, [cart]);

  const canAffordPoints = user.profile.total_points >= cartTotal.points;
  const canAffordMoney = user.profile.total_money >= cartTotal.money;
  const canAfford = canAffordPoints && canAffordMoney;

  const remainingAfterPurchase = {
    points: user.profile.total_points - cartTotal.points,
    money: user.profile.total_money - cartTotal.money
  };

  const handlePurchase = () => {
    if (canAfford) {
      onPurchase(cart);
    }
  };

  return (
    <CartOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <CartContainer
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
      >
        <CartHeader>
          <CartTitle>
            <ShoppingBag size={24} />
            Shopping Cart ({cart.length})
          </CartTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </CartHeader>

        <CartContent>
          {cart.length > 0 ? (
            <>
              <CartItems>
                <AnimatePresence>
                  {cart.map((item, index) => (
                    <CartItem
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <ItemImage image={item.image}>
                        {!item.image && '🎁'}
                      </ItemImage>
                      
                      <ItemInfo>
                        <ItemTitle>{item.title}</ItemTitle>
                        <ItemCost>
                          {item.cost_points && (
                            <span>⭐ {formatPoints(item.cost_points)}</span>
                          )}
                          {item.cost_dollars && (
                            <span>💰 {formatCurrency(item.cost_dollars)}</span>
                          )}
                        </ItemCost>
                      </ItemInfo>
                      
                      <RemoveButton
                        variant="danger"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <Trash2 size={14} />
                      </RemoveButton>
                    </CartItem>
                  ))}
                </AnimatePresence>
              </CartItems>

              <CartSummary padding="lg">
                <SummaryTitle>
                  <CreditCard size={20} />
                  Purchase Summary
                </SummaryTitle>
                
                <SummaryGrid>
                  <SummaryItem>
                    <SummaryValue>
                      <Star size={16} />
                      {formatPoints(cartTotal.points)}
                    </SummaryValue>
                    <SummaryLabel>Total Points</SummaryLabel>
                  </SummaryItem>
                  
                  <SummaryItem>
                    <SummaryValue>
                      <DollarSign size={16} />
                      {formatCurrency(cartTotal.money)}
                    </SummaryValue>
                    <SummaryLabel>Total Money</SummaryLabel>
                  </SummaryItem>
                </SummaryGrid>
              </CartSummary>

              <BalanceCheck canAfford={canAfford}>
                {canAfford ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <BalanceDetails>
                  <BalanceTitle>
                    {canAfford ? 'You can afford this purchase!' : 'Insufficient funds'}
                  </BalanceTitle>
                  <BalanceBreakdown>
                    After purchase: ⭐ {remainingAfterPurchase.points.toLocaleString()} points • 
                    💰 ${remainingAfterPurchase.money.toFixed(2)}
                  </BalanceBreakdown>
                </BalanceDetails>
              </BalanceCheck>
            </>
          ) : (
            <EmptyCart>
              <EmptyIcon>🛒</EmptyIcon>
              <h3>Your cart is empty</h3>
              <p>Add some rewards to get started!</p>
            </EmptyCart>
          )}
        </CartContent>

        {cart.length > 0 && (
          <CartActions>
            <Button
              variant="ghost"
              onClick={onClearCart}
            >
              <Trash2 size={16} />
              Clear Cart
            </Button>
            
            <PurchaseButton
              canAfford={canAfford}
              onClick={handlePurchase}
              disabled={!canAfford}
            >
              {canAfford ? (
                <>
                  <CreditCard size={16} />
                  Purchase All
                </>
              ) : (
                <>
                  <AlertCircle size={16} />
                  Can't Afford
                </>
              )}
            </PurchaseButton>
          </CartActions>
        )}
      </CartContainer>
    </CartOverlay>
  );
};