import { Renderer } from './Renderer.js';
import { StorageManager } from './StorageManager.js';
import { ScoreManager } from './ScoreManager.js';
import { AudioManager } from './AudioManager.js';
import { InputManager } from './InputManager.js';
import { UIManager } from './UIManager.js';
import { Game } from './Game.js';
import { State } from './GameState.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const storage = new StorageManager();
const score = new ScoreManager(storage);
const audio = new AudioManager();
const ui = new UIManager();
const renderer = new Renderer(ctx);

const game = new Game(score, audio, renderer);

let lastTime = 0;

const settings = storage.get('icebreaker.settings', {
  sound: true,
  controls: true,
  effects: false
});

audio.enabled = settings.sound;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  renderer.resize(
    window.innerWidth,
    window.innerHeight,
    dpr
  );

  game.resize();
}

function updateUI() {
  document.getElementById('score').textContent = score.score;
  document.getElementById('best').textContent = score.high;
  document.getElementById('menuBest').textContent = score.high;

  document.getElementById('sound').textContent =
    audio.enabled ? '🔊' : '🔇';
}

function showMenu() {
  game.state = State.MENU;

  ui.show('menu');
  ui.hud(false);
  ui.touch(false);

  updateUI();
}

function startGame() {
  game.start();

  ui.show(null);
  ui.hud(true);
  ui.touch(settings.controls);

  updateUI();
}

function togglePause() {
  game.pause();

  if (game.state === State.PAUSED) {
    ui.show('paused');
    ui.hud(false);
    ui.touch(false);
  } else if (game.state === State.PLAYING) {
    ui.show(null);
    ui.hud(true);
    ui.touch(settings.controls);
  }
}

new InputManager(
  canvas,
  direction => game.move(direction),
  togglePause
);

document.getElementById('play')
  .addEventListener('click', startGame);

document.getElementById('again')
  .addEventListener('click', startGame);

document.getElementById('pause')
  .addEventListener('click', togglePause);

document.getElementById('resume')
  .addEventListener('click', togglePause);

document.getElementById('left')
  .addEventListener('click', () => game.move(-1));

document.getElementById('right')
  .addEventListener('click', () => game.move(1));

document.getElementById('sound')
  .addEventListener('click', () => {
    audio.enabled = !audio.enabled;
    updateUI();
  });

document.getElementById('settings')
  .addEventListener('click', () => {
    game.state = State.SETTINGS;
    ui.show('settingsScreen');
    ui.hud(false);
    ui.touch(false);
  });

document.getElementById('back')
  .addEventListener('click', showMenu);

document.querySelectorAll('.home')
  .forEach(button => {
    button.addEventListener('click', showMenu);
  });

window.addEventListener('resize', resize);

document.addEventListener('visibilitychange', () => {
  if (
    document.hidden &&
    game.state === State.PLAYING
  ) {
    togglePause();
  }
});

function gameLoop(timestamp) {
  const dt = Math.min(
    0.05,
    (timestamp - lastTime) / 1000 || 0
  );

  lastTime = timestamp;

  const newBest = game.update(dt);

  renderer.draw(
    timestamp / 1000,
    game.icebergs,
    game.boat
  );

  updateUI();

  if (
    game.state === State.GAME_OVER &&
    !document.getElementById('over').classList.contains('hidden')
  ) {
    // already showing
  }

  if (
    game.state === State.GAME_OVER &&
    document.getElementById('finalScore').textContent !== String(score.score)
  ) {
    document.getElementById('finalScore').textContent = score.score;
    document.getElementById('finalBest').textContent = score.high;

    document.getElementById('newBest')
      .classList.toggle('hidden', !newBest);

    ui.show('over');
    ui.hud(false);
    ui.touch(false);
  }

  requestAnimationFrame(gameLoop);
}

resize();
showMenu();
requestAnimationFrame(gameLoop);
