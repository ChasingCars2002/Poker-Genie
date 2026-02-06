import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import DrillSelector from './components/DrillSelector';
import TrainerView from './components/TrainerView';
import { DRILLS } from './data/gtoData';

function App() {
  const [activeDrill, setActiveDrill] = useState(null);

  return (
    <AnimatePresence mode="wait">
      {activeDrill ? (
        <motion.div
          key="trainer"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <TrainerView
            drillId={activeDrill}
            onBack={() => setActiveDrill(null)}
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
            onSelect={setActiveDrill}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
