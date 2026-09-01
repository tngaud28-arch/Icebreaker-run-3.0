```js
import { Renderer } from './Renderer.js';
import { StorageManager } from './StorageManager.js';
import { ScoreManager } from './ScoreManager.js';
import { AudioManager } from './AudioManager.js';
import { InputManager } from './InputManager.js';
import { UIManager } from './UIManager.js';
import { Game } from './Game.js';
import { State } from './GameState.js';

const canvas = document.getElementById('gameCanvas');

if (!canvas) {
    throw new Error('Could not find #gameCanvas in index.html');
}

const storage = new StorageManager();
const scoreManager = new ScoreManager();
const audioManager = new AudioManager();
const inputManager = new InputManager();
const uiManager = new UIManager();
const renderer = new Renderer(canvas);

const game = new Game({
    renderer,
    storage,
    scoreManager,
    audioManager,
    inputManager,
    uiManager
});

function gameLoop(timestamp) {
    game.update(timestamp);
    game.render();
    requestAnimationFrame(gameLoop);
}

function startGame() {
    if (typeof game.start === 'function') {
        game.start();
    } else if (typeof game.setState === 'function') {
        game.setState(State.PLAYING);
    }
}

function restartGame() {
    if (typeof game.restart === 'function') {
        game.restart();
    } else {
        startGame();
    }
}

window.addEventListener('load', () => {
    if (typeof game.init === 'function') {
        game.init();
    }

    requestAnimationFrame(gameLoop);
});

window.addEventListener('error', (event) => {
    console.error('Game error:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

window.startGame = startGame;
window.restartGame = restartGame;
```
