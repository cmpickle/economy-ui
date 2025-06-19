import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

const SidebarContainer = styled.aside`
  width: 250px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.lg};
  height: calc(100vh - 80px);
  overflow-y: auto;
`;

const NavSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const NavItem = styled(motion.div)<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  transition: all 0.2s ease;

  ${({ active, theme }) =>
    active
      ? `
        background-color: ${theme.colors.primaryLight};
        color: ${theme.colors.primary};
      `
      : `
        color: ${theme.colors.text};
        &:hover {
          background-color: ${theme.colors.surfaceLight};
        }
      `}
`;

const NavIcon = styled.span`
  font-size: 18px;
  width: 20px;
  text-align: center;
`;

interface NavItemData {
  id: string;
  label: string;
  icon: string;
  roles: string[];
}

const navigationItems: NavItemData[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', roles: ['parent', 'teen', 'child'] },
  { id: 'chores', label: 'Chores', icon: '✅', roles: ['parent', 'teen', 'child'] },
  { id: 'learning', label: 'Learning', icon: '📚', roles: ['parent', 'teen', 'child'] },
  { id: 'rewards', label: 'Rewards', icon: '🎁', roles: ['parent', 'teen', 'child'] },
  { id: 'events', label: 'Events', icon: '📅', roles: ['parent', 'teen', 'child'] },
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆', roles: ['parent', 'teen', 'child'] },
  { id: 'transactions', label: 'Transactions', icon: '💳', roles: ['parent'] },
  { id: 'profile', label: 'Profile', icon: '👤', roles: ['parent', 'teen', 'child'] },
  { id: 'manage', label: 'Manage Family', icon: '👨‍👩‍👧‍👦', roles: ['parent'] },
];

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user } = useAuth();

  if (!user) return null;

  const userRole = user.profile.role;
  const availableItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  const mainItems = availableItems.filter(item => 
    !['profile', 'manage', 'transactions'].includes(item.id)
  );
  
  const managementItems = availableItems.filter(item => 
    ['transactions', 'manage'].includes(item.id)
  );

  const settingsItems = availableItems.filter(item => 
    ['profile'].includes(item.id)
  );

  return (
    <SidebarContainer>
      <NavSection>
        <SectionTitle>Main</SectionTitle>
        {mainItems.map((item, index) => (
          <NavItem
            key={item.id}
            active={activeSection === item.id}
            onClick={() => onSectionChange(item.id)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ x: 4 }}
          >
            <NavIcon>{item.icon}</NavIcon>
            {item.label}
          </NavItem>
        ))}
      </NavSection>

      {managementItems.length > 0 && (
        <NavSection>
          <SectionTitle>Management</SectionTitle>
          {managementItems.map((item, index) => (
            <NavItem
              key={item.id}
              active={activeSection === item.id}
              onClick={() => onSectionChange(item.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: (mainItems.length + index) * 0.1 }}
              whileHover={{ x: 4 }}
            >
              <NavIcon>{item.icon}</NavIcon>
              {item.label}
            </NavItem>
          ))}
        </NavSection>
      )}

      {settingsItems.length > 0 && (
        <NavSection>
          <SectionTitle>Settings</SectionTitle>
          {settingsItems.map((item, index) => (
            <NavItem
              key={item.id}
              active={activeSection === item.id}
              onClick={() => onSectionChange(item.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: (mainItems.length + managementItems.length + index) * 0.1 }}
              whileHover={{ x: 4 }}
            >
              <NavIcon>{item.icon}</NavIcon>
              {item.label}
            </NavItem>
          ))}
        </NavSection>
      )}
    </SidebarContainer>
  );
};