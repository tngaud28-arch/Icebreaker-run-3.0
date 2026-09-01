import { Renderer } from './Renderer.js';
import { StorageManager } from './StorageManager.js';
import { ScoreManager } from './ScoreManager.js';
import { AudioManager } from './AudioManager.js';
import { InputManager } from './InputManager.js';
import { UIManager } from './UIManager.js';
import { Game } from './Game.js';
import { State } from './GameState.js';

const $ = id => document.getElementById(id);

const canvas = $('gameCanvas');
const ctx = canvas.getContext('2d');

const store = new StorageManager();
const score = new ScoreManager(store);
const audio = new AudioManager();
const ui = new UIManager();
const renderer = new Renderer(ctx);
const game = new Game(score, audio, renderer);

let settings = store.get('icebreaker.settings', {
  sound: true,
  controls: true,
  effects: false
});

let last = 0;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  renderer.resize(
    window.innerWidth,
    window.innerHeight,
    dpr
  );

  game.resize();
}

function refresh() {
  $('best').textContent = score.high;
  $('menuBest').textContent = score.high;
  $('score').textContent = score.score;
  $('sound').textContent = audio.enabled ? '🔊' : '🔇';
}

function menu() {
  game.state = State.MENU;

  ui.show('menu');
  ui.hud(false);
  ui.touch(false);

  refresh();
}

function start() {
  game.start();

  ui.show(null);
  ui.hud(true);
  ui.touch(settings.controls);

  refresh();
}

function pause() {
  game.pause();

  if (game.state === State.PAUSED) {
    ui.show('paused');
    ui.touch(false);
  } else if (game.state === State.PLAYING) {
    ui.show(null);
    ui.touch(settings.controls);
  }
}

new InputManager(
  canvas,
  direction => game.move(direction),
  pause
);

// Main buttons
$('play').addEventListener('click', start);
$('again').addEventListener('click', start);
$('pause').addEventListener('click', pause);
$('resume').addEventListener('click', pause);

$('left').addEventListener('click', () => game.move(-1));
$('right').addEventListener('click', () => game.move(1));

$('sound').addEventListener('click', () => {
  audio.enabled = !audio.enabled;
  refresh();
});

document.querySelectorAll('.home').forEach(button => {
  button.addEventListener('click', menu);
});

// Settings
$('settings').addEventListener('click', () => {
  game.state = State.SETTINGS;
  ui.show('settingsScreen');
});

$('back').addEventListener('click', menu);

$('soundSetting').checked = settings.sound;
$('controlsSetting').checked = settings.controls;
$('effectsSetting').checked = settings.effects;

function saveSettings() {
  settings = {
    sound: $('soundSetting').checked,
    controls: $('controlsSetting').checked,
    effects: $('effectsSetting').checked
  };

  audio.enabled = settings.sound;

  store.set('icebreaker.settings', settings);

  refresh();
}

$('soundSetting').addEventListener('change', saveSettings);
$('controlsSetting').addEventListener('change', saveSettings);
$('effectsSetting').addEventListener('change', saveSettings);

audio.enabled = settings.sound;

window.addEventListener('resize', resize);

document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.state === State.PLAYING) {
    pause();
  }
});

resize();
menu();

function loop(timestamp) {
  const dt = Math.min(
    0.05,
    (timestamp - last) / 1000 || 0
  );

  last = timestamp;

  const newHigh = game.update(dt);

  renderer.draw(
    timestamp / 1000,
    game.icebergs,
    game.boat
  );

  refresh();

  if (
    game.state === State.GAME_OVER &&
    $('over').classList.contains('hidden')
  ) {
    $('finalScore').textContent = score.score;
    $('finalBest').textContent = score.high;

    $('newBest').classList.toggle(
      'hidden',
      !newHigh
    );

    ui.show('over');
    ui.hud(false);
    ui.touch(false);
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
