import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import DrillSelector from './components/DrillSelector';
import TrainerView from './components/TrainerView';
import ArenaView from './components/ArenaView';
import WeeklyReport from './components/WeeklyReport';
import PreflopView from './components/PreflopView';
import { DRILLS } from './data/gtoData';

const TRANSITION = { duration: 0.25 };

function Screen({ id, from, children }) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, x: from }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -from }}
      transition={TRANSITION}
    >
      {children}
    </motion.div>
  );
}

function App() {
  const [activeMode, setActiveMode] = useState(null);
  const back = () => setActiveMode(null);

  const handleSelect = (id) => {
    if (id === 'arena') setActiveMode({ type: 'arena' });
    else if (id === 'weekly') setActiveMode({ type: 'weekly' });
    else if (id === 'preflop') setActiveMode({ type: 'preflop' });
    else setActiveMode({ type: 'drill', id });
  };

  return (
    <AnimatePresence mode="wait">
      {activeMode?.type === 'arena' ? (
        <Screen id="arena" from={20}><ArenaView onBack={back} /></Screen>
      ) : activeMode?.type === 'preflop' ? (
        <Screen id="preflop" from={20}><PreflopView onBack={back} /></Screen>
      ) : activeMode?.type === 'weekly' ? (
        <Screen id="weekly" from={20}><WeeklyReport onBack={back} /></Screen>
      ) : activeMode?.type === 'drill' ? (
        // Keyed on the drill so switching drills remounts the trainer with a
        // clean session rather than inheriting the previous drill's state.
        <Screen id={`trainer-${activeMode.id}`} from={20}>
          <TrainerView drillId={activeMode.id} onBack={back} />
        </Screen>
      ) : (
        <Screen id="selector" from={-20}>
          <DrillSelector drills={DRILLS} onSelect={handleSelect} />
        </Screen>
      )}
    </AnimatePresence>
  );
}

export default App;
