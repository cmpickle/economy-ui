import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Avatar } from '../../ui/Avatar';
import { Transaction, User } from '../../../types/api';
import { formatDateTime, formatCurrency, formatPoints } from '../../../utils/api';
import { History, Filter, Search, Eye, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
  householdMembers: User[];
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const HistoryTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0;
`;

const FilterControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  width: 200px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const FilterSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
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

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const TransactionCard = styled(Card)`
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const TransactionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const TransactionInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const TransactionIcon = styled.div<{ type: string }>`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  
  ${({ type, theme }) => {
    switch (type) {
      case 'bonus':
        return `background-color: ${theme.colors.success}20; color: ${theme.colors.success};`;
      case 'allowance':
        return `background-color: ${theme.colors.primary}20; color: ${theme.colors.primary};`;
      case 'penalty':
        return `background-color: ${theme.colors.error}20; color: ${theme.colors.error};`;
      case 'gift':
        return `background-color: #8B5CF620; color: #8B5CF6;`;
      case 'manual_adjustment':
        return `background-color: ${theme.colors.gray[200]}; color: ${theme.colors.gray[600]};`;
      default:
        return `background-color: ${theme.colors.gray[200]}; color: ${theme.colors.gray[600]};`;
    }
  }}
`;

const TransactionDetails = styled.div`
  flex: 1;
`;

const TransactionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const TransactionMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TransactionAmounts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const AmountBadge = styled.div<{ isPositive: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: 4px;
  
  ${({ isPositive, theme }) =>
    isPositive
      ? `
        background-color: ${theme.colors.success}20;
        color: ${theme.colors.success};
      `
      : `
        background-color: ${theme.colors.error}20;
        color: ${theme.colors.error};
      `}
`;

const TransactionStatus = styled.div<{ status: string }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: uppercase;
  
  ${({ status, theme }) => {
    switch (status) {
      case 'approved':
        return `
          background-color: ${theme.colors.success}20;
          color: ${theme.colors.success};
        `;
      case 'pending':
        return `
          background-color: ${theme.colors.warning}20;
          color: ${theme.colors.warning};
        `;
      case 'rejected':
        return `
          background-color: ${theme.colors.error}20;
          color: ${theme.colors.error};
        `;
      default:
        return `
          background-color: ${theme.colors.gray[200]};
          color: ${theme.colors.gray[600]};
        `;
    }
  }}
`;

const TransactionNotes = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
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

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  householdMembers,
  showViewAll = false,
  onViewAll
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  const getUserById = (userId: number) => {
    return householdMembers.find(user => user.id === userId);
  };

  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!transaction.description.toLowerCase().includes(searchLower) &&
          !transaction.user_name.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Type filter
    if (typeFilter !== 'all' && transaction.transaction_type !== typeFilter) {
      return false;
    }

    // User filter
    if (userFilter !== 'all' && transaction.user.toString() !== userFilter) {
      return false;
    }

    // Time filter
    if (timeFilter !== 'all') {
      const transactionDate = new Date(transaction.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (timeFilter) {
        case 'today':
          return daysDiff === 0;
        case 'week':
          return daysDiff <= 7;
        case 'month':
          return daysDiff <= 30;
        default:
          return true;
      }
    }

    return true;
  });

  const uniqueTypes = [...new Set(transactions.map(t => t.transaction_type))];

  return (
    <HistoryContainer>
      <Card padding="lg">
        <HistoryHeader>
          <HistoryTitle>
            <History size={24} />
            Transaction History
            {showViewAll && transactions.length > 10 && (
              <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#6B7280' }}>
                (Showing recent 10)
              </span>
            )}
          </HistoryTitle>
          
          {!showViewAll && (
            <FilterControls>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={16} />
                <SearchInput
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <FilterSelect
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>
                    {getTransactionTypeLabel(type)}
                  </option>
                ))}
              </FilterSelect>
              
              <FilterSelect
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="all">All Members</option>
                {householdMembers.filter(m => m.profile.role !== 'parent').map(member => (
                  <option key={member.id} value={member.id.toString()}>
                    {member.first_name} {member.last_name}
                  </option>
                ))}
              </FilterSelect>
              
              <FilterSelect
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </FilterSelect>
            </FilterControls>
          )}
          
          {showViewAll && onViewAll && (
            <Button variant="ghost" onClick={onViewAll}>
              <Eye size={16} />
              View All
            </Button>
          )}
        </HistoryHeader>

        <TransactionsList>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction, index) => {
              const user = getUserById(transaction.user);
              const isPositive = transaction.amount_points > 0 || transaction.amount_dollars > 0;
              
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <TransactionCard padding="lg">
                    <TransactionHeader>
                      <TransactionInfo>
                        <TransactionIcon type={transaction.transaction_type}>
                          {getTransactionIcon(transaction.transaction_type)}
                        </TransactionIcon>
                        
                        <TransactionDetails>
                          <TransactionTitle>{transaction.description}</TransactionTitle>
                          <TransactionMeta>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {user && (
                                <Avatar
                                  avatar={user.profile.avatar}
                                  name={`${user.first_name} ${user.last_name}`}
                                  size="sm"
                                />
                              )}
                              <span>{transaction.user_name}</span>
                            </div>
                            <div>
                              <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                              {formatDateTime(transaction.created_at)}
                            </div>
                            <div>Created by {transaction.created_by_name}</div>
                          </TransactionMeta>
                        </TransactionDetails>
                      </TransactionInfo>
                      
                      <TransactionAmounts>
                        <TransactionStatus status={transaction.status}>
                          {transaction.status}
                        </TransactionStatus>
                        
                        {transaction.amount_points !== 0 && (
                          <AmountBadge isPositive={transaction.amount_points > 0}>
                            {transaction.amount_points > 0 ? (
                              <TrendingUp size={14} />
                            ) : (
                              <TrendingDown size={14} />
                            )}
                            {transaction.amount_points > 0 ? '+' : ''}{formatPoints(transaction.amount_points)}
                          </AmountBadge>
                        )}
                        
                        {transaction.amount_dollars !== 0 && (
                          <AmountBadge isPositive={transaction.amount_dollars > 0}>
                            {transaction.amount_dollars > 0 ? (
                              <TrendingUp size={14} />
                            ) : (
                              <TrendingDown size={14} />
                            )}
                            {transaction.amount_dollars > 0 ? '+' : ''}{formatCurrency(transaction.amount_dollars)}
                          </AmountBadge>
                        )}
                      </TransactionAmounts>
                    </TransactionHeader>
                    
                    {transaction.notes && (
                      <TransactionNotes>
                        "{transaction.notes}"
                      </TransactionNotes>
                    )}
                  </TransactionCard>
                </motion.div>
              );
            })
          ) : (
            <EmptyState>
              <EmptyIcon>📊</EmptyIcon>
              <h3>No Transactions Found</h3>
              <p>
                {searchTerm || typeFilter !== 'all' || userFilter !== 'all' || timeFilter !== 'all'
                  ? "No transactions match your current filters."
                  : "No transactions have been created yet."
                }
              </p>
            </EmptyState>
          )}
        </TransactionsList>
      </Card>
    </HistoryContainer>
  );
};