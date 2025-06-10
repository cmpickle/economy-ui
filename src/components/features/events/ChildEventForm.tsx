import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { X, Clock, Plus, Minus } from 'lucide-react';

interface ChildEventFormProps {
  onSubmit: (eventData: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.9), rgba(78, 205, 196, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const FormCard = styled(Card)`
  width: 100%;
  max-width: 500px;
  position: relative;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ theme }) => theme.spacing.md};
`;

const FormTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const FormSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.full};
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
  gap: ${({ theme }) => theme.spacing.xl};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.lg};
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  text-align: center;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, #ffffff, #f8fafc);

  &:focus {
    outline: none;
    border-color: #FF6B6B;
    box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.2);
  }
`;

const TimePickerContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xl};
  align-items: center;
`;

const TimeUnit = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const TimeIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const TimeControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TimeButton = styled(motion.button)`
  width: 60px;
  height: 60px;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
  color: white;
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const TimeDisplay = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
  background: linear-gradient(135deg, #ffffff, #f0f9ff);
  border: 3px solid #e0f2fe;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  min-width: 100px;
  text-align: center;
`;

const TimeLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const FormActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  padding-top: ${({ theme }) => theme.spacing.md};
`;

const SubmitButton = styled(Button)`
  background: linear-gradient(135deg, #10B981, #059669);
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing['2xl']};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(16, 185, 129, 0.4);
  }
`;

const CancelButton = styled(Button)`
  background: linear-gradient(135deg, #6B7280, #4B5563);
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
`;

export const ChildEventForm: React.FC<ChildEventFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);

  const adjustTime = (type: 'hours' | 'minutes', direction: 'up' | 'down') => {
    if (type === 'hours') {
      if (direction === 'up' && hours < 12) {
        setHours(hours + 1);
      } else if (direction === 'down' && hours > 0) {
        setHours(hours - 1);
      }
    } else {
      if (direction === 'up' && minutes < 59) {
        setMinutes(minutes + 5);
      } else if (direction === 'down' && minutes > 0) {
        setMinutes(minutes - 5);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    // Calculate the event time (today + hours + minutes)
    const now = new Date();
    const eventTime = new Date(now);
    eventTime.setHours(now.getHours() + hours);
    eventTime.setMinutes(now.getMinutes() + minutes);

    const eventData = {
      title: title.trim(),
      event_date: eventTime.toISOString(),
      event_type: 'same_day',
      description: `Fun event happening in ${hours} hours and ${minutes} minutes!`,
      notification_settings: {
        notify_1_day: false,
        notify_1_hour: false,
        notify_15_min: true, // Always notify 15 min before for same-day events
      }
    };

    onSubmit(eventData);
  };

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
      >
        <FormCard padding="lg">
          <CloseButton onClick={onCancel}>
            <X size={24} />
          </CloseButton>

          <FormHeader>
            <FormTitle>🎉 Create Fun Event!</FormTitle>
            <FormSubtitle>What exciting thing is happening today?</FormSubtitle>
          </FormHeader>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="title">
                What's the event called? 🎈
              </Label>
              <Input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Pizza Party, Movie Time, etc..."
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>When is it happening? ⏰</Label>
              <TimePickerContainer>
                <TimeUnit>
                  <TimeIcon>🕐</TimeIcon>
                  <TimeLabel>Hours</TimeLabel>
                  <TimeControls>
                    <TimeButton
                      type="button"
                      onClick={() => adjustTime('hours', 'up')}
                      disabled={hours >= 12}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Plus size={24} />
                    </TimeButton>
                    <TimeDisplay>{hours}</TimeDisplay>
                    <TimeButton
                      type="button"
                      onClick={() => adjustTime('hours', 'down')}
                      disabled={hours <= 0}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Minus size={24} />
                    </TimeButton>
                  </TimeControls>
                </TimeUnit>

                <TimeUnit>
                  <TimeIcon>⏱️</TimeIcon>
                  <TimeLabel>Minutes</TimeLabel>
                  <TimeControls>
                    <TimeButton
                      type="button"
                      onClick={() => adjustTime('minutes', 'up')}
                      disabled={minutes >= 55}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Plus size={24} />
                    </TimeButton>
                    <TimeDisplay>{minutes.toString().padStart(2, '0')}</TimeDisplay>
                    <TimeButton
                      type="button"
                      onClick={() => adjustTime('minutes', 'down')}
                      disabled={minutes <= 0}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Minus size={24} />
                    </TimeButton>
                  </TimeControls>
                </TimeUnit>
              </TimePickerContainer>
            </FormGroup>

            <FormActions>
              <CancelButton
                type="button"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </CancelButton>
              <SubmitButton
                type="submit"
                loading={isLoading}
                disabled={isLoading || !title.trim()}
              >
                🎊 Create Event!
              </SubmitButton>
            </FormActions>
          </Form>
        </FormCard>
      </motion.div>
    </Overlay>
  );
};