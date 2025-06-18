import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { X, RotateCcw, CheckCircle, Clock, Target } from 'lucide-react';

interface SudokuGameProps {
  task: any;
  onClose: () => void;
  onComplete: (result: any) => void;
}

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const GameContainer = styled(Card)`
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const GameTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const GameStats = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  opacity: 0.8;
`;

const GameBoard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const SudokuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 4px;
  background: rgba(255, 255, 255, 0.2);
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const SudokuCell = styled(motion.div)<{ 
  isPrefilled: boolean; 
  isCorrect?: boolean; 
  isIncorrect?: boolean;
  isEmpty: boolean;
}>`
  width: 80px;
  height: 80px;
  background: ${({ isPrefilled, isCorrect, isIncorrect }) => {
    if (isPrefilled) return 'rgba(255, 255, 255, 0.9)';
    if (isCorrect) return 'rgba(34, 197, 94, 0.8)';
    if (isIncorrect) return 'rgba(239, 68, 68, 0.8)';
    return 'rgba(255, 255, 255, 0.6)';
  }};
  border: 2px solid ${({ isPrefilled }) => 
    isPrefilled ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)'};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ isPrefilled }) => isPrefilled ? '#1F2937' : '#FFFFFF'};
  cursor: ${({ isPrefilled, isEmpty }) => 
    isPrefilled ? 'not-allowed' : isEmpty ? 'pointer' : 'default'};
  transition: all 0.2s ease;
  position: relative;
  user-select: none;

  &:hover {
    ${({ isPrefilled, isEmpty }) => 
      !isPrefilled && isEmpty && `
        transform: scale(1.05);
        border-color: rgba(255, 255, 255, 0.8);
        box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
      `}
  }
`;

const TokensContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
`;

const NumberToken = styled(motion.div)<{ isUsed: boolean }>`
  width: 60px;
  height: 60px;
  background: ${({ isUsed }) => 
    isUsed ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.9)'};
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ isUsed }) => isUsed ? 'rgba(255, 255, 255, 0.5)' : '#1F2937'};
  cursor: ${({ isUsed }) => isUsed ? 'not-allowed' : 'grab'};
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    ${({ isUsed }) => !isUsed && `
      transform: scale(1.1);
      box-shadow: 0 4px 15px rgba(255, 255, 255, 0.4);
    `}
  }

  &:active {
    cursor: grabbing;
  }
`;

const GameControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const SuccessMessage = styled(motion.div)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  background: rgba(34, 197, 94, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const generateSudoku3x3 = () => {
  // Generate a valid 3x3 Sudoku solution
  const solutions = [
    [
      [1, 2, 3],
      [3, 1, 2],
      [2, 3, 1]
    ],
    [
      [2, 1, 3],
      [3, 2, 1],
      [1, 3, 2]
    ],
    [
      [3, 1, 2],
      [2, 3, 1],
      [1, 2, 3]
    ],
    [
      [1, 3, 2],
      [2, 1, 3],
      [3, 2, 1]
    ]
  ];

  const solution = solutions[Math.floor(Math.random() * solutions.length)];
  
  // Create puzzle by removing some numbers (keep 2-4 numbers visible)
  const puzzle = solution.map(row => [...row]);
  const prefilledPositions: { row: number; col: number }[] = [];
  
  // Randomly select 2-3 positions to keep filled
  const numPrefilled = 2 + Math.floor(Math.random() * 2);
  const allPositions = [];
  
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      allPositions.push({ row, col });
    }
  }
  
  // Shuffle and select positions to keep
  const shuffled = allPositions.sort(() => Math.random() - 0.5);
  const selectedPositions = shuffled.slice(0, numPrefilled);
  
  // Clear non-selected positions
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const isSelected = selectedPositions.some(pos => pos.row === row && pos.col === col);
      if (isSelected) {
        prefilledPositions.push({ row, col });
      } else {
        puzzle[row][col] = null;
      }
    }
  }

  return {
    puzzle,
    solution,
    prefilledPositions
  };
};

export const SudokuGame: React.FC<SudokuGameProps> = ({ task, onClose, onComplete }) => {
  const [gameData, setGameData] = useState(() => generateSudoku3x3());
  const [currentGrid, setCurrentGrid] = useState(gameData.puzzle);
  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [startTime] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAvailableTokens = () => {
    const used = currentGrid.flat().filter(cell => cell !== null);
    const available = [1, 2, 3];
    
    return available.map(num => ({
      number: num,
      count: 3 - used.filter(cell => cell === num).length
    })).filter(token => token.count > 0);
  };

  const isPrefilled = (row: number, col: number) => {
    return gameData.prefilledPositions.some(pos => pos.row === row && pos.col === col);
  };

  const handleCellClick = (row: number, col: number) => {
    if (isPrefilled(row, col) || !selectedToken || isCompleted) return;

    const newGrid = currentGrid.map(r => [...r]);
    
    // If cell is empty, place the token
    if (newGrid[row][col] === null) {
      newGrid[row][col] = selectedToken;
      setCurrentGrid(newGrid);
      setSelectedToken(null);
      
      // Check if placement is correct
      if (gameData.solution[row][col] !== selectedToken) {
        setMistakes(prev => prev + 1);
      }
      
      // Check if puzzle is completed
      const isComplete = newGrid.every((row, r) => 
        row.every((cell, c) => cell === gameData.solution[r][c])
      );
      
      if (isComplete) {
        setIsCompleted(true);
        setTimeout(() => {
          onComplete({
            completed: true,
            timeElapsed,
            mistakes,
            score: Math.max(100 - mistakes * 10 - Math.floor(timeElapsed / 30), 10)
          });
        }, 2000);
      }
    }
    // If cell has a number and it's not prefilled, remove it
    else if (!isPrefilled(row, col)) {
      newGrid[row][col] = null;
      setCurrentGrid(newGrid);
    }
  };

  const handleTokenClick = (number: number) => {
    if (isCompleted) return;
    setSelectedToken(selectedToken === number ? null : number);
  };

  const resetGame = () => {
    const newGame = generateSudoku3x3();
    setGameData(newGame);
    setCurrentGrid(newGame.puzzle);
    setSelectedToken(null);
    setMistakes(0);
    setIsCompleted(false);
    setShowValidation(false);
  };

  const validatePuzzle = () => {
    setShowValidation(true);
    setTimeout(() => setShowValidation(false), 2000);
  };

  const getCellValidation = (row: number, col: number) => {
    if (!showValidation || currentGrid[row][col] === null) return {};
    
    const isCorrect = currentGrid[row][col] === gameData.solution[row][col];
    return {
      isCorrect,
      isIncorrect: !isCorrect
    };
  };

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
      >
        <GameContainer padding="lg">
          <GameHeader>
            <GameTitle>
              🧩 3×3 Sudoku Puzzle
            </GameTitle>
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </GameHeader>

          <GameStats>
            <StatItem>
              <StatValue>
                <Clock size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                {formatTime(timeElapsed)}
              </StatValue>
              <StatLabel>Time</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>
                <Target size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                {mistakes}
              </StatValue>
              <StatLabel>Mistakes</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>⭐ {task.point_value}</StatValue>
              <StatLabel>Points</StatLabel>
            </StatItem>
          </GameStats>

          <GameBoard>
            <SudokuGrid>
              {currentGrid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <SudokuCell
                    key={`${rowIndex}-${colIndex}`}
                    isPrefilled={isPrefilled(rowIndex, colIndex)}
                    isEmpty={cell === null}
                    {...getCellValidation(rowIndex, colIndex)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    whileHover={{ scale: isPrefilled(rowIndex, colIndex) || cell !== null ? 1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {cell}
                  </SudokuCell>
                ))
              )}
            </SudokuGrid>

            <div>
              <h3 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.25rem' }}>
                Available Numbers
              </h3>
              <TokensContainer>
                {getAvailableTokens().map(token => (
                  <NumberToken
                    key={token.number}
                    isUsed={token.count === 0}
                    onClick={() => handleTokenClick(token.number)}
                    whileHover={{ scale: token.count > 0 ? 1.1 : 1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      border: selectedToken === token.number ? '3px solid #FFD700' : undefined,
                      boxShadow: selectedToken === token.number ? '0 0 20px rgba(255, 215, 0, 0.5)' : undefined
                    }}
                  >
                    {token.number}
                    <div style={{
                      position: 'absolute',
                      bottom: '-8px',
                      right: '-8px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      color: '#1F2937',
                      fontWeight: 'bold'
                    }}>
                      {token.count}
                    </div>
                  </NumberToken>
                ))}
              </TokensContainer>
            </div>

            <GameControls>
              <Button variant="ghost" onClick={validatePuzzle} disabled={isCompleted}>
                <CheckCircle size={16} />
                Check Progress
              </Button>
              <Button variant="ghost" onClick={resetGame}>
                <RotateCcw size={16} />
                New Puzzle
              </Button>
            </GameControls>

            <AnimatePresence>
              {isCompleted && (
                <SuccessMessage
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.8 }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    Congratulations!
                  </h3>
                  <p style={{ fontSize: '1rem', opacity: 0.9 }}>
                    You completed the puzzle in {formatTime(timeElapsed)} with {mistakes} mistakes!
                  </p>
                  <div style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 'bold', 
                    marginTop: '1rem',
                    color: '#FFD700'
                  }}>
                    Score: {Math.max(100 - mistakes * 10 - Math.floor(timeElapsed / 30), 10)}/100
                  </div>
                </SuccessMessage>
              )}
            </AnimatePresence>
          </GameBoard>
        </GameContainer>
      </motion.div>
    </Overlay>
  );
};