import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import { createTheme } from './styles/theme';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/features/dashboard/Dashboard';
import { EventsPage } from './components/features/events/EventsPage';
import { LoginForm } from './components/features/auth/LoginForm';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  }

  #root {
    min-height: 100vh;
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
`;

const ContentArea = styled.main`
  flex: 1;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.background};
`;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [themeColor, setThemeColor] = useState('#3B82F6');

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'chores':
        return <div style={{ padding: '2rem' }}>Chores section coming soon...</div>;
      case 'rewards':
        return <div style={{ padding: '2rem' }}>Rewards section coming soon...</div>;
      case 'events':
        return <EventsPage />;
      case 'leaderboard':
        return <div style={{ padding: '2rem' }}>Leaderboard section coming soon...</div>;
      case 'profile':
        return <div style={{ padding: '2rem' }}>Profile section coming soon...</div>;
      case 'manage':
        return <div style={{ padding: '2rem' }}>Family management section coming soon...</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppContainer>
      <Header />
      <MainContent>
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        <ContentArea>
          {renderContent()}
        </ContentArea>
      </MainContent>
    </AppContainer>
  );
};

function App() {
  const [themeColor] = useState('#3B82F6');
  const theme = createTheme(themeColor);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;