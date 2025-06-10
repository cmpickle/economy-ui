import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { useEvents, useCreateEvent } from '../../../hooks/useQuery';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { EventForm } from './EventForm';
import { EventCard } from './EventCard';
import { ChildEventForm } from './ChildEventForm';
import { ChildEventCalendar } from './ChildEventCalendar';
import { Calendar, Plus, Clock, Baby } from 'lucide-react';

const EventsContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ViewToggle = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 4px;
  gap: 4px;
`;

const ViewButton = styled(motion.button)<{ active: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: all 0.2s ease;
  
  ${({ active, theme }) =>
    active
      ? `
        background-color: ${theme.colors.primary};
        color: ${theme.colors.white};
        box-shadow: ${theme.shadows.sm};
      `
      : `
        background-color: transparent;
        color: ${theme.colors.textSecondary};
        &:hover {
          color: ${theme.colors.text};
        }
      `}
`;

const Controls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
`;

const CreateEventButton = styled(Button)<{ variant: 'child' | 'parent' }>`
  ${({ variant, theme }) =>
    variant === 'child'
      ? `
        background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
        font-size: ${theme.typography.fontSize.lg};
        padding: ${theme.spacing.md} ${theme.spacing.xl};
        border-radius: ${theme.borderRadius.xl};
        box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
        }
      `
      : ''}
`;

const ChildView = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ParentView = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyIcon = styled.div<{ childView?: boolean }>`
  font-size: ${({ childView }) => childView ? '6rem' : '4rem'};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const EmptyTitle = styled.h3<{ childView?: boolean }>`
  font-size: ${({ theme, childView }) => 
    childView ? theme.typography.fontSize['2xl'] : theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const EmptyDescription = styled.p<{ childView?: boolean }>`
  font-size: ${({ theme, childView }) => 
    childView ? theme.typography.fontSize.lg : theme.typography.fontSize.base};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'child' | 'parent'>('child');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { data: events = [], isLoading } = useEvents();
  const createEventMutation = useCreateEvent();

  if (!user) return null;

  const isParent = user.profile.role === 'parent';
  const isChild = user.profile.role === 'child';

  // Filter events based on view mode
  const filteredEvents = events.filter(event => {
    if (viewMode === 'child') {
      return event.event_type === 'same_day' || !event.event_type; // Show same-day events or legacy events
    } else {
      return event.event_type === 'scheduled' || !event.event_type; // Show scheduled events or legacy events
    }
  });

  const handleCreateEvent = async (eventData: any) => {
    try {
      const eventWithType = {
        ...eventData,
        event_type: viewMode === 'child' ? 'same_day' : 'scheduled'
      };
      await createEventMutation.mutateAsync(eventWithType);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  if (isLoading) {
    return (
      <EventsContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          fontSize: '18px'
        }}>
          Loading events...
        </div>
      </EventsContainer>
    );
  }

  return (
    <EventsContainer>
      <Header>
        <Title>
          {viewMode === 'child' ? '🎈' : '📅'} Family Events
        </Title>
        
        <Controls>
          <ViewToggle>
            <ViewButton
              active={viewMode === 'child'}
              onClick={() => setViewMode('child')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Baby size={16} />
              Kid View
            </ViewButton>
            <ViewButton
              active={viewMode === 'parent'}
              onClick={() => setViewMode('parent')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Calendar size={16} />
              Parent View
            </ViewButton>
          </ViewToggle>
          
          {(isParent || (viewMode === 'child' && !isParent)) && (
            <CreateEventButton
              variant={viewMode}
              onClick={() => setShowCreateForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={viewMode === 'child' ? 20 : 16} />
              {viewMode === 'child' ? 'Add Today Event!' : 'Create Event'}
            </CreateEventButton>
          )}
        </Controls>
      </Header>

      <AnimatePresence mode="wait">
        {viewMode === 'child' ? (
          <motion.div
            key="child-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {filteredEvents.length > 0 ? (
              <ChildView>
                <ChildEventCalendar events={filteredEvents} />
                <div>
                  {/* Today's events sidebar could go here */}
                </div>
              </ChildView>
            ) : (
              <EmptyState
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <EmptyIcon childView>🎪</EmptyIcon>
                <EmptyTitle childView>No Fun Events Yet!</EmptyTitle>
                <EmptyDescription childView>
                  Ask a grown-up to add some exciting events, or create a same-day event yourself!
                </EmptyDescription>
                {!isParent && (
                  <CreateEventButton
                    variant="child"
                    onClick={() => setShowCreateForm(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus size={20} />
                    Add Today Event!
                  </CreateEventButton>
                )}
              </EmptyState>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="parent-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {filteredEvents.length > 0 ? (
              <ParentView>
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </ParentView>
            ) : (
              <EmptyState
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <EmptyIcon>📅</EmptyIcon>
                <EmptyTitle>No Events Scheduled</EmptyTitle>
                <EmptyDescription>
                  Create your first family event to get started!
                </EmptyDescription>
                {isParent && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus size={16} />
                    Create Your First Event
                  </Button>
                )}
              </EmptyState>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateForm && (
          <>
            {viewMode === 'child' ? (
              <ChildEventForm
                onSubmit={handleCreateEvent}
                onCancel={() => setShowCreateForm(false)}
                isLoading={createEventMutation.isPending}
              />
            ) : (
              <EventForm
                onSubmit={handleCreateEvent}
                onCancel={() => setShowCreateForm(false)}
                isLoading={createEventMutation.isPending}
              />
            )}
          </>
        )}
      </AnimatePresence>
    </EventsContainer>
  );
};