import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Avatar } from '../../ui/Avatar';
import { Transaction, User } from '../../../types/api';
import { formatCurrency, formatPoints, formatDateTime } from '../../../utils/api';
import { 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  TrendingUp, 
  TrendingDown,
  Filter,
  Search,
  Calendar
} from 'lucide-react';

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const EditorTitle = styled.h2`
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

const TransactionsTable = styled(Card)`
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 150px 120px 120px 100px 80px;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TableRow = styled(motion.div)<{ isEditing?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 150px 120px 120px 100px 80px;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  align-items: center;
  transition: all 0.2s ease;
  
  ${({ isEditing, theme }) => isEditing && `
    background-color: ${theme.colors.primaryLight};
  `}

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceLight};
  }
`;

const TransactionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TransactionDetails = styled.div`
  flex: 1;
`;

const TransactionDescription = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2px;
`;

const TransactionMeta = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EditableInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const AmountDisplay = styled.div<{ isPositive: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ isPositive, theme }) => 
    isPositive ? theme.colors.success : theme.colors.error};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ActionButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing.xs};
  min-width: auto;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

interface TransactionEditorProps {
  transactions: Transaction[];
  householdMembers: User[];
  onTransactionUpdate: () => void;
}

export const TransactionEditor: React.FC<TransactionEditorProps> = ({
  transactions,
  householdMembers,
  onTransactionUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Transaction>>({});

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

    // User filter
    if (userFilter !== 'all' && transaction.user.toString() !== userFilter) {
      return false;
    }

    // Type filter
    if (typeFilter !== 'all' && transaction.transaction_type !== typeFilter) {
      return false;
    }

    return true;
  });

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditData({
      description: transaction.description,
      amount_dollars: transaction.amount_dollars,
      amount_points: transaction.amount_points,
      notes: transaction.notes
    });
  };

  const handleSave = async (transactionId: number) => {
    try {
      // API call to update transaction
      console.log('Updating transaction:', transactionId, editData);
      setEditingId(null);
      setEditData({});
      onTransactionUpdate();
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (transactionId: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        // API call to delete transaction
        console.log('Deleting transaction:', transactionId);
        onTransactionUpdate();
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  };

  const uniqueTypes = [...new Set(transactions.map(t => t.transaction_type))];

  return (
    <EditorContainer>
      <EditorHeader>
        <EditorTitle>
          <Edit3 size={24} />
          Transaction Editor
        </EditorTitle>
        
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>
                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </FilterSelect>
        </FilterControls>
      </EditorHeader>

      <TransactionsTable padding="none">
        <TableHeader>
          <div>Transaction</div>
          <div>Member</div>
          <div>Money</div>
          <div>Points</div>
          <div>Date</div>
          <div>Actions</div>
        </TableHeader>

        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction, index) => {
            const user = getUserById(transaction.user);
            const isEditing = editingId === transaction.id;
            const isPositiveMoney = transaction.amount_dollars > 0;
            const isPositivePoints = transaction.amount_points > 0;
            
            return (
              <TableRow
                key={transaction.id}
                isEditing={isEditing}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
              >
                <TransactionInfo>
                  <TransactionDetails>
                    {isEditing ? (
                      <EditableInput
                        value={editData.description || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description"
                      />
                    ) : (
                      <>
                        <TransactionDescription>{transaction.description}</TransactionDescription>
                        <TransactionMeta>
                          {transaction.transaction_type.replace('_', ' ')}
                          {transaction.notes && ` • ${transaction.notes}`}
                        </TransactionMeta>
                      </>
                    )}
                  </TransactionDetails>
                </TransactionInfo>

                <TransactionInfo>
                  {user && (
                    <>
                      <Avatar
                        avatar={user.profile.avatar}
                        name={`${user.first_name} ${user.last_name}`}
                        size="sm"
                      />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                          {user.first_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          {user.profile.role}
                        </div>
                      </div>
                    </>
                  )}
                </TransactionInfo>

                <div>
                  {isEditing ? (
                    <EditableInput
                      type="number"
                      step="0.01"
                      value={editData.amount_dollars || 0}
                      onChange={(e) => setEditData(prev => ({ ...prev, amount_dollars: parseFloat(e.target.value) || 0 }))}
                    />
                  ) : (
                    transaction.amount_dollars !== 0 && (
                      <AmountDisplay isPositive={isPositiveMoney}>
                        {isPositiveMoney ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {isPositiveMoney ? '+' : ''}{formatCurrency(transaction.amount_dollars)}
                      </AmountDisplay>
                    )
                  )}
                </div>

                <div>
                  {isEditing ? (
                    <EditableInput
                      type="number"
                      value={editData.amount_points || 0}
                      onChange={(e) => setEditData(prev => ({ ...prev, amount_points: parseInt(e.target.value) || 0 }))}
                    />
                  ) : (
                    transaction.amount_points !== 0 && (
                      <AmountDisplay isPositive={isPositivePoints}>
                        {isPositivePoints ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {isPositivePoints ? '+' : ''}{formatPoints(transaction.amount_points)}
                      </AmountDisplay>
                    )
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  {formatDateTime(transaction.created_at).split(' ')[0]}
                </div>

                <ActionButtons>
                  {isEditing ? (
                    <>
                      <ActionButton
                        size="sm"
                        onClick={() => handleSave(transaction.id)}
                      >
                        <Save size={14} />
                      </ActionButton>
                      <ActionButton
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                      >
                        <X size={14} />
                      </ActionButton>
                    </>
                  ) : (
                    <>
                      <ActionButton
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Edit3 size={14} />
                      </ActionButton>
                      <ActionButton
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 size={14} />
                      </ActionButton>
                    </>
                  )}
                </ActionButtons>
              </TableRow>
            );
          })
        ) : (
          <EmptyState>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h3>No Transactions Found</h3>
            <p>No transactions match your current filters.</p>
          </EmptyState>
        )}
      </TransactionsTable>
    </EditorContainer>
  );
};