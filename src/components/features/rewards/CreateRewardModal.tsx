import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { useCreateReward } from '../../../hooks/useQuery';
import { X, Gift, Star, DollarSign, Image, Calendar, Users } from 'lucide-react';

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

const CostSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ImagePreview = styled.div<{ image?: string }>`
  width: 100%;
  height: 200px;
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ image }) => 
    image 
      ? `url(${image}) center/cover` 
      : 'linear-gradient(135deg, #f8fafc, #e2e8f0)'
  };
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const ImagePlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SchedulingSection = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const SchedulingTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

const AgeRestrictionsSection = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const AgeInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
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

interface CreateRewardModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateRewardModal: React.FC<CreateRewardModalProps> = ({
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    cost_points: 0,
    cost_dollars: 0,
    is_scheduled: false,
    schedule_date: '',
    age_restrictions: {
      min_age: '',
      max_age: '',
      roles_allowed: [] as string[]
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createReward = useCreateReward();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Reward title is required';
    }

    if (formData.cost_points === 0 && formData.cost_dollars === 0) {
      newErrors.cost = 'Reward must have a points or money cost';
    }

    if (formData.cost_points < 0 || formData.cost_dollars < 0) {
      newErrors.cost = 'Cost cannot be negative';
    }

    if (formData.is_scheduled && !formData.schedule_date) {
      newErrors.schedule_date = 'Schedule date is required when scheduling is enabled';
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
      const rewardData = {
        ...formData,
        age_restrictions: {
          min_age: formData.age_restrictions.min_age ? parseInt(formData.age_restrictions.min_age) : undefined,
          max_age: formData.age_restrictions.max_age ? parseInt(formData.age_restrictions.max_age) : undefined,
          roles_allowed: formData.age_restrictions.roles_allowed.length > 0 ? formData.age_restrictions.roles_allowed : undefined
        }
      };

      await createReward.mutateAsync(rewardData);
      onSuccess();
    } catch (error: any) {
      setErrors({ 
        submit: error.response?.data?.errorMessage || 'Failed to create reward' 
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

  const handleAgeRestrictionChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      age_restrictions: {
        ...prev.age_restrictions,
        [field]: value
      }
    }));
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      age_restrictions: {
        ...prev.age_restrictions,
        roles_allowed: prev.age_restrictions.roles_allowed.includes(role)
          ? prev.age_restrictions.roles_allowed.filter(r => r !== role)
          : [...prev.age_restrictions.roles_allowed, role]
      }
    }));
  };

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
              <Gift size={24} />
              Create New Reward
            </ModalTitle>
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>
                Reward Title *
              </Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Extra Screen Time, Special Treat"
                maxLength={100}
              />
              {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>Description</Label>
              <TextArea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this reward includes..."
                maxLength={500}
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Image size={16} />
                Reward Image (URL)
              </Label>
              <Input
                type="url"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <ImagePreview image={formData.image}>
                {!formData.image && (
                  <ImagePlaceholder>
                    <Image size={32} />
                    <div>Add an image URL to preview</div>
                  </ImagePlaceholder>
                )}
              </ImagePreview>
            </FormGroup>

            <CostSection>
              <FormGroup>
                <Label>
                  <Star size={16} />
                  Points Cost
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="10000"
                  value={formData.cost_points || ''}
                  onChange={(e) => handleInputChange('cost_points', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <DollarSign size={16} />
                  Money Cost
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="1000"
                  step="0.01"
                  value={formData.cost_dollars || ''}
                  onChange={(e) => handleInputChange('cost_dollars', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </FormGroup>
            </CostSection>
            {errors.cost && <ErrorMessage>{errors.cost}</ErrorMessage>}

            <SchedulingSection>
              <SchedulingTitle>
                <Calendar size={16} />
                Scheduling Options
              </SchedulingTitle>
              
              <CheckboxGroup>
                <CheckboxItem>
                  <Checkbox
                    type="checkbox"
                    checked={formData.is_scheduled}
                    onChange={(e) => handleInputChange('is_scheduled', e.target.checked)}
                  />
                  Schedule this reward for a specific date
                </CheckboxItem>
              </CheckboxGroup>

              {formData.is_scheduled && (
                <FormGroup style={{ marginTop: '1rem' }}>
                  <Label>Available Date</Label>
                  <Input
                    type="date"
                    value={formData.schedule_date}
                    onChange={(e) => handleInputChange('schedule_date', e.target.value)}
                  />
                  {errors.schedule_date && <ErrorMessage>{errors.schedule_date}</ErrorMessage>}
                </FormGroup>
              )}
            </SchedulingSection>

            <AgeRestrictionsSection>
              <SchedulingTitle>
                <Users size={16} />
                Age & Role Restrictions
              </SchedulingTitle>
              
              <AgeInputs>
                <FormGroup>
                  <Label>Minimum Age</Label>
                  <Input
                    type="number"
                    min="1"
                    max="18"
                    value={formData.age_restrictions.min_age}
                    onChange={(e) => handleAgeRestrictionChange('min_age', e.target.value)}
                    placeholder="No minimum"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Maximum Age</Label>
                  <Input
                    type="number"
                    min="1"
                    max="18"
                    value={formData.age_restrictions.max_age}
                    onChange={(e) => handleAgeRestrictionChange('max_age', e.target.value)}
                    placeholder="No maximum"
                  />
                </FormGroup>
              </AgeInputs>

              <FormGroup style={{ marginTop: '1rem' }}>
                <Label>Allowed Roles</Label>
                <CheckboxGroup>
                  {['child', 'teen'].map(role => (
                    <CheckboxItem key={role}>
                      <Checkbox
                        type="checkbox"
                        checked={formData.age_restrictions.roles_allowed.includes(role)}
                        onChange={() => handleRoleToggle(role)}
                      />
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </CheckboxItem>
                  ))}
                </CheckboxGroup>
              </FormGroup>
            </AgeRestrictionsSection>

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
              disabled={!formData.title.trim() || (formData.cost_points === 0 && formData.cost_dollars === 0)}
            >
              Create Reward
            </Button>
          </ModalFooter>
        </ModalContent>
      </motion.div>
    </Overlay>
  );
};