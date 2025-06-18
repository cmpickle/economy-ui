import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Avatar } from '../../ui/Avatar';
import { useUsers } from '../../../hooks/useQuery';
import { useAuth } from '../../../hooks/useAuth';
import { X, Calendar, User as UserIcon, Star, Brain } from 'lucide-react';

interface TaskAssignmentModalProps {
  onClose: () => void;
  onSuccess: () => void;
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

const TaskTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TaskTypeCard = styled.button<{ selected: boolean }>`
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

const TaskTypeIcon = styled.div`
  font-size: 2rem;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const AssignmentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StudentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StudentCard = styled.button<{ selected: boolean }>`
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

const StudentInfo = styled.div`
  flex: 1;
`;

const StudentName = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-bottom: 2px;
`;

const StudentAge = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  opacity: 0.8;
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

const taskTypes = [
  { id: 'sudoku_3x3', name: '3×3 Sudoku', icon: '🧩', description: 'Logic puzzle' },
  { id: 'math', name: 'Math', icon: '🔢', description: 'Coming soon' },
  { id: 'reading', name: 'Reading', icon: '📚', description: 'Coming soon' },
  { id: 'writing', name: 'Writing', icon: '✍️', description: 'Coming soon' },
  { id: 'science', name: 'Science', icon: '🔬', description: 'Coming soon' },
];

export const TaskAssignmentModal: React.FC<TaskAssignmentModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const userHouseholdId = user?.households?.[0];
  const { data: householdMembers = [] } = useUsers(
    userHouseholdId ? { household_id: userHouseholdId } : undefined
  );

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_type: 'sudoku_3x3',
    difficulty_level: 'easy',
    point_value: 10,
    assigned_to: null as number | null,
    due_date: '',
    max_attempts: 3,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter for children only
  const children = householdMembers.filter(member => 
    member.profile.role === 'child' || member.profile.role === 'teen'
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (formData.point_value < 1) {
      newErrors.point_value = 'Point value must be at least 1';
    }

    if (!formData.assigned_to) {
      newErrors.assigned_to = 'Please select a student';
    }

    if (formData.due_date) {
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
      // Mock API call - replace with actual implementation
      console.log('Creating learning task:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess();
    } catch (error: any) {
      setErrors({ 
        submit: error.response?.data?.errorMessage || 'Failed to create task' 
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

  // Set default due date to one week from now
  React.useEffect(() => {
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    const dateString = oneWeekFromNow.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, due_date: dateString }));
  }, []);

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
              <Brain size={24} />
              Assign Learning Task
            </ModalTitle>
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Task Type</Label>
              <TaskTypeGrid>
                {taskTypes.map(type => (
                  <TaskTypeCard
                    key={type.id}
                    type="button"
                    selected={formData.task_type === type.id}
                    onClick={() => handleInputChange('task_type', type.id)}
                    disabled={type.id !== 'sudoku_3x3'} // Only Sudoku is available for now
                  >
                    <TaskTypeIcon>{type.icon}</TaskTypeIcon>
                    <div>{type.name}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                      {type.description}
                    </div>
                  </TaskTypeCard>
                ))}
              </TaskTypeGrid>
            </FormGroup>

            <FormGroup>
              <Label>Task Title *</Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Morning Sudoku Challenge"
                maxLength={100}
              />
              {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>Description</Label>
              <TextArea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Add any additional instructions or context..."
                maxLength={500}
              />
            </FormGroup>

            <FormGroup>
              <Label>Difficulty Level</Label>
              <Select
                value={formData.difficulty_level}
                onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <Star size={16} />
                Point Value *
              </Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={formData.point_value}
                onChange={(e) => handleInputChange('point_value', parseInt(e.target.value) || 0)}
              />
              {errors.point_value && <ErrorMessage>{errors.point_value}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>
                <Calendar size={16} />
                Due Date (Optional)
              </Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
              />
              {errors.due_date && <ErrorMessage>{errors.due_date}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>Max Attempts</Label>
              <Select
                value={formData.max_attempts}
                onChange={(e) => handleInputChange('max_attempts', parseInt(e.target.value))}
              >
                <option value={1}>1 attempt</option>
                <option value={3}>3 attempts</option>
                <option value={5}>5 attempts</option>
                <option value={0}>Unlimited</option>
              </Select>
            </FormGroup>

            <AssignmentSection>
              <Label>
                <UserIcon size={16} />
                Assign To *
              </Label>
              <StudentGrid>
                {children.length > 0 ? (
                  children.map(child => (
                    <StudentCard
                      key={child.id}
                      type="button"
                      selected={formData.assigned_to === child.id}
                      onClick={() => handleInputChange('assigned_to', child.id)}
                    >
                      <Avatar
                        avatar={child.profile.avatar}
                        name={`${child.first_name} ${child.last_name}`}
                        size="sm"
                      />
                      <StudentInfo>
                        <StudentName>{child.first_name} {child.last_name}</StudentName>
                        <StudentAge>Age {child.profile.age}</StudentAge>
                      </StudentInfo>
                    </StudentCard>
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
                    No children found in household
                  </div>
                )}
              </StudentGrid>
              {errors.assigned_to && <ErrorMessage>{errors.assigned_to}</ErrorMessage>}
            </AssignmentSection>

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
              disabled={!formData.title.trim() || !formData.assigned_to}
            >
              Assign Task
            </Button>
          </ModalFooter>
        </ModalContent>
      </motion.div>
    </Overlay>
  );
};