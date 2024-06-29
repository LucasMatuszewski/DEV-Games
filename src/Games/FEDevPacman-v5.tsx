import React, { useState, useEffect, useCallback } from 'react';

// TODO: Multiple funny code samples, randomly, or/and select to set it (maybe for different programming languages + different set of best practices?)
// TODO: Add Form to let user generate maze based on any custom code.
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
  '      <button onClick={handleClick}>',
  '        Click me',
  '      </button>',
  '    </div>',
  '  );',
  '};',
  '',
  'export default App;',
];

const CELL_SIZE = 20; // Reduced cell size
const GRID_WIDTH = Math.max(...codeLines.map((line) => line.length)) + 2;
const GRID_HEIGHT = codeLines.length + 2;

const PLAYER = '🧑‍💻'; // Developer emoji
const EMPTY = ' ';

const pointTypes = [
  {
    name: 'UX',
    points: 10,
    title: 'User Experience',
    description: 'Designing with the user in mind for better usability.',
  },
  {
    name: 'A11y',
    points: 9,
    title: 'Accessibility',
    description:
      'Ensuring your application is usable by people with disabilities.',
  },
  {
    name: 'O(1)',
    points: 8,
    title: 'Constant Time Complexity',
    description:
      'Optimizing algorithms to run in constant time O(1) or at list linear time O(n). In Big O notation.',
  },
  {
    name: 'TDD',
    points: 7,
    title: 'Test-Driven Development',
    description: 'Writing tests before code to ensure functionality.',
  },
  {
    name: 'KISS',
    points: 6,
    title: 'Keep It Simple, Stupid',
    description:
      'Simplifying code to make it more understandable and maintainable.',
  },
  {
    name: 'YAGNI',
    points: 5,
    title: "You Aren't Gonna Need It",
    description: 'Avoiding unnecessary features to keep the codebase clean.',
  },
  {
    name: 'i18n',
    points: 5,
    title: 'Internationalization',
    description:
      'Designing software to be adaptable to various languages and regions.',
  },
  {
    name: 'DRY',
    points: 4,
    title: "Don't Repeat Yourself",
    description: 'Reducing repetition in code to improve maintainability.',
  },
  {
    name: 'A/B',
    points: 3,
    title: 'A/B Testing',
    description:
      'Comparing two versions of a webpage or app to see which performs better.',
  },
  {
    name: 'TS',
    points: 2,
    title: 'TypeScript',
    description: 'Using TypeScript for type safety and better code quality.',
  },
  {
    name: 'SEO',
    points: 1,
    title: 'Search Engine Optimization',
    description: 'Improving the visibility of a website in search engines.',
  },
  {
    name: 'CI/CD',
    points: 7,
    title: 'Continuous Integration/Continuous Deployment',
    description:
      'Automating the integration, testing and deployment of code changes.',
  },
  {
    name: 'SOLID',
    points: 6,
    title: 'SOLID Principles',
    description:
      'A set of design principles for writing maintainable and scalable code. S = Single responsibility, O = Open-closed, L = Liskov substitution, I = Interface segregation, D = Dependency inversion.',
  },
  {
    name: 'DDD',
    points: 5,
    title: 'Domain-Driven Design',
    description:
      'Designing software based on the business domain and good understanding of business needs.',
  },
  {
    name: 'BEM',
    points: 4,
    title: 'Block Element Modifier',
    description: 'A methodology for writing clean and maintainable CSS.',
  },
  // Are below items a good practices???
  // {
  //   name: 'MVC',
  //   points: 3,
  //   title: 'Model-View-Controller',
  //   description: 'A design pattern for separating concerns in an application.',
  // },
  {
    name: 'SemVer',
    points: 3,
    title: 'Semantic Versioning',
    description:
      'A versioning scheme for software: MAJOR.MINOR.PATCH. Aims to ensure that minor updates are backward compatible and versioning is more predictable.',
  },
  {
    name: 'SSR',
    points: 2,
    title: 'Server-Side Rendering',
    description:
      'Rendering web pages on the server for better performance and SEO.',
  },
  {
    name: 'SPA',
    points: 1,
    title: 'Single Page Application',
    description:
      'Building web applications that load a single HTML page and dynamically update as the user interacts with the app.',
  },
].sort((a, b) => b.points - a.points);
// TODO: save points added to maze in an array to limit the number of occurences of each point type. Add max limit in object?

const bugTypes = [
  { name: '🐛', color: '#FF0000' },
  { name: '💣', color: '#FF3333' },
  { name: '🔥', color: '#FF6666' },
  { name: '⚠️', color: '#FF9999' },
  // { name: '❌', color: '#FFCCCC' },
  // { name: '💾', color: '#990000' },
  { name: 'Error', color: '#990000' },
  { name: '404', color: '#CC0000' },
  { name: 'O(n²)', color: '#FF6666' },
  { name: 'any', color: '#FF9999' },
  { name: 'NaN', color: '#FFCCCC' },
  { name: 'Legacy', color: '#FF6600' },
  { name: 'Debt', color: '#993300' },
];
const BUGS_NUMBER = 20;

const initialGrid = Array(GRID_HEIGHT)
  .fill(null)
  .map(() => Array(GRID_WIDTH).fill(EMPTY));

// Fill grid with code, adding padding
codeLines.forEach((line, y) => {
  // Add spaces, 1 before code, and many after the code to the end on the grid
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
    Array(BUGS_NUMBER)
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
  const [gameIntro, setGameIntro] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem('highScore') || '0')
  );

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
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('highScore', score.toString());
      }
    }
  }, [bugs, playerPos, score, highScore]);

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
      // const saturation = 50 + (pointType.points / 10) * 50;
      // points are from 2 to 10. Make saturation much lower for small points and much higher for hight points (up to 100%)
      const saturation = pointType.points * 10;
      return `hsl(120, ${saturation}%, 50%)`;
    }
    const bugType = bugTypes.find((bt) => bt.name === content);
    if (bugType) return bugType.color;
    return 'transparent';
  };

  const restartGame = () => {
    setGrid(initialGrid);
    setPlayerPos({ x: 1, y: 1 });
    setBugs(
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
    setScore(0);
    setGameOver(false);
  };

  const addTitleToContent = (content: string) => {
    const pointType = pointTypes.find((pt) => pt.name === content);
    if (pointType) {
      return (
        <span
          // TODO: create a custom tooltip
          title={`${pointType.title} - ${pointType.description} (${
            pointType.points
          } point${pointType.points > 1 ? 's' : ''} :)`}
          style={{ cursor: 'help' }}
        >
          {content}
        </span>
      );
    }
    return content;
  };

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-50px)] text-white">
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <div className="flex justify-between w-full mb-4">
          <h1 className="text-3xl font-bold">Wonderful Developers</h1>
          <div className="text-2xl"> Score: {score}</div>
          <div className="text-2xl"> Your record: {highScore}</div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_WIDTH}, ${CELL_SIZE}px)`,
            gap: '1px',
          }}
          // className="bg-gray-700 p-2 rounded"
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
                    // TODO: optimize, add classNames instead of CSS code
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    // backgroundColor: isCode ? '#1e293b' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isCode ? '13px' : '15px',
                    color: isCode ? '#94a3b8' : getCellColor(content),
                    fontWeight: isCode ? 'bold' : 'normal',
                    borderRadius: '2px',
                    transition: 'all 0.1s ease-in-out',
                  }}
                >
                  {addTitleToContent(content)}
                </div>
              );
            })
          )}
        </div>
        {gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <h2 className="text-3xl mb-4 text-red-800">Game Over!</h2>
              <p className="text-xl mb-4">Final Score: {score}</p>
              <button
                onClick={restartGame}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
        {gameIntro && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-lg bg-gray-800 p-8 rounded-lg text-center">
              <h2 className="text-3xl mb-2">How to Play</h2>
              <p>
                Use arrow keys to move the developer {PLAYER} and collect good
                practices.
              </p>
              <p>
                Avoid bugs{' '}
                <span className="text-red-500">
                  {bugTypes.map((bug) => bug.name).join(' ')}
                </span>{' '}
                at all costs!
              </p>
              <button
                onClick={() => setGameIntro(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold mt-4 py-2 px-4 rounded transition duration-200"
              >
                Start the game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FEDevPacman;
