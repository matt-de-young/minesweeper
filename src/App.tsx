import './App.css';
import React from 'react';

/**
 * Implement the game so that it can be played
 * - GameConfigScreen and GameOverScreen just need to be used
 * - App, GameGrid and Tile need changes
 *
 * Implement the game loop (Config Screen -> Game -> Win / Lose -> Config -> Game -> ...)
 * Implement the field setup and game state: width, height + random located bombs
 * Implement what happens when flagging a tile or when uncovering a tile
 *
 * Remember cascading:
 * When a player clicks on a cell with no adjacent mines (a "zero" cell)
 * The auto-uncovering continues recursively for all connected "zero" cells and their adjacent non-mine cells (the numbered cells)
 *
 * In this version, the flags dont do anything, they are visual aid for the player but they should not block the cascading.
 */

type BaseTile = {
  index: number;
};

type BombTile = BaseTile & {
  type: 'bomb';
};

type NumberTile = BaseTile & {
  type: 'number';
  adjacentBombs: number;
};

type EmptyTile = BaseTile & {
  type: 'empty';
};

type Tile = BombTile | NumberTile | EmptyTile;

type TileState = {
  isOpen: boolean;
  isFlagged: boolean;
};

export default function App() {
  const [width, setWidth] = React.useState(10);
  const [height, setHeight] = React.useState(10);
  const [numBombs, setNumBombs] = React.useState(10);
  const [gameOver, setGameOver] = React.useState(false);
  const [didWin, setDidWin] = React.useState(false);
  const [gameStarted, setGameStarted] = React.useState(false);

  function onConfig(width: number, height: number, numBombs: number) {
    setWidth(width);
    setHeight(height);
    setNumBombs(numBombs);
    setGameStarted(true);
    setGameOver(false);
    setDidWin(false);
  }

  function onRestart() {
    setGameStarted(false);
    setGameOver(false);
    setDidWin(false);
  }

  return (
    <div
      style={{
        flex: 1,
        flexDirection: 'column',
        gap: '8px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <p>
        Welcome to{' '}
        <a href="https://en.wikipedia.org/wiki/Minesweeper_(video_game)">
          Minesweeper
        </a>
      </p>
      <ol>
        <li>Click on a tile to uncover it.</li>
        <li>Right-click on a tile to flag ⛳️ it.</li>
        <li>Uncover a bomb 💣 and lose.</li>
        <li>Uncover everything but bombs and win.</li>
      </ol>
      {!gameStarted && <GameConfigScreen onConfig={onConfig} />}
      {gameStarted && (
        <GameGrid
          width={width}
          height={height}
          numBoms={numBombs}
          onGameOver={(won) => {
            setGameOver(true);
            setDidWin(won);
          }}
        />
      )}
      {gameOver && <GameOverScreen didWin={didWin} onRestart={onRestart} />}
    </div>
  );
}

type GameConfigScreenProps = {
  onConfig: (width: number, height: number, numBombs: number) => void;
};
function GameConfigScreen({ onConfig }: GameConfigScreenProps) {
  const [width, setWidth] = React.useState<number>(10);
  const [height, setHeight] = React.useState<number>(10);
  const [numBombs, setNumBombs] = React.useState<number>(10);

  const maxBombs = width * height - 1;
  const isValid = numBombs > 0 && numBombs <= maxBombs;

  // Calculate difficulty based on bomb ratio
  const bombRatio = numBombs / (width * height);
  const getDifficultyLabel = (ratio: number): string => {
    if (ratio <= 0.05) return "🤡";
    if (ratio <= 0.12) return "😊";
    if (ratio <= 0.16) return "😐";
    if (ratio <= 0.20) return "😰";
    return "💀";
  };

  const onConfirm = React.useCallback(() => {
    if (isValid) {
      onConfig(width, height, numBombs);
    }
  }, [width, height, numBombs, onConfig, isValid]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <input
          type="number"
          value={width}
          min={1}
          onChange={(event) => setWidth(Math.max(1, Number(event.currentTarget.value)))}
          style={{ width: '42px', lineHeight: '26px' }}
        />
        {'x'}
        <input
          type="number"
          value={height}
          min={1}
          onChange={(event) => setHeight(Math.max(1, Number(event.currentTarget.value)))}
          style={{ width: '42px', lineHeight: '26px' }}
        />
        {'💣'}
        <input
          type="number"
          value={numBombs}
          min={1}
          max={maxBombs}
          onChange={(event) => setNumBombs(Math.min(maxBombs, Math.max(1, Number(event.currentTarget.value))))}
          style={{ width: '42px', lineHeight: '26px' }}
        />
        <span style={{
          minWidth: '100px',
          color: bombRatio > 0.20 ? 'red' : 'inherit'
        }}>
          difficulty: {getDifficultyLabel(bombRatio)}
        </span>
        <button
          style={{
            color: isValid ? 'green' : 'gray',
            lineHeight: '26px',
            padding: '4px 8px 4px 8px',
          }}
          disabled={!isValid}
          onClick={onConfirm}
        >
          Start Game
        </button>
      </div>
      {!isValid && (
        <div style={{ color: 'red' }}>
          Number of bombs must be between 1 and {maxBombs}
        </div>
      )}
    </div>
  );
}

type GameOverScreenProps = {
  didWin: boolean;
  onRestart: () => void;
};
function GameOverScreen({ onRestart, didWin }: GameOverScreenProps) {
  // likely nothing to be done here
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        alignItems: 'center',
      }}
    >
      {didWin ? <p>You Won! 🏆</p> : <p>You lost. 💀</p>}
      <button
        style={{
          color: 'green',
          lineHeight: '26px',
          padding: '4px 8px 4px 8px',
        }}
        onClick={onRestart}
      >
        Restart
      </button>
    </div>
  );
}

type GameGridProps = {
  width: number;
  height: number;
  numBoms: number;
  onGameOver: (didWin: boolean) => void; // Add this line
};
function GameGrid({ width, height, numBoms, onGameOver }: GameGridProps) {
  const [tiles, setTiles] = React.useState(() => generateInitialGrid());
  const [tileStates, setTileStates] = React.useState<TileState[]>(() =>
    Array(width * height).fill({ isOpen: false, isFlagged: false })
  );

  React.useEffect(() => {
    setTiles(generateInitialGrid());
    setTileStates(
      Array(width * height).fill({ isOpen: false, isFlagged: false })
    );
  }, [width, height, numBoms]);

  function generateInitialGrid(): Tile[] {
    const positions: Tile[] = Array(width * height)
      .fill(null)
      .map((_, index) => ({
        index,
        type: 'empty',
      }));

    // Place bombs
    let bombsPlaced = 0;
    while (bombsPlaced < numBoms) {
      const randomIndex = Math.floor(Math.random() * positions.length);
      if (positions[randomIndex].type === 'empty') {
        positions[randomIndex] = {
          index: randomIndex,
          type: 'bomb',
        };
        bombsPlaced++;
      }
    }

    // Calculate numbers
    return positions.map((tile, index) => {
      if (tile.type === 'bomb') return tile;

      const adjacentBombs = countAdjacentBombs(index, positions);
      return adjacentBombs > 0
        ? {
            index,
            type: 'number',
            adjacentBombs,
          }
        : {
            index,
            type: 'empty',
          };
    });
  }

  function countAdjacentBombs(index: number, positions: Tile[]): number {
    const row = Math.floor(index / width);
    const col = index % width;
    let count = 0;

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i;
        const newCol = col + j;
        if (newRow >= 0 && newRow < height && newCol >= 0 && newCol < width) {
          const newIndex = newRow * width + newCol;
          if (positions[newIndex].type === 'bomb') count++;
        }
      }
    }
    return count;
  }

  function uncoverTile(index: number) {
    if (tileStates[index].isOpen) return;

    const newTileStates = [...tileStates];
    const tile = tiles[index];

    if (tile.type === 'bomb') {
      // Reveal all bombs
      tiles.forEach((t, i) => {
        if (t.type === 'bomb') {
          newTileStates[i] = { ...newTileStates[i], isOpen: true };
        }
      });
      setTileStates(newTileStates);
      onGameOver(false);
      return;
    }

    // Cascade empty tiles
    const cascade = (idx: number) => {
      if (
        idx < 0 ||
        idx >= tiles.length ||
        newTileStates[idx].isOpen ||
        tiles[idx].type === 'bomb'
      )
        return;

      newTileStates[idx] = { ...newTileStates[idx], isOpen: true };

      if (tiles[idx].type === 'empty') {
        const row = Math.floor(idx / width);
        const col = idx % width;

        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (
              newRow >= 0 &&
              newRow < height &&
              newCol >= 0 &&
              newCol < width
            ) {
              cascade(newRow * width + newCol);
            }
          }
        }
      }
    };

    cascade(index);
    setTileStates(newTileStates);

    // Check win condition
    const unopenedNonBombs = tiles.filter(
      (t, i) => t.type !== 'bomb' && !newTileStates[i].isOpen
    ).length;

    if (unopenedNonBombs === 0) {
      // Flag all bombs on win
      tiles.forEach((t, i) => {
        if (t.type === 'bomb') {
          newTileStates[i] = { ...newTileStates[i], isFlagged: true };
        }
      });
      setTileStates(newTileStates);
      onGameOver(true);
    }
  }

  function toggleFlag(index: number) {
    setTileStates((prev) => {
      const newStates = [...prev];
      newStates[index] = {
        ...newStates[index],
        isFlagged: !newStates[index].isFlagged,
      };
      return newStates;
    });
  }

  function getTileDisplay(tile: Tile, state: TileState): string {
    if (!state.isOpen) {
      return state.isFlagged ? '⛳️' : '';
    }

    switch (tile.type) {
      case 'bomb':
        return '💣';
      case 'number':
        return tile.adjacentBombs.toString();
      case 'empty':
        return '';
    }
  }

  return (
    <div
      style={{
        backgroundColor: '#ddd',
        display: 'grid',
        minWidth: 0,
        flex: '0 1 0',
        gridTemplateColumns: `repeat(${width}, 28px)`,
        gridTemplateRows: `repeat(${height}, 28px)`,
      }}
    >
      {tiles.map((tile, index) => (
        <Tile
          key={index}
          text={getTileDisplay(tile, tileStates[index])}
          open={tileStates[index].isOpen}
          onOpen={() => uncoverTile(index)}
          onFlag={() => toggleFlag(index)}
        />
      ))}
    </div>
  );
}

type TileProps = {
  text?: string; // number or 💣 or ⛳️
  open?: boolean;
  onOpen?: () => void;
  onFlag?: () => void; // Add this for flag functionality
};
function Tile({ text, open, onOpen, onFlag }: TileProps) {
  const commonProps = {
    width: 28,
    height: 28,
    fontSize: 18,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const onFlagClick = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      onFlag?.();
    },
    [onFlag]
  );

  if (open) {
    return <div style={commonProps}>{text}</div>;
  }

  return (
    <div
      style={{
        ...commonProps,
        border: '1px solid grey',
        backgroundColor: '#eee',
        cursor: 'pointer',
      }}
      onClick={onOpen}
      onContextMenu={onFlagClick}
    >
      {text}
    </div>
  );
}
