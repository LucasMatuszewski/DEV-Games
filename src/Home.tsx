import React from 'react';
import { Link } from 'react-router-dom';
import gamesList from './gamesList.json';

const games = gamesList || [
  'FEDevPacman1',
  // Add more game names as needed
];

const Home = () => {
  return (
    <div>
      <h1>Game Menu</h1>
      <ul>
        {games.map((game) => (
          <li key={game}>
            <Link to={`/games/${game}`}>{game}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
