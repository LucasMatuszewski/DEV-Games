import { useState, useEffect, useCallback } from 'react';

const codeLines = [
  "import React from 'react';",
  "import { useState, useEffect } from 'react';",
  'interface Props {',
  '  name: string;',
  '  age: number;',
  '}',
  '',
  'const App: React.FC<Props> = ({ name, age }) => {',
  '  const [count, setCount] = useState(0);',
  '',
  '  useEffect(() => {',
  "    document.title = name + ' App';",
  '  }, [name]);',
  '',
  '  const handleClick = () => {',
  '    setCount((prevCount) => prevCount + 1);',
  '  };',
  '',
  '  return (',
  '    <div>',
  '      <h1>Hello, {name}!</h1>',
  '      <p>You are {age} years old.</p>',
  '      <p>You clicked {count} times.</p>',
  '      <button onClick={handleClick}>Click me</button>',
  '    </div>',
  '  );',
  '};',
  '',
  'export default App;',
];

const CELL_SIZE = 20;
const GRID_WIDTH = 30;
const GRID_HEIGHT = 30;

const PLAYER = 'P';
const BUG = 'B';
const POINT = '.';
const CODE = '#';
const EMPTY = ' ';

const initialGrid = Array(GRID_HEIGHT)
  .fill(null)
  .map(() => Array(GRID_WIDTH).fill(EMPTY));

// Fill grid with code
codeLines.forEach((line, y) => {
  line.split('').forEach((char, x) => {
    if (x < GRID_WIDTH && y < GRID_HEIGHT) {
      initialGrid[y][x] = CODE;
    }
  });
});

// Add points
for (let i = 0; i < 20; i++) {
  const x = Math.floor(Math.random() * GRID_WIDTH);
  const y = Math.floor(Math.random() * GRID_HEIGHT);
  if (initialGrid[y][x] === EMPTY) {
    initialGrid[y][x] = POINT;
  }
}

const FEDevPacman1 = () => {
  const [grid, setGrid] = useState(initialGrid);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [bugs, setBugs] = useState([
    { x: GRID_WIDTH - 2, y: 1 },
    { x: 1, y: GRID_HEIGHT - 2 },
    { x: GRID_WIDTH - 2, y: GRID_HEIGHT - 2 },
  ]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      if (gameOver) return;

      setPlayerPos((prev) => {
        const newX = prev.x + dx;
        const newY = prev.y + dy;

        if (
          newX >= 0 &&
          newX < GRID_WIDTH &&
          newY >= 0 &&
          newY < GRID_HEIGHT &&
          grid[newY][newX] !== CODE
        ) {
          if (grid[newY][newX] === POINT) {
            setScore((prevScore) => prevScore + 1);
            setGrid((prevGrid) => {
              const newGrid = [...prevGrid];
              newGrid[newY][newX] = EMPTY;
              return newGrid;
            });
          }
          return { x: newX, y: newY };
        }
        return prev;
      });
    },
    [gameOver, grid]
  );

  const moveBugs = useCallback(() => {
    if (gameOver) return;

    setBugs((prevBugs) => {
      return prevBugs.map((bug) => {
        const directions = [
          { dx: 0, dy: 1 },
          { dx: 0, dy: -1 },
          { dx: 1, dy: 0 },
          { dx: -1, dy: 0 },
        ];

        const validMoves = directions.filter(({ dx, dy }) => {
          const newX = bug.x + dx;
          const newY = bug.y + dy;
          return (
            newX >= 0 &&
            newX < GRID_WIDTH &&
            newY >= 0 &&
            newY < GRID_HEIGHT &&
            grid[newY][newX] !== CODE
          );
        });

        if (validMoves.length > 0) {
          const { dx, dy } =
            validMoves[Math.floor(Math.random() * validMoves.length)];
          return { x: bug.x + dx, y: bug.y + dy };
        }

        return bug;
      });
    });
  }, [gameOver, grid]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
          movePlayer(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const bugMoveInterval = setInterval(moveBugs, 500);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(bugMoveInterval);
    };
  }, [movePlayer, moveBugs]);

  useEffect(() => {
    if (bugs.some((bug) => bug.x === playerPos.x && bug.y === playerPos.y)) {
      setGameOver(true);
    }
  }, [bugs, playerPos]);

  const getCellContent = (x: number, y: number) => {
    if (x === playerPos.x && y === playerPos.y) return PLAYER;
    if (bugs.some((bug) => bug.x === x && bug.y === y)) return BUG;
    return grid[y][x];
  };

  const getCellColor = (content: string) => {
    switch (content) {
      case PLAYER:
        return 'yellow';
      case BUG:
        return 'red';
      case POINT:
        return 'green';
      case CODE:
        return '#888';
      default:
        return 'transparent';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-2xl mb-4">FE Dev Pac-Man</h1>
      <div className="mb-4">Score: {score}</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_WIDTH}, ${CELL_SIZE}px)`,
          gap: '1px',
        }}
      >
        {grid.map((row, y) =>
          row.map((_, x) => {
            const content = getCellContent(x, y);
            return (
              <div
                key={`${x}-${y}`}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: getCellColor(content),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: content === CODE ? '8px' : '12px',
                }}
              >
                {content === CODE ? '#' : content}
              </div>
            );
          })
        )}
      </div>
      {gameOver && <div className="mt-4 text-xl text-red-500">Game Over!</div>}
    </div>
  );
};

export default FEDevPacman1;
