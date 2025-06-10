import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { CountdownTimer } from '../../ui/CountdownTimer';
import { Event } from '../../../types/api';
import { formatDateTime } from '../../../utils/api';

interface ChildEventCalendarProps {
  events: Event[];
}

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const CalendarHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CalendarTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const TodayDate = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EventsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const EventCard = styled(motion.div)`
  background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
  border-radius: 24px;
  padding: ${({ theme }) => theme.spacing.xl};
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
    animation: shimmer 3s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const EventIcon = styled.div`
  font-size: 4rem;
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
`;

const EventTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const EventTime = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  opacity: 0.9;
`;

const CountdownSection = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  backdrop-filter: blur(10px);
`;

const CountdownTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const NoEventsCard = styled(Card)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']};
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
`;

const NoEventsIcon = styled.div`
  font-size: 6rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const NoEventsTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const NoEventsText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const getEventIcon = (title: string): string => {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('pizza')) return '🍕';
  if (titleLower.includes('movie') || titleLower.includes('film')) return '🎬';
  if (titleLower.includes('party')) return '🎉';
  if (titleLower.includes('game')) return '🎮';
  if (titleLower.includes('park')) return '🌳';
  if (titleLower.includes('beach')) return '🏖️';
  if (titleLower.includes('birthday')) return '🎂';
  if (titleLower.includes('dinner') || titleLower.includes('lunch')) return '🍽️';
  if (titleLower.includes('ice cream')) return '🍦';
  if (titleLower.includes('zoo')) return '🦁';
  if (titleLower.includes('museum')) return '🏛️';
  if (titleLower.includes('swim')) return '🏊';
  if (titleLower.includes('bike')) return '🚴';
  if (titleLower.includes('book') || titleLower.includes('read')) return '📚';
  if (titleLower.includes('music')) return '🎵';
  if (titleLower.includes('art') || titleLower.includes('draw')) return '🎨';
  if (titleLower.includes('sleep') || titleLower.includes('nap')) return '😴';
  if (titleLower.includes('walk')) return '🚶';
  if (titleLower.includes('car') || titleLower.includes('drive')) return '🚗';
  
  return '🎈'; // Default fun icon
};

export const ChildEventCalendar: React.FC<ChildEventCalendarProps> = ({ events }) => {
  const today = new Date();
  const todayString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Filter for today's events and upcoming events
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.event_date);
    return eventDate.toDateString() === today.toDateString();
  });

  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.event_date);
    return eventDate > today;
  }).slice(0, 3); // Show next 3 upcoming events

  const allDisplayEvents = [...todayEvents, ...upcomingEvents];

  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>🌟 Fun Events Calendar 🌟</CalendarTitle>
        <TodayDate>Today is {todayString}</TodayDate>
      </CalendarHeader>

      <EventsGrid>
        {allDisplayEvents.length > 0 ? (
          allDisplayEvents.map((event, index) => {
            const isToday = todayEvents.includes(event);
            const eventIcon = getEventIcon(event.title);
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.2,
                  type: 'spring',
                  stiffness: 200
                }}
              >
                <EventCard
                  whileHover={{ 
                    scale: 1.02, 
                    y: -5,
                    boxShadow: '0 15px 40px rgba(255, 107, 107, 0.4)'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <EventIcon>{eventIcon}</EventIcon>
                  <EventTitle>{event.title}</EventTitle>
                  <EventTime>
                    {isToday ? '🎊 Today!' : formatDateTime(event.event_date)}
                  </EventTime>
                  
                  <CountdownSection>
                    <CountdownTitle>
                      {isToday ? 'Time until fun!' : 'Countdown to event:'}
                    </CountdownTitle>
                    <CountdownTimer
                      targetDate={event.event_date}
                      showProgress={true}
                    />
                  </CountdownSection>
                </EventCard>
              </motion.div>
            );
          })
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <NoEventsCard>
              <NoEventsIcon>🎪</NoEventsIcon>
              <NoEventsTitle>No Events Today!</NoEventsTitle>
              <NoEventsText>
                Ask a grown-up to plan something fun, or create your own same-day event!
              </NoEventsText>
            </NoEventsCard>
          </motion.div>
        )}
      </EventsGrid>
    </CalendarContainer>
  );
};