import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateTimeUntil } from '../../utils/api';

interface CountdownTimerProps {
  targetDate: string;
  onComplete?: () => void;
  showProgress?: boolean;
}

const TimerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const TimeDisplay = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`;

const TimeUnit = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.sm};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  min-width: 60px;
`;

const TimeValue = styled(motion.div)`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
  line-height: 1;
`;

const TimeLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
`;

const Separator = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 ${({ theme }) => theme.spacing.xs};
`;

const ProgressContainer = styled.div`
  width: 100%;
  max-width: 300px;
`;

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  onComplete,
  showProgress = true,
}) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeUntil(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeUntil(targetDate);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total_seconds <= 0 && onComplete) {
        onComplete();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const timeUnits = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' },
  ];

  if (timeLeft.total_seconds <= 0) {
    return (
      <TimerContainer>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          🎉 Event Time! 🎉
        </motion.div>
      </TimerContainer>
    );
  }

  return (
    <TimerContainer>
      <TimeDisplay>
        <AnimatePresence mode="wait">
          {timeUnits.map((unit, index) => (
            <React.Fragment key={unit.label}>
              <TimeUnit
                key={`${unit.label}-${unit.value}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TimeValue
                  key={unit.value}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {unit.value.toString().padStart(2, '0')}
                </TimeValue>
                <TimeLabel>{unit.label}</TimeLabel>
              </TimeUnit>
              {index < timeUnits.length - 1 && <Separator>:</Separator>}
            </React.Fragment>
          ))}
        </AnimatePresence>
      </TimeDisplay>
      
      {showProgress && (
        <ProgressContainer>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${timeLeft.progress_percentage}%` }}
            style={{
              height: '4px',
              backgroundColor: '#3B82F6',
              borderRadius: '2px',
            }}
          />
        </ProgressContainer>
      )}
    </TimerContainer>
  );
};