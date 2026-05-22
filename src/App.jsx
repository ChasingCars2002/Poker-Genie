import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import DrillSelector from './components/DrillSelector';
import TrainerView from './components/TrainerView';
import { DRILLS } from './data/gtoData';

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.12 },
};

export default function App() {
  const [activeDrill, setActiveDrill] = useState(null);

  return (
    <AnimatePresence mode="wait">
      {activeDrill ? (
        <motion.div key="trainer" {...fade}>
          <TrainerView drillId={activeDrill} onBack={() => setActiveDrill(null)} />
        </motion.div>
      ) : (
        <motion.div key="selector" {...fade}>
          <DrillSelector drills={DRILLS} onSelect={setActiveDrill} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
