import React, { useState, useEffect, useCallback } from 'react';

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
  "    document.title = `${name}'s App`;",
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
  '      <button onClick={handleClick}>',
  '        Click me',
  '      </button>',
  '    </div>',
  '  );',
  '};',
  '',
  'export default App;',
];

const CELL_SIZE = 30; // Increased cell size
const GRID_WIDTH = 32;
const GRID_HEIGHT = 32;

const PLAYER = 'D';
const EMPTY = ' ';
const CODE = '#';

const pointTypes = [
  { name: 'A11y', points: 10 },
  { name: 'UX', points: 9 },
  { name: 'TS', points: 8 },
  { name: 'TDD', points: 7 },
  { name: 'SEO', points: 6 },
  { name: 'KISS', points: 5 },
  { name: 'DRY', points: 4 },
  { name: 'A/B', points: 3 },
  { name: 'O(1)', points: 2 },
].sort((a, b) => b.points - a.points);

const bugTypes = [
  { name: 'Err', color: '#FF0000' },
  { name: 'bug', color: '#FF3333' },
  { name: 'O(n²)', color: '#FF6666' },
  { name: 'any', color: '#FF9999' },
  { name: 'NaN', color: '#FFCCCC' },
  { name: '404', color: '#CC0000' },
  { name: 'mem', color: '#990000' },
];

const initialGrid = Array(GRID_HEIGHT)
  .fill(null)
  .map(() => Array(GRID_WIDTH).fill(EMPTY));

// Fill grid with code, adding padding
codeLines.forEach((line, y) => {
  const paddedLine = ' ' + line + ' ';
  paddedLine.split('').forEach((char, x) => {
    if (x < GRID_WIDTH && y + 1 < GRID_HEIGHT - 1) {
      initialGrid[y + 1][x] = char === ' ' ? EMPTY : CODE;
    }
  });
});

// Function to get a random point type with higher chance for lower point values
const getRandomPointType = () => {
  const totalWeight = pointTypes.reduce(
    (sum, type) => sum + (11 - type.points),
    0
  );
  let randomWeight = Math.random() * totalWeight;
  for (const type of pointTypes) {
    randomWeight -= 11 - type.points;
    if (randomWeight <= 0) return type;
  }
  return pointTypes[pointTypes.length - 1];
};

// Add points in empty spaces
for (let y = 0; y < GRID_HEIGHT; y++) {
  for (let x = 0; x < GRID_WIDTH; x++) {
    if (initialGrid[y][x] === EMPTY && Math.random() < 0.1) {
      initialGrid[y][x] = getRandomPointType().name;
    }
  }
}

const FEDevPacman = () => {
  const [grid, setGrid] = useState(initialGrid);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [bugs, setBugs] = useState(
    Array(10)
      .fill(null)
      .map(() => ({
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT),
        type: bugTypes[Math.floor(Math.random() * bugTypes.length)],
      }))
  );
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
          const cellContent = grid[newY][newX];
          const pointType = pointTypes.find((pt) => pt.name === cellContent);
          if (pointType) {
            setScore((prevScore) => prevScore + pointType.points);
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
          return { ...bug, x: bug.x + dx, y: bug.y + dy };
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
    const bug = bugs.find((bug) => bug.x === x && bug.y === y);
    if (bug) return bug.type.name;
    return grid[y][x];
  };

  const getCellColor = (content: string) => {
    if (content === PLAYER) return 'yellow';
    const pointType = pointTypes.find((pt) => pt.name === content);
    if (pointType) {
      const saturation = 50 + (pointType.points / 10) * 50;
      return `hsl(120, ${saturation}%, 50%)`;
    }
    const bugType = bugTypes.find((bt) => bt.name === content);
    if (bugType) return bugType.color;
    if (content === CODE) return '#888';
    return 'transparent';
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
                  fontSize: '10px',
                  color: content === PLAYER ? 'black' : 'inherit',
                }}
              >
                {content}
              </div>
            );
          })
        )}
      </div>
      {gameOver && <div className="mt-4 text-xl text-red-500">Game Over!</div>}
    </div>
  );
};

export default FEDevPacman;
