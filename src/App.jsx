import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import DrillSelector from './components/DrillSelector';
import TrainerView from './components/TrainerView';
import ArenaView from './components/ArenaView';
import { DRILLS } from './data/gtoData';

function App() {
  const [activeMode, setActiveMode] = useState(null);

  const handleSelect = (id) => {
    if (id === 'arena') {
      setActiveMode({ type: 'arena' });
    } else {
      setActiveMode({ type: 'drill', id });
    }
  };

  return (
    <AnimatePresence mode="wait">
      {activeMode?.type === 'arena' ? (
        <motion.div
          key="arena"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <ArenaView onBack={() => setActiveMode(null)} />
        </motion.div>
      ) : activeMode?.type === 'drill' ? (
        <motion.div
          key="trainer"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <TrainerView
            drillId={activeMode.id}
            onBack={() => setActiveMode(null)}
          />
        </motion.div>
      ) : (
        <motion.div
          key="selector"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.25 }}
        >
          <DrillSelector
            drills={DRILLS}
            onSelect={handleSelect}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
