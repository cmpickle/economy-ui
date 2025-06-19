import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Avatar } from '../../ui/Avatar';
import { User } from '../../../types/api';
import { useCreateTransaction } from '../../../hooks/useQuery';
import { X, DollarSign, Star, User as UserIcon, MessageSquare } from 'lucide-react';

interface CreateTransactionModalProps {
  onClose: () => void;
  onSuccess: () => void;
  householdMembers: User[];
  initialType?: string;
}

const Overlay = styled(motion.div)`
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

const ModalContent = styled(Card)`
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceLight};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const TransactionTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TypeCard = styled.button<{ selected: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ selected, theme }) => 
    selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ selected, theme }) => 
    selected ? theme.colors.primaryLight : theme.colors.surface};
  color: ${({ selected, theme }) => 
    selected ? theme.colors.primary : theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const TypeIcon = styled.div`
  font-size: 2rem;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const TypeLabel = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-bottom: 2px;
`;

const TypeDescription = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  opacity: 0.8;
`;

const UserSelection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`;

const UserCard = styled.button<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ selected, theme }) => 
    selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ selected, theme }) => 
    selected ? theme.colors.primaryLight : theme.colors.surface};
  color: ${({ selected, theme }) => 
    selected ? theme.colors.primary : theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-bottom: 2px;
`;

const UserBalance = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  opacity: 0.8;
`;

const AmountInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
`;

const AmountGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const transactionTypes = [
  {
    id: 'bonus',
    label: 'Bonus',
    description: 'Reward good behavior',
    icon: '🎁',
    color: '#10B981'
  },
  {
    id: 'allowance',
    label: 'Allowance',
    description: 'Regular weekly payment',
    icon: '💰',
    color: '#3B82F6'
  },
  {
    id: 'penalty',
    label: 'Penalty',
    description: 'Deduct for rule violations',
    icon: '⚠️',
    color: '#EF4444'
  },
  {
    id: 'gift',
    label: 'Gift',
    description: 'Special occasion money',
    icon: '🎉',
    color: '#8B5CF6'
  },
  {
    id: 'manual_adjustment',
    label: 'Adjustment',
    description: 'Manual correction',
    icon: '⚙️',
    color: '#6B7280'
  }
];

export const CreateTransactionModal: React.FC<CreateTransactionModalProps> = ({
  onClose,
  onSuccess,
  householdMembers,
  initialType = ''
}) => {
  const [formData, setFormData] = useState({
    transaction_type: initialType || 'bonus',
    user_id: null as number | null,
    amount_points: 0,
    amount_dollars: 0,
    description: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTransaction = useCreateTransaction();

  // Filter out parents from the user selection
  const eligibleMembers = householdMembers.filter(member => 
    member.profile.role !== 'parent'
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.user_id) {
      newErrors.user_id = 'Please select a family member';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.amount_points === 0 && formData.amount_dollars === 0) {
      newErrors.amount = 'Please enter points or money amount';
    }

    if (formData.amount_points < 0 || formData.amount_dollars < 0) {
      if (formData.transaction_type !== 'penalty') {
        newErrors.amount = 'Negative amounts only allowed for penalties';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Adjust amounts for penalty transactions
      const adjustedData = {
        ...(({ user_id, ...rest}) => rest)(formData),
        user: formData.user_id,
        household: householdMembers.find(member => member.id === formData.user_id)?.households[0],
        amount_points: formData.transaction_type === 'penalty' 
          ? -Math.abs(formData.amount_points) 
          : Math.abs(formData.amount_points),
        amount_dollars: formData.transaction_type === 'penalty' 
          ? -Math.abs(formData.amount_dollars) 
          : Math.abs(formData.amount_dollars)
      };

      await createTransaction.mutateAsync(adjustedData);
      onSuccess();
    } catch (error: any) {
      setErrors({ 
        submit: error.response?.data?.errorMessage || 'Failed to create transaction' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getTypeInfo = (typeId: string) => {
    return transactionTypes.find(type => type.id === typeId) || transactionTypes[0];
  };

  const selectedType = getTypeInfo(formData.transaction_type);

  // Set default description based on transaction type
  useEffect(() => {
    if (formData.transaction_type && !formData.description) {
      const defaultDescriptions = {
        bonus: 'Bonus for good behavior',
        allowance: 'Weekly allowance',
        penalty: 'Penalty for rule violation',
        gift: 'Special gift',
        manual_adjustment: 'Manual adjustment'
      };
      
      setFormData(prev => ({
        ...prev,
        description: defaultDescriptions[formData.transaction_type as keyof typeof defaultDescriptions] || ''
      }));
    }
  }, [formData.transaction_type]);

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <ModalContent padding="lg">
          <ModalHeader>
            <ModalTitle>
              <DollarSign size={24} />
              Create Transaction
            </ModalTitle>
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Transaction Type</Label>
              <TransactionTypeGrid>
                {transactionTypes.map(type => (
                  <TypeCard
                    key={type.id}
                    type="button"
                    selected={formData.transaction_type === type.id}
                    onClick={() => handleInputChange('transaction_type', type.id)}
                  >
                    <TypeIcon>{type.icon}</TypeIcon>
                    <TypeLabel>{type.label}</TypeLabel>
                    <TypeDescription>{type.description}</TypeDescription>
                  </TypeCard>
                ))}
              </TransactionTypeGrid>
            </FormGroup>

            <UserSelection>
              <Label>
                <UserIcon size={16} />
                Select Family Member *
              </Label>
              <UserGrid>
                {eligibleMembers.length > 0 ? (
                  eligibleMembers.map(member => (
                    <UserCard
                      key={member.id}
                      type="button"
                      selected={formData.user_id === member.id}
                      onClick={() => handleInputChange('user_id', member.id)}
                    >
                      <Avatar
                        avatar={member.profile.avatar}
                        name={`${member.first_name} ${member.last_name}`}
                        size="sm"
                      />
                      <UserInfo>
                        <UserName>{member.first_name} {member.last_name}</UserName>
                        <UserBalance>
                          {member.profile.total_points} pts • ${Number(member.profile.total_money).toFixed(2)}
                        </UserBalance>
                      </UserInfo>
                    </UserCard>
                  ))
                ) : (
                  <div style={{ 
                    padding: '1rem', 
                    color: '#6B7280', 
                    fontStyle: 'italic',
                    border: '1px dashed #E5E7EB',
                    borderRadius: '0.375rem',
                    gridColumn: '1 / -1',
                    textAlign: 'center'
                  }}>
                    No family members found
                  </div>
                )}
              </UserGrid>
              {errors.user_id && <ErrorMessage>{errors.user_id}</ErrorMessage>}
            </UserSelection>

            <FormGroup>
              <Label>
                <MessageSquare size={16} />
                Description *
              </Label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="e.g., Bonus for helping with dishes"
                maxLength={200}
              />
              {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
            </FormGroup>

            <AmountInputs>
              <AmountGroup>
                <Label>
                  <Star size={16} />
                  Points {formData.transaction_type === 'penalty' ? '(to deduct)' : ''}
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="10000"
                  value={formData.amount_points || ''}
                  onChange={(e) => handleInputChange('amount_points', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </AmountGroup>

              <AmountGroup>
                <Label>
                  <DollarSign size={16} />
                  Money {formData.transaction_type === 'penalty' ? '(to deduct)' : ''}
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="1000"
                  step="0.01"
                  value={formData.amount_dollars || ''}
                  onChange={(e) => handleInputChange('amount_dollars', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </AmountGroup>
            </AmountInputs>
            {errors.amount && <ErrorMessage>{errors.amount}</ErrorMessage>}

            <FormGroup>
              <Label>Additional Notes (Optional)</Label>
              <TextArea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional context or notes..."
                maxLength={500}
              />
            </FormGroup>

            {errors.submit && (
              <ErrorMessage>{errors.submit}</ErrorMessage>
            )}
          </Form>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={!formData.user_id || !formData.description.trim()}
              style={{ backgroundColor: selectedType.color }}
            >
              {selectedType.icon} Create {selectedType.label}
            </Button>
          </ModalFooter>
        </ModalContent>
      </motion.div>
    </Overlay>
  );
};