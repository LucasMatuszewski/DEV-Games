const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'src', 'Games');
const outputFilePath = path.join(__dirname, 'src', 'gamesList.json');

fs.readdir(gamesDir, (err, files) => {
  if (err) {
    console.error('Error reading games directory:', err);
    return;
  }

  const gameNames = files
    .filter(
      (file) =>
        file.endsWith('.jsx') ||
        file.endsWith('.tsx') ||
        file.endsWith('.ts') ||
        file.endsWith('.js')
    ) // Adjust extensions as needed
    .map((file) => path.basename(file, path.extname(file)));

  fs.writeFile(outputFilePath, JSON.stringify(gameNames, null, 2), (err) => {
    if (err) {
      console.error('Error writing games list file:', err);
    } else {
      console.log('Games list generated successfully.');
    }
  });
});

// node generateGameList.js
