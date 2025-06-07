import React from 'react';
import styled from 'styled-components';
import { Button } from '../../ui/Button';
import { User } from '../../../types/api';
import { X, RotateCcw } from 'lucide-react';

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FilterTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FilterLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceLight};
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SortControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SortButton = styled.button<{ active: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ active, theme }) => 
    active ? theme.colors.primary : theme.colors.surface};
  color: ${({ active, theme }) => 
    active ? theme.colors.white : theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ active, theme }) => 
      active ? theme.colors.primaryDark : theme.colors.surfaceLight};
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

interface ChoreFiltersProps {
  filters: {
    status: string[];
    assignedTo: string[];
    dateRange: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  onFiltersChange: (filters: any) => void;
  householdMembers: User[];
  onClose: () => void;
}

export const ChoreFilters: React.FC<ChoreFiltersProps> = ({
  filters,
  onFiltersChange,
  householdMembers,
  onClose,
}) => {
  const statusOptions = [
    { value: 'incomplete', label: 'Incomplete' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'completed', label: 'Completed' },
    { value: 'skipped', label: 'Skipped' },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'today', label: 'Due Today' },
    { value: 'week', label: 'Due This Week' },
    { value: 'month', label: 'Due This Month' },
  ];

  const sortOptions = [
    { value: 'due_date', label: 'Due Date' },
    { value: 'point_value', label: 'Point Value' },
    { value: 'name', label: 'Name' },
    { value: 'status', label: 'Status' },
  ];

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked
      ? [...filters.status, status]
      : filters.status.filter(s => s !== status);
    
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handleAssignedToChange = (userId: string, checked: boolean) => {
    const newAssignedTo = checked
      ? [...filters.assignedTo, userId]
      : filters.assignedTo.filter(id => id !== userId);
    
    onFiltersChange({ ...filters, assignedTo: newAssignedTo });
  };

  const handleDateRangeChange = (dateRange: string) => {
    onFiltersChange({ ...filters, dateRange });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    onFiltersChange({ ...filters, sortOrder });
  };

  const resetFilters = () => {
    onFiltersChange({
      status: [],
      assignedTo: [],
      dateRange: 'all',
      sortBy: 'due_date',
      sortOrder: 'asc',
    });
  };

  return (
    <FiltersContainer>
      <FilterHeader>
        <FilterTitle>Filters</FilterTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={16} />
        </Button>
      </FilterHeader>

      <FilterSection>
        <FilterLabel>Status</FilterLabel>
        <CheckboxGroup>
          {statusOptions.map(option => (
            <CheckboxItem key={option.value}>
              <Checkbox
                type="checkbox"
                checked={filters.status.includes(option.value)}
                onChange={(e) => handleStatusChange(option.value, e.target.checked)}
              />
              {option.label}
            </CheckboxItem>
          ))}
        </CheckboxGroup>
      </FilterSection>

      <FilterSection>
        <FilterLabel>Assigned To</FilterLabel>
        <CheckboxGroup>
          {householdMembers.map(member => (
            <CheckboxItem key={member.id}>
              <Checkbox
                type="checkbox"
                checked={filters.assignedTo.includes(member.id.toString())}
                onChange={(e) => handleAssignedToChange(member.id.toString(), e.target.checked)}
              />
              {member.first_name} {member.last_name}
            </CheckboxItem>
          ))}
        </CheckboxGroup>
      </FilterSection>

      <FilterSection>
        <FilterLabel>Due Date</FilterLabel>
        <Select
          value={filters.dateRange}
          onChange={(e) => handleDateRangeChange(e.target.value)}
        >
          {dateRangeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FilterSection>

      <FilterSection>
        <FilterLabel>Sort By</FilterLabel>
        <Select
          value={filters.sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        
        <SortControls>
          <SortButton
            active={filters.sortOrder === 'asc'}
            onClick={() => handleSortOrderChange('asc')}
          >
            Ascending
          </SortButton>
          <SortButton
            active={filters.sortOrder === 'desc'}
            onClick={() => handleSortOrderChange('desc')}
          >
            Descending
          </SortButton>
        </SortControls>
      </FilterSection>

      <FilterActions>
        <Button variant="ghost" size="sm" onClick={resetFilters} fullWidth>
          <RotateCcw size={16} />
          Reset Filters
        </Button>
      </FilterActions>
    </FiltersContainer>
  );
};