import { lazy, Suspense } from 'react';
import { Routes, Route, useParams, Link } from 'react-router-dom';

import Home from './Home';
import './App.css';

const DynamicGame = () => {
  const { id } = useParams();
  const GameComponent = lazy(() =>
    import(`./Games/${id}`).catch(() => import('./Games/FEDevPacman1'))
  ); // Fallback to a default component if the import fails;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Link to="/" className="App-link">
        Back to Home
      </Link>
      <GameComponent />
    </Suspense>
  );
};

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games/:id" element={<DynamicGame />} />
        </Routes>
      </header>
    </div>
  );
}

export default App;
