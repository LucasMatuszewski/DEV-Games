import { Link } from 'react-router-dom';
import gamesList from '../gamesList.json';
import './Home.css';

const games = gamesList || [
  'FEDevPacman1',
  // Add more game names as needed
];

const Home = () => {
  return (
    <div className="home-container">
      <img
        src="/DEV-Games/space-invader.svg"
        alt="Space Invader"
        className="space-invader-icon"
      />
      <h1>Dev Games</h1>
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
