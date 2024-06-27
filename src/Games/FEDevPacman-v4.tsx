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

const CELL_SIZE = 23;
const GRID_WIDTH = Math.max(...codeLines.map((line) => line.length)) + 2;
const GRID_HEIGHT = codeLines.length + 2;

const PLAYER = 'Dev';
const EMPTY = ' ';

const pointTypes = [
  { name: 'UX', points: 10 },
  { name: 'A11y', points: 9 },
  { name: 'O(1)', points: 8 },
  { name: 'TDD', points: 7 },
  { name: 'SEO', points: 6 },
  { name: 'KISS', points: 5 },
  { name: 'DRY', points: 4 },
  { name: 'A/B', points: 3 },
  { name: 'TS', points: 2 },
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
  const paddedLine = ' ' + line.padEnd(GRID_WIDTH - 2, ' ') + ' ';
  paddedLine.split('').forEach((char, x) => {
    initialGrid[y + 1][x] = char;
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

// Function to check if a cell is suitable for placing a point or bug
const isSuitableCell = (grid: string[][], x: number, y: number) => {
  if (grid[y][x] !== EMPTY) return false;

  // Check surrounding cells
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < GRID_WIDTH && ny >= 0 && ny < GRID_HEIGHT) {
        if (grid[ny][nx] !== EMPTY && grid[ny][nx] !== ' ') {
          return false;
        }
      }
    }
  }
  return true;
};

// Add points in suitable empty spaces
for (let y = 0; y < GRID_HEIGHT; y++) {
  for (let x = 0; x < GRID_WIDTH; x++) {
    if (isSuitableCell(initialGrid, x, y) && Math.random() < 0.1) {
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
      .map(() => {
        let x, y;
        do {
          x = Math.floor(Math.random() * GRID_WIDTH);
          y = Math.floor(Math.random() * GRID_HEIGHT);
        } while (!isSuitableCell(initialGrid, x, y));
        return {
          x,
          y,
          type: bugTypes[Math.floor(Math.random() * bugTypes.length)],
        };
      })
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
          (grid[newY][newX] === EMPTY ||
            pointTypes.some((pt) => pt.name === grid[newY][newX]))
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
            (grid[newY][newX] === EMPTY ||
              pointTypes.some((pt) => pt.name === grid[newY][newX]))
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
    return 'transparent';
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <div className="bg-gray-900 p-2">
        <div className="flex justify-between w-full mb-2">
          <h1 className="text-2xl">FE Dev Pac-Man</h1>
          <div className="text-2xl">Score: {score}</div>
        </div>
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
              const isCode =
                content !== EMPTY &&
                !pointTypes.some((pt) => pt.name === content) &&
                !bugTypes.some((bt) => bt.name === content) &&
                content !== PLAYER;
              return (
                <div
                  key={`${x}-${y}`}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isCode || content === PLAYER ? '20px' : '15px',
                    color: isCode ? '#ccc' : getCellColor(content),
                    fontWeight: isCode ? 'bold' : 'normal',
                    border: content === PLAYER ? '1px solid white' : 'none',
                    borderRadius: '50%',
                  }}
                >
                  {content}
                </div>
              );
            })
          )}
        </div>
        {gameOver && (
          <div className="mt-4 text-xl text-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            Game Over!
          </div>
        )}
      </div>
    </div>
  );
};

export default FEDevPacman;
