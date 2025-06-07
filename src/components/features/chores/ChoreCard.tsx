import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Avatar } from '../../ui/Avatar';
import { Chore, User } from '../../../types/api';
import { formatPoints, formatDate } from '../../../utils/api';
import { 
  Calendar, 
  User as UserIcon, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MessageSquare,
  RotateCcw
} from 'lucide-react';

const ChoreCardContainer = styled(Card)<{ status: string }>`
  position: relative;
  transition: all 0.2s ease;
  border-left: 4px solid ${({ status, theme }) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'pending': return theme.colors.warning;
      case 'incomplete': return theme.colors.primary;
      case 'skipped': return theme.colors.error;
      default: return theme.colors.border;
    }
  }};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const ChoreHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ChoreTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
  line-height: 1.3;
`;

const StatusBadge = styled.div<{ status: string }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ status, theme }) => {
    switch (status) {
      case 'completed':
        return `
          background-color: ${theme.colors.success}20;
          color: ${theme.colors.success};
        `;
      case 'pending':
        return `
          background-color: ${theme.colors.warning}20;
          color: ${theme.colors.warning};
        `;
      case 'incomplete':
        return `
          background-color: ${theme.colors.primary}20;
          color: ${theme.colors.primary};
        `;
      case 'skipped':
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

const ChoreDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  line-height: 1.4;
`;

const ChoreDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DetailIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PointsValue = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.primary};
`;

const AssignedUser = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const DueDate = styled.div<{ isOverdue: boolean }>`
  color: ${({ isOverdue, theme }) => 
    isOverdue ? theme.colors.error : theme.colors.textSecondary
  };
  font-weight: ${({ isOverdue, theme }) => 
    isOverdue ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal
  };
`;

const RecurrenceBadge = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 2px ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ChoreActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const NotesSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const NotesLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const NotesText = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.4;
`;

const NotesInput = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  resize: vertical;
  min-height: 60px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

interface ChoreCardProps {
  chore: Chore;
  currentUser: User;
  onComplete: (choreId: number, notes?: string) => void;
  onApprove: (choreId: number, approved: boolean, feedback?: string) => void;
  householdMembers: User[];
}

export const ChoreCard: React.FC<ChoreCardProps> = ({
  chore,
  currentUser,
  onComplete,
  onApprove,
  householdMembers,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isParent = currentUser.profile.role === 'parent';
  const isAssignedToMe = chore.assigned_to === currentUser.id;
  const assignedUser = householdMembers.find(user => user.id === chore.assigned_to);
  
  const dueDate = new Date(chore.due_date);
  const isOverdue = dueDate < new Date() && chore.status === 'incomplete';

  const getStatusIcon = () => {
    switch (chore.status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'skipped':
        return <XCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getRecurrenceText = () => {
    switch (chore.recurrence) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'annually': return 'Yearly';
      default: return null;
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(chore.id, notes);
      setNotes('');
      setShowNotes(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (approved: boolean) => {
    setIsSubmitting(true);
    try {
      await onApprove(chore.id, approved, feedback);
      setFeedback('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canComplete = isAssignedToMe && chore.status === 'incomplete';
  const canApprove = isParent && chore.status === 'pending';

  return (
    <ChoreCardContainer status={chore.status}>
      <ChoreHeader>
        <div style={{ flex: 1 }}>
          <ChoreTitle>{chore.name}</ChoreTitle>
          {chore.description && (
            <ChoreDescription>{chore.description}</ChoreDescription>
          )}
        </div>
        <StatusBadge status={chore.status}>
          {getStatusIcon()}
          {chore.status}
        </StatusBadge>
      </ChoreHeader>

      <ChoreDetails>
        <DetailRow>
          <DetailIcon>⭐</DetailIcon>
          <PointsValue>{formatPoints(chore.point_value)}</PointsValue>
        </DetailRow>

        <DetailRow>
          <DetailIcon><Calendar size={16} /></DetailIcon>
          <DueDate isOverdue={isOverdue}>
            Due: {formatDate(chore.due_date)}
            {isOverdue && ' (Overdue)'}
          </DueDate>
        </DetailRow>

        {assignedUser && (
          <DetailRow>
            <DetailIcon><UserIcon size={16} /></DetailIcon>
            <AssignedUser>
              <Avatar
                avatar={assignedUser.profile.avatar}
                name={`${assignedUser.first_name} ${assignedUser.last_name}`}
                size="sm"
              />
              {assignedUser.first_name} {assignedUser.last_name}
            </AssignedUser>
          </DetailRow>
        )}

        {getRecurrenceText() && (
          <DetailRow>
            <DetailIcon><RotateCcw size={16} /></DetailIcon>
            <RecurrenceBadge>
              {getRecurrenceText()}
            </RecurrenceBadge>
          </DetailRow>
        )}
      </ChoreDetails>

      {(chore.notes || chore.status === 'pending') && (
        <NotesSection>
          <NotesLabel>
            {chore.status === 'pending' ? 'Completion Notes' : 'Notes'}
          </NotesLabel>
          <NotesText>{chore.notes}</NotesText>
        </NotesSection>
      )}

      <ChoreActions>
        {canComplete && (
          <>
            <Button
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
              variant="ghost"
            >
              <MessageSquare size={16} />
              {showNotes ? 'Cancel' : 'Add Notes'}
            </Button>
            <Button
              size="sm"
              onClick={showNotes ? handleComplete : () => onComplete(chore.id)}
              loading={isSubmitting}
              disabled={showNotes && !notes.trim()}
            >
              <CheckCircle size={16} />
              Complete
            </Button>
          </>
        )}

        {canApprove && (
          <>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleApprove(false)}
              loading={isSubmitting}
            >
              <XCircle size={16} />
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => handleApprove(true)}
              loading={isSubmitting}
            >
              <CheckCircle size={16} />
              Approve
            </Button>
          </>
        )}
      </ChoreActions>

      {showNotes && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{ marginTop: '1rem' }}
        >
          <NotesInput
            placeholder="Add any notes about completing this chore..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </motion.div>
      )}

      {canApprove && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{ marginTop: '1rem' }}
        >
          <NotesInput
            placeholder="Add feedback for the family member..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </motion.div>
      )}
    </ChoreCardContainer>
  );
};