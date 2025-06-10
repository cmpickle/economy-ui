import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Avatar } from '../../ui/Avatar';
import { User } from '../../../types/api';
import { useCreateChore } from '../../../hooks/useQuery';
import { X, Calendar, User as UserIcon, RotateCcw, Star } from 'lucide-react';

const ModalOverlay = styled(motion.div)`
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

const ModalContent = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${({ theme }) => theme.shadows.xl};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
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

const AssignmentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const AssignmentOptions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const AssignmentOption = styled.button<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ selected, theme }) => 
    selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ selected, theme }) => 
    selected ? theme.colors.primaryLight : theme.colors.surface};
  color: ${({ selected, theme }) => 
    selected ? theme.colors.primary : theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const RecurrenceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const RecurrenceOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`;

const RecurrenceOption = styled.button<{ selected: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 2px solid ${({ selected, theme }) => 
    selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ selected, theme }) => 
    selected ? theme.colors.primaryLight : theme.colors.surface};
  color: ${({ selected, theme }) => 
    selected ? theme.colors.primary : theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: center;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const DebugInfo = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

interface CreateChoreModalProps {
  onClose: () => void;
  onSuccess: () => void;
  householdMembers: User[];
}

export const CreateChoreModal: React.FC<CreateChoreModalProps> = ({
  onClose,
  onSuccess,
  householdMembers,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    point_value: 10,
    due_date: '',
    assigned_to: null as number | null,
    recurrence: 'none',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createChore = useCreateChore();

  const recurrenceOptions = [
    { value: 'none', label: 'One Time' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'annually', label: 'Yearly' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Chore name is required';
    }

    if (formData.point_value < 1) {
      newErrors.point_value = 'Point value must be at least 1';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    } else {
      const dueDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.due_date = 'Due date cannot be in the past';
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
      await createChore.mutateAsync(formData);
      onSuccess();
    } catch (error: any) {
      setErrors({ 
        submit: error.response?.data?.errorMessage || 'Failed to create chore' 
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

  // Set default due date to tomorrow
  React.useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, due_date: tomorrowString }));
  }, []);

  return (
    <ModalOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <ModalContent
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader>
          <ModalTitle>Create New Chore</ModalTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </ModalHeader>

        <ModalBody>
          {/* Debug Information */}
          <DebugInfo>
            <strong>Debug Info:</strong><br />
            Household Members Count: {householdMembers.length}<br />
            Members: {householdMembers.map(m => `${m.first_name} ${m.last_name}`).join(', ') || 'None'}
          </DebugInfo>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>
                Chore Name *
              </Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Take out the trash"
                maxLength={100}
              />
              {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>Description</Label>
              <TextArea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Add any additional details or instructions..."
                maxLength={500}
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Star size={16} />
                Point Value *
              </Label>
              <Input
                type="number"
                min="1"
                max="1000"
                value={formData.point_value}
                onChange={(e) => handleInputChange('point_value', parseInt(e.target.value) || 0)}
              />
              {errors.point_value && <ErrorMessage>{errors.point_value}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>
                <Calendar size={16} />
                Due Date *
              </Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
              />
              {errors.due_date && <ErrorMessage>{errors.due_date}</ErrorMessage>}
            </FormGroup>

            <AssignmentSection>
              <Label>
                <UserIcon size={16} />
                Assign To
              </Label>
              <AssignmentOptions>
                <AssignmentOption
                  type="button"
                  selected={formData.assigned_to === null}
                  onClick={() => handleInputChange('assigned_to', null)}
                >
                  Unassigned
                </AssignmentOption>
                {householdMembers.length > 0 ? (
                  householdMembers.map(member => (
                    <AssignmentOption
                      key={member.id}
                      type="button"
                      selected={formData.assigned_to === member.id}
                      onClick={() => handleInputChange('assigned_to', member.id)}
                    >
                      <Avatar
                        avatar={member.profile.avatar}
                        name={`${member.first_name} ${member.last_name}`}
                        size="sm"
                      />
                      {member.first_name}
                    </AssignmentOption>
                  ))
                ) : (
                  <div style={{ 
                    padding: '1rem', 
                    color: '#6B7280', 
                    fontStyle: 'italic',
                    border: '1px dashed #E5E7EB',
                    borderRadius: '0.375rem',
                    width: '100%',
                    textAlign: 'center'
                  }}>
                    No household members found
                  </div>
                )}
              </AssignmentOptions>
            </AssignmentSection>

            <RecurrenceSection>
              <Label>
                <RotateCcw size={16} />
                Recurrence
              </Label>
              <RecurrenceOptions>
                {recurrenceOptions.map(option => (
                  <RecurrenceOption
                    key={option.value}
                    type="button"
                    selected={formData.recurrence === option.value}
                    onClick={() => handleInputChange('recurrence', option.value)}
                  >
                    {option.label}
                  </RecurrenceOption>
                ))}
              </RecurrenceOptions>
            </RecurrenceSection>

            {errors.submit && (
              <ErrorMessage>{errors.submit}</ErrorMessage>
            )}
          </Form>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!formData.name.trim() || !formData.due_date}
          >
            Create Chore
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};