import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
}

const StyledCard = styled(motion.div)<CardProps>`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: all 0.2s ease;

  ${({ padding, theme }) => {
    switch (padding) {
      case 'sm':
        return `padding: ${theme.spacing.sm};`;
      case 'lg':
        return `padding: ${theme.spacing.xl};`;
      default:
        return `padding: ${theme.spacing.md};`;
    }
  }}

  ${({ hover, theme }) =>
    hover &&
    `
    cursor: pointer;
    &:hover {
      box-shadow: ${theme.shadows.md};
      transform: translateY(-2px);
    }
  `}
`;

export const Card: React.FC<CardProps> = ({ children, hover, ...props }) => {
  return (
    <StyledCard
      {...props}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </StyledCard>
  );
};