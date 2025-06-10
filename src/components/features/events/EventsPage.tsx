import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { useEvents, useCreateEvent } from '../../../hooks/useQuery';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { CountdownTimer } from '../../ui/CountdownTimer';
import { EventForm } from './EventForm';
import { EventCard } from './EventCard';
import { Calendar, Plus, Filter, Search } from 'lucide-react';

const EventsContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1200px;
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

const Controls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  padding-left: 40px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  width: 250px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 12px;
  width: 16px;
  height: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FilterButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const EmptyTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const EmptyDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FilterTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const FilterTab = styled.button<{ active: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  background: none;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  color: ${({ active, theme }) => 
    active ? theme.colors.primary : theme.colors.textSecondary};
  border-bottom-color: ${({ active, theme }) => 
    active ? theme.colors.primary : 'transparent'};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  const { data: events = [], isLoading } = useEvents();
  const createEventMutation = useCreateEvent();

  if (!user) return null;

  const canCreateEvents = user.profile.role === 'parent' || 
    (user.profile.role === 'teen' && user.profile.role === 'teen'); // Assuming teens can create events

  const filterEvents = (events: any[]) => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    const now = new Date();
    switch (activeFilter) {
      case 'upcoming':
        filtered = filtered.filter(event => new Date(event.event_date) > now);
        break;
      case 'past':
        filtered = filtered.filter(event => new Date(event.event_date) <= now);
        break;
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.event_date);
          return eventDate >= today && eventDate < tomorrow;
        });
        break;
      default:
        break;
    }

    return filtered.sort((a, b) => 
      new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    );
  };

  const filteredEvents = filterEvents(events);

  const handleCreateEvent = async (eventData: any) => {
    try {
      await createEventMutation.mutateAsync(eventData);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const getFilterCounts = () => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      all: events.length,
      upcoming: events.filter(event => new Date(event.event_date) > now).length,
      today: events.filter(event => {
        const eventDate = new Date(event.event_date);
        return eventDate >= today && eventDate < tomorrow;
      }).length,
      past: events.filter(event => new Date(event.event_date) <= now).length,
    };
  };

  const filterCounts = getFilterCounts();

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
          <Calendar size={32} />
          Family Events
        </Title>
        
        <Controls>
          <SearchContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          
          {canCreateEvents && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus size={16} />
              Create Event
            </Button>
          )}
        </Controls>
      </Header>

      <FilterTabs>
        <FilterTab 
          active={activeFilter === 'all'} 
          onClick={() => setActiveFilter('all')}
        >
          All ({filterCounts.all})
        </FilterTab>
        <FilterTab 
          active={activeFilter === 'upcoming'} 
          onClick={() => setActiveFilter('upcoming')}
        >
          Upcoming ({filterCounts.upcoming})
        </FilterTab>
        <FilterTab 
          active={activeFilter === 'today'} 
          onClick={() => setActiveFilter('today')}
        >
          Today ({filterCounts.today})
        </FilterTab>
        <FilterTab 
          active={activeFilter === 'past'} 
          onClick={() => setActiveFilter('past')}
        >
          Past ({filterCounts.past})
        </FilterTab>
      </FilterTabs>

      <AnimatePresence>
        {filteredEvents.length > 0 ? (
          <EventsGrid>
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </EventsGrid>
        ) : (
          <EmptyState
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <EmptyIcon>📅</EmptyIcon>
            <EmptyTitle>
              {searchTerm ? 'No events found' : 'No events yet'}
            </EmptyTitle>
            <EmptyDescription>
              {searchTerm 
                ? `No events match "${searchTerm}". Try a different search term.`
                : canCreateEvents 
                  ? 'Create your first family event to get started!'
                  : 'No events have been created yet. Ask a parent to create some events!'
              }
            </EmptyDescription>
            {canCreateEvents && !searchTerm && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus size={16} />
                Create Your First Event
              </Button>
            )}
          </EmptyState>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateForm && (
          <EventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setShowCreateForm(false)}
            isLoading={createEventMutation.isPending}
          />
        )}
      </AnimatePresence>
    </EventsContainer>
  );
};