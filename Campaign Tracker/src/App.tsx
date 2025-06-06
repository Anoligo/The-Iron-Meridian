import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { Quests } from '@/features/quests/Quests';
import { Characters } from '@/features/characters/Characters';
import { Locations } from '@/features/locations/Locations';
import { Loot } from '@/features/loot/Loot';
import { Factions } from '@/features/factions/Factions';
import { Npcs } from '@/features/npcs/Npcs';
import { Notes } from '@/features/notes/Notes';
import { Settings } from '@/features/settings/Settings';
import '@/styles/global.scss';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <div className="app">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/quests" element={<Quests />} />
                <Route path="/characters" element={<Characters />} />
                <Route path="/locations" element={<Locations />} />
                <Route path="/loot" element={<Loot />} />
                <Route path="/factions" element={<Factions />} />
                <Route path="/npcs" element={<Npcs />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text)',
                  border: '1px solid var(--border-light)',
                },
              }}
            />
          </div>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
