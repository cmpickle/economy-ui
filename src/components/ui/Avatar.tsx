import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface AvatarProps {
  avatar?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

const AvatarContainer = styled(motion.div)<{ size: string; clickable: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  overflow: hidden;
  border: 2px solid ${({ theme }) => theme.colors.border};

  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          width: 32px;
          height: 32px;
          font-size: 14px;
        `;
      case 'lg':
        return `
          width: 64px;
          height: 64px;
          font-size: 24px;
        `;
      case 'xl':
        return `
          width: 96px;
          height: 96px;
          font-size: 36px;
        `;
      default:
        return `
          width: 48px;
          height: 48px;
          font-size: 18px;
        `;
    }
  }}
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const Avatar: React.FC<AvatarProps> = ({
  avatar,
  name,
  size = 'md',
  onClick,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getEmojiFromAvatar = (avatar: string) => {
    const avatarMap: { [key: string]: string } = {
      unicorn: '🦄',
      dragon: '🐉',
      cat: '🐱',
      dog: '🐶',
      lion: '🦁',
      tiger: '🐯',
      bear: '🐻',
      panda: '🐼',
      koala: '🐨',
      fox: '🦊',
      wolf: '🐺',
      monkey: '🐵',
    };
    return avatarMap[avatar] || '👤';
  };

  return (
    <AvatarContainer
      size={size}
      clickable={!!onClick}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
    >
      {avatar && avatar.startsWith('http') ? (
        <AvatarImage src={avatar} alt={name} />
      ) : avatar ? (
        getEmojiFromAvatar(avatar)
      ) : (
        getInitials(name)
      )}
    </AvatarContainer>
  );
};