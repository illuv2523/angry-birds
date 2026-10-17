/* ================= script.js ================= */
(() => {
'use strict';

/* ============================================================
   КОНСТАНТЫ
   ============================================================ */
const canvas = document.getElementById('game');
const ctx    = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

const GROUND_Y = 560;
const GRAVITY  = 1500;
const FIXED_DT = 1 / 120;

const ANCHOR   = { x: 158, y: 392 };
const MAX_DRAG = 140;
const POWER    = 11;

const STORAGE_KEY = 'angryBirdsSave_v2';

/* ============================================================
   ТИПЫ ПТИЦ
   ============================================================ */
const BIRD_TYPES = {
  red: {
    r: 18, mass: 2.5,
    color1: '#ff8a7a', color2: '#c92020',
    belly: 'rgba(255,225,200,0.85)',
    ability: null,
    abilityName: ''
  },
  yellow: {
    r: 16, mass: 2.0,
    color1: '#fff4a0', color2: '#dcae00',
    belly: 'rgba(255,250,215,0.9)',
    ability: 'dash',
    abilityName: 'Рывок'
  },
  black: {
    r: 20, mass: 4.0,
    color1: '#606060', color2: '#0d0d0d',
    belly: 'rgba(160,160,160,0.35)',
    ability: 'bomb',
    abilityName: 'Взрыв'
  },
  blue: {
    r: 13, mass: 1.2,
    color1: '#d6efff', color2: '#2f7fb8',
    belly: 'rgba(235,248,255,0.95)',
    ability: 'split',
    abilityName: 'Трио'
  },
  white: {
    r: 19, mass: 2.8,
    color1: '#ffffff', color2: '#c9d4dd',
    belly: 'rgba(240,240,240,0.95)',
    ability: 'egg',
    abilityName: 'Бомба вниз'
  }
};

/* ============================================================
   МАТЕРИАЛЫ
   ============================================================ */
const MATERIALS = {
  wood:   { hp: 70,  density: 0.90, rest: 0.10, fric: 0.65, fill: '#c9884a', stroke: '#7a4a1c' },
  ice:    { hp: 35,  density: 0.65, rest: 0.06, fric: 0.20, fill: '#b6e6fa', stroke: '#5ba8d0' },
  stone:  { hp: 200, density: 2.00, rest: 0.08, fric: 0.80, fill: '#8d929b', stroke: '#4d525b' },
  barrel: { hp: 25,  density: 1.10, rest: 0.15, fric: 0.55, fill: '#c9301e', stroke: '#7a1a10' }
};

/* ============================================================
   УРОВНИ (15)
   ============================================================ */
const LEVELS = [
  { birds: ['red','red','yellow'],
    blocks: [
      { mat: 'wood', x: 500, y: 515, w: 22, h: 90 },
      { mat: 'wood', x: 580, y: 515, w: 22, h: 90 },
      { mat: 'wood', x: 540, y: 458, w: 120, h: 24 }
    ],
    pigs: [ { x: 540, y: 538, r: 22 }, { x: 540, y: 425, r: 20 } ] },

  { birds: ['red','red','yellow','red'],
    blocks: [
      { mat: 'wood',   x: 480, y: 515, w: 22, h: 90 },
      { mat: 'wood',   x: 560, y: 515, w: 22, h: 90 },
      { mat: 'wood',   x: 520, y: 458, w: 120, h: 24 },
      { mat: 'barrel', x: 650, y: 545, w: 30, h: 30 },
      { mat: 'wood',   x: 720, y: 515, w: 22, h: 90 },
      { mat: 'wood',   x: 800, y: 515, w: 22, h: 90 },
      { mat: 'wood',   x: 760, y: 458, w: 120, h: 24 }
    ],
    pigs: [ { x: 520, y: 538, r: 22 }, { x: 760, y: 538, r: 22 } ] },

  { birds: ['red','yellow','red','red'],
    blocks: [
      { mat: 'stone', x: 540, y: 505, w: 26, h: 110 },
      { mat: 'stone', x: 620, y: 505, w: 26, h: 110 },
      { mat: 'wood',  x: 580, y: 438, w: 120, h: 24 },
      { mat: 'barrel',x: 720, y: 545, w: 30, h: 30 },
      { mat: 'wood',  x: 780, y: 515, w: 22, h: 90 },
      { mat: 'wood',  x: 860, y: 515, w: 22, h: 90 },
      { mat: 'wood',  x: 820, y: 458, w: 120, h: 24 }
    ],
    pigs: [ { x: 580, y: 538, r: 22 }, { x: 580, y: 406, r: 20 }, { x: 820, y: 538, r: 22 } ] },

  { birds: ['red','yellow','red','red','yellow'],
    blocks: [
      { mat: 'ice',  x: 500, y: 515, w: 22, h: 90 },
      { mat: 'ice',  x: 580, y: 515, w: 22, h: 90 },
      { mat: 'wood', x: 540, y: 458, w: 120, h: 24 },
      { mat: 'ice',  x: 540, y: 425, w: 22, h: 40 },
      { mat: 'stone',x: 700, y: 505, w: 26, h: 110 },
      { mat: 'stone',x: 780, y: 505, w: 26, h: 110 },
      { mat: 'wood', x: 740, y: 438, w: 120, h: 24 },
      { mat: 'barrel',x: 880, y: 545, w: 30, h: 30 }
    ],
    pigs: [
      { x: 540, y: 538, r: 22 },
      { x: 540, y: 396, r: 20 },
      { x: 740, y: 538, r: 22 }
    ] },

  { birds: ['yellow','yellow','red','yellow'],
    blocks: [
      { mat: 'wood',  x: 480, y: 515, w: 22, h: 90 },
      { mat: 'wood',  x: 560, y: 515, w: 22, h: 90 },
      { mat: 'wood',  x: 640, y: 515, w: 22, h: 90 },
      { mat: 'wood',  x: 520, y: 458, w: 100, h: 24 },
      { mat: 'wood',  x: 600, y: 458, w: 100, h: 24 },
      { mat: 'ice',   x: 560, y: 420, w: 22, h: 40 },
      { mat: 'barrel',x: 760, y: 545, w: 30, h: 30 },
      { mat: 'barrel',x: 800, y: 545, w: 30, h: 30 },
      { mat: 'wood',  x: 780, y: 460, w: 100, h: 24 }
    ],
    pigs: [
      { x: 520, y: 538, r: 22 },
      { x: 600, y: 538, r: 22 },
      { x: 560, y: 392, r: 20 },
      { x: 780, y: 538, r: 22 }
    ] },

  { birds: ['red','yellow','black','red','yellow','red'],
    blocks: [
      { mat: 'stone', x: 480, y: 505, w: 26, h: 110 },
      { mat: 'stone', x: 570, y: 505, w: 26, h: 110 },
      { mat: 'stone', x: 660, y: 505, w: 26, h: 110 },
      { mat: 'wood',  x: 525, y: 438, w: 120, h: 24 },
      { mat: 'wood',  x: 615, y: 438, w: 120, h: 24 },
      { mat: 'ice',   x: 570, y: 405, w: 22, h: 40 },
      { mat: 'wood',  x: 780, y: 515, w: 22, h: 90 },
      { mat: 'wood',  x: 860, y: 515, w: 22, h: 90 },
      { mat: 'wood',  x: 820, y: 458, w: 120, h: 24 }
    ],
    pigs: [
      { x: 525, y: 538, r: 22 },
      { x: 615, y: 538, r: 22 },
      { x: 570, y: 376, r: 20 },
      { x: 820, y: 538, r: 22 }
    ] },

  { birds: ['black','red','red','black','red'],
    blocks: [
      { mat: 'stone', x: 600, y: 500, w: 30, h: 120 },
      { mat: 'stone', x: 700, y: 500, w: 30, h: 120 },
      { mat: 'stone', x: 800, y: 500, w: 30, h: 120 },
      { mat: 'wood',  x: 650, y: 428, w: 140, h: 24 },
      { mat: 'wood',  x: 750, y: 428, w: 140, h: 24 },
      { mat: 'stone', x: 700, y: 385, w: 30, h: 60 },
      { mat: 'wood',  x: 700, y: 340, w: 180, h: 24 }
    ],
    pigs: [
      { x: 650, y: 538, r: 22 },
      { x: 750, y: 538, r: 22 },
      { x: 700, y: 396, r: 20 },
      { x: 700, y: 312, r: 18 }
    ] },

  { birds: ['red','yellow','blue','red','black','red'],
    blocks: [
      { mat: 'ice',   x: 480, y: 515, w: 22, h: 90 },
      { mat: 'ice',   x: 560, y: 515, w: 22, h: 90 },
      { mat: 'wood',  x: 520, y: 458, w: 120, h: 24 },
      { mat: 'barrel',x: 640, y: 545, w: 30, h: 30 },
      { mat: 'stone', x: 720, y: 505, w: 26, h: 110 },
      { mat: 'stone', x: 800, y: 505, w: 26, h: 110 },
      { mat: 'wood',  x: 760, y: 438, w: 120, h: 24 },
      { mat: 'ice',   x: 760, y: 415, w: 22, h: 40 }
    ],
    pigs: [
      { x: 520, y: 538, r: 22 },
      { x: 520, y: 406, r: 20 },
      { x: 760, y: 538, r: 22 },
      { x: 760, y: 386, r: 20 }
    ] },

  { birds: ['blue','blue','red','yellow','blue','red'],
    blocks: [
      { mat: 'ice',   x: 520, y: 515, w: 22, h: 90 },
      { mat: 'ice',   x: 600, y: 515, w: 22, h: 90 },
      { mat: 'ice',   x: 680, y: 515, w: 22, h: 90 },
      { mat: 'wood',  x: 560, y: 458, w: 100, h: 24 },
      { mat: 'wood',  x: 640, y: 458, w: 100, h: 24 },
      { mat: 'ice',   x: 600, y: 425, w: 22, h: 40 },
      { mat: 'stone', x: 780, y: 505, w: 30, h: 110 },
      { mat: 'stone', x: 880, y: 505, w: 30, h: 110 },
      { mat: 'wood',  x: 830, y: 438, w: 120, h: 24 }
    ],
    pigs: [
      { x: 560, y: 538, r: 22 },
      { x: 640, y: 538, r: 22 },
      { x: 600, y: 396, r: 20 },
      { x: 830, y: 538, r: 22 }
    ] },

  { birds: ['red','black','yellow','red','black','yellow'],
    blocks: [
      { mat: 'wood',   x: 460, y: 515, w: 22, h: 90 },
      { mat: 'barrel', x: 540, y: 545, w: 30, h: 30 },
      { mat: 'barrel', x: 590, y: 545, w: 30, h: 30 },
      { mat: 'wood',   x: 640, y: 515, w: 22, h: 90 },
      { mat: 'wood',   x: 520, y: 458, w: 120, h: 24 },
      { mat: 'wood',   x: 620, y: 458, w: 120, h: 24 },
      { mat: 'wood',   x: 570, y: 420, w: 22, h: 40 },
      { mat: 'stone',  x: 780, y: 505, w: 30, h: 110 },
      { mat: 'stone',  x: 880, y: 505, w: 30, h: 110 },
      { mat: 'wood',   x: 830, y: 438, w: 120, h: 24 }
    ],
    pigs: [
      { x: 520, y: 538, r: 22 },
      { x: 620, y: 538, r: 22 },
      { x: 570, y: 392, r: 20 },
      { x: 830, y: 538, r: 22 }
    ] },

  { birds: ['red','yellow','black','red','blue','red'],
    blocks: [
      { mat: 'stone', x: 600, y: 525, w: 32, h: 70 },
      { mat: 'stone', x: 700, y: 525, w: 32, h: 70 },
      { mat: 'wood',  x: 650, y: 478, w: 140, h: 24 },
      { mat: 'stone', x: 620, y: 445, w: 24, h: 46 },
      { mat: 'stone', x: 680, y: 445, w: 24, h: 46 },
      { mat: 'wood',  x: 650, y: 410, w: 120, h: 24 },
      { mat: 'ice',   x: 650, y: 375, w: 22, h: 46 },
      { mat: 'wood',  x: 650, y: 330, w: 120, h: 24 }
    ],
    pigs: [
      { x: 650, y: 538, r: 22 },
      { x: 650, y: 388, r: 20 },
      { x: 650, y: 302, r: 18 }
    ] },

  { birds: ['red','yellow','black','blue','red','yellow','red'],
    blocks: [
      { mat: 'ice',   x: 480, y: 515, w: 22, h: 90 },
      { mat: 'ice',   x: 560, y: 515, w: 22, h: 90 },
      { mat: 'wood',  x: 520, y: 458, w: 120, h: 24 },
      { mat: 'barrel',x: 480, y: 400, w: 28, h: 28 },
      { mat: 'stone', x: 660, y: 505, w: 26, h: 110 },
      { mat: 'stone', x: 740, y: 505, w: 26, h: 110 },
      { mat: 'wood',  x: 700, y: 438, w: 120, h: 24 },
      { mat: 'ice',   x: 700, y: 415, w: 22, h: 40 },
      { mat: 'wood',  x: 850, y: 515, w: 22, h: 90 },
      { mat: 'wood',  x: 930, y: 515, w: 22, h: 90 },
      { mat: 'wood',  x: 890, y: 458, w: 120, h: 24 }
    ],
    pigs: [
      { x: 520, y: 538, r: 22 },
      { x: 520, y: 396, r: 20 },
      { x: 700, y: 538, r: 22 },
      { x: 700, y: 386, r: 20 },
      { x: 890, y: 538, r: 22 }
    ] },

  { birds: ['red','black','yellow','blue','black','red','yellow'],
    blocks: [
      { mat: 'stone',  x: 540, y: 505, w: 30, h: 110 },
      { mat: 'stone',  x: 640, y: 505, w: 30, h: 110 },
      { mat: 'barrel', x: 590, y: 545, w: 30, h: 30 },
      { mat: 'wood',   x: 590, y: 438, w: 140, h: 24 },
      { mat: 'ice',    x: 590, y: 415, w: 22, h: 40 },
      { mat: 'stone',  x: 760, y: 505, w: 30, h: 110 },
      { mat: 'stone',  x: 860, y: 505, w: 30, h: 110 },
      { mat: 'barrel', x: 810, y: 545, w: 30, h: 30 },
      { mat: 'wood',   x: 810, y: 438, w: 140, h: 24 },
      { mat: 'ice',    x: 810, y: 415, w: 22, h: 40 }
    ],
    pigs: [
      { x: 590, y: 538, r: 22 },
      { x: 590, y: 386, r: 20 },
      { x: 810, y: 538, r: 22 },
      { x: 810, y: 386, r: 20 },
      { x: 700, y: 538, r: 22 }
    ] },

  { birds: ['blue','black','yellow','red','white','black','red','blue'],
    blocks: [
      { mat: 'stone', x: 480, y: 505, w: 28, h: 110 },
      { mat: 'stone', x: 580, y: 505, w: 28, h: 110 },
      { mat: 'stone', x: 680, y: 505, w: 28, h: 110 },
      { mat: 'wood',  x: 530, y: 438, w: 140, h: 24 },
      { mat: 'wood',  x: 630, y: 438, w: 140, h: 24 },
      { mat: 'stone', x: 580, y: 395, w: 24, h: 60 },
      { mat: 'ice',   x: 530, y: 360, w: 22, h: 46 },
      { mat: 'ice',   x: 630, y: 360, w: 22, h: 46 },
      { mat: 'wood',  x: 580, y: 325, w: 140, h: 24 },
      { mat: 'barrel',x: 800, y: 545, w: 30, h: 30 },
      { mat: 'barrel',x: 860, y: 545, w: 30, h: 30 },
      { mat: 'wood',  x: 830, y: 460, w: 120, h: 24 }
    ],
    pigs: [
      { x: 530, y: 538, r: 22 },
      { x: 630, y: 538, r: 22 },
      { x: 580, y: 386, r: 20 },
      { x: 580, y: 302, r: 18 },
      { x: 830, y: 538, r: 22 },
      { x: 830, y: 428, r: 20 }
    ] },

  { birds: ['red','yellow','black','blue','white','black','yellow','red','blue'],
    blocks: [
      { mat: 'stone', x: 460, y: 500, w: 30, h: 120 },
      { mat: 'stone', x: 560, y: 500, w: 30, h: 120 },
      { mat: 'stone', x: 660, y: 500, w: 30, h: 120 },
      { mat: 'stone', x: 760, y: 500, w: 30, h: 120 },
      { mat: 'stone', x: 860, y: 500, w: 30, h: 120 },
      { mat: 'wood',  x: 510, y: 428, w: 140, h: 24 },
      { mat: 'wood',  x: 610, y: 428, w: 140, h: 24 },
      { mat: 'wood',  x: 710, y: 428, w: 140, h: 24 },
      { mat: 'wood',  x: 810, y: 428, w: 140, h: 24 },
      { mat: 'barrel',x: 560, y: 380, w: 30, h: 30 },
      { mat: 'barrel',x: 760, y: 380, w: 30, h: 30 },
      { mat: 'ice',   x: 660, y: 385, w: 22, h: 60 },
      { mat: 'wood',  x: 660, y: 340, w: 140, h: 24 },
      { mat: 'stone', x: 660, y: 305, w: 24, h: 46 },
      { mat: 'wood',  x: 660, y: 262, w: 120, h: 24 }
    ],
    pigs: [
      { x: 510, y: 538, r: 22 },
      { x: 610, y: 538, r: 22 },
      { x: 710, y: 538, r: 22 },
      { x: 810, y: 538, r: 22 },
      { x: 660, y: 396, r: 20 },
      { x: 660, y: 302, r: 18 },
      { x: 660, y: 234, r: 16 }
    ] }
];

/* ============================================================
   СОСТОЯНИЕ
   ============================================================ */
let bodies    = [];
let particles = [];
let popups    = [];
let shockwaves= [];
let pigs      = [];
let blocks    = [];
let bird      = null;
let birdTypes = [];

let state      = 'aim';
let score      = 0;
let levelIndex = 0;

let settleTimer = 0;
let flyTimer    = 0;

let dragging = false;
let worldTime = 0;

let save = { best: 0, maxLevel: 0 };

let accTime  = 0;
let lastTime = 0;

/* ============================================================
   ДЕКОРАЦИИ
   ============================================================ */
const clouds = [
  { x: 180, y: 90,  s: 1.0, vx: 12 },
  { x: 480, y: 60,  s: 1.3, vx: 8  },
  { x: 760, y: 120, s: 0.9, vx: 15 },
  { x: 1050,y: 80,  s: 1.15,vx: 10 }
];

const grassTufts = [];
for (let i = 0; i < 80; i++) {
  grassTufts.push({
    x: Math.random() * W,
    y: GROUND_Y + 2 + Math.random() * (H - GROUND_Y - 6),
    h: 6 + Math.random() * 14,
    phase: Math.random() * Math.PI * 2,
    shade: Math.random() < 0.5 ? '#3f7a25' : '#5aa63f'
  });
}

const trees = [
  { x: 60,  s: 0.85 },
  { x: 340, s: 0.7  },
  { x: 940, s: 0.9  }
];

/* ============================================================
   DOM
   ============================================================ */
const elScore    = document.getElementById('score');
const elBest     = document.getElementById('best');
const elLevel    = document.getElementById('level');
const elBirds    = document.getElementById('birds');
const overlay    = document.getElementById('overlay');
const ovTitle    = document.getElementById('ov-title');
const ovText     = document.getElementById('ov-text');
const btnRestart = document.getElementById('btn-restart');
const btnNext    = document.getElementById('btn-next');

/* ============================================================
   ТЕЛО
   ============================================================ */
class Body {
  constructor(o) {
    this.type = o.type;
    this.x = o.x;
    this.y = o.y;
    this.vx = 0;
    this.vy = 0;

    this.r = o.r || 0;
    this.w = o.w || 0;
    this.h = o.h || 0;

    this.static  = !!o.static;
    this.mass    = o.mass || 1;
    this.invMass = this.static ? 0 : 1 / this.mass;

    this.rest = (o.rest !== undefined) ? o.rest : 0.15;
    this.fric = (o.fric !== undefined) ? o.fric : 0.55;

    this.kind = o.kind || 'block';
    this.mat  = o.mat  || null;

    this.hp    = (o.hp !== undefined) ? o.hp : Infinity;
    this.maxHp = this.hp;

    this.dead = false;
    this.held = false;
    this.rot  = 0;

    this.birdType    = o.birdType || null;
    this.abilityUsed = false;
    this.trail       = [];
    this.wingPhase   = Math.random() * Math.PI * 2;
  }
}

/* ============================================================
   ФИЗИКА
   ============================================================ */
function circleCircle(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const d2 = dx*dx + dy*dy;
  const rs = a.r + b.r;
  if (d2 >= rs*rs) return null;
  const d = Math.sqrt(d2) || 0.0001;
  return { nx: dx/d, ny: dy/d, pen: rs - d };
}

function circleBox(c, b) {
  const hw = b.w/2, hh = b.h/2;
  const px = Math.max(b.x - hw, Math.min(c.x, b.x + hw));
  const py = Math.max(b.y - hh, Math.min(c.y, b.y + hh));
  const dx = c.x - px, dy = c.y - py;
  const d2 = dx*dx + dy*dy;
  if (d2 > c.r*c.r) return null;
  if (d2 > 1e-9) {
    const d = Math.sqrt(d2);
    return { nx: -dx/d, ny: -dy/d, pen: c.r - d };
  }
  const left   = c.x - (b.x - hw);
  const right  = (b.x + hw) - c.x;
  const top    = c.y - (b.y - hh);
  const bottom = (b.y + hh) - c.y;
  const m = Math.min(left, right, top, bottom);
  if (m === left)   return { nx: -1, ny: 0, pen: left   + c.r };
  if (m === right)  return { nx:  1, ny: 0, pen: right  + c.r };
  if (m === top)    return { nx: 0,  ny: -1, pen: top    + c.r };
  return                   { nx: 0,  ny: 1,  pen: bottom + c.r };
}

function boxBox(a, b) {
  const dx = b.x - a.x;
  const ox = (a.w + b.w)/2 - Math.abs(dx);
  if (ox <= 0) return null;
  const dy = b.y - a.y;
  const oy = (a.h + b.h)/2 - Math.abs(dy);
  if (oy <= 0) return null;
  if (ox < oy) return { nx: dx < 0 ? -1 : 1, ny: 0, pen: ox };
  return { nx: 0, ny: dy < 0 ? -1 : 1, pen: oy };
}

function collide(a, b) {
  if (a.type === 'circle' && b.type === 'circle') return circleCircle(a, b);
  if (a.type === 'circle' && b.type === 'box')    return circleBox(a, b);
  if (a.type === 'box'    && b.type === 'circle') {
    const m = circleBox(b, a);
    if (!m) return null;
    return { nx: -m.nx, ny: -m.ny, pen: m.pen };
  }
  return boxBox(a, b);
}

function resolve(a, b, m) {
  const nx = m.nx, ny = m.ny;
  const invSum = a.invMass + b.invMass;
  if (invSum === 0) return 0;

  const corr = Math.max(m.pen - 0.5, 0) / invSum * 0.7;
  a.x -= nx * corr * a.invMass;
  a.y -= ny * corr * a.invMass;
  b.x += nx * corr * b.invMass;
  b.y += ny * corr * b.invMass;

  const rvx = b.vx - a.vx, rvy = b.vy - a.vy;
  const vn = rvx * nx + rvy * ny;
  if (vn > 0) return 0;

  const e = Math.min(a.rest, b.rest);
  const j = -(1 + e) * vn / invSum;

  a.vx -= j * nx * a.invMass;
  a.vy -= j * ny * a.invMass;
  b.vx += j * nx * b.invMass;
  b.vy += j * ny * b.invMass;

  let tx = rvx - vn * nx, ty = rvy - vn * ny;
  const tl = Math.hypot(tx, ty);
  if (tl > 1e-6) {
    tx /= tl; ty /= tl;
    const mu = Math.sqrt(a.fric * b.fric);
    let jt = -(rvx * tx + rvy * ty) / invSum;
    const maxJt = j * mu;
    if (jt >  maxJt) jt =  maxJt;
    if (jt < -maxJt) jt = -maxJt;
    a.vx -= jt * tx * a.invMass;
    a.vy -= jt * ty * a.invMass;
    b.vx += jt * tx * b.invMass;
    b.vy += jt * ty * b.invMass;
  }
  return Math.abs(j);
}

/* ============================================================
   УРОН
   ============================================================ */
const DMG_THRESHOLD = 250;
const DMG_SCALE     = 0.09;

function applyDamage(a, b, impulse) {
  const dmg = (impulse - DMG_THRESHOLD) * DMG_SCALE;
  if (dmg <= 0) return;
  if (!a.static && (a.kind === 'block' || a.kind === 'pig')) {
    a.hp -= dmg;
    if (a.hp <= 0) destroy(a);
  }
  if (!b.static && (b.kind === 'block' || b.kind === 'pig')) {
    b.hp -= dmg;
    if (b.hp <= 0) destroy(b);
  }
}

function destroy(body) {
  if (body.dead) return;
  body.dead = true;

  if (body.kind === 'pig') {
    score += 5000;
    spawnParticles(body.x, body.y, '#7ac943', 22);
    spawnParticles(body.x, body.y, '#ffffff', 8);
    popup(body.x, body.y - 20, '+5000', '#7ff0a0');
  } else if (body.mat === 'barrel') {
    score += 1000;
    popup(body.x, body.y - 20, '+1000', '#ffb020');
  } else if (body.kind === 'block') {
    score += 500;
    const m = MATERIALS[body.mat];
    spawnParticles(body.x, body.y, m ? m.fill : '#bbb', 14);
    popup(body.x, body.y - 15, '+500', '#ffe066');
  }

  updateHUD();

  if (body.mat === 'barrel') {
    explode(body.x, body.y, 180, 1200, 100);
  }
}

/* ============================================================
   ВЗРЫВ
   ============================================================ */
function explode(x, y, radius, power, damage) {
  spawnParticles(x, y, '#ff9a3a', 40);
  spawnParticles(x, y, '#ffe066', 25);
  spawnParticles(x, y, '#ff4040', 20);
  spawnParticles(x, y, '#5a5a5a', 15);
  shockwaves.push({ x, y, r: 12, maxR: radius, life: 0.55, maxLife: 0.55 });

  for (const b of bodies) {
    if (b.dead || b.static || b.held) continue;
    const dx = b.x - x, dy = b.y - y;
    const d = Math.hypot(dx, dy);
    if (d > radius || d < 0.01) continue;

    const falloff = 1 - d / radius;
    b.vx += (dx / d) * power * falloff;
    b.vy += (dy / d) * power * falloff;

    if (b.kind === 'block' || b.kind === 'pig') {
      b.hp -= damage * falloff;
      if (b.hp <= 0 && !b.dead) destroy(b);
    }
  }
}

/* ============================================================
   ЧАСТИЦЫ / ПОПАПЫ / ВОЛНЫ
   ============================================================ */
function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 460,
      vy: (Math.random() - 0.5) * 460 - 120,
      r: 2 + Math.random() * 4.5,
      life: 0.55 + Math.random() * 0.6,
      maxLife: 1.15,
      color
    });
  }
}

function popup(x, y, text, color) {
  popups.push({ x, y, vy: -55, text, color, life: 1.1, maxLife: 1.1 });
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.vy += 1300 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0 || p.y > H + 80) particles.splice(i, 1);
  }
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.y += p.vy * dt;
    p.vy += 40 * dt;
    p.life -= dt;
    if (p.life <= 0) popups.splice(i, 1);
  }
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const s = shockwaves[i];
    s.r += (s.maxR - s.r) * 6 * dt;
    s.life -= dt;
    if (s.life <= 0) shockwaves.splice(i, 1);
  }
}

/* ============================================================
   ШАГ ФИЗИКИ  (с гашением микро-дрожания)
   ============================================================ */
function physicsStep(dt) {
  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i];
    if (b.static || b.held || b.dead) continue;
    b.vy += GRAVITY * dt;

    // Гасим микро-колебания: тела со скоростью ниже 50 px/s
    // быстро затухают — это предотвращает бесконечное дрожание стопок.
    const sp = Math.hypot(b.vx, b.vy);
    if (sp < 50) {
      b.vx *= 0.90;
      b.vy *= 0.90;
    } else {
      b.vx *= 0.9995;
    }

    b.x  += b.vx * dt;
    b.y  += b.vy * dt;
    if (b.kind === 'bird') {
      b.rot += b.vx * dt * 0.02;
      b.wingPhase += dt * 25;
    }
  }

  for (let it = 0; it < 3; it++) {
    for (let i = 0; i < bodies.length; i++) {
      const a = bodies[i];
      if (a.dead) continue;
      for (let k = i + 1; k < bodies.length; k++) {
        const b = bodies[k];
        if (b.dead) continue;
        if (a.static && b.static) continue;
        if (a.held || b.held) continue;
        const m = collide(a, b);
        if (!m) continue;
        const imp = resolve(a, b, m);
        if (it === 0 && imp > 0) applyDamage(a, b, imp);
      }
    }
  }
}

/* ============================================================
   ОЧИСТКА  (удаляем всё, что ниже уровня земли)
   ============================================================ */
function cleanup() {
  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i];
    if (b.dead || b.static) continue;
    if (b.x < -520 || b.x > W + 720 || b.y > GROUND_Y + 100) {
      if (b.kind === 'pig' || b.kind === 'block') destroy(b);
      else b.dead = true;
    }
  }
  bodies = bodies.filter(b => !b.dead);
  pigs   = pigs.filter(p => !p.dead);
  blocks = blocks.filter(b => !b.dead);
}

/* ============================================================
   СТАРТ УРОВНЯ
   ============================================================ */
function startLevel(index) {
  levelIndex = index;
  const L = LEVELS[index];

  bodies = [];
  particles = [];
  popups = [];
  shockwaves = [];
  pigs = [];
  blocks = [];
  bird = null;
  birdTypes = L.birds.slice();

  state = 'aim';
  settleTimer = 0;
  flyTimer    = 0;
  dragging    = false;
  accTime     = 0;

  bodies.push(new Body({
    type: 'box', x: W/2, y: GROUND_Y + 150,
    w: 4000, h: 300, static: true, kind: 'ground',
    rest: 0.20, fric: 0.90
  }));

  for (const def of L.blocks) {
    const mat  = MATERIALS[def.mat];
    const mass = (def.w * def.h) * mat.density * 0.0012;
    const b = new Body({
      type: 'box', kind: 'block',
      x: def.x, y: def.y, w: def.w, h: def.h,
      mass, rest: mat.rest, fric: mat.fric,
      hp: mat.hp, mat: def.mat
    });
    bodies.push(b);
    blocks.push(b);
  }

  for (const def of L.pigs) {
    const p = new Body({
      type: 'circle', kind: 'pig',
      x: def.x, y: def.y, r: def.r,
      mass: def.r * def.r * 0.006,
      rest: 0.25, fric: 0.55, hp: 40
    });
    bodies.push(p);
    pigs.push(p);
  }

  spawnNextBird();
  overlay.classList.add('hidden');
  updateHUD();
}

/* ============================================================
   ПТИЦА
   ============================================================ */
function spawnNextBird() {
  if (birdTypes.length === 0) { bird = null; return; }
  const typeName = birdTypes.shift();
  const type = BIRD_TYPES[typeName];
  if (!type) { spawnNextBird(); return; }   // защита от опечаток
  const b = new Body({
    type: 'circle', kind: 'bird',
    x: ANCHOR.x, y: ANCHOR.y, r: type.r,
    mass: type.mass, rest: 0.45, fric: 0.55,
    birdType: typeName
  });
  b.held = true;
  b.rot = 0;
  bodies.push(b);
  bird = b;
  state = 'aim';
  dragging = false;
}

function launchBird() {
  if (!bird || !bird.held) return;
  const dx = ANCHOR.x - bird.x;
  const dy = ANCHOR.y - bird.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 20) {
    bird.x = ANCHOR.x;
    bird.y = ANCHOR.y;
    return;
  }
  bird.vx = dx * POWER;
  bird.vy = dy * POWER;
  bird.held = false;
  state = 'fly';
  flyTimer = 0;
  updateHUD();
}

/* ============================================================
   СПОСОБНОСТЬ
   ============================================================ */
function activateAbility() {
  if (!bird || bird.dead || bird.abilityUsed) return;
  const type = BIRD_TYPES[bird.birdType];
  if (!type || !type.ability) return;

  bird.abilityUsed = true;

  if (type.ability === 'bomb') {
    const bx = bird.x, by = bird.y;
    bird.dead = true;
    bird = null;
    explode(bx, by, 175, 1150, 130);

  } else if (type.ability === 'dash') {
    const sp = Math.hypot(bird.vx, bird.vy);
    if (sp > 30) {
      const k = 1800 / sp;
      bird.vx *= k;
      bird.vy *= k;
    } else {
      bird.vx = 1800;
    }
    spawnParticles(bird.x, bird.y, '#fff4a0', 12);

  } else if (type.ability === 'split') {
    const vx = bird.vx, vy = bird.vy;
    const px = bird.x,  py = bird.y;
    for (let i = 0; i < 2; i++) {
      const nb = new Body({
        type: 'circle', kind: 'bird',
        x: px, y: py, r: BIRD_TYPES.blue.r,
        mass: BIRD_TYPES.blue.mass,
        rest: 0.45, fric: 0.55,
        birdType: 'blue'
      });
      nb.held = false;
      nb.abilityUsed = true;
      nb.vx = vx + (i === 0 ? -230 : 230);
      nb.vy = vy - 60;
      bodies.push(nb);
    }
    spawnParticles(px, py, '#d6efff', 10);

  } else if (type.ability === 'egg') {
    const ex = bird.x, ey = bird.y + bird.r + 4;
    bird.vy = -Math.abs(bird.vy) * 0.4 - 200;
    explode(ex, ey, 120, 900, 90);
  }
}

/* ============================================================
   HUD
   ============================================================ */
function updateHUD() {
  const remain = birdTypes.length + ((bird && bird.held) ? 1 : 0);
  elScore.textContent = score;
  elBest.textContent  = save.best;
  elLevel.textContent = levelIndex + 1;
  elBirds.textContent = remain;
}

/* ============================================================
   УКАЗАТЕЛЬ
   ============================================================ */
function getPointer(e) {
  const rect = canvas.getBoundingClientRect();
  const sx = canvas.width / rect.width;
  const sy = canvas.height / rect.height;
  let cx, cy;
  if (e.touches && e.touches.length) {
    cx = e.touches[0].clientX;
    cy = e.touches[0].clientY;
  } else {
    cx = e.clientX;
    cy = e.clientY;
  }
  return { x: (cx - rect.left) * sx, y: (cy - rect.top) * sy };
}

/* ============================================================
   УПРАВЛЕНИЕ
   ============================================================ */
function onDown(e) {
  if ((state === 'fly' || state === 'wait') &&
      bird && !bird.dead && !bird.abilityUsed) {
    const type = BIRD_TYPES[bird.birdType];
    if (type && type.ability) {
      activateAbility();
      e.preventDefault();
      return;
    }
  }

  if (state !== 'aim') return;
  if (!bird || !bird.held) return;
  const p = getPointer(e);
  const dx = p.x - bird.x;
  const dy = p.y - bird.y;
  if (Math.hypot(dx, dy) < bird.r * 3) {
    dragging = true;
    e.preventDefault();
  }
}

function onMove(e) {
  if (!dragging || !bird) return;
  const p = getPointer(e);
  let dx = p.x - ANCHOR.x;
  let dy = p.y - ANCHOR.y;
  const d = Math.hypot(dx, dy);
  if (d > MAX_DRAG) {
    dx = dx / d * MAX_DRAG;
    dy = dy / d * MAX_DRAG;
  }
  bird.x = ANCHOR.x + dx;
  bird.y = ANCHOR.y + dy;
  e.preventDefault();
}

function onUp(e) {
  if (!dragging) return;
  dragging = false;
  launchBird();
  e.preventDefault();
}

canvas.addEventListener('mousedown', onDown);
window.addEventListener('mousemove', onMove);
window.addEventListener('mouseup',   onUp);
canvas.addEventListener('touchstart', onDown, { passive: false });
window.addEventListener('touchmove',  onMove, { passive: false });
window.addEventListener('touchend',   onUp,   { passive: false });
window.addEventListener('touchcancel',onUp,   { passive: false });

/* ============================================================
   ХОД ИГРЫ
   ============================================================ */
function allSettled() {
  for (const b of bodies) {
    if (b.static || b.held || b.dead) continue;
    const sp = Math.hypot(b.vx, b.vy);
    if (sp > 45) return false;   // порог увеличен с 22 до 45
  }
  return true;
}

function afterTurn() {
  if (pigs.length === 0) {
    state = 'over';
    winGame();
    return;
  }
  if (birdTypes.length > 0) {
    spawnNextBird();
  } else {
    state = 'over';
    loseGame();
  }
  updateHUD();
}

/* ============================================================
   ПОБЕДА / ПОРАЖЕНИЕ
   ============================================================ */
function winGame() {
  const bonus = birdTypes.length * 10000;
  score += bonus;
  updateHUD();

  if (score > save.best) save.best = score;
  if (levelIndex + 1 > save.maxLevel) save.maxLevel = levelIndex + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  updateHUD();

  const isLast = levelIndex >= LEVELS.length - 1;

  if (isLast) {
    ovTitle.textContent = '🏆 Игра пройдена!';
    ovText.textContent  =
      'Все 15 уровней позади!\n' +
      'Итоговые очки: ' + score + '\n' +
      'Рекорд: ' + save.best;
    btnRestart.textContent = 'Закрыть';
    btnNext.textContent    = 'Заново с 1-го';
    btnNext.style.display  = '';
  } else {
    ovTitle.textContent = 'Уровень ' + (levelIndex + 1) + ' пройден!';
    ovText.textContent  =
      'Очки: ' + score + '\n' +
      'Рекорд: ' + save.best + '\n' +
      (bonus > 0 ? 'Бонус за птиц: ' + bonus : '');
    btnRestart.textContent = 'Заново';
    btnNext.textContent    = 'Далее';
    btnNext.style.display  = '';
  }
  overlay.classList.remove('hidden');
}

function loseGame() {
  if (score > save.best) {
    save.best = score;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  }
  updateHUD();

  ovTitle.textContent = 'Проигрыш';
  ovText.textContent  =
    'Птицы закончились.\n' +
    'Очки: ' + score + '\n' +
    'Рекорд: ' + save.best;
  btnRestart.textContent = 'Заново';
  btnNext.style.display  = 'none';
  overlay.classList.remove('hidden');
}

/* ============================================================
   КНОПКИ
   ============================================================ */
btnRestart.addEventListener('click', () => {
  if (levelIndex >= LEVELS.length - 1 && pigs.length === 0) {
    overlay.classList.add('hidden');
    return;
  }
  score = 0;
  startLevel(levelIndex);
  overlay.classList.add('hidden');
});

btnNext.addEventListener('click', () => {
  const next = levelIndex + 1;
  if (next < LEVELS.length) {
    startLevel(next);
  } else {
    score = 0;
    startLevel(0);
  }
  overlay.classList.add('hidden');
});

/* ============================================================
   СОХРАНЕНИЕ
   ============================================================ */
function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (typeof s.best === 'number')     save.best = s.best;
      if (typeof s.maxLevel === 'number') save.maxLevel = s.maxLevel;
    }
  } catch (e) {}
}

/* ============================================================
   ФОН
   ============================================================ */
function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0,    '#5fb6f0');
  g.addColorStop(0.45, '#a7d8f7');
  g.addColorStop(0.75, '#dfeffb');
  g.addColorStop(1,    '#f3f7dc');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.translate(130, 100);
  for (let i = 0; i < 12; i++) {
    ctx.rotate(Math.PI * 2 / 12);
    ctx.fillStyle = '#fff3a0';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(280, -18);
    ctx.lineTo(280, 18);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  const sg = ctx.createRadialGradient(130, 100, 10, 130, 100, 60);
  sg.addColorStop(0, '#fff8c0');
  sg.addColorStop(0.6, '#ffe066');
  sg.addColorStop(1, 'rgba(255,224,102,0.1)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(130, 100, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#a4c8e8';
  ctx.beginPath();
  ctx.moveTo(-50, GROUND_Y);
  ctx.lineTo(80,  320);
  ctx.lineTo(220, GROUND_Y);
  ctx.lineTo(340, 340);
  ctx.lineTo(500, GROUND_Y);
  ctx.lineTo(640, 300);
  ctx.lineTo(800, GROUND_Y);
  ctx.lineTo(950, 350);
  ctx.lineTo(1100, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#7aae88';
  ctx.beginPath();
  ctx.moveTo(-50, GROUND_Y);
  ctx.lineTo(140, 380);
  ctx.lineTo(320, GROUND_Y);
  ctx.lineTo(500, 400);
  ctx.lineTo(720, GROUND_Y);
  ctx.lineTo(900, 380);
  ctx.lineTo(1100, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  for (const c of clouds) drawCloud(c.x, c.y, c.s);
}

function drawCloud(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = 'rgba(150,180,210,0.35)';
  ctx.beginPath();
  ctx.arc(2, 4, 30, 0, Math.PI * 2);
  ctx.arc(32, -4, 36, 0, Math.PI * 2);
  ctx.arc(67, 6, 28, 0, Math.PI * 2);
  ctx.arc(34, 16, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.arc(30, -8, 36, 0, Math.PI * 2);
  ctx.arc(66, 2, 28, 0, Math.PI * 2);
  ctx.arc(32, 14, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.arc(28, -14, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawGround() {
  const g = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  g.addColorStop(0,    '#84c95e');
  g.addColorStop(0.15, '#5aa63f');
  g.addColorStop(1,    '#2d5a1f');
  ctx.fillStyle = g;
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  ctx.fillStyle = '#9adf72';
  ctx.fillRect(0, GROUND_Y - 4, W, 6);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(0, GROUND_Y - 4, W, 2);

  for (const t of grassTufts) {
    const sway = Math.sin(worldTime * 1.5 + t.phase) * 2;
    ctx.strokeStyle = t.shade;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(t.x, t.y);
    ctx.quadraticCurveTo(t.x + sway, t.y - t.h * 0.6, t.x + sway * 1.6, t.y - t.h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(t.x - 3, t.y);
    ctx.quadraticCurveTo(t.x - 3 + sway, t.y - t.h * 0.5, t.x - 3 + sway * 1.6, t.y - t.h * 0.85);
    ctx.stroke();
  }
}

function drawTrees() {
  for (const tr of trees) {
    ctx.save();
    ctx.translate(tr.x, GROUND_Y);
    ctx.scale(tr.s, tr.s);

    ctx.fillStyle = '#5a3a1e';
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(-5, -40);
    ctx.lineTo(5, -40);
    ctx.lineTo(8, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#3d8a2a';
    ctx.beginPath();
    ctx.arc(0, -55, 34, 0, Math.PI * 2);
    ctx.arc(-22, -45, 24, 0, Math.PI * 2);
    ctx.arc(22, -45, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#54a83a';
    ctx.beginPath();
    ctx.arc(-8, -62, 22, 0, Math.PI * 2);
    ctx.arc(12, -58, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/* ============================================================
   РОГАТКА
   ============================================================ */
function drawSlingBack() {
  ctx.strokeStyle = '#4a2c15';
  ctx.lineWidth = 15;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(ANCHOR.x, ANCHOR.y + 6);
  ctx.lineTo(ANCHOR.x - 8, GROUND_Y + 6);
  ctx.stroke();

  ctx.strokeStyle = '#6b421c';
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(ANCHOR.x, ANCHOR.y + 10);
  ctx.lineTo(ANCHOR.x - 22, ANCHOR.y - 22);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ANCHOR.x, ANCHOR.y + 10);
  ctx.lineTo(ANCHOR.x + 22, ANCHOR.y - 18);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,220,150,0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ANCHOR.x - 16, ANCHOR.y - 12);
  ctx.lineTo(ANCHOR.x - 6, ANCHOR.y + 4);
  ctx.stroke();
}

function drawSlingFront() {
  ctx.strokeStyle = '#8a5428';
  ctx.lineWidth = 15;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(ANCHOR.x, ANCHOR.y + 6);
  ctx.lineTo(ANCHOR.x + 6, GROUND_Y + 6);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,220,150,0.4)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ANCHOR.x + 2, ANCHOR.y + 4);
  ctx.lineTo(ANCHOR.x + 5, GROUND_Y - 4);
  ctx.stroke();
}

function drawSlingBands() {
  if (!bird || !bird.held) return;

  ctx.strokeStyle = '#2a1810';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(ANCHOR.x - 22, ANCHOR.y - 22);
  ctx.lineTo(bird.x, bird.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ANCHOR.x + 22, ANCHOR.y - 18);
  ctx.lineTo(bird.x, bird.y);
  ctx.stroke();

  if (Math.hypot(ANCHOR.x - bird.x, ANCHOR.y - bird.y) > 15) {
    const vx = (ANCHOR.x - bird.x) * POWER;
    const vy = (ANCHOR.y - bird.y) * POWER;
    let px = bird.x, py = bird.y, pvx = vx, pvy = vy;
    for (let i = 0; i < 80; i++) {
      const dt = 0.035;
      pvy += GRAVITY * dt;
      px += pvx * dt;
      py += pvy * dt;
      if (py > GROUND_Y || px > W) break;
      const a = 0.75 - i * 0.008;
      ctx.fillStyle = 'rgba(255,255,255,' + Math.max(0.1, a) + ')';
      ctx.beginPath();
      ctx.arc(px, py, 3 - i * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/* ============================================================
   ПТИЦА
   ============================================================ */
function drawBird(b) {
  const type = BIRD_TYPES[b.birdType] || BIRD_TYPES.red;
  const R = b.r;

  if (b.trail && b.trail.length) {
    for (let i = 0; i < b.trail.length; i++) {
      const t = b.trail[i];
      const a = (t.life / 0.5) * 0.4;
      ctx.globalAlpha = a;
      ctx.fillStyle = type.color1;
      ctx.beginPath();
      ctx.arc(t.x, t.y, R * 0.55 * (t.life / 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.save();
  ctx.translate(b.x, b.y);

  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.arc(3, R * 0.85, R * 0.85, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(b.rot);

  ctx.fillStyle = type.color2;
  ctx.beginPath();
  ctx.moveTo(-R * 0.7, -R * 0.3);
  ctx.lineTo(-R * 1.55, -R * 0.65);
  ctx.lineTo(-R * 1.4, 0);
  ctx.lineTo(-R * 1.55, R * 0.55);
  ctx.lineTo(-R * 0.7, R * 0.3);
  ctx.closePath();
  ctx.fill();

  const wingAng = Math.sin(b.wingPhase) * 0.25;
  ctx.save();
  ctx.translate(-R * 0.15, R * 0.05);
  ctx.rotate(wingAng);
  const wg = ctx.createLinearGradient(0, 0, -R * 0.4, -R * 0.8);
  wg.addColorStop(0, type.color2);
  wg.addColorStop(1, type.color1);
  ctx.fillStyle = wg;
  ctx.beginPath();
  ctx.ellipse(-R * 0.25, -R * 0.25, R * 0.6, R * 0.9, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  const g = ctx.createRadialGradient(-R * 0.3, -R * 0.4, R * 0.15, 0, 0, R + 3);
  g.addColorStop(0, type.color1);
  g.addColorStop(1, type.color2);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = type.belly;
  ctx.beginPath();
  ctx.ellipse(R * 0.1, R * 0.4, R * 0.55, R * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffb020';
  ctx.beginPath();
  ctx.moveTo(R * 0.55, -R * 0.1);
  ctx.lineTo(R * 1.5, R * 0.15);
  ctx.lineTo(R * 0.55, R * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#c88000';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(R * 0.55, R * 0.15);
  ctx.lineTo(R * 1.5, R * 0.15);
  ctx.stroke();

  const ex = R * 0.4, ey = -R * 0.28;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(ex, ey, R * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(ex + R * 0.14, ey, R * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(ex + R * 0.08, ey - R * 0.1, R * 0.07, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#111';
  ctx.lineWidth = R * 0.16;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(R * 0.05, -R * 0.85);
  ctx.lineTo(R * 0.7, -R * 0.55);
  ctx.stroke();

  if (b.birdType === 'black') {
    ctx.strokeStyle = '#3a2a10';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -R);
    ctx.quadraticCurveTo(4, -R - 10, 2, -R - 14);
    ctx.stroke();
    const spark = 1 + Math.sin(worldTime * 30) * 0.5;
    ctx.fillStyle = '#ffe066';
    ctx.beginPath();
    ctx.arc(2, -R - 16, 3 * spark, 0, Math.PI * 2);
    ctx.fill();
  }
  if (b.birdType === 'blue') {
    ctx.strokeStyle = 'rgba(30,90,150,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.75, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();

  if (!b.held && !b.abilityUsed && state === 'fly' && b === bird) {
    const type2 = BIRD_TYPES[b.birdType];
    if (type2 && type2.ability) {
      const pulse = 1 + Math.sin(worldTime * 8) * 0.15;
      ctx.strokeStyle = 'rgba(255,255,100,0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(b.x, b.y, R * 1.8 * pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.strokeText(type2.abilityName + '!', b.x, b.y - R * 2.4);
      ctx.fillText(type2.abilityName + '!', b.x, b.y - R * 2.4);
    }
  }
}

/* ============================================================
   СВИНЬЯ
   ============================================================ */
function drawPig(p) {
  ctx.save();
  ctx.translate(p.x, p.y);

  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.arc(2, p.r * 0.9, p.r * 0.85, 0, Math.PI * 2);
  ctx.fill();

  const g = ctx.createRadialGradient(-p.r * 0.3, -p.r * 0.35, p.r * 0.2, 0, 0, p.r + 3);
  g.addColorStop(0, '#b8f07a');
  g.addColorStop(1, '#4f8a24');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, p.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#5ea82a';
  ctx.beginPath();
  ctx.ellipse(-p.r * 0.65, -p.r * 0.75, p.r * 0.3, p.r * 0.22, -0.4, 0, Math.PI * 2);
  ctx.ellipse( p.r * 0.65, -p.r * 0.75, p.r * 0.3, p.r * 0.22,  0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#7ac943';
  ctx.beginPath();
  ctx.ellipse(0, p.r * 0.25, p.r * 0.45, p.r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#3f7020';
  ctx.beginPath();
  ctx.arc(-p.r * 0.15, p.r * 0.25, p.r * 0.08, 0, Math.PI * 2);
  ctx.arc( p.r * 0.15, p.r * 0.25, p.r * 0.08, 0, Math.PI * 2);
  ctx.fill();

  const ex = p.r * 0.42, ey = -p.r * 0.35;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-ex, ey, p.r * 0.3, 0, Math.PI * 2);
  ctx.arc( ex, ey, p.r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(-ex + 1, ey, p.r * 0.15, 0, Math.PI * 2);
  ctx.arc( ex + 1, ey, p.r * 0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-ex + 2, ey - 2, p.r * 0.06, 0, Math.PI * 2);
  ctx.arc( ex + 2, ey - 2, p.r * 0.06, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,120,120,0.35)';
  ctx.beginPath();
  ctx.arc(-p.r * 0.72, p.r * 0.15, p.r * 0.18, 0, Math.PI * 2);
  ctx.arc( p.r * 0.72, p.r * 0.15, p.r * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* ============================================================
   БЛОК
   ============================================================ */
function drawBlock(b) {
  const m = MATERIALS[b.mat] || MATERIALS.wood;
  const x = b.x - b.w / 2;
  const y = b.y - b.h / 2;

  ctx.save();

  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  ctx.fillRect(x + 3, y + 4, b.w, b.h);

  const g = ctx.createLinearGradient(x, y, x, y + b.h);
  g.addColorStop(0, m.fill);
  g.addColorStop(0.55, m.fill);
  g.addColorStop(1, m.stroke);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, b.w, b.h);

  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillRect(x + 2, y + 2, b.w - 4, Math.min(4, b.h * 0.15));

  ctx.strokeStyle = m.stroke;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, b.w - 2, b.h - 2);

  if (b.mat === 'wood' && b.w > 30 && b.h > 15) {
    ctx.strokeStyle = 'rgba(90,50,15,0.32)';
    ctx.lineWidth = 1.2;
    const horizontal = b.w > b.h;
    if (horizontal) {
      for (let i = 0; i < 4; i++) {
        const yy = y + 4 + (b.h - 8) * (i / 3);
        ctx.beginPath();
        ctx.moveTo(x + 3, yy);
        ctx.lineTo(x + b.w - 3, yy);
        ctx.stroke();
      }
    } else {
      for (let i = 0; i < 4; i++) {
        const xx = x + 4 + (b.w - 8) * (i / 3);
        ctx.beginPath();
        ctx.moveTo(xx, y + 3);
        ctx.lineTo(xx, y + b.h - 3);
        ctx.stroke();
      }
    }
  } else if (b.mat === 'ice') {
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + b.h * 0.5);
    ctx.lineTo(x + b.w * 0.5, y + 4);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(90,170,210,0.55)';
    ctx.beginPath();
    ctx.moveTo(x + b.w * 0.7, y + b.h - 4);
    ctx.lineTo(x + b.w - 4, y + b.h * 0.4);
    ctx.stroke();
  } else if (b.mat === 'stone') {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    const seed = (b.x * 13 + b.y * 7) | 0;
    for (let i = 0; i < 6; i++) {
      const sx = x + 4 + ((seed * (i + 3) * 17) % (b.w - 8));
      const sy = y + 4 + ((seed * (i + 5) * 23) % (b.h - 8));
      ctx.beginPath();
      ctx.arc(sx, sy, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (b.mat === 'barrel') {
    ctx.strokeStyle = '#4a1a10';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + b.h * 0.25);
    ctx.lineTo(x + b.w, y + b.h * 0.25);
    ctx.moveTo(x, y + b.h * 0.75);
    ctx.lineTo(x + b.w, y + b.h * 0.75);
    ctx.stroke();

    ctx.fillStyle = '#ffe066';
    ctx.beginPath();
    ctx.moveTo(b.x, b.y - Math.min(b.w, b.h) * 0.28);
    ctx.lineTo(b.x + Math.min(b.w, b.h) * 0.28, b.y);
    ctx.lineTo(b.x, b.y + Math.min(b.w, b.h) * 0.28);
    ctx.lineTo(b.x - Math.min(b.w, b.h) * 0.28, b.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#7a1a10';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#7a1a10';
    ctx.font = 'bold ' + (Math.min(b.w, b.h) * 0.38) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', b.x, b.y + 1);
  }

  if (b.hp < b.maxHp && b.mat !== 'barrel') {
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1.5;
    const n = Math.ceil((1 - b.hp / b.maxHp) * 5);
    const seed = (b.x * 31 + b.y * 7) | 0;
    for (let i = 0; i < n; i++) {
      const cx = x + 6 + ((seed * (i + 1) * 13) % (b.w - 12));
      const cy = y + 6 + ((seed * (i + 2) * 17) % (b.h - 12));
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 8, cy + 10);
      ctx.lineTo(cx + 4, cy + 16);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/* ============================================================
   ЧАСТИЦЫ / ПОПАПЫ / ВОЛНЫ
   ============================================================ */
function drawParticles() {
  for (const p of particles) {
    const a = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * (0.5 + a * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPopups() {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 20px sans-serif';
  for (const p of popups) {
    const a = Math.min(1, p.life / p.maxLife * 2);
    ctx.globalAlpha = a;
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.lineWidth = 4;
    ctx.strokeText(p.text, p.x, p.y);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;
}

function drawShockwaves() {
  for (const s of shockwaves) {
    const a = Math.max(0, s.life / s.maxLife);
    ctx.globalAlpha = a * 0.7;
    ctx.strokeStyle = '#fff5b0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = a * 0.35;
    ctx.strokeStyle = '#ffa040';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * 0.9, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/* ============================================================
   РЕНДЕР
   ============================================================ */
function render() {
  drawBackground();
  drawTrees();
  drawGround();
  drawSlingBack();

  for (const b of blocks) if (!b.dead) drawBlock(b);
  for (const p of pigs)   if (!p.dead) drawPig(p);

  for (const b of bodies) {
    if (b.kind === 'bird' && !b.dead) drawBird(b);
  }

  drawSlingBands();
  drawSlingFront();
  drawShockwaves();
  drawParticles();
  drawPopups();
}

/* ============================================================
   ОБНОВЛЕНИЕ
   ============================================================ */
function update(dt) {
  worldTime += dt;

  for (const c of clouds) {
    c.x += c.vx * dt;
    if (c.x > W + 200) c.x = -200;
  }

  accTime += dt;
  let steps = 0;
  while (accTime >= FIXED_DT && steps < 6) {
    physicsStep(FIXED_DT);
    accTime -= FIXED_DT;
    steps++;
  }

  for (const b of bodies) {
    if (b.kind === 'bird' && !b.dead && !b.held) {
      b.trail.push({ x: b.x, y: b.y, life: 0.5 });
      if (b.trail.length > 12) b.trail.shift();
    }
    if (b.trail) {
      for (let i = b.trail.length - 1; i >= 0; i--) {
        b.trail[i].life -= dt;
        if (b.trail[i].life <= 0) b.trail.splice(i, 1);
      }
    }
  }

  updateParticles(dt);
  cleanup();

  if (state === 'fly') {
    flyTimer += dt;
    if (flyTimer > 3.0) {
      let allGone = true;
      for (const b of bodies) {
        if (b.kind === 'bird' && !b.dead &&
            b.x < W + 250 && b.y < H + 250) {
          allGone = false;
          break;
        }
      }
      // Ход завершается если: все птицы улетели ИЛИ всё замерло ИЛИ
      // прошло 8 секунд (жёсткий таймаут от зависаний)
      if (allGone || allSettled() || flyTimer > 8) {
        state = 'wait';
        settleTimer = 0;
      }
    }
  }

  if (state === 'wait') {
    settleTimer += dt;
    if (settleTimer > 0.7) {
      bodies = bodies.filter(b => b.kind !== 'bird');
      bird = null;
      afterTurn();
    }
  }
}

/* ============================================================
   ЦИКЛ
   ============================================================ */
function loop(now) {
  if (!lastTime) lastTime = now;
  let dt = (now - lastTime) / 1000;
  lastTime = now;
  if (dt > 0.05) dt = 0.05;

  if (state !== 'over' || particles.length > 0) update(dt);
  render();
  requestAnimationFrame(loop);
}

/* ============================================================
   ИНИЦИАЛИЗАЦИЯ
   ============================================================ */
function init() {
  loadSave();
  score = 0;
  updateHUD();
  startLevel(0);
  requestAnimationFrame(loop);
}

init();

})();