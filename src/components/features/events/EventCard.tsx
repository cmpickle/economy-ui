import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { CountdownTimer } from '../../ui/CountdownTimer';
import { Event } from '../../../types/api';
import { formatDateTime } from '../../../utils/api';
import { Calendar, Clock, User, Bell, MoreVertical } from 'lucide-react';

interface EventCardProps {
  event: Event;
}

const StyledCard = styled(Card)`
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EventTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

const EventDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EventMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EventStatus = styled.div<{ status: 'upcoming' | 'today' | 'past' }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ status, theme }) => {
    switch (status) {
      case 'today':
        return `
          background-color: ${theme.colors.warning}20;
          color: ${theme.colors.warning};
          border: 1px solid ${theme.colors.warning}40;
        `;
      case 'past':
        return `
          background-color: ${theme.colors.gray[200]};
          color: ${theme.colors.gray[600]};
          border: 1px solid ${theme.colors.gray[300]};
        `;
      default:
        return `
          background-color: ${theme.colors.success}20;
          color: ${theme.colors.success};
          border: 1px solid ${theme.colors.success}40;
        `;
    }
  }}
`;

const CountdownSection = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const CountdownTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  text-align: center;
`;

const NotificationBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  background-color: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const ActionButton = styled(Button)`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: 50px;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${StyledCard}:hover & {
    opacity: 1;
  }
`;

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const [showActions, setShowActions] = useState(false);
  
  const getEventStatus = () => {
    const now = new Date();
    const eventDate = new Date(event.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (eventDate >= today && eventDate < tomorrow) {
      return 'today';
    } else if (eventDate > now) {
      return 'upcoming';
    } else {
      return 'past';
    }
  };

  const status = getEventStatus();
  const isUpcoming = status === 'upcoming' || status === 'today';
  
  const hasNotifications = event.notification_settings && (
    event.notification_settings.notify_1_day ||
    event.notification_settings.notify_1_hour ||
    event.notification_settings.notify_15_min ||
    (event.notification_settings.custom_notifications && 
     event.notification_settings.custom_notifications.length > 0)
  );

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <StyledCard padding="lg">
        <EventStatus status={status}>
          {status === 'today' ? 'Today' : status === 'past' ? 'Past' : 'Upcoming'}
        </EventStatus>
        
        <EventHeader>
          <div style={{ flex: 1, paddingRight: '60px' }}>
            <EventTitle>{event.title}</EventTitle>
            {event.description && (
              <EventDescription>{event.description}</EventDescription>
            )}
          </div>
        </EventHeader>

        <EventMeta>
          <MetaItem>
            <Calendar size={16} />
            {formatDateTime(event.event_date)}
          </MetaItem>
          
          <MetaItem>
            <User size={16} />
            Created by User #{event.created_by}
          </MetaItem>
          
          {hasNotifications && (
            <NotificationBadge>
              <Bell size={12} />
              Notifications enabled
            </NotificationBadge>
          )}
        </EventMeta>

        {isUpcoming && event.time_until_event && (
          <CountdownSection>
            <CountdownTitle>
              {status === 'today' ? 'Event is today!' : 'Time until event:'}
            </CountdownTitle>
            <CountdownTimer
              targetDate={event.event_date}
              showProgress={true}
            />
          </CountdownSection>
        )}

        {status === 'past' && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px',
            color: '#6B7280',
            fontStyle: 'italic'
          }}>
            This event has passed
          </div>
        )}
      </StyledCard>
    </motion.div>
  );
};