// Okiya game logic in JavaScript

const game = {
  currentPlayer: 'red',
  lastTileRemoved: null,
  board: [],
  tilesRemaining: 16,
  gameEnded: false,

  initBoard() {
    const plants = ['lily', 'pine', 'maple', 'sakura'];
    const poetry = ['bird', 'sun', 'rain', 'tanzaku'];
    const tiles = [];

    const combinations = [];
    for (let plant of plants) {
      for (let po of poetry) {
        combinations.push({ plant, poetry: po });
      }
    }
    const shuffled = combinations.sort(() => 0.5 - Math.random()).slice(0, 16);

    let index = 0;
    for (let y = 0; y < 4; y++) {
      this.board[y] = [];
      for (let x = 0; x < 4; x++) {
        this.board[y][x] = { ...shuffled[index], takenBy: null, x, y };
        index++;
      }
    }
  },

  canTake(tile) {
    if (tile.takenBy !== null) return false;
    if (!this.lastTileRemoved) return true;
    return tile.plant === this.lastTileRemoved.plant || tile.poetry === this.lastTileRemoved.poetry;
  },

  takeTile(x, y) {
    if (this.gameEnded) return;
    const tile = this.board[y][x];
    if (!this.canTake(tile)) return;

    tile.takenBy = this.currentPlayer;
    this.lastTileRemoved = tile;
    this.tilesRemaining--;

    if (this.checkVictory(this.currentPlayer)) {
      this.endGame(`${this.currentPlayer} player wins!`);
      return;
    }

    if (!this.hasMoves(this.otherPlayer())) {
      this.endGame(`${this.currentPlayer} player wins by blocking!`);
      return;
    }

    if (this.tilesRemaining === 0) {
      this.endGame('Draw!');
      return;
    }

    this.currentPlayer = this.otherPlayer();
    this.render();
  },

  hasMoves(player) {
    return this.board.flat().some(tile => this.canTake(tile));
  },

  otherPlayer() {
    return this.currentPlayer === 'red' ? 'black' : 'red';
  },

  checkVictory(player) {
    const grid = this.board.map(row => row.map(tile => tile.takenBy === player));

    for (let i = 0; i < 4; i++) {
      if (grid[i].every(Boolean)) return true;
      if (grid.map(row => row[i]).every(Boolean)) return true;
    }

    if ([0,1,2,3].every(i => grid[i][i])) return true;
    if ([0,1,2,3].every(i => grid[i][3 - i])) return true;

    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (grid[y][x] && grid[y][x+1] && grid[y+1][x] && grid[y+1][x+1]) return true;
      }
    }
    return false;
  },

  endGame(message) {
    this.gameEnded = true;
    alert(message);
  },

  render() {
    const container = document.getElementById('board');
    container.innerHTML = '';

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const tile = this.board[y][x];
        const div = document.createElement('div');
        div.className = 'tile';
        div.dataset.x = x;
        div.dataset.y = y;

        if (tile.takenBy) {
          div.classList.add(tile.takenBy);
        } else {
          div.style.backgroundImage = `url(images/${tile.plant}_${tile.poetry}.png)`;
        }

        if (this.canTake(tile)) {
          div.classList.add('clickable');
          div.onclick = () => this.takeTile(x, y);
        } else {
          div.classList.add('disabled');
        }

        container.appendChild(div);
      }
    }

    const lastTileContainer = document.getElementById('last-tile');
    lastTileContainer.innerHTML = '';

    if (this.lastTileRemoved) {
      const lastTileImg = document.createElement('img');
      lastTileImg.src = `images/${this.lastTileRemoved.plant}_${this.lastTileRemoved.poetry}.png`;
      lastTileImg.alt = `${this.lastTileRemoved.plant} and ${this.lastTileRemoved.poetry}`;
      lastTileImg.style.width = '100px';
      lastTileImg.style.height = '100px';
      lastTileContainer.appendChild(lastTileImg);
    }

    const turnLabel = document.createElement('div');
    turnLabel.textContent = 'Next Turn:';
    turnLabel.style.marginTop = '10px';
    turnLabel.style.fontWeight = 'bold';
    lastTileContainer.appendChild(turnLabel);

    const playerToken = document.createElement('img');
    playerToken.src = `images/${this.currentPlayer}_token.png`;
    playerToken.alt = `${this.currentPlayer} player token`;
    playerToken.style.width = '100px';
    playerToken.style.height = '100px';
    lastTileContainer.appendChild(playerToken);
  },

  restart() {
    this.currentPlayer = 'red';
    this.lastTileRemoved = null;
    this.tilesRemaining = 16;
    this.gameEnded = false;
    this.initBoard();
    this.render();
  }
};

window.onload = () => {
  game.initBoard();
  game.render();

  const restartBtn = document.getElementById('restart');
  if (restartBtn) {
    restartBtn.onclick = () => game.restart();
  }
};
