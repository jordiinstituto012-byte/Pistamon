import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { pokemones, pokemonesJohto, pokemonesHoenn, pokemonesSinnoh, pokemonesTeselia, getPokemonSprite, pokemonesKalos, pokemonesAlola, pokemonesGalar, pokemonesPaldea, pokemonesTodos} from '../data/pokemon';
import { Search, Trophy, RotateCcw, AlertCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Region = 'kanto' | 'johto'| 'hoenn'| 'sinnoh'| 'teselia'| 'kalos'| 'alola'| 'galar'| 'paldea'| 'todos';

const REGION_DATA: Record<Region, Record<string, string[]>> = {
  kanto: pokemones,
  johto: pokemonesJohto,
  hoenn: pokemonesHoenn,
  sinnoh: pokemonesSinnoh,
  teselia: pokemonesTeselia,
  kalos: pokemonesKalos,
  alola: pokemonesAlola,
  galar: pokemonesGalar,
  paldea: pokemonesPaldea,
  todos: pokemonesTodos
};

function getSuggestions(query: string, regionData: Record<string, string[]>): string[] {
  if (!query.trim()) return [];
  const q = query.trim().toLowerCase();
  return Object.keys(regionData)
    .filter(name => name.trim().toLowerCase().startsWith(q))
    .slice(0, 3);
}

const MAX_ATTEMPTS = 4;


type AchievementId =
  | 'first_win'
  | 'first_game'
  | 'streak_3'
  | 'streak_10'
  | 'kanto_complete'
  | 'johto_complete'
  | 'hoenn_complete'
  | 'teselia_complete'
  | 'kalos_complete'
  | 'alola_complete'
  | 'galar_complete'
  | 'paldea_complete'
  | 'sinnoh_complete'
  | 'all_complete'
  | 'streak_30'
  | 'wins_50'
  | 'wins_150'
  | 'wins_400'
  | 'games_150'
  | 'games_750'
  | 'no_hint_1'
  | 'no_hint_5'
  | 'legendary_1'
  | 'legendary_all'
  | 'ditto'
  | 'bulbasaur_first_10'
  | 'fail_10'
  | 'fail_30'
  | 'night_owl'
  | 'shiny_1'
  | 'shiny_10';

type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  reward: number;
};

type GameStats = {
  played: number;
  won: number;
  failStreak: number;
  noHintWins: number;
  legendaryWins: string[];
  shinyWins: number;
  firstGuessGames: number;
};

const EMPTY_GAME_STATS: GameStats = {
  played: 0,
  won: 0,
  failStreak: 0,
  noHintWins: 0,
  legendaryWins: [],
  shinyWins: 0,
  firstGuessGames: 0,
};

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', title: 'El principio de mucho', description: 'Adivina tu primer Pokémon.', reward: 25 },
  { id: 'first_game', title: 'Empezar es el primer paso', description: 'Juega tu primera partida.', reward: 20 },
  { id: 'streak_3', title: 'Hat-Trick', description: 'Ten una racha de 3 días seguidos.', reward: 30 },
  { id: 'streak_10', title: 'Sigue así', description: 'Consigue una racha de 10 días.', reward: 100 },
  { id: 'kanto_complete', title: 'Oak estaría orgulloso', description: 'Completa la Pokédex de Kanto.', reward: 250 },
  { id: 'johto_complete', title: 'Elm estaría orgulloso', description: 'Completa la Pokédex de Johto.', reward: 250 },
  { id: 'hoenn_complete', title: 'Abedul estaría orgulloso', description: 'Completa la Pokédex de Hoenn.', reward: 250 },
  { id: 'teselia_complete', title: 'Encina estaría orgullosa', description: 'Completa la Pokédex de Teselia.', reward: 250 },
  { id: 'kalos_complete', title: 'Ciprés estaría orgulloso', description: 'Completa la Pokédex de Kalos.', reward: 250 },
  { id: 'alola_complete', title: 'Kukui estaría orgulloso', description: 'Completa la Pokédex de Alola.', reward: 250 },
  { id: 'galar_complete', title: 'Magnolia estaría orgullosa', description: 'Completa la Pokédex de Galar/Hisui disponible en el juego.', reward: 250 },
  { id: 'paldea_complete', title: 'Albora estaría orgullosa', description: 'Completa la Pokédex de Paldea.', reward: 250 },
  { id: 'sinnoh_complete', title: 'Serbal estaría orgulloso', description: 'Completa la Pokédex de Sinnoh.', reward: 250 },
  { id: 'all_complete', title: 'Arceus estaría orgulloso', description: 'Completa toda la Pokédex.', reward: 1500 },
  { id: 'streak_30', title: 'Una al día no lastima', description: 'Consigue 30 días de racha.', reward: 300 },
  { id: 'wins_50', title: 'Participar no es siempre lo importante', description: 'Adivina 50 Pokémon.', reward: 150 },
  { id: 'wins_150', title: 'Maestro adivinador', description: 'Adivina 150 Pokémon.', reward: 250 },
  { id: 'wins_400', title: 'Ni Ash se atrevió a tanto', description: 'Adivina 400 Pokémon.', reward: 500 },
  { id: 'games_150', title: 'Última, lo juro', description: 'Juega 150 partidas.', reward: 200 },
  { id: 'games_750', title: 'Objetivo: Tocar césped', description: 'Juega 750 partidas.', reward: 800 },
  { id: 'no_hint_1', title: 'Adivino supremo', description: 'Adivina un Pokémon sin usar pistas.', reward: 100 },
  { id: 'no_hint_5', title: 'Hacker', description: 'Adivina 5 Pokémon sin usar pistas.', reward: 500 },
  { id: 'legendary_1', title: 'Llamada legendaria', description: 'Adivina tu primer Pokémon legendario.', reward: 50 },
  { id: 'legendary_all', title: 'Todos te necesitan', description: 'Adivina todos los Pokémon legendarios.', reward: 1500 },
  { id: 'ditto', title: '¿Seguro que era Ditto?', description: 'Adivina a Ditto.', reward: 50 },
  { id: 'bulbasaur_first_10', title: 'Hay más Pokémon', description: 'Haz un primer intento en 10 partidas, usando cualquier Pokémon.', reward: 150 },
  { id: 'fail_10', title: 'Habrá que ponerse en serio', description: 'Falla 10 partidas seguidas.', reward: 100 },
  { id: 'fail_30', title: '¿Te han maldecido?', description: 'Falla 30 partidas seguidas.', reward: 0 },
  { id: 'night_owl', title: '¿Por qué no te vas a dormir?', description: 'Juega entre la 1:00 y las 5:00.', reward: 0 },
  { id: 'shiny_1', title: '¿Por qué brilla tanto?', description: 'Adivina tu primer Pokémon shiny.', reward: 150 },
  { id: 'shiny_10', title: '¿Es legal el amuleto Iris aquí?', description: 'Adivina 10 Pokémon shiny.', reward: 1000 },
];

const LEGENDARY_POKEMON = [
  'articuno', 'zapdos', 'moltres', 'mewtwo',
  'raikou', 'entei', 'suicune', 'lugia', 'ho-oh',
  'regirock', 'regice', 'registeel', 'latias', 'latios', 'kyogre', 'groudon', 'rayquaza',
  'uxie', 'mesprit', 'azelf', 'dialga', 'palkia', 'heatran', 'regigigas', 'giratina', 'cresselia',
  'cobalion', 'terrakion', 'virizion', 'tornadus', 'thundurus', 'reshiram', 'zekrom', 'landorus', 'kyurem',
  'xerneas', 'yveltal', 'zygarde',
  'type: null', 'silvally', 'tapu koko', 'tapu lele', 'tapu bulu', 'tapu fini', 'cosmog', 'cosmoem',
  'solgaleo', 'lunala', 'necrozma',
  'zacian', 'zamazenta', 'eternatus', 'kubfu', 'urshifu', 'regieleki', 'regidrago',
  'glastrier', 'spectrier', 'calyrex', 'enamorus',
  'wo-chien', 'chien-pao', 'ting-lu', 'chi-yu', 'koraidon', 'miraidon',
  'okidogi', 'munkidori', 'fezandipiti', 'ogerpon', 'terapagos',
];

function normalizePokemonName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/♀/g, 'f')
    .replace(/♂/g, 'm')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

const LEGENDARY_KEYS = new Set(LEGENDARY_POKEMON.map(normalizePokemonName));

function getPokemonShinySprite(name: string) {
  const normal = getPokemonSprite(name);

  // Compatible con las rutas habituales de sprites de PokeAPI.
  if (normal.includes('/sprites/pokemon/other/official-artwork/')) {
    return normal.replace(
      '/sprites/pokemon/other/official-artwork/',
      '/sprites/pokemon/other/official-artwork/shiny/'
    );
  }

  if (normal.includes('/sprites/pokemon/')) {
    return normal.replace('/sprites/pokemon/', '/sprites/pokemon/shiny/');
  }

  // Si getPokemonSprite usa otra fuente, conserva el sprite normal
  // en vez de romper la imagen.
  return normal;
}

type BallId =
  | 'poke'
  | 'super'
  | 'ultra'
  | 'sana'
  | 'honor'
  | 'master'
  | 'safari'
  | 'lujo'
  | 'veloz'
  | 'malla'
  | 'nido'
  | 'buceo'
  | 'acopio'
  | 'turno'
  | 'ocaso'
  | 'cebo'
  | 'nivel'
  | 'luna'
  | 'amigo'
  | 'amor'
  | 'peso'
  | 'ensueno'
  | 'ente'
  | 'competi'
  | 'parque';

type BallDefinition = {
  id: BallId;
  name: string;
  price: number;
  sprite: string;
};

const POKEBALL_SPRITE_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/';

const BALLS: BallDefinition[] = [
  { id: 'poke', name: 'Poké Ball', price: 0, sprite: `${POKEBALL_SPRITE_BASE}poke-ball.png` },
  { id: 'super', name: 'Super Ball', price: 200, sprite: `${POKEBALL_SPRITE_BASE}great-ball.png` },
  { id: 'ultra', name: 'Ultra Ball', price: 750, sprite: `${POKEBALL_SPRITE_BASE}ultra-ball.png` },
  { id: 'sana', name: 'Sana Ball', price: 500, sprite: `${POKEBALL_SPRITE_BASE}heal-ball.png` },
  { id: 'honor', name: 'Honor Ball', price: 300, sprite: `${POKEBALL_SPRITE_BASE}premier-ball.png` },
  { id: 'master', name: 'Master Ball', price: 2000, sprite: `${POKEBALL_SPRITE_BASE}master-ball.png` },
  { id: 'safari', name: 'Safari Ball', price: 300, sprite: `${POKEBALL_SPRITE_BASE}safari-ball.png` },
  { id: 'lujo', name: 'Lujo Ball', price: 1000, sprite: `${POKEBALL_SPRITE_BASE}luxury-ball.png` },
  { id: 'veloz', name: 'Veloz Ball', price: 500, sprite: `${POKEBALL_SPRITE_BASE}quick-ball.png` },

  // Todas las Poké Balls no tarifadas expresamente por el usuario cuestan 350.
  { id: 'malla', name: 'Malla Ball', price: 350, sprite: `${POKEBALL_SPRITE_BASE}net-ball.png` },
  { id: 'nido', name: 'Nido Ball', price: 350, sprite: `${POKEBALL_SPRITE_BASE}nest-ball.png` },
  { id: 'buceo', name: 'Buceo Ball', price: 350, sprite: `${POKEBALL_SPRITE_BASE}dive-ball.png` },
  { id: 'acopio', name: 'Acopio Ball', price: 350, sprite: `${POKEBALL_SPRITE_BASE}repeat-ball.png` },
  { id: 'turno', name: 'Turno Ball', price: 350, sprite: `${POKEBALL_SPRITE_BASE}timer-ball.png` },
  { id: 'ocaso', name: 'Ocaso Ball', price: 350, sprite: `${POKEBALL_SPRITE_BASE}dusk-ball.png` },
  { id: 'cebo', name: 'Cebo Ball', price: 350, sprite: `${POKEBALL_SPRITE_BASE}lure-ball.png` },
  { id: 'nivel', name: 'Nivel Ball', price: 350, sprite: `${POKEBALL_SPRITE_BASE}level-ball.png` },
  { id: 'luna', name: 'Luna Ball', price: 350, sprite: `${POKEBALL_SPRITE_BASE}moon-ball.png` },
  { id: 'amigo', name: 'Amigo Ball', price: 350, sprite: `${POKEBALL_SPRITE_BASE}friend-ball.png` },
  { id: 'amor', name: 'Amor Ball', price: 350, sprite: `${POKEBALL_SPRITE_BASE}love-ball.png` },
  { id: 'peso', name: 'Peso Ball', price: 350, sprite: `${POKEBALL_SPRITE_BASE}heavy-ball.png` },
  { id: 'ensueno', name: 'Ensueño Ball', price: 350, sprite: `${POKEBALL_SPRITE_BASE}dream-ball.png` },
  { id: 'ente', name: 'Ente Ball', price: 350, sprite: `${POKEBALL_SPRITE_BASE}beast-ball.png` },
  { id: 'competi', name: 'Competi Ball', price: 350, sprite: `${POKEBALL_SPRITE_BASE}sport-ball.png` },
  { id: 'parque', name: 'Parque Ball', price: 350, sprite: `${POKEBALL_SPRITE_BASE}park-ball.png` },
];

const SHINY_BOOSTS = [
  { chance: 0.15, label: '15 % shiny', price: 3000 },
  { chance: 0.25, label: '25 % shiny', price: 5000 },
  { chance: 0.50, label: '50 % shiny', price: 10000 },
] as const;

function BallSprite({ ballId }: { ballId: BallId }) {
  const ball = BALLS.find(item => item.id === ballId) ?? BALLS[0];

  return (
    <img
      src={ball.sprite}
      alt={ball.name}
      title={ball.name}
      className="w-4/5 h-4/5 object-contain drop-shadow-xl"
      style={{ imageRendering: 'pixelated' }}
      draggable={false}
    />
  );
}

// Stylized Kanto region map SVG
function KantoMapSVG() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full" aria-label="Mapa de Kanto">
      {/* Sky / sea background */}
      <rect width="200" height="160" fill="#7ec8e3" />
      {/* Ocean patches */}
      <rect x="140" y="90" width="60" height="70" fill="#5ab3d4" rx="4" />
      <rect x="0" y="120" width="50" height="40" fill="#5ab3d4" rx="4" />
      {/* Main landmass */}
      <polygon points="10,10 190,10 190,130 150,145 100,155 50,150 10,140" fill="#6ab04c" />
      {/* Route lines (paths between towns) */}
      <line x1="40" y1="130" x2="40" y2="85" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="40" y1="85" x2="75" y2="85" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="75" y1="85" x2="75" y2="50" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="75" y1="50" x2="120" y2="50" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="120" y1="50" x2="155" y2="85" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="120" y1="85" x2="155" y2="85" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="75" y1="85" x2="120" y2="85" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="120" y1="85" x2="120" y2="120" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="40" y1="130" x2="80" y2="130" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="80" y1="130" x2="120" y2="120" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      {/* Mountain range */}
      <polygon points="60,70 70,52 80,70" fill="#8B7355" opacity="0.8" />
      <polygon points="75,68 85,50 95,68" fill="#8B7355" opacity="0.8" />
      <polygon points="90,70 100,52 110,70" fill="#8B7355" opacity="0.8" />
      {/* Towns (white squares with colored roofs) */}
      {/* Pallet Town */}
      <rect x="33" y="123" width="14" height="14" fill="#f0f0f0" rx="2" />
      <polygon points="33,123 47,123 40,116" fill="#e74c3c" />
      {/* Viridian */}
      <rect x="33" y="78" width="14" height="14" fill="#f0f0f0" rx="2" />
      <polygon points="33,78 47,78 40,71" fill="#27ae60" />
      {/* Pewter */}
      <rect x="68" y="78" width="14" height="14" fill="#f0f0f0" rx="2" />
      <polygon points="68,78 82,78 75,71" fill="#7f8c8d" />
      {/* Cerulean */}
      <rect x="68" y="43" width="14" height="14" fill="#f0f0f0" rx="2" />
      <polygon points="68,43 82,43 75,36" fill="#3498db" />
      {/* Vermilion */}
      <rect x="113" y="113" width="14" height="14" fill="#f0f0f0" rx="2" />
      <polygon points="113,113 127,113 120,106" fill="#e67e22" />
      {/* Lavender */}
      <rect x="148" y="78" width="14" height="14" fill="#f0f0f0" rx="2" />
      <polygon points="148,78 162,78 155,71" fill="#9b59b6" />
      {/* Celadon */}
      <rect x="113" y="43" width="14" height="14" fill="#f0f0f0" rx="2" />
      <polygon points="113,43 127,43 120,36" fill="#2ecc71" />
      {/* Saffron */}
      <rect x="113" y="78" width="14" height="14" fill="#f0f0f0" rx="2" />
      <polygon points="113,78 127,78 120,71" fill="#f1c40f" />
      {/* Fuchsia */}
      <rect x="73" y="123" width="14" height="14" fill="#f0f0f0" rx="2" />
      <polygon points="73,123 87,123 80,116" fill="#e91e63" />
      {/* Legend label */}
      <text x="100" y="15" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white" fontFamily="sans-serif" style={{textShadow:'0 1px 2px #000'}}>KANTO</text>
    </svg>
  );
}

// Stylized Johto region map SVG
function JohtoMapSVG() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full" aria-label="Mapa de Johto">
      {/* Sky / sea background */}
      <rect width="200" height="160" fill="#5ab3d4" />
      {/* Ocean patches */}
      <rect x="0" y="100" width="40" height="60" fill="#4a9fc0" rx="4" />
      <rect x="150" y="110" width="50" height="50" fill="#4a9fc0" rx="4" />
      {/* Main landmass — Johto is taller/narrower shape */}
      <polygon points="30,10 175,10 185,80 170,140 120,155 60,150 25,120 20,60" fill="#5a9e3c" />
      {/* Route paths */}
      <line x1="55" y1="130" x2="55" y2="90" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="55" y1="90" x2="90" y2="90" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="90" y1="90" x2="90" y2="55" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="55" y1="55" x2="90" y2="55" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="55" y1="55" x2="55" y2="25" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="55" y1="25" x2="100" y2="25" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="100" y1="25" x2="130" y2="55" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="90" y1="55" x2="130" y2="55" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="130" y1="55" x2="155" y2="55" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="130" y1="55" x2="130" y2="90" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="90" y1="90" x2="130" y2="90" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      <line x1="55" y1="130" x2="100" y2="130" stroke="#c8a96e" strokeWidth="3" strokeDasharray="4,3" />
      {/* Mountain range (Mt. Mortar, Ice Path region) */}
      <polygon points="100,42 110,24 120,42" fill="#8B7355" opacity="0.8" />
      <polygon points="115,40 125,22 135,40" fill="#8B7355" opacity="0.8" />
      {/* Snow cap on peaks */}
      <polygon points="109,28 110,24 111,28" fill="white" />
      <polygon points="124,26 125,22 126,26" fill="white" />
      {/* Towns */}
      {/* New Bark */}
      <rect x="133" y="83" width="14" height="14" fill="#f0f0f0" rx="2" />
      <polygon points="133,83 147,83 140,76" fill="#27ae60" />
      {/* Cherrygrove */}
      <rect x="133" y="123" width="14" height="14" fill="#f0f0f0" rx="2" />
      <polygon points="133,123 147,123 140,116" fill="#e91e63" />
      {/* Violet */}
      <rect x="83" y="83" width="14" height="14" fill="#f0f0f0" rx="2" />
      <polygon points="83,83 97,83 90,76" fill="#9b59b6" />
      {/* Azalea */}
      <rect x="83" y="123" width="14" height="14" fill="#f0f0f0" rx="2" />
      <polygon points="83,123 97,123 90,116" fill="#f39c12" />
      {/* Goldenrod */}
      <rect x="48" y="48" width="14" height="14" fill="#f0f0f0" rx="2" />
      <polygon points="48,48 62,48 55,41" fill="#f1c40f" />
      {/* Ecruteak */}
      <rect x="83" y="48" width="14" height="14" fill="#f0f0f0" rx="2" />
      <polygon points="83,48 97,48 90,41" fill="#8B4513" />
      {/* Olivine */}
      <rect x="48" y="83" width="14" height="14" fill="#f0f0f0" rx="2" />
      <polygon points="48,83 62,83 55,76" fill="#2ecc71" />
      {/* Mahogany */}
      <rect x="148" y="48" width="14" height="14" fill="#f0f0f0" rx="2" />
      <polygon points="148,48 162,48 155,41" fill="#c0392b" />
      {/* Blackthorn */}
      <rect x="48" y="18" width="14" height="14" fill="#f0f0f0" rx="2" />
      <polygon points="48,18 62,18 55,11" fill="#2c3e50" />
      {/* Legend label */}
      <text x="100" y="15" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white" fontFamily="sans-serif" style={{textShadow:'0 1px 2px #000'}}>JOHTO</text>
    </svg>
  );
}

export default function Game() {
  const [region, setRegion] = useState<Region | null>(null);
  const [target, setTarget] = useState<string>('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState<Record<Region, { won: number; total: number }>>({
    kanto: { won: 0, total: 0 },
    johto: { won: 0, total: 0 },
    hoenn: { won: 0, total: 0 },
    sinnoh: { won: 0, total: 0 },
    teselia: { won: 0, total: 0 },
    kalos: { won: 0, total: 0 },
     alola: { won: 0, total: 0 },
     galar: { won: 0, total: 0 },
    paldea: { won: 0, total: 0 },
    todos: { won: 0, total: 0 }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const achievementToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unlockedAchievementsRef = useRef<AchievementId[]>([]);
  const coinAnimationIdRef = useRef(0);

  const [visitStreak, setVisitStreak] = useState(1);
  const [pokecuartos, setPokecuartos] = useState(0);
  const [pokedexRegion, setPokedexRegion] = useState<Region | null>(null);
  const [discoveredPokemon, setDiscoveredPokemon] = useState<string[]>([]);
  const [shinyPokemon, setShinyPokemon] = useState<string[]>([]);
  const [isShinyTarget, setIsShinyTarget] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>(EMPTY_GAME_STATS);
  const [unlockedAchievements, setUnlockedAchievements] = useState<AchievementId[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);
  const [coinAnimations, setCoinAnimations] = useState<Array<{ id: number; amount: number }>>([]);
  const [ownedBalls, setOwnedBalls] = useState<BallId[]>(['poke']);
  const [equippedBall, setEquippedBall] = useState<BallId>('poke');
  const [activeShinyBoost, setActiveShinyBoost] = useState<{ chance: number; endsAt: number } | null>(null);
  const [boostNow, setBoostNow] = useState(Date.now());
  const [recoverableStreak, setRecoverableStreak] = useState<number | null>(null);
  const [shopMessage, setShopMessage] = useState('');

  const normalizePokemonKey = normalizePokemonName;

  const animateCoinGain = (amount: number) => {
    if (amount <= 0) return;
    const id = ++coinAnimationIdRef.current;
    setCoinAnimations(prev => [...prev, { id, amount }]);
    setTimeout(() => {
      setCoinAnimations(prev => prev.filter(item => item.id !== id));
    }, 1100);
  };

  const unlockPokemon = (name: string) => {
    const key = normalizePokemonKey(name);
    setDiscoveredPokemon(prev => {
      if (prev.includes(key)) return prev;
      const next = [...prev, key];
      try {
        localStorage.setItem('pistamonDiscoveredPokemon', JSON.stringify(next));
      } catch {
        // Si localStorage está bloqueado, se conserva durante esta sesión.
      }
      return next;
    });
  };

  const unlockShinyPokemon = (name: string) => {
    const key = normalizePokemonKey(name);
    setShinyPokemon(prev => {
      if (prev.includes(key)) return prev;
      const next = [...prev, key];
      try {
        localStorage.setItem('pistamonShinyPokemon', JSON.stringify(next));
      } catch {
        // Se conserva durante la sesión.
      }
      return next;
    });
  };

  const isPokemonDiscovered = (name: string) =>
    discoveredPokemon.includes(normalizePokemonKey(name));

  const isPokemonShinyDiscovered = (name: string) =>
    shinyPokemon.includes(normalizePokemonKey(name));

  const addPokecuartos = (amount: number) => {
    if (amount <= 0) return;
    animateCoinGain(amount);
    setPokecuartos(prev => {
      const next = prev + amount;
      try {
        localStorage.setItem('pistamonPokecuartos', String(next));
      } catch {
        // Si localStorage está bloqueado, se conserva durante esta sesión.
      }
      return next;
    });
  };

  const spendPokecuartos = (amount: number) => {
    if (amount <= 0) return true;
    if (pokecuartos < amount) {
      setShopMessage(`Te faltan ${amount - pokecuartos} Pokécuartos.`);
      return false;
    }

    const next = pokecuartos - amount;
    setPokecuartos(next);
    try {
      localStorage.setItem('pistamonPokecuartos', String(next));
    } catch {
      // Se conserva durante la sesión.
    }
    return true;
  };

  const equipBall = (ballId: BallId) => {
    setEquippedBall(ballId);
    setShopMessage(`${BALLS.find(ball => ball.id === ballId)?.name ?? 'Poké Ball'} equipada.`);
    try {
      localStorage.setItem('pistamonEquippedBall', ballId);
    } catch {
      // Se conserva durante la sesión.
    }
  };

  const buyOrEquipBall = (ball: BallDefinition) => {
    if (ownedBalls.includes(ball.id)) {
      equipBall(ball.id);
      return;
    }

    if (!spendPokecuartos(ball.price)) return;

    const nextOwned = Array.from(new Set([...ownedBalls, ball.id]));
    setOwnedBalls(nextOwned);
    setEquippedBall(ball.id);
    setShopMessage(`${ball.name} comprada y equipada.`);
    try {
      localStorage.setItem('pistamonOwnedBalls', JSON.stringify(nextOwned));
      localStorage.setItem('pistamonEquippedBall', ball.id);
    } catch {
      // Se conserva durante la sesión.
    }
  };

  const buyShinyBoost = (chance: number, price: number) => {
    if (!spendPokecuartos(price)) return;

    const boost = {
      chance,
      endsAt: Date.now() + 5 * 60 * 1000,
    };

    setActiveShinyBoost(boost);
    setBoostNow(Date.now());
    setShopMessage(`Potenciador shiny del ${Math.round(chance * 100)} % activado durante 5 minutos.`);
    try {
      localStorage.setItem('pistamonShinyBoost', JSON.stringify(boost));
    } catch {
      // Se conserva durante la sesión.
    }
  };

  const recoverStreakPrice = recoverableStreak
    ? Math.ceil(recoverableStreak / 5) * 1000
    : 0;

  const recoverLostStreak = () => {
    if (!recoverableStreak) {
      setShopMessage('No tienes ninguna racha perdida disponible para recuperar.');
      return;
    }
    if (!spendPokecuartos(recoverStreakPrice)) return;

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    setVisitStreak(recoverableStreak);
    setShopMessage(`Racha de ${recoverableStreak} días recuperada.`);
    try {
      localStorage.setItem(
        'pistamonVisitStreak',
        JSON.stringify({ count: recoverableStreak, lastVisit: today })
      );
      localStorage.removeItem('pistamonRecoverableStreak');
    } catch {
      // Se conserva durante la sesión.
    }
    setRecoverableStreak(null);
  };

  const saveGameStats = (next: GameStats) => {
    setGameStats(next);
    try {
      localStorage.setItem('pistamonGameStats', JSON.stringify(next));
    } catch {
      // Se conserva durante la sesión.
    }
  };

  const unlockAchievement = (id: AchievementId) => {
    if (unlockedAchievementsRef.current.includes(id)) return;

    const achievement = ACHIEVEMENTS.find(item => item.id === id);
    if (!achievement) return;

    const next = [...unlockedAchievementsRef.current, id];
    unlockedAchievementsRef.current = next;
    setUnlockedAchievements(next);

    try {
      localStorage.setItem('pistamonAchievements', JSON.stringify(next));
    } catch {
      // Se conserva durante la sesión.
    }

    if (achievement.reward > 0) addPokecuartos(achievement.reward);

    setAchievementToast(achievement);
    if (achievementToastTimerRef.current) {
      clearTimeout(achievementToastTimerRef.current);
    }
    achievementToastTimerRef.current = setTimeout(() => {
      setAchievementToast(null);
    }, 3500);
  };

  const startGame = (r: Region) => {
    const names = Object.keys(REGION_DATA[r]);
    const randomIndex = Math.floor(Math.random() * names.length);

    let shinyChance = 0.05;
    if (activeShinyBoost) {
      if (activeShinyBoost.endsAt > Date.now()) {
        shinyChance = activeShinyBoost.chance;
      } else {
        setActiveShinyBoost(null);
        try {
          localStorage.removeItem('pistamonShinyBoost');
        } catch {
          // Ignorar.
        }
      }
    }

    setRegion(r);
    setTarget(names[randomIndex]);
    setIsShinyTarget(Math.random() < shinyChance);
    setGuesses([]);
    setCurrentGuess('');
    setStatus('playing');

    const hour = new Date().getHours();
    if (hour >= 1 && hour < 5) {
      unlockAchievement('night_owl');
    }

    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const initGame = () => {
    if (!region) return;
    startGame(region);
  };

  useEffect(() => {
    try {
      const rawDiscovered = localStorage.getItem('pistamonDiscoveredPokemon');
      const savedDiscovered = rawDiscovered ? JSON.parse(rawDiscovered) : [];
      if (Array.isArray(savedDiscovered)) {
        const normalized = savedDiscovered
          .filter((value): value is string => typeof value === 'string')
          .map(normalizePokemonKey);
        setDiscoveredPokemon(Array.from(new Set(normalized)));
      }

      const rawShiny = localStorage.getItem('pistamonShinyPokemon');
      const savedShiny = rawShiny ? JSON.parse(rawShiny) : [];
      if (Array.isArray(savedShiny)) {
        const normalizedShiny = savedShiny
          .filter((value): value is string => typeof value === 'string')
          .map(normalizePokemonKey);
        setShinyPokemon(Array.from(new Set(normalizedShiny)));
      }

      const rawStats = localStorage.getItem('pistamonGameStats');
      const savedStats = rawStats ? JSON.parse(rawStats) : null;
      if (savedStats && typeof savedStats === 'object') {
        setGameStats({
          played: Number(savedStats.played) || 0,
          won: Number(savedStats.won) || 0,
          failStreak: Number(savedStats.failStreak) || 0,
          noHintWins: Number(savedStats.noHintWins) || 0,
          legendaryWins: Array.isArray(savedStats.legendaryWins)
            ? savedStats.legendaryWins.filter((value: unknown): value is string => typeof value === 'string').map(normalizePokemonKey)
            : [],
          shinyWins: Number(savedStats.shinyWins) || 0,
          firstGuessGames: Number(savedStats.firstGuessGames ?? savedStats.bulbasaurFirstGuessGames) || 0,
        });
      }

      const rawAchievements = localStorage.getItem('pistamonAchievements');
      const savedAchievements = rawAchievements ? JSON.parse(rawAchievements) : [];
      if (Array.isArray(savedAchievements)) {
        const validIds = new Set(ACHIEVEMENTS.map(item => item.id));
        const normalizedAchievements = savedAchievements.filter(
          (value): value is AchievementId =>
            typeof value === 'string' && validIds.has(value as AchievementId)
        );
        unlockedAchievementsRef.current = normalizedAchievements;
        setUnlockedAchievements(normalizedAchievements);
      }

      const validBallIds = new Set(BALLS.map(ball => ball.id));
      const rawOwnedBalls = localStorage.getItem('pistamonOwnedBalls');
      const savedOwnedBalls = rawOwnedBalls ? JSON.parse(rawOwnedBalls) : ['poke'];
      if (Array.isArray(savedOwnedBalls)) {
        const normalizedOwnedBalls = savedOwnedBalls.filter(
          (value): value is BallId =>
            typeof value === 'string' && validBallIds.has(value as BallId)
        );
        setOwnedBalls(Array.from(new Set<BallId>(['poke', ...normalizedOwnedBalls])));
      }

      const savedEquippedBall = localStorage.getItem('pistamonEquippedBall');
      if (savedEquippedBall && validBallIds.has(savedEquippedBall as BallId)) {
        setEquippedBall(savedEquippedBall as BallId);
      }

      const rawBoost = localStorage.getItem('pistamonShinyBoost');
      const savedBoost = rawBoost ? JSON.parse(rawBoost) : null;
      if (
        savedBoost &&
        typeof savedBoost.chance === 'number' &&
        typeof savedBoost.endsAt === 'number' &&
        savedBoost.endsAt > Date.now()
      ) {
        setActiveShinyBoost({
          chance: savedBoost.chance,
          endsAt: savedBoost.endsAt,
        });
        setBoostNow(Date.now());
      } else if (savedBoost) {
        localStorage.removeItem('pistamonShinyBoost');
      }

      const savedRecoverableStreak = Number(
        localStorage.getItem('pistamonRecoverableStreak') ?? '0'
      );
      if (Number.isFinite(savedRecoverableStreak) && savedRecoverableStreak > 0) {
        setRecoverableStreak(savedRecoverableStreak);
      }
    } catch {
      setDiscoveredPokemon([]);
      setShinyPokemon([]);
      setGameStats(EMPTY_GAME_STATS);
      unlockedAchievementsRef.current = [];
      setUnlockedAchievements([]);
      setOwnedBalls(['poke']);
      setEquippedBall('poke');
      setActiveShinyBoost(null);
      setRecoverableStreak(null);
    }
  }, []);

  useEffect(() => {
    const STREAK_KEY = 'pistamonVisitStreak';
    const COINS_KEY = 'pistamonPokecuartos';
    const STREAK_REWARD_KEY = 'pistamonLastStreakRewardDate';
    const RECOVERABLE_STREAK_KEY = 'pistamonRecoverableStreak';

    const getLocalDateKey = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayDate = new Date();
    const today = getLocalDateKey(todayDate);
    let nextStreak = 1;
    let nextPokecuartos = 0;
    let earnedStreakReward = false;

    try {
      const rawStreak = localStorage.getItem(STREAK_KEY);
      const savedStreak = rawStreak
        ? (JSON.parse(rawStreak) as { count?: number; lastVisit?: string })
        : null;

      if (savedStreak?.lastVisit === today) {
        nextStreak = Math.max(1, savedStreak.count ?? 1);
      } else if (savedStreak?.lastVisit) {
        const [year, month, day] = savedStreak.lastVisit.split('-').map(Number);
        const lastVisitDate = new Date(year, month - 1, day);
        const currentDate = new Date(
          todayDate.getFullYear(),
          todayDate.getMonth(),
          todayDate.getDate()
        );

        const diffDays = Math.round(
          (currentDate.getTime() - lastVisitDate.getTime()) / 86400000
        );

        if (diffDays === 1) {
          nextStreak = Math.max(1, savedStreak.count ?? 1) + 1;
        } else {
          const lostStreak = Math.max(1, savedStreak.count ?? 1);
          nextStreak = 1;
          localStorage.setItem(RECOVERABLE_STREAK_KEY, String(lostStreak));
          setRecoverableStreak(lostStreak);
        }
      }

      localStorage.setItem(
        STREAK_KEY,
        JSON.stringify({
          count: nextStreak,
          lastVisit: today,
        })
      );

      const savedCoins = Number(localStorage.getItem(COINS_KEY) ?? '0');
      nextPokecuartos =
        Number.isFinite(savedCoins) && savedCoins >= 0 ? savedCoins : 0;

      const lastStreakRewardDate = localStorage.getItem(STREAK_REWARD_KEY);

      // Día de racha 1 = +1, día 2 = +2, día 3 = +3...
      // Solo se cobra una vez por día aunque recargues la página.
      if (lastStreakRewardDate !== today) {
        nextPokecuartos += nextStreak;
        earnedStreakReward = true;
        localStorage.setItem(COINS_KEY, String(nextPokecuartos));
        localStorage.setItem(STREAK_REWARD_KEY, today);
      }
    } catch {
      nextStreak = 1;
      nextPokecuartos = 0;
    }

    setVisitStreak(nextStreak);
    setPokecuartos(nextPokecuartos);

    if (earnedStreakReward) {
      setTimeout(() => animateCoinGain(nextStreak), 300);
    }
  }, []);

  useEffect(() => {
    if (region) setTimeout(() => inputRef.current?.focus(), 100);
  }, [region]);

  useEffect(() => {
    if (!activeShinyBoost) return;

    const tick = () => {
      const now = Date.now();
      setBoostNow(now);
      if (activeShinyBoost.endsAt <= now) {
        setActiveShinyBoost(null);
        try {
          localStorage.removeItem('pistamonShinyBoost');
        } catch {
          // Ignorar.
        }
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [activeShinyBoost]);

  useEffect(() => {
    if (visitStreak >= 3) unlockAchievement('streak_3');
    if (visitStreak >= 10) unlockAchievement('streak_10');
    if (visitStreak >= 30) unlockAchievement('streak_30');

    if (gameStats.played >= 1) unlockAchievement('first_game');
    if (gameStats.won >= 1) unlockAchievement('first_win');
    if (gameStats.won >= 50) unlockAchievement('wins_50');
    if (gameStats.won >= 150) unlockAchievement('wins_150');
    if (gameStats.won >= 400) unlockAchievement('wins_400');
    if (gameStats.played >= 150) unlockAchievement('games_150');
    if (gameStats.played >= 750) unlockAchievement('games_750');
    if (gameStats.noHintWins >= 1) unlockAchievement('no_hint_1');
    if (gameStats.noHintWins >= 5) unlockAchievement('no_hint_5');
    if (gameStats.legendaryWins.length >= 1) unlockAchievement('legendary_1');
    if (gameStats.shinyWins >= 1) unlockAchievement('shiny_1');
    if (gameStats.shinyWins >= 10) unlockAchievement('shiny_10');
    if (gameStats.firstGuessGames >= 10) unlockAchievement('bulbasaur_first_10');
    if (gameStats.failStreak >= 10) unlockAchievement('fail_10');
    if (gameStats.failStreak >= 30) unlockAchievement('fail_30');

    const discoveredSet = new Set(discoveredPokemon);
    const regionComplete = (r: Region) =>
      Object.keys(REGION_DATA[r]).every(name => discoveredSet.has(normalizePokemonKey(name)));

    if (regionComplete('kanto')) unlockAchievement('kanto_complete');
    if (regionComplete('johto')) unlockAchievement('johto_complete');
    if (regionComplete('hoenn')) unlockAchievement('hoenn_complete');
    if (regionComplete('sinnoh')) unlockAchievement('sinnoh_complete');
    if (regionComplete('teselia')) unlockAchievement('teselia_complete');
    if (regionComplete('kalos')) unlockAchievement('kalos_complete');
    if (regionComplete('alola')) unlockAchievement('alola_complete');
    if (regionComplete('galar')) unlockAchievement('galar_complete');
    if (regionComplete('paldea')) unlockAchievement('paldea_complete');
    if (regionComplete('todos')) unlockAchievement('all_complete');

    if (discoveredSet.has(normalizePokemonKey('ditto'))) {
      unlockAchievement('ditto');
    }

    const availableLegendaryKeys = Array.from(LEGENDARY_KEYS).filter(key =>
      Object.keys(REGION_DATA.todos).some(name => normalizePokemonKey(name) === key)
    );
    const legendaryWinsSet = new Set(gameStats.legendaryWins);
    if (
      availableLegendaryKeys.length > 0 &&
      availableLegendaryKeys.every(key => legendaryWinsSet.has(key))
    ) {
      unlockAchievement('legendary_all');
    }
  }, [visitStreak, discoveredPokemon, gameStats]);


  const shinyBoostRemainingSeconds = activeShinyBoost
    ? Math.max(0, Math.ceil((activeShinyBoost.endsAt - boostNow) / 1000))
    : 0;

  const formatBoostTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${minutes}:${String(rest).padStart(2, '0')}`;
  };

  const overlayUI = (
    <>
      <style>{`
        @keyframes pistamonCoinFly {
          0% {
            left: 50%;
            top: 55%;
            transform: translate(-50%, -50%) scale(0.65) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2) rotate(80deg);
          }
          100% {
            left: calc(100% - 115px);
            top: 30px;
            transform: translate(-50%, -50%) scale(0.45) rotate(540deg);
            opacity: 0;
          }
        }
      `}</style>

      {/* Accesos permanentes: visibles también en móvil */}
      <div className="fixed top-2 left-2 md:top-4 md:left-4 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setShowAchievements(false);
            setShopMessage('');
            setShowShop(true);
          }}
          className="bg-black/55 backdrop-blur-sm border border-emerald-400/40 rounded-full px-3 md:px-4 py-2 text-[11px] md:text-sm text-emerald-300 font-black shadow-lg hover:bg-black/70 transition-colors"
        >
          🛒 Tienda
        </button>

        <button
          type="button"
          onClick={() => {
            setShowShop(false);
            setShowAchievements(true);
          }}
          className="bg-black/55 backdrop-blur-sm border border-yellow-400/30 rounded-full px-3 md:px-4 py-2 text-[11px] md:text-sm text-yellow-300 font-black shadow-lg hover:bg-black/70 transition-colors"
        >
          🏆 Logros <span className="hidden sm:inline">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
        </button>
      </div>

      {activeShinyBoost && shinyBoostRemainingSeconds > 0 && (
        <div className="fixed top-14 left-2 md:top-16 md:left-4 z-40 rounded-full border border-fuchsia-400/40 bg-black/55 px-3 py-1.5 text-[10px] md:text-xs font-black text-fuchsia-300 backdrop-blur-sm shadow-lg">
          ✨ Shiny {Math.round(activeShinyBoost.chance * 100)} % · {formatBoostTime(shinyBoostRemainingSeconds)}
        </div>
      )}

      {coinAnimations.map(item => (
        <div
          key={item.id}
          className="fixed z-[200] pointer-events-none flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-black font-black shadow-2xl"
          style={{ animation: 'pistamonCoinFly 1s ease-in-out forwards' }}
        >
          🪙 +{item.amount}
        </div>
      ))}

      {achievementToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[210] w-[min(92vw,520px)] rounded-2xl border-2 border-yellow-400/60 bg-black/90 p-4 text-center shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300">
          <p className="text-xs font-black uppercase tracking-widest text-yellow-300">🏆 Logro desbloqueado</p>
          <p className="mt-1 text-xl font-black text-white">{achievementToast.title}</p>
          <p className="mt-1 text-sm text-white/70">{achievementToast.description}</p>
          {achievementToast.reward > 0 && (
            <p className="mt-2 font-black text-yellow-300">🪙 +{achievementToast.reward} Pokécuartos</p>
          )}
        </div>
      )}

      {showShop && (
        <div
          className="fixed inset-0 z-[185] bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 md:p-4"
          onClick={() => setShowShop(false)}
        >
          <div
            className="w-full max-w-6xl max-h-[94vh] overflow-hidden bg-card rounded-2xl md:rounded-3xl border-4 border-emerald-400/30 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 p-4 md:p-6 border-b border-white/10">
              <div>
                <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Mercado Pistamon</p>
                <h2 className="text-2xl md:text-3xl font-black text-card-foreground">🛒 TIENDA</h2>
                <p className="text-sm text-card-foreground/60 mt-1">Compra aspectos, potenciadores y recupera tu racha.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:block rounded-full border border-yellow-400/30 bg-black/30 px-4 py-2 text-sm font-black text-yellow-300">
                  🪙 {pokecuartos}
                </div>
                <button
                  type="button"
                  onClick={() => setShowShop(false)}
                  className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl font-black transition-colors"
                  aria-label="Cerrar tienda"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-4 md:p-6 space-y-8">
              {shopMessage && (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200">
                  {shopMessage}
                </div>
              )}

              <section>
                <div className="mb-4">
                  <h3 className="text-xl md:text-2xl font-black text-card-foreground">🔴 Poké Balls</h3>
                  <p className="text-sm text-card-foreground/60">
                    Compra una vez y después puedes equiparla siempre. La Poké Ball normal es gratuita.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                  {BALLS.map(ball => {
                    const owned = ownedBalls.includes(ball.id);
                    const equipped = equippedBall === ball.id;

                    return (
                      <div
                        key={ball.id}
                        className={`rounded-2xl border-2 p-3 flex flex-col items-center text-center ${
                          equipped
                            ? 'border-emerald-400 bg-emerald-400/10'
                            : owned
                              ? 'border-white/20 bg-black/15'
                              : 'border-white/10 bg-black/20'
                        }`}
                      >
                        <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                          <BallSprite ballId={ball.id} />
                        </div>
                        <h4 className="font-black text-card-foreground leading-tight">{ball.name}</h4>
                        <p className="mt-1 text-xs font-bold text-yellow-300">
                          {ball.price === 0 ? 'Gratis' : `🪙 ${ball.price}`}
                        </p>
                        <button
                          type="button"
                          onClick={() => buyOrEquipBall(ball)}
                          disabled={equipped}
                          className={`mt-3 w-full rounded-xl px-2 py-2 text-xs font-black transition-colors ${
                            equipped
                              ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                              : owned
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-black'
                          }`}
                        >
                          {equipped ? '✓ EQUIPADA' : owned ? 'EQUIPAR' : 'COMPRAR'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="border-t border-white/10 pt-7">
                <div className="mb-4">
                  <h3 className="text-xl md:text-2xl font-black text-card-foreground">✨ Potenciadores shiny</h3>
                  <p className="text-sm text-card-foreground/60">
                    Sustituyen temporalmente el 5 % normal de aparición shiny y duran exactamente 5 minutos.
                  </p>
                </div>

                {activeShinyBoost && shinyBoostRemainingSeconds > 0 && (
                  <div className="mb-4 rounded-2xl border border-fuchsia-400/40 bg-fuchsia-400/10 p-4 text-fuchsia-200 font-bold">
                    Activo: {Math.round(activeShinyBoost.chance * 100)} % shiny · quedan {formatBoostTime(shinyBoostRemainingSeconds)}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {SHINY_BOOSTS.map(boost => (
                    <div key={boost.chance} className="rounded-2xl border-2 border-fuchsia-400/20 bg-fuchsia-400/5 p-4">
                      <p className="text-2xl font-black text-fuchsia-300">✨ {boost.label}</p>
                      <p className="mt-1 text-sm text-card-foreground/60">Duración: 5 minutos</p>
                      <p className="mt-3 font-black text-yellow-300">🪙 {boost.price}</p>
                      <button
                        type="button"
                        onClick={() => buyShinyBoost(boost.chance, boost.price)}
                        className="mt-3 w-full rounded-xl bg-fuchsia-500 px-4 py-2 font-black text-white hover:bg-fuchsia-400 transition-colors"
                      >
                        ACTIVAR
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="border-t border-white/10 pt-7">
                <div className="mb-4">
                  <h3 className="text-xl md:text-2xl font-black text-card-foreground">🔥 Recuperar racha</h3>
                  <p className="text-sm text-card-foreground/60">
                    El precio sube 1000 Pokécuartos por cada bloque de 5 días: 1–5 = 1000, 6–10 = 2000, 11–15 = 3000, etc.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-orange-400/25 bg-orange-400/5 p-4 md:p-5">
                  {recoverableStreak ? (
                    <>
                      <p className="text-lg font-black text-white">
                        Racha disponible: 🔥 {recoverableStreak} {recoverableStreak === 1 ? 'día' : 'días'}
                      </p>
                      <p className="mt-1 font-black text-yellow-300">Precio: 🪙 {recoverStreakPrice}</p>
                      <button
                        type="button"
                        onClick={recoverLostStreak}
                        className="mt-4 rounded-xl bg-orange-500 px-5 py-2.5 font-black text-black hover:bg-orange-400 transition-colors"
                      >
                        RECUPERAR RACHA
                      </button>
                    </>
                  ) : (
                    <p className="font-bold text-card-foreground/60">
                      No tienes ninguna racha perdida pendiente de recuperar.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {showAchievements && (
        <div
          className="fixed inset-0 z-[180] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 md:p-4"
          onClick={() => setShowAchievements(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[94vh] md:max-h-[88vh] overflow-hidden bg-card rounded-2xl md:rounded-3xl border-4 border-yellow-400/30 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 p-4 md:p-6 border-b border-white/10">
              <div>
                <p className="text-xs font-bold text-yellow-300 uppercase tracking-widest">Sala de trofeos</p>
                <h2 className="text-2xl md:text-3xl font-black text-card-foreground">🏆 LOGROS</h2>
                <p className="text-sm text-card-foreground/60 mt-1">
                  {unlockedAchievements.length} / {ACHIEVEMENTS.length} desbloqueados
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAchievements(false)}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl font-black transition-colors"
                aria-label="Cerrar logros"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ACHIEVEMENTS.map(achievement => {
                  const unlocked = unlockedAchievements.includes(achievement.id);
                  return (
                    <div
                      key={achievement.id}
                      className={`rounded-2xl border-2 p-4 transition-all ${
                        unlocked
                          ? 'bg-yellow-400/10 border-yellow-400/50'
                          : 'bg-black/20 border-white/10 opacity-70'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl shrink-0">{unlocked ? '🏆' : '🔒'}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className={`font-black leading-tight ${unlocked ? 'text-yellow-300' : 'text-card-foreground'}`}>
                              {achievement.title}
                            </h3>
                            <span className="shrink-0 text-xs font-black text-yellow-300">
                              {achievement.reward > 0 ? `🪙 +${achievement.reward}` : 'Sin recompensa indicada'}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-card-foreground/65">{achievement.description}</p>
                          <p className={`mt-2 text-xs font-black uppercase tracking-wider ${
                            unlocked ? 'text-green-400' : 'text-card-foreground/35'
                          }`}>
                            {unlocked ? '✓ Conseguido' : 'Pendiente'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ─── Region selector ───────────────────────────────────────────
  if (!region) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center-top pt-28 pb-12 md:py-12 px-2 md:px-4 relative overflow-hidden">
        {overlayUI}
        <div className="fixed top-14 md:top-4 right-2 md:right-4 z-50 flex items-center gap-2 md:gap-3">
          <div className="bg-black/40 backdrop-blur-sm border border-yellow-400/30 rounded-full px-3 md:px-4 py-2 text-[11px] md:text-base text-yellow-300 font-black shadow-lg">
            🪙 {pokecuartos} Pokécuartos
          </div>
          <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-3 md:px-4 py-2 text-[11px] md:text-base text-white font-black shadow-lg">
            🔥 Racha: {visitStreak} {visitStreak === 1 ? 'día' : 'días'}
          </div>
        </div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary/30 rounded-full blur-[80px] pointer-events-none" />
        <h1 className="text-[42px] md:text-5xl font-black text-primary text-center mb-3 md:mb-4 tracking-tight z-10">🔥 PISTAMON🔥</h1>
        <p className="text-white/70 text-sm md:text-lg font-semibold mb-6 md:mb-12 z-10">Elige tu región para empezar</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 z-10 w-full max-w-[1400px]">
          {/* Kanto */}
          <button

            onClick={() => startGame('kanto')}
            data-testid="button-region-kanto"
            className="group relative w-full h-[285px] md:h-[390px] bg-card rounded-2xl md:rounded-3xl border-2 md:border-4 border-white/20 shadow-2xl p-3 md:p-6 flex flex-col items-center justify-between gap-2 md:gap-4 hover:scale-[1.02] md:hover:scale-105 hover:border-primary/60 transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <div className="w-full h-28 md:h-40 rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center bg-green-950/30">
              <img
                src="data:image/jpeg;base64,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"
                alt="Mapa de Kanto"
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Gen I</p>
              <p className="text-xl md:text-3xl font-black text-card-foreground">KANTO</p>
              <p className="text-sm text-card-foreground/50 mt-1">151 Pokémon</p>
            </div>
            <div className="absolute inset-0 rounded-3xl bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
            <span
              role="button"
              tabIndex={0}
              data-pokedex-region="kanto"
              onClick={(e) => {
                e.stopPropagation();
                setPokedexRegion('kanto');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setPokedexRegion('kanto');
                }
              }}
              className="relative z-20 w-full mt-auto px-3 py-2 rounded-xl bg-secondary/20 border-2 border-secondary/40 text-secondary font-black text-sm hover:bg-secondary/30 transition-colors"
            >
              📕 POKÉDEX
            </span>
          </button>

          {/* Johto */}
          <button
            onClick={() => startGame('johto')}
            data-testid="button-region-johto"
            className="group relative w-full h-[285px] md:h-[390px] bg-card rounded-2xl md:rounded-3xl border-2 md:border-4 border-white/20 shadow-2xl p-3 md:p-6 flex flex-col items-center justify-between gap-2 md:gap-4 hover:scale-[1.02] md:hover:scale-105 hover:border-primary/60 transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <div className="w-full h-28 md:h-40 rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center bg-blue-950/30">
              <img
                src="data:image/jpeg;base64,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"
                alt="Mapa de Johto"
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Gen II</p>
              <p className="text-xl md:text-3xl font-black text-card-foreground">JOHTO</p>
              <p className="text-sm text-card-foreground/50 mt-1">100 Pokémon</p>
            </div>
            <div className="absolute inset-0 rounded-3xl bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
            <span
              role="button"
              tabIndex={0}
              data-pokedex-region="johto"
              onClick={(e) => {
                e.stopPropagation();
                setPokedexRegion('johto');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setPokedexRegion('johto');
                }
              }}
              className="relative z-20 w-full mt-auto px-3 py-2 rounded-xl bg-secondary/20 border-2 border-secondary/40 text-secondary font-black text-sm hover:bg-secondary/30 transition-colors"
            >
              📕 POKÉDEX
            </span>
          </button>
          {/* Hoenn */}
          <button
            onClick={() => startGame('hoenn')}
            data-testid="button-region-hoenn"
            className="group relative w-full h-[285px] md:h-[390px] bg-card rounded-2xl md:rounded-3xl border-2 md:border-4 border-white/20 shadow-2xl p-3 md:p-6 flex flex-col items-center justify-between gap-2 md:gap-4 hover:scale-[1.02] md:hover:scale-105 hover:border-primary/60 transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <div className="w-full h-28 md:h-40 rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center bg-blue-950/30">
              <img
                src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQBAwMBEQACEQEDEQH/xAAbAAADAAMBAQAAAAAAAAAAAAAEBQYCAwcBAP/EAEAQAAIBAgQEBAQDBwMDAwUAAAECAwQRAAUSIRMxQVEGImFxFDKBkSOhsQcVQsHR4fAkM1JDcvEWssI0U2KSov/EABoBAAIDAQEAAAAAAAAAAAAAAAMEAQIFAAb/xAA0EQACAgEDAgMFCAIDAQEAAAABAgADEQQSITFBE1FhBSIycZEUgaGxwdHh8CNCFTPxJFL/2gAMAwEAAhEDEQA/AOYU0XxM6xLyb3bDxIAi+DOi+GP2bxZrAk0kNVoIuTUVSwavYKj7fUYA9wH9/wDIRVzHVV+yei+HHDh0yXF1FS52/wC4j+WA/aTmX8OSPijwGMkCGKrjlLrtEGuQL76m2Aweu8PwYGxWQZzFp8JzrTxVDzQWkXnxV0r7nb1335YKLFJxiDJYDIMUVNAsEhRZFkI/4bgfXBQpYZAgvHA64mkUzX647wzJ+0LGOSeHanOK1aWHVw7apJAu0ajmfe/64rYBWMmWruLnGJXZT+zpJoI6mt/CjINzLJu4NrNpXb2F+nrbAWsA6QgLHtxGsPhSgoZJY4IIUGnXrrBdmXsLcv8ANhgRsJk4hNZTeH8voS0yxtMy6JVjICgH/jyP+c8UzJ4AkNmmZ5c+uGkidSCQjm1rC29xtawt9fTEjMoSIpPFlYycOMEAWJa2x/wYYXTuVyIA3IGwZ8GljV0YooJv5cETTMDljBNcDwomyALcbE+2H1xFGm95E5ElMSfniQPlmCyq7f7dTf00qf5YC27s0IMd1/P94M/xaAkcJwOmix/9wwsfF+cMvgnjkf35QX95OG0tEvsu5/z64HvPeHGmUjgzfHVwsC8q6NIvfvi+8d5A0rg8GbVShZQdwbXCjmx7Y5bExDLVaOMzbDQxV/CWktxpNhEDY3xO+rbuM4i1GAHOZhDly8ZoytjHsTq6/TAPtCZ4E7/J3Ma03hqCazSTmMn/AKca6nP5j9cX8UEdJUFweT+Ea0uTeGYDonyvMcxqDssfxBRfqVAt+eK++emBCeKo9TGlJkcvGjWLw3l9LGTzNGKhlHfVLcm3tjsrj4syQ7dhGVf4blWlkelrIFlW7AChp9duwASy4oLB0xJye8g84pM+aAS1sehfmQTtEzMO4UKoA+hwcc9JO4Ss/Z94Tqc4oYcyzitqEh4h4FPTlYgRuLtoAvuOXb3wvdZtOIReZ1WmEhSSOaNdNgiyKg3HqQThX1hQfOTXi3MREopgsouhVEVGW47jlf8AIeuLqOMwNjdpxnxBDK7tJC0qBNjGzc/pg1bgcGBBwcRBhmEnS/2a+CFzDg5lmKs1O68SKNXtexIuR1G3L1wrddtbAhErzyZ24UyHh+UKE+XT+mFYaKs34I4grallQnSqL1/vjgO8oxnJvHVZSCWKkgCO0dywG++2x77jkMP6dBWN7TO1NgLBVk5R5XVV0Bqo0Ahbkz7fX2G2Js9oIH2rLp7Oc17348hPqfKqmZBd1uSb2T5QP64Ut9puDhY9T7JrK+/nPlDo/DssyXSYbC+kdsLP7Su88Rn/AIvTL1l14HyybLKCeZkUFmsxY/w8z+mOS+23ljmQ+nprP+MYibxfnuYPVcDLLpGQrNPYahbcAb98N03Iv/ZEL63P/XJGtrM1rZviK6Wqlf5bkD3tthoX6UCJmrUE9JumocznQGSKR0e3yWNu22BDV6TODD2aHVqOx++B1eVz0sElRUU8scafM5S3Lng41ukJwpgjo9WASV4+cX66dWXzsAxsr6bg7XwT7TTnGYDa56CZpHxpNMGpz2O18Ds1la/DzOCNjLcRnBltU3lDxpt06YWb2ow6LAnZmeTZfXL5VMbtpvY3H2xK+1SeqywWvziTjRrKRKxVlO4I5YaGrrIzmG8JyMCbpJqdhdoWN/4tJxB1NBlVqt6AzBKOkkOstIoPMncYlHpZsZl/EuTjrNlXlLzSBIhaBhYtz25/0xF1Lk8COVXKw6wjNspijo1lo5eLWRm7NGNwCLhSOnXb6dsIF2D8xrAxB8nilqA/DkaIaSbgWNuu/tg61l+BA2vsGTKrw/l+WvaFa8KQb/i2W/pvzxHgOh6QAtSwR+cw8P0X4fxT1Ml7aYkBF/e1sEWixpRrak4zzC6Kvy+Wa1+C55aZUvbva2KFGEutiGU1FUZZDAzPMC1rXmmDW72HLAjnMMCpEn838RKaZsuyKLizObagttN+pOLbT1lNw6CeU+XzZjQyJn9HomRFhWoj3YKORsfXti+4rysrt3cNHHh98oyrL+DRyH4dCyzObhlfUL3U7i5JwGwsxyYashRiN5s0dYZ0pRIzabrxLeYehwPEvu44kpnOaV1bVw00sAjQixZeg9TggUAQbMScSQ8Q0fDMTxJawGr3/wDG2IlWnPqgcOeROzHDyfCJwncP2fVseXeB6WamSSWRn0vdxfdje3YbDY4zLWy5MYrbFeYRQftCmnasp4KFnnjY6WJsLDvhk0BcEniLDUgkqOsDz3M3iys5iZCtTuFU+a1+ZBwShUZyMcCC1FjBQ3eReV5etTE1RMfMBqdtXzMdwgPoNz62whqrmts944H6S2ipHNrcgfiYypqWtjKqqSshsp8u3ttg+7T+CVzzzz/RA1W6hdWllmcdwe3nM5xXTn/T08iuvlZCl7kjp6YTeusABWzNmjW22EkDH35+kV1NfneWTRRtTIlT/wACt2I+mKeChEKXucSjy6uzeXLXle68Virqp25C38/vgQsFPwjMP9mFgG5sGR/jOeegZQSVmu5dDsxTy2P0ufpgumJt95xK62qqsAVxHlte7MmioLRj/pMSPzwxZXx0iAs2AY7TonhvLJZojU00gndjpjgQtoUjnqwi7kDBkOnjMSuBBvFVHmeXZTXwTwGZKkEGVXuIxuTt/Tti9TIzCXWuyhG2+8CBJSky+tqo4jCsOmMayQLWU3/phzI5mINhyPOb44KlZRLLNAFbyjY9MDLDGMQe5cYUciMJ6cBFmad1SRR1079/XHBccYh6lrJIOfwmuyQRLIlSzKDaxbV7E9sQVBPAkWoGU+GOkR8Np8xMcLodb6VBBYD27jrg44WFRdwGZUweH5oaPXVVtEYdN20qHJvysL4Ta3LYAMl9Hg72bET1tPFSNoppVmQg3WNbXPrztgyk4wYCwKOQYInxFPUh4FDQ2HI7X9D98P0ak19eZUlSPIzxsw1SB5S2kXGnVsCef54MtlLtkiHF1gXibI6tEiKxkWPMLzw9XsHwxSyyxvigzSCR1LRalHJSeeLnpIQYjzLMyoqVgZclpZR/xck4Eysf9pPiqD8Mdx+LaSFWjj8O5cInFiijn9cBOnYn4oT7Ug4CyaraqOaVnhphApN9KuxtgorK9YBrAekcZR4nnokghip4dERux07nFDphYScwyakoAMSjq/HNXUxGOhpEiZxu7bke2BjRFTlzLW+0ABhBJpfio42D1BYOxchrfMTub4I2mRomuudTgwcZnJHKiyyycFtjpJBXviraUY4jVWtJOCJXeFqYZt8XBU3mmiPkcSaSVtswwlYhr5M0a2WzgGKc/oqmimlpag6tJBV2vvfHDDciVYFeDOZVxHxs+/8A1G/XDafCJYTofhHxZR0WQwZXU0cs2lmBZz+Hu5YWUEF9z1It+qJodvelBqAg2ERlJ4yagr5BRZfTo8R06xGFN+VjcE29BY+uG69H4gAYxd9WUJwvMnfGPiGszhY+Oya5SFCxpYDv2wWypdPUQvUwS2Ne29+glb4cgSuyOglp6WaExIbxxWYMwNmbluT5ue97csYFo94z0GmZRWpHE8qNn1il86HXcyBb7c7ED8zvgREHqdKbWBVQPXufwjGnaKGJ7VCl3HzMpA9hb7f2xYYEMlArGBEggX98yPVwvE8llEjrewA5C/L/ADbFGczSqqXbkcmO4C0cdkktY2Kh7A737Xv+fPtgJOWlHQ5zOeeK2auq6iadC8isulUHE8t7i5tc7NzsPyw7XjHBxF3znDLmIxlTUzQ1pRqaKqkAijNrWNt/Tv1wYW9V64ittKOcjgEjidb8CUceVPPRyyySOzAoQBsLczblf6YzbG3HJh7Kwvw9IV+0ZWTw3VzRqeIDpUBbqL2uTbkAAScRSB4ggnYitpE0MK0epaWT4lSoMpiUjULAaR2G17b2udzvjW2ZDD0mIVqOCnQdYVU5NT1GX/FTV4hl1tLp0C4B3C8sUSsKM95K1VYJiFcimemef4qoTcsNN9x6Da2BG4A4gTcAeBxEM/GSdUqptUTnbUTdefNR9cMAAjIEODuT3RHvhrK3qKipq6RqVYo2sOLcByVtYL6323GAW27AM95UBmHHaH0klHWwOlZPWrLF5REixtHsSBe4BI226+2LWM55XGJdlLDDH6RPPGtOhAJVVe5BYHc+vI4sAcxW3O/b3m+phhq6VhDcvGuou3b3Ow/vgYyjYMArFW97vBTlrzRiRo5TbcSOyqGwTeJc3FDND5cyAlk8guQVY6h6csGWwjoZYXjrNZRKUBm1sjGwUm5H1wzTqGB2scyxzb06wuGx+XkRtjQUiKMDNmk35Hf0xcSszWEk3P2wUcyMwukgQstor3PMm2JxgHE7djrKjLMtWpKmneNnQnUosR06+m+MzU6lkb0/GM1VC4YHxDnngbf1PlxiHtQZYlI89VUqwdCqqUa1+vSxJ369L4zXGousCL27Z5x5mamlbS0UtZgHd1IHHH+q9oozPKoVyKKdydWyaWC2Nze+29vffGrp2/y7Dzx5n9eP71iNgVqfEOeTkcDj6df7xAvDubPkOYcZELoylGuenTBtRRvAXygtNqPCYkxl45qwZ6HMlnBpKqnLLGeadbn74zEBHu95pWNu5nKZdMssknLUxP54al5SZFSyS5hTRU5VSzjzP8q974vZ8OW7RAHNnu94ZJKPh+EQGlE0haTqx6b9ueGk45i1hwMQapoZJUhnZbjVYbDCetsxtEtRltwHoJ0XKstraXw9ltPwzG0UPnUNYltrn7gHGE+WYmeoowqhSIDXV1DRVAFfWxXkJ/CZgGU333N+RvivhsYY6hFXmff+psmpoSi1vFkUXj0oSpJ22I/ti3hGCN65GTPpqs1lHJWLJdUibTpkUhG77c8BO7dgxxMBTtimhhqq3Iw9NVzK0+0SgjyX66trG5/LF9oD4MG126v7oNkEfxlXMmZRyxsFCxBrMAdgRy62H0xa0bVGIvRrwrkWL2+f6CE5lQVK59TytSy1ENMPNGp5Nfp06Yqu0oRnEjUa4eIG28SmpauWKSetcNAJSjlHHnIFhv6YWOAMTq71uY4j3xc0Y8PVjuFEbRXAuFu1hpt9bY6vlhiQMAHM51lniKKrpIaVKeGOJ4wgcL5i1t8bQBAmSSowoENnyappqBmLh0AuQWv5fbFXzjmQa8CZUiCOlYmJmJS5CgE+53v9LYzGILcRE4ycTn+dwo1eq6/LLcFmBOkEb+554fqYgRqk8Sp8DVFXT0E609GKumadVla5uliBcd+/pbC2qKn3ScQ9QsGSRwY18L6ONU6kWDVMLM6htrHy7jvgdjoFG4ZGIVQMgYx0n1f4enzKsreFHFMiyoxlVQoPI2AvzGOS9FUZ4gLNMwt3iK/EOXwJU00FJBIqyBVKQLszDoel+l/TB6jxwcylyBuggc+W5hl6ySNBKkDRaQVfXYE2At05jbviw2sODFTT0BlVH4MpJLvBWu/FgXhiR1uGt81tP5Yr9pTOAI6NJX1xz9800/gahqL/AB1aKiNQf9tNKhu/0wOzVujjwx9ZFWnCZOeYqy/IE/FpZHvMG8rqdhtt9779tsbtVtjqLAcDuIjc1auanHvHoew+cLyvw7xqdpKuObjRyWdUIUW25dL88Xs1Lbht4z38j8vlJp0yty3Y+mCPn84bNkGWtDEYaWanlZwVO7atuTc+354yE1N1dh3kmbNmnpvpIQAH8pposqcVcbMIeFLdRIt/w2H8JOHm1r3VsFXt+Ezx7NrodGsbv+PaEDLXoMwqpDJHwDGpuNgSL9TzwPRZC7cEzvbLVWPnIHH3+QAiGgzF58wSjqKiWWIO54XEJAFjc/fGhqdoXcMA/wAiLaENlVOceXbkGN/FHwdL4NqY8tro20SRNzu3zd+XI9sJV3E2bhNJqaxWE8pKpKzBVMm+wv8AzxrbuOZh4h/7QoWy7MI6WH/6Y04ESk30iwv9L4z6hvG7uDNfGHC+kiRGSLgYNiFNiidMrsvFD4HopFiXiTU1PrfqpYl2+7FcK0Pv1JU9Of4gtSgSnKjyifJKVKmovKRpU3a/XGjY2BxMVjzzKKqoEqvhjTRuRDLa4HlHLn97YxdeSpGfKP8As7/IPcHQiOq+rWiWKWZZCaZRNp1XLDl7b2t9cZyrkieo3gIWnIWV5Koa4kacf7pbk5J64fYjbgTzxsAyT5wuSOORLNGBCzHzLz9cByR0l60pN2FY47ywyenioMjU0UZnTSXAHmu3TY++E7Duf3p6ipVWoBPKTeTeIzQRz5dVvCLSs6yi+4JN1+n88MtUGw4iI2klW6QmsjnlpVNBmUs9QCCqO1rC2+/viEswcMOIrbpVPwElpqjrq1YnFZmdWQFNwrWG3Qd8cVXOQJCadVBF2ePWWdC2vIqR3kWSRUUtqNyBrDG3ckDCth2sQZOlKMWCdpo/aNnUT5XQUuoMlVUK+kNYtEo1b++J0iEvn0hNUQlZBkvmbZQ+TA0VE1M0ytoCt8vS+NYZPEzHdc7vLExqs7qWyGmgXU/lF7bnYY61CT6QRO/vGXh6t+Kywxy/PpuPXGXcm1uIu2FYiSXiFzLmLIgI4VwdNth/PD1IyuDD1/DzKXwh4mhyvK1pC4MnmJGixJNr7/fAdTW7jbjiOK1SDeTj0jXKavJ6t6mOaQSTySNIscguNP8AXC7ixQBg5k+7a5ZSDH1AtMI0hpQlPCCGsrcz1274WsqtDe8pJ+UIAjYhE1PC7MghQRxnVxN9iRvYcx1viVWxBkcEzmrYnbiJJ6qahSQU8cEjqeMqO38IFrjnc7bfXDp07umdpwBye0TyEbYTz5RvRVMb1EatPHxlsTEIvMDYXA74F4oQYHT6wyo4BLZ5j2joJCG/EThlrA6dNv64E1bWMCvMIiKBz0ivN5Mvp3EIhCzrcaiBd/fGzpEsVcZ4mXr3RiPd5imOOKdKrVVcRV3VghIUbbDvufyxcWWhsdCB+vGfunPp9KyliMgn9OcfefwnlNSuXRXqHZFYagmrl7fyway5SvvgZMU01NiWf4ScfpNVVRa8wbhl3phIWVbEBSR2xaseFp8KcMYTVXrqNXlgSg6wOtoA0yIWDDqJGYA23P5A4wvtVzZDMZqLp0qIbgAdMD84bluX0UM8DwxU4UKD5eYZgpH08v64oznIKk5hPE2/D0mGc5dTVuR1UBGhyi/N/GwudQ+uJS561wOmYRFDmSPh/SksXGVZF0lGVv8AtO/3tj1G7dSCJj4C6gqemTF+fSTu7GrbVIAE53sBiAoxxDq/vYMXJGAgBwQCBdiWOJV5z4h/eNFl1HCCkEcKh17sAB/8T98KaasVuWMLq7jYgAh+QxOaBnchfN152/pi91wHWZ6qXIUfxKLK5ZaOCo+HqIpjImqSKIatIBG+39MZN7PcniOOO01NGq6ewIrZJ646Yg2cV5jyDNIJkMjyQMEkYbg28o9bHT+eFKzzieh1VatUXHTE5lKdYVkUh7AYd6TzPAOBPqbMGjr4I7K4lPKTf6e2Kuvukx7RKS2RLioeU5LMXkMWuIBZRsqsTcbD+Ha2M8Eb8z0mCFHPMgFiSok0yzH8QEayRudr+/Wx9cPliOnaIEIXyxPzjLK8zlgqVoIAKiA7ShD5Ruf4vrgfh5G4wN95UlUbiM6CKLN7ZYtqIJJeRtyGUnvzGKn3PfnVN4ibT0xyZYZLk0uVyyxfG8el4I4KMdTat9rDmNxhV7fEwcSaUoqf/Gesif2jNLDm9PTMBwV0lPQW3w3owMFoPX2Bsp98wy53TLYrtplVLWBsSbDDgw3BmTvwSQYbmD1EdOafU5Z4wVuenXFtTUK3GIkuqZyTnvA/DM7RyyQvGY2FwbX1C/phK9cjMPchBBgecZbJDO8tpLuSWUxsR2tew98XrfiWSwYAigLISkcUh08iT9rffD1VXimELKOSJT5RlqwHUwvKebH+WNOrTVV9BzMu/VM3AOB6SqyiEq/G8xaI3HvgerduEHw9TJ0O0brTnI4XyyfPtH9JOJoWqqgDUSeIq9uZG25x5S+zxbCw6dp7AVOihT8Xf5yDrc5q6TxKYhDGDFIVhUrYOt+o6c/83xt6S1L6TU3eYvtHTNU4u64jbNc0qqiWCRKeCORG1h0LXPfDlPs8UsSDnIxzMx/aPjrsPBB84xi8Z1Cgj4Lc7kLIR9cJf8IB0sMcHtdTxt/GJ/EfiZsxiVJqMRaW1B9QY4PptEdO+d5MBqNWupTYox6w/IpEnoYlSSNZuI/DQru4tfn05nANUuHJxwcZ/vpLaSxTX4RPvAnA7cjufWH5jU02XKZYlMYjULIA1yzenr6euK1IG5JyOstqC5sVa/i6cecCo/GEUEskM2XVpEsRCnhDf88dd4VoGH6RnTaXVUknZnPqJvy7Pcurqvg6HjqQD+FOoDWI7YU/44FSyPmFfVtW4ruTGZujzMPXPQPQqmhiiaNrKu1z9N8AWrAGOYR27EYmGaSUrQuDUxqwUqDq1FRvta++5OCLpL7X4XAlBqK6gctk/KRbQtA4eAXQc998ekVQECzGNmXLesVZiXlqGZlsCbsTiQOAIYOMkwaxxM6bafToOodNvTAQMmVZuo/vWWnhx3ShOtwoY+U6yDgNoTPvgHPnFOSW8PII7x9lOY1VHUST8IzhvK7ubafr/LA9TVV4e3O2MaTVahbt+N2eM/tx2iTPqmsTw/JDDHDw5JEDT6SWG45b252+5xjVkbsTWFz11lR0kUm0/CbYKCCxOxPPDWeOIixz70z4cLtApKvCv/2pAG9LYqTkGG0ufE5Bz6S7RJ6rLYIYSREqWYBQXB5i9yB+f3xnnAbJnrQvu95F+IQZEegigi0a3dZCoDAm2y7bbnmOZve2G6sj3jE7zldqj6z6kThiI6Gjq5ADdhpBuLGzH0FrD1xO7d34mbdWauCOsY5NSVdLXTZlX0ck8MraVNPpZox0BW9+XuMHS2nYV/27QopvNYesZHlLHKq6hqMqFXTzVBWOYsxkhF1sNwQNr7bD1xnsmDg9Ypp61S0ORjBkDn6LUmOOaWeVnYtGwJ536gjnvbnp7G+HqFYnCiUusQEupBHywfvz+GJrpqh6SmtSo00oHmkPnv8A9g6+5/vhsWIgOBzEfCa6zH4fvC4sxp51j1rI7G6kRkXY+1+fsOmAP4thG5hiA+zPv2qOYlrpUjqmASojnkN1aQMpb6nbBMVFcflHhXcObOk206yzxrJNNI8truxfUDv0ucLnCmUchW90cQB6aooajU6OyKbBj/FYm/15Yb096r3hiVsTbxKvL8wiqYlkjZSeRt3xsLYrDrMW3TupxiUOWVkaPu689xfA7VWxSIOh2ocNKGCSnlXTALRvuyLcj3sNz32OPL3+zrqznqPOey03tOvUDnOfLB/v1knmOWSPmTVUswmd7cmJ0r0BPU2tb9cbeg0XgDe596YXtX2qNT/ir4X8z2+kia2euqpntVSyBJWQyKxRVAJA0gbfXCz6iwuTuxDrVXUMACHZXUVSyLSTkyIdwSw1L7kc8OaPUM7bScxPV0rt8QQyajmnMrwQ1FSyR8SQRAeVfXBL9TRU2GPMnS6O+4EovAjHLkE2XQVFPILX2F9O45i/fb88T4iMORxErKGW0jIz+sOrKkzUFJTUnnqHbiMz/Kvq32wpqXWoEEdZpezaHtZSnAHX5+UUHN82WWeGWgilYeQsbLYem/I9zjKNdWMgz062W9CvMd5bm/xNREODFG2nzx6LyRFSBs553v8A510NFp8KW+nyxMT2pqS22rtxn55g8mfTO0iJDBG7KVaZVu1j7/5th4aOlH3qMTK+13umwniLjJo+QWHUnngxOepgwAAJp/eCCTQ5I9154quG+E5hGqsUZIxBq4RyRsRYHBB6yF6yfaUgkHnim6PLSCMw2IEJigibdZbeHYqebKzE2u53IBwnqKTYykHpJ01y1mwOMxxWZxQxZbS5ZOJEqWkIiVRdW23v9MKa6k7t/WM6W9X02zGCJF+I82FZPFT0cjPHGdUjAHc8rC+Fq6yBkwlm0pgnn5mL6aFq+vFNEiqZLEnQdtt7DBHO1cy2l0ptcLCs7iGXT0phRYBAWA/DszgEW378zgVRFmRN+5BQgKcYllBrmYPHXSxnQGJYAgj1HLrgRQLkERA660uCOBA2yehqI3aoqg8jOW4/FYWI274uthBHu5HlArqLHbBMB/8ATwRVkinJjLWMiMDsASTy9zgtlla27QCB6jmcULKTnJ7dxGOXeHAZZhVyytFpsmh9BB33NutsVaxc5EIiEAgH6Eibs1yKKHLJky9pIi43UuNJ5c9uuOLqzZneEuScQBPDNbU5hTzT01qKC4Z1a4vt9Ri1F6huIs2n3KT2/kQ96Ofw3V1K5fTwvTVD3hec6dKixsB1AJtf0wCwBzgnGIwjnTjC4wef4gmWpBHUNWSLTx1RmZ3iEg02K22a1733tgb5I29oZNSCdwHIg/iGhOfSQijSBY4R5zI2kk+npi9LeGDmU1d3iqFTt1m2lyZKSBy8KM/EU2jfXcW2viTduMWprG33hz9YtqctroqwtC7JC+sjybr5jY7/AFOLrZWThjK3adf9f2n1C5y+nliFKk7PdmYoAb/bEXIljcHjtHNHq7aE2KvPeLv3TE08hEKanux4g0n+eCCwrxmAsJZic9fujbIGqMhV5qqeONGLlEdizGwtt1sbD03J6YudU7L4acxRFWm7xiMHGPn3/pkwTUZrNI71cjhH8utyq33GwHpbf3wey9yckyi1V0jCAD9pqUVNGkXDkZgp/wBln2ty+mBhQxxCqwOSwjnLIUWOSYhTOxuW7+mNrT1JUBgczI1NpY47SyyVNRaspKwxRspSSEgEE25kdD+mMS3ehdGXJJ6z09BrvSqytiAnaCSU1LRo8KMyoGLIdNyxLaid+m9r+2Hk3pUFQ898zB1N1Das32qdpxtx8up/aGZJ8Ay/DzcJalPKuu4LD0vtzwHWUs53iP8Asn2hXXX4T8c8euf1m1KrLYs2mFcHdUjKhkFtLDYD88KUaZru/E09ZrxpV5GSZoc0klUJYqaOErp8oFzblqP58salKLSpwZ5m7WvrLqyVxyMevMlW/DqWWTysf4Tz2NsPblYDBgtjV+6wwZtopI2zOmBtYvyY7HArwRU2IfS83L2jfxzTSy0sPw0FgiAyydrcsYWkdarN03tQbLVKuc+Ui5JLwobn1x6InIyJghcHEVS/7jYHHkbCgRtEPIMQOkzj1jnJah45VRmEaX5sdt8UtzsOJRFXxlJMq/3LFXU0GYSoQ6u4Ml7hVswBHre30xkMxYczfrpW1AQMZ/SS1bkVFlMqLmWYi8m4VEK+W/P17YqSzfDAW6fw2HOYOmbZFlpD0U0jyEk2eI3seY9MUNdjDBE6ltRQ26rn5x3HmVPnprKVEWphiIdLLby6epPKxvyws1RQAzfr1fiMV2ffI/4yWqmdqRpY4E2KJIxBIPPDqgBRmYuttTfheIak+tNLUaOwPQc9vfFCuD1maWOchpl/qZLpStULKWC2ikbRY2G5Btf9MWUF2wefnyY3RW7cpwv0+kqMhgzimqtVVUrTwogMt24obfp2O/M4tdp7KtoC5LdBCVbkLFm4jbMaqnqKRoDViISSaOIpuEB3uft+mJOndBlv4hhctuV3dYxyyqigySmoItUmgAySsblz3/O+CVaMj3jE7NWoHhL2hFQtDmFK1FmKgAeaKVeaN9Pv9MVv0zN7y9Zem+psLZyBIDM8up6V54pYnkUSErMt7MvT/PTAzTeOcQb2V7yEYRZLS0PmlLMFA8xhZnAHrblge8worsI6Gao2kpqcVWT1kiMykGXi3AF9wQfYYk9cOJQOQcTbFJmrRytVVkupr/iOw0/Xp9sQRX5SBcd3BhKPXyw63lEis2kaU21e5wImtTG1q1DchTzNi5XWJdUhrVUt5QgUbdTscSbUkDS6gdFM0VmS1FW6xrDVM7AmNGlAJA9b/li62ADI6Sp0t27JWanyDMKamjMNDIObFCQWY37X7g/ljhdWe8t9kuI3EZmmqoKtYEE8TpM6eVGWxY278sXS1M5BixVs4hNLA0Ihie/EcrdT9sbpz4f3TIJ3tx8pW6NMiwU8gGxeR1XfQouT26H7YUVBWhYf0xmx21OoWv7s+QH9/KP/AA5NR11E6TxQFuWhgNwfU7774VDvjkz0DUVLhVHEkc9X90eJTSUhvR1GiVSdzEQflB7XH54bqbeOZh6/TrQN9Yx/7GDVVJVVEvEOgTqyNr3GoY41AU7U85Uaw/bA93A24x85oytY2NDValKEPBKD0vcqf0wNmcWHHcQunFD6VQ3+jHPoCevy5EO8RZLR1GUTwwyRGt1l4nBBZlAawBHrpNvXCPi3LaLcYx1mjpq6RSaC+7PIzJHJLSVtPLMhY2JKnuBjc1jZ0xZTMzQIBrAjDpC/EuY5lBBUUVZZo51HDkXcKO33748+iA9JvNX4Z3SRc6lX7nHoxwonnm+NjA5FJcm2KwgPEoKKmMrFLeUoT9cSJn2PjmF0VORA7OwMfzalxGMqZQv744nRshaGfIaFIZ2aeaESRrw2sOu5ta/ucYAPaer06stAx2kF+0SGZszhSsIYyU66DGB5vM3Ign/Di6k44iWpZwwLGSE5ipxpuNZJCKVO/of7YuMwK5f5fOEeH82qMrqZpIhCFljKPC6sobtsMVtrWwc9o3Xe9Pw8z4TSwgmGBChudnAG/rfE4z1iLKtjEscGFZTFNmMhNFAxcsqyHS2mMFubt0HfuMVYHOAMwi6ex2weF84xmqUyGp+GjAnqzZppJH8qyEb6QOQsBb0xoUuNLwRlj19PT+Ze2wBdiHgcfzLTJS1dlnHSIsspVpB6dcW1lqpqaznHB+pgtGrOrq474n09A0kSmfL444lbiWXmwHIc+WJ+06a0+Fv5PH1nPuqDEVAKO4iiuzGSNuDSm3S3bDjYAmHWzEb24zEGYZzUUdTHHI72cby32v1t3tfCjahFsKmaFWm8SrdnEPoMxmnItIJAf4gb/nhtHDCIWV+G3kY3L1stFMadS+iIgAqLW7YR1bUacD/GCT6dJq+zk1mq3N4pAH4/iJPy0sElLHSiKrWmkYtPIyFFte526m4Avb6c8ZlSPbZ7uI+Vek+Jf28+/wAoQ0mTU1PStFGJZY1b8JowFBJBFxyuOnoenLDSaKzefEORB3e0atgbTphvMjp6+vpBZvEFaGJjnKgnYKLAD2w+tVajAEzDZaxyXP1nqZ/mbFb1kn0PLFxWnkJUu/8A+j9ZvGdZiRr+KlbQbqeZ7c8caaiclRmWW+4DaHIHzmyLOMxLLJ8W5PXzbbdMFNaMuColBbYrZVjnzzDKnOZKmGBZKeMzR2VXI+W/UDCq+z6K3NoEabX32V+ETj17zT8MUzvh1EixaXA4jm46WPPli19j+EWQZIgqtOg1C12NgecqsgihGeSx1TwkPCIgVIKkWYMv2t98KsXspViuPOO6Y0Vax0Vwcjj9v75Q4+Co4atZYM1qEgLA8IqLsO2on+WAEZ6zVOeDJzxHRxNmSNFfhxDhQqw+Y7cva174NpfiJHQTP9rsvhBD8RiGZ6gVTSsjjU3yNb1xOlfcD9YH2vQqopI9PwnuQVNQ+W1SRqXMrcJeXl9bntc4Y27vmP7+sy3c1uQOhHPy6xrQMwr5J5Fkjemm0KjC9m4aNblta7E/3vhYH7Q4P+vP8TSav7GqJj38KPvycxRkgaeo5nUAT3NzhzVv/wDMcQGgJ+0r3MrPEGXQ5rkUkUNme3O9iWHK3MHfpjziWlX5E9Jy5IM5bw3RLOjIVbSysLEY9QrAqCDPO2KVcgzQxOo4jMkdJY+HaYySTSsTaNAPQE4gGZzDMl6rOjWGaCnZYaeI3jGoq0q9D9eeM+69n4HAmomiFQBPJP4Tqnh3Paal8M06pUVM3BXhhEmS63H6Dpt9+eFCwzgzRquQJ1nPPGWeSZvmcssaskcaiOJSQStuot1ve3viwURa1ldwYHPJVtEkTVCyK17FgCQPUkYgBc8CLDafeAgcdIGKKHjkZztq2/TFiwAhjZ3m1Udn0JLAsimwUEqT7f8AjHQfu9WHEdZFLNQUNfVygkqfIpUaZJNG3LmBvf2w5pmWpGvbr0EMCbFFa9P0gPwtbNU6qipZndzdllAAY73FjsPS3LCT2biWaUB3H4fw7Sv8HyESNTVE5YI20iqQSTcWGNDS3NZpyMciXqyLRu4jsuqNUwiZ3iQBFZuZPXfriuoUu9PHOZXUsqq/PaS8pHEkaS93cqFUc/8AOeGr7hX7zTCppe0hFmtspp0jmOaS6HZm0xRXa19udrWNseee9mfIE9ClSIoQRU+VyQH/AEU3lVAUNlu3/wCu22G6tSydIK2oPncMw6krs1gZPidRBbQCgKOuNGjW+I2xhM67QooLpxj1nlXO8r3u0mj/AJyG4PrhgkdBFlzj3jF8sszfwqthbl0xHMMFHnBkh4j6VFz2xBAhOe0qPCnhOOvmmbOJZqaBVBQoVF/qb/pgLOR8Mbp06uPfjym8HZLFVgy51HLHdvwi4UkW8tiOt/S2J8Z+mJb7JVnlo0o/CGRUsavNOtZMZPKpmAUC3LtijX2Qteio78xtlPg/KqaoWanpmaRN11SEgdb7nA2vdhiHr0dKHcFg/ivKC0sNWBeZSV1afMb+3M4rWwUyuro8YZ7+cmK2lKSstbS1cfC0lZIlBu9jfV1B9sXaywkbcY7zPOnRVYWKxOOCPP15/f5QiPPK+lol/wBdA9OfkeQgsp7WDc/cYkrSWIGZSvU6tKv+wYPHmf3ivMapY3SeSqiqpXXyyBh5BfkVsLb/AHxKEuCpXaB+MFdtUrZv3k/h903Sy0tZCWrKdqZNVzU6dQBt+ZOA6dER28M5OP1jmutusoTxV2gn59sdIt8PwUs/HSZ0VFm1BJiUV1IO/wBDYj1GCagWHBr7HMDo3pDMtxwSMA/gfwlDmKZNJQ1AqMvTXM6ySStIJWBUAavISeW3L74QrS8EA8d5srfpWy24McAcc8evljzkzkHw0GZurOI4VJ0rIDuO3p332xo2q9lG0cmZ1d1SavxW91e3EsDQUCZPLIg4jMS5BcLa57AYVUOKCo/CPlqjqMk9fM8fSc68QwvBm0zToITIQIolj202FjfocW0N/u7IHXIHYuImK74fzERL7w4yrTzRkW13ZvsLYgxCtvf5kJ4eWjpa6P4xgFeLRxDy5WxlNyOJuFg5wRkZMpaSWgpKZY0raZHPNkkU398NC+gIBsOYEIy88fWIs2qKeqq2enUMAiqSg2J3JwO51cggYkNuEXCrVWtM9uEfN3te+BbZda89IJBWrNqWSy6xy7HFiOkM1W0AykoK7L6fw+/xFEJ53lKMbhSTa+q/tgLBt8pk5wY4hz3KMvyiCpZXWIEiOEG7km9/1O+NDUVo+jVe8Bp7LV1rFBxjEXjxD4cmnJWgqFlc/OtSFYfX7YzRVYMZMdy2Ccfp+Utcmlyp6KkraWnljUu0Z81yljvfpi2iS9r2VTjA59ZZrFCLuHEKqKiOOMIYgROxCSqbhuuNFNLa9qsz8L2imtdFpZlGc95NSAR1hEsbMqyal0ta32wfU0rapUmY2i1J01gtAz2wekdLrqahJqKmMkbjSUEmkxdLb7WPP74wtRo2pGASZvae6nWAsPdx2gNdQ2qEMsDU6c20ODex2APQ7c8TpqXs90/lLap6tKu5zn0BgNfUtHBw6Wkj224lrv8AfpjWq0iVHcOsyLde1ybMBV/GJJjOG2jcdzpw13zAjaRyYM5dj5kc27m2Olxgd543L/aFve+OnZnycFTcx7+wxPE4kzYrgyAqLdvTFhKngSjyXxA9GBE0YkXiLrvz0+nrfArK93SM06g1idfy3N6VkgjRl/Gj1qe98Z5BBm4rqQJjmbJCDPGV1jzcV/4R6HpjhJfgZkZmviSolkZqQ8G6hGI82/p/XBq6wTEdTqCtZMjajLeH53N16HDGOwnnRcTBJYzqG+1x9MSFIl1IxKmllpgtLVzRmXQ68VLX98BSsoHUd+npG7r1uFVmOU4M9zzMsur8zoXoUhmaAFpjw9KsOgIGIrrPQyNXeu4Og/mETxxTUD5g7pFI0oXhooQAX3v9LYneyP4YGRB+Ct1B1DMFOcAen5wSonYvpnlhlBAAYBTcDlvbBK0TqFxOut1IIBtDD7v2mqeuihj1DQzKb6OQOD7QRiKV5VwfI/lFfiHOqGvpGMaOKiQKpDqDoA9cZVPs81WBt3AnoH1auhA6yV0+mNDEU3x/RVjQzc7BksfU4Gx45mey4nlf4X+IpFrKSRpE1aniY6eGD6gfrhK1NmTma9NwasYznvxxMZvDUghJAp3ZELFY5vMQBfthQXA95K12FuDEjCSkq4qWGnLvLyjHzBrEn8r4LgkZl0oa47R1irMKGancz1UbrFJZl1C1xbb3GCLyu4dOn3+UaRhwnfr93nPZaOKSIOrokgHmJNsQDziDFrBsGNKSgqFyWNuFI8Qma7BTblzxQsu8jvK2An3xxBarLqOc6S4gnC+Ug3Djbp0OODMOvSEpuJGYkC8CZQSryc12BGDqMw594Trn7Opaeq8NQ0rkpOryMLdRfvhBtRZpdQXHTAi9gqt/wN1EZ59JDHlEcFHNaskf8EhrlmNuY5DbDx1tjkbesEdPSKfCxwOfvglVHGVQzWElhqYde+Ng4xzPNvwx2wF2jFlDMCABs3P3tgTMhnYdeWGPwi+ojlEi6DNt/wDkSLYrnHeFDA9YQss+i4juO/fE7xI2AjM9PxRALRFFPJmHM9Bjt4l1qmiooqwDVNSTKB/EU2++INijrCpU2QAOsAaAsrMFLKvMqOWJ3r5ySCDiYRUTupcIxXuBe2I8RQYUVuRkCeCmbUNPK+CAwW4Ymq1QLyIqBQd1N7/XtywidcN2AIfwhnaQcyjy3OamKGBHgnjaIArYXKgjt1GO+00OOuJoro9ZTjjPlzKzLvEUVShSerNkiu0bC2o8uRxUKrcocw7XNWubRiTFd8dPORTUjRK+oxmbyqbDpfmcVfWImEr5b5GLrobtSd9x2J8xB4/3pEXjrXi0NEzU5VPK9trb8t/0wuvtEsemYaz2DTgKG+X8zynpjUpEzwtAZFDaG9umNeq5LFBE89dp7aDtIz/e/lGtJNCt6SSKYFwQrFLKfrgY1FTvtVsmMH2dqKaWstTg/wBE+WKkWZRBGpcKVBjQtYfQYKzIO/MWem5l37SR8onzE1bTLFVQmGORNUJZGU3JIsbjnYfnhenVC5mXjI/KOan2cdIq2dSevp0/eLGeVHMcpOocyTyw1jBxF8L2ns/EaMaTc9d8WPAkL15gQhZ3Go3O539BfAzGFPOBB9ZxTMtiNsu4gq4pFTUl9y24OBuARgwC2NWQy9QeJ0TL6grQwMtlBGyobCxN8BrrV6gZp6i+yvUsc5IOPL58CGZjkYrqOCvphIamM2UXv5TseeMyxCmRNIE3KGziczz7NJKDxDGsVPFH8JKFeWUXYXHUdLXPfBNNULcLYepmcoKMW7+WOM9oZmmeUdIkENWtFUTyMomTjAlCGvfT7AcwL3wMVOu6vkCHL12UhkBAI79gPw5+UUz+KB8Rx6rL5pmXUI4wQsZ7X2vyxdKivwnEilU6k5jvLvFEcfhRZoaWOObVwkgRQqr7bb8/74A9TC3BMI9/+hE56wmNRKSISEuHKqxvuOgvyw9xiQNoHrBqeAPVxKjK0jyGONiNIY97E2GCoCzADvL2MQhyMDE7J4TyqjoI4YpYkSVW4aukZLMxUkk2FwLg7nbphC2tmcoSDzKafDr4mOT39J9NSZNratiqVimRjaNYjpuO4JBHPqMH01diMC4z+X1/iRaaXpdVxu/H6QGrSfUGeeJdQBVLWLDtzxt5T/aefpBPuL1PHlnnp9/rMqn4CriEVRNMkzRqomUEmIj07XPL0xFlFiHcgGPniNVMHA8Qnpwev4Dt05huURw0dI0MuY/FDUSNNO6m/rqG+BPVaWDBMfMj9DDJ4ewhm+gP6j9JnU0VI1O7TxyW+YFHYE/Tp9/pgZS5nOFAXzMKE061jLEt5D95sWCr0fERoqxICBG1TGHaw6LuSfTFRqFBxg48wP6fykjQgr1XP1P7TLM2lipg6QPOtr6IwTt3N7j7WwcbD3zn5f8AsCEYHjgj5/36TVLlpqqNgVUJpuQDax7XxIWtTgdYNlOcntEsVGtKZpIqyCaL5Fc3R725BWO4v6b4EXPi+GUh7qVNHi+IMjoJshlp5qg6aQKoFiSQRe3MbD1wQVir/b7orqG+0DJXnz+7p0Az9+fSNWmZ4miljhdCTq1CzC4B5diTf6+mMk6RdxOPvz6njHymymtZqxyS2Bkbcnkdc9AM9j07kT4mKYI7IA8YGiSMaWQDoDbYemH10FbEWUkj5dPoZm/8pegaq4BgPM8j5Ed/7ma5GjkC/EK8gXfS4Vlb66bjBj7PO4sGH05+oIiv/JDw9mwk5zycg/MEH85qro6WcMKWKWliurWSU+VgCLrq23BxA0Fq4ZHO4dD1+4+f1hx7UpZitlWUbHGccj5CbVztqejjppXkqEQggVCoALb7kbkXI2vtbAD7LLsS7D7hiMf8yAgFNZyPMkxdBmMcmZ8OKq4CMN3Vbi/YdhbDq6dVQIBnEzDdc9jW2MQW6n0/WOp5nSHiRvHUEDmrC/8AXAlqRSWCAMesvffbtANm5e3P6RdP4irZ20vFGEW/ljsL/bE1VVocqOZS3VXXjBPEyljlrlrcvzCSeV6hOJQ6muIbgHmd9jyt0Bxm30kKbU4wT983NJqg1o07c71X1GcZI/vSSFpGULMxd1JRmHW2NKli9YJmZqalruKr0mJYqLAnFgYvjJheR0pqczgRrkEsP/5OKucCGq/7AoiJ7qxHY4pCxrltR/q4ogv8Vwe+IaKOvG6dJVdMegIBpAGkdMdWV2jHSM3K5ZiepMcUubJT0wVT5gPlwm9JLEx6nVqiYnMf2kQGsr6vMYFSNmXW0RUgllsPKfW18SNPtXdnpmC+0htQFcYzjvnrzIqmgieIrUxMjW+YC9z3/vgfIMZsZg3uHM9mleClhYysuo2Mbeff2IxwBMhFDOeP0jqgrJo/C0SwoReaRGJTaxsT9CQMBZR4vMrYDk56RRBJLHXSvIuqVxp0qbKRse3O4wTb7uRObBrAHSYOvAzKJoInVUl43nudiemD0NtsUychqjuPUYndcp4YyykaHiCSQ67DQVub8ri+A27fEYg85h9OpGmTHlAIf3hKYY6uN1idirRPGAVW3p3OAq+1wvfzEsqkKSx5k34tjQ1cLRodGjY2tpIP63xrVEkczAvXw7CO8xizKCWGI1iKKlDdmKFklFubAb364sTaDjOR2/veFrtqHJGDN1NmNCkimSWWWNEC8OSI3bfmWGKp4i57H+9oS3UVMMnmHtnGWVjcPTKIXFnj3IP5YuhsUe8cyhsqL5UYjvJvD1BpR6RZAD0I0/a1j+eFNR4rnCtgTV0+3ZyuT/e3SUByZhTmJgWVhZr33F7gd8QmVAGYVq1JJAxFWZQLTIxSA3C2GiwI+uDo3nE7V2jIknnddHXKFqaSQsq2LGY2P0wWlTXkA8H0/mIX3gkNg5HrAKevNHDJOQqU8C6nUDn0G/vihValLd4AO+odav8AXPA7DMVv4nzGUtLBSRxw2usZNzsTzN+fLphMagEjKiazV0jKGw56eh/j0jSjziqzanSWmo2UW8zM3yn064Nd7QCcJ1kU+xnubdb09OJtjmqIa+OCv4cazDyOFbn6m1iD6YNpde1uQcZ+kV9oeya6ffQnb3jCRaUqUldSy8gVJH6YbFtwHw8/OZhr0m4hXOPPH4cTUaDKrmSTgsCByF2+o2xU22k42/f2/f8ACGC0BQ3iE+mOf2/GePlmUSqpdYkA3BjNj9hiPEcnBHEk+CBnxOvp+B/iexZUtFJxoFn4bDykqCD7EjAXuXO0dRLfZbWUMuMHp26/OBwV+XyZjJR5xJWRlW3MLhFHSw6k/wBMLLbZapZHAmsdDp9ONr1lz3PaHJS0clXJUZdU1MsHDIWOZizKQLhlbt821+g74DqLnRNjnJPlD6fSUm9bUUrtOOnBBHHy64kzWUzU1W8TLpsxIFtIsdxtjR05zSsydeNmqcev6QBkYm1sWgBKDwwts3hv5QqMb9yFNhgdnwwulXdaDJGtulXKtuTEYgQxEPy9gJTq2bVuewxBzE7BxOnxNCYFs4LEeW/0thc+J4g29JoI1JpJY+8OkGklB4oCksoNtPU4YZSEJidLK94B6ZH5ySzqleszVeO7yRRjTzJUNfnYdOX2wnqS+0EdO8JXyzhOufw7Y/KCLksQj/FjUTNqJXT83oP864zjc2cCEJuzjB+kms1o1FYQyFNdgqkkEWHPDlbZGCeRHKmsVeY7gzqQZEuWLRqeGqoX1C1u/vgJq/yb8yHsDDb5zGiyabMssSqpgS0UzNw73Li259xjUsX/AORcDp+8UFn+Y19zx9OZuqsuSQqKeOQa5AFAUgXPO9+2M/Sb3sAkEuineMYnWfD8KNk9OhRpOFpQgRgt737b4tqQRawzNbRMHoWM48spkkQxsxKcgF3t354DyvAMZFYMhvFsYaOawBZHZ9Qtvfc+2NLTD3czzntIf5cyQVlVbyc7XA+uGcxbZBJKgsbkbX5DEyQsNyudWqY1WPU1+uIJ4lqxhxmdm8M6Xji1ADbCrz0FR4lMRcG/LAoxJ3N1QB7jBVi9oGJz/OKWOZ20ghl5euGl4EwLsboiz6nenyKaQGyLLGzAdr77YDqgTXxJ0oHiYHlFtkanV4XDsRqBtYN1tjHBOeY0y+cxpq+pyt1lhkiiRzvGRcN67csdtVo3ptZZUSOo8jHiZ9QVSQNmwSJ4mvwuZv0ZTg2lpxaCTgRvU6pbNOdgyT2mKVtDmE5+GqY2kY7KTY43lZGPunM8k9V1XxLxGNFkdRU2Zxpj7sMVawLC06ay3lRK/K/CNNTVtOWbU6APIjW5/wBMKPc7Zm5Voa0xkZPnH2d5VQzU+upLRrELoybaTgSuQcxi/T13JtcdOnpIObMaYMwqqBJJ7WDuLaj3xA0it3i2o9q26cgbflzCqPxBQyUTR1b8GXqkCaNI35fQj64FZoW3jZ0k6f2tUKwb/i54/KRGdVpzDN56i+7k29B0xqVKFQL5THZmcs7dSTBtgxJXfBCIPJnQPCeUGDJGqnKcSca9Vr2UDkPXCVpy03NHTtqzOU5lTuK+oB1XEhHL1wQYxFWyDHGRU8TUvxM63C3ZvYcsCZsZzEWDPcta9yBLfI7DKKSaYDXLE38Wrkx59j0+mFaHe2sHOOZt66imi8gDqMfeO8wrZnihHDTm4G3O3XDzMoxnuZkbThj5CT7FHrnlN1Ki4K4vYQxIMz1ZlGQYwizORgBxyAO9sDCVjtCHUagjG4xJncRzCoU1MJ0Ko+Gl07MCfML99hhHWvtsyvTE0Kms8EOc4muajpqemJETGMAgtYXBtz9cZyu7HmcrHrmGeDo5qXLHL6lV5CY725dx/n649FpiTX70W1jDxciOKmd5LNI2oqLLfoMWVVr+EYzFrr7LcbznHnKfwtVr8MNLNpe4PcYybzlywnqdEStahhjIzzHk1RAsbiB1c/KSD8nf2wL4ukbZto5nN/F1auuWPUNVyDY9MamnGFnndcwa0Y8hIyV9Vj9MHgVzPFCuCL2OJkEkQzLpfhyGFgQcQekmv4uZ0bw/n0RiQF9Dbc+uFjgzcqbiUM3iONFCtILHqDiu2Fa0Yk/nHiCNUIDhyexwRVid1wxJabN4pHAkfT2YH9cMgTFsYk8QhJo54DFJpkjYFWHMMDi2AwxA+IyHImUWQ5VIiCR6lVUnbWdO/fuR/TGZZ7PszlD/AH5zXo1ukP8A2Jz5wKq8NVDEmnqKOpXSQFdijkdN+/2wv9l1C/6/Qw2zSs3+O3HoRE1Vk1VTwxtVQCJWuAsfn0N6n1wIna2D19ZezTPUBYh3Z8oFHl9HPPCYalVIdf8AbI2N+W39ueL1WsjZxBI1jAowys7l4fEU+XGJY2lKr5m9eYGHWcscmPVIqLsEYR5a87xTzSshj/gHX3xGYQLCMyl4FI9wZNIva174gSzcCc0aP96M9RUTiKS9go30+46YYRsTM1NHjYjOphFTlwoePDKtttAAcW3672xwIzLmttm04kRWZP8ABzcMVMDEf8m0m3scMKwmY9ZVsZEKpcjrJmR04BXmfPfb6Yq1qiEq0tjc8Y+cdnM4smoajL1qC67jQ17pf/icLMdxzNWseGuJN8FKkma1y5JOob364ndBFATmDZKNVAyH5Sp298Q45MxSxW8MPMSzyaJaPw/RTxbvPGQ2re3mJ27YQ0RLoAe09J7WUVXmwdW4/PpNNQf9JNMNnQbW9eeH8+8Jgn4Gk7psS1ze+n8r4KehaZ/+ufSfBVM7AqLbfpiR1AnE4YiMdV0ETKHjZfMjbg/TDDIrLhhOptepsocQ6v8AD1H8HFWM8zELcxFhoaw5Ha9vYjGd9hqrbImo1yrWXCDOM9/3gk0riR11XAttbut8N1uSsz9Suy8LnrBJJDJCdVuV9sCLkjmA+Eg/fH2USMaRFvbhiwI5n3wouC7DE2gzLTWQesZ5ePJVNc3Z9RxBwjAAdZoZNiHcek574hkaWpmdzcgHrhvTsWryfWZ+tqFepZR6fkIrnjC0gYXv5j9mIwbM4KPDBgikg3B6YtAGeq7c74gycYhfx08S2R7Yg1iFW5gMTdFmdWFvxOfO+I2CF8ZiJhJVSyoS7XI64sBiLMSTPqdFe7Eb23xYQbHHSF0kjwFdB27HEjrBuNy8x+JG0I+17dsXMU6dIQszhQ4O5OJAEje3nGmVt8RenmVXiYbqR63wlqtNXb7x4M2vZmstq90HjyglQYo5ZEjpoUsSQwW5Fz0vidPoq0Is5J9ZXW+1tQ4avgD0nRclooKKhiSFdjpve29xff74AxyxJm3pqlrqAHlDHdkLAcr9cVhIHWATzPE+yhCbqbHliRKvISXLIGp6iVGkiddDXRuZZrG98XzFyB3jHIPDmXTx01Q6ScRIy2z7MQxG49RgbMYVK1IzNGYF52MbOQjg3CgbW7YuM+coTuOJLyO9PeSBjGbPspsNuvviYNht6SXzSomnjeSSRi2k73525YqZ0b5E4nymmkkjUsVIJ33sSO+Ok4n/2Q=="
                alt="Mapa de Hoenn"
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Gen III</p>
              <p className="text-xl md:text-3xl font-black text-card-foreground">HOENN</p>
              <p className="text-sm text-card-foreground/50 mt-1">135 Pokémon</p>
            </div>
            <div className="absolute inset-0 rounded-3xl bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
            <span
              role="button"
              tabIndex={0}
              data-pokedex-region="hoenn"
              onClick={(e) => {
                e.stopPropagation();
                setPokedexRegion('hoenn');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setPokedexRegion('hoenn');
                }
              }}
              className="relative z-20 w-full mt-auto px-3 py-2 rounded-xl bg-secondary/20 border-2 border-secondary/40 text-secondary font-black text-sm hover:bg-secondary/30 transition-colors"
            >
              📕 POKÉDEX
            </span>
          </button>
          {/* sinnoh */}
          <button
            onClick={() => startGame('sinnoh')}
            data-testid="button-region-sinnoh"
            className="group relative w-full h-[285px] md:h-[390px] bg-card rounded-2xl md:rounded-3xl border-2 md:border-4 border-white/20 shadow-2xl p-3 md:p-6 flex flex-col items-center justify-between gap-2 md:gap-4 hover:scale-[1.02] md:hover:scale-105 hover:border-primary/60 transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <div className="w-full h-28 md:h-40 rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center bg-blue-950/30">
              <img
                src="data:image/jpeg;base64,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"
                alt="Mapa de Sinnoh"
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Gen IV </p>
              <p className="text-xl md:text-3xl font-black text-card-foreground">SINNOH</p>
              <p className="text-sm text-card-foreground/50 mt-1">135 Pokémon</p>
            </div>
            <div className="absolute inset-0 rounded-3xl bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
            <span
              role="button"
              tabIndex={0}
              data-pokedex-region="sinnoh"
              onClick={(e) => {
                e.stopPropagation();
                setPokedexRegion('sinnoh');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setPokedexRegion('sinnoh');
                }
              }}
              className="relative z-20 w-full mt-auto px-3 py-2 rounded-xl bg-secondary/20 border-2 border-secondary/40 text-secondary font-black text-sm hover:bg-secondary/30 transition-colors"
            >
              📕 POKÉDEX
            </span>
          </button>
          {/* teselia */}
          <button
            onClick={() => startGame('teselia')}
            data-testid="button-region-teselia"
            className="group relative w-full h-[285px] md:h-[390px] bg-card rounded-2xl md:rounded-3xl border-2 md:border-4 border-white/20 shadow-2xl p-3 md:p-6 flex flex-col items-center justify-between gap-2 md:gap-4 hover:scale-[1.02] md:hover:scale-105 hover:border-primary/60 transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <div className="w-full h-28 md:h-40 rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center bg-blue-950/30">
              <img
                src="data:image/jpeg;base64,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"
                alt="Mapa de Teselia"
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Gen V </p>
              <p className="text-xl md:text-3xl font-black text-card-foreground">TESELIA</p>
              <p className="text-sm text-card-foreground/50 mt-1">156 Pokémon</p>
            </div>
            <div className="absolute inset-0 rounded-3xl bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
            <span
              role="button"
              tabIndex={0}
              data-pokedex-region="teselia"
              onClick={(e) => {
                e.stopPropagation();
                setPokedexRegion('teselia');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setPokedexRegion('teselia');
                }
              }}
              className="relative z-20 w-full mt-auto px-3 py-2 rounded-xl bg-secondary/20 border-2 border-secondary/40 text-secondary font-black text-sm hover:bg-secondary/30 transition-colors"
            >
              📕 POKÉDEX
            </span>


          </button>
          {/* kalos */}
          <button
            onClick={() => startGame('kalos')}
            data-testid="button-region-kalos"
            className="group relative w-full h-[285px] md:h-[390px] bg-card rounded-2xl md:rounded-3xl border-2 md:border-4 border-white/20 shadow-2xl p-3 md:p-6 flex flex-col items-center justify-between gap-2 md:gap-4 hover:scale-[1.02] md:hover:scale-105 hover:border-primary/60 transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <div className="w-full h-28 md:h-40 rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center bg-blue-950/30">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMvfQJcRMO9eEjuGvsM-hvGhoSf3T7zaE4Lqwz_en55w&s=10"
                alt="Mapa de Kalos"
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Gen VI </p>
              <p className="text-xl md:text-3xl font-black text-card-foreground">KALOS</p>
              <p className="text-sm text-card-foreground/50 mt-1">72 Pokémon</p>
            </div>
            <div className="absolute inset-0 rounded-3xl bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
            <span
              role="button"
              tabIndex={0}
              data-pokedex-region="kalos"
              onClick={(e) => {
                e.stopPropagation();
                setPokedexRegion('kalos');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setPokedexRegion('kalos');
                }
              }}
              className="relative z-20 w-full mt-auto px-3 py-2 rounded-xl bg-secondary/20 border-2 border-secondary/40 text-secondary font-black text-sm hover:bg-secondary/30 transition-colors"
            >
              📕 POKÉDEX
            </span>
         </button>
         {/* alola */}
           <button
             onClick={() => startGame('alola')}
             data-testid="button-region-alola"
             className="group relative w-full h-[285px] md:h-[390px] bg-card rounded-2xl md:rounded-3xl border-2 md:border-4 border-white/20 shadow-2xl p-3 md:p-6 flex flex-col items-center justify-between gap-2 md:gap-4 hover:scale-[1.02] md:hover:scale-105 hover:border-primary/60 transition-all duration-200 cursor-pointer overflow-hidden"
           >
             <div className="w-full h-28 md:h-40 rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center bg-blue-950/30">
               <img
                 src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLM3mp2KNOt01TmEenF1JuB6IZBpswY8HJX9vU6mU9Xw&s=10"
                 alt="Mapa de Kalos"
                 className="w-full h-full object-cover"
                 style={{ imageRendering: 'pixelated' }}
               />
             </div>
             <div className="text-center">
               <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Gen VII </p>
               <p className="text-xl md:text-3xl font-black text-card-foreground">ALOLA</p>
               <p className="text-sm text-card-foreground/50 mt-1">88 Pokémon</p>
             </div>
             <div className="absolute inset-0 rounded-3xl bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
            <span
              role="button"
              tabIndex={0}
              data-pokedex-region="alola"
              onClick={(e) => {
                e.stopPropagation();
                setPokedexRegion('alola');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setPokedexRegion('alola');
                }
              }}
              className="relative z-20 w-full mt-auto px-3 py-2 rounded-xl bg-secondary/20 border-2 border-secondary/40 text-secondary font-black text-sm hover:bg-secondary/30 transition-colors"
            >
              📕 POKÉDEX
            </span>
          </button>
         {/* galar */}
          <button
            onClick={() => startGame('galar')}
            data-testid="button-region-galar"
            className="group relative w-full h-[285px] md:h-[390px] bg-card rounded-2xl md:rounded-3xl border-2 md:border-4 border-white/20 shadow-2xl p-3 md:p-6 flex flex-col items-center justify-between gap-2 md:gap-4 hover:scale-[1.02] md:hover:scale-105 hover:border-primary/60 transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <div className="w-full h-28 md:h-40 rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center bg-blue-950/30">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbUHITKwN1BtIsPa1LYDOCzPi3qBqiftkFzjuf8a9HmA&s=10"
                alt="Mapa de Galar"
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Gen VIII </p>
              <p className="text-xl md:text-3xl font-black text-card-foreground">GALAR/HISUI</p>
              <p className="text-sm text-card-foreground/50 mt-1">96 Pokémon</p>
            </div>
            <div className="absolute inset-0 rounded-3xl bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
            <span
              role="button"
              tabIndex={0}
              data-pokedex-region="galar"
              onClick={(e) => {
                e.stopPropagation();
                setPokedexRegion('galar');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setPokedexRegion('galar');
                }
              }}
              className="relative z-20 w-full mt-auto px-3 py-2 rounded-xl bg-secondary/20 border-2 border-secondary/40 text-secondary font-black text-sm hover:bg-secondary/30 transition-colors"
            >
              📕 POKÉDEX
            </span>
         </button>
         {/* paldea */}
           <button
             onClick={() => startGame('paldea')}
             data-testid="button-region-paldea"
             className="group relative w-full h-[285px] md:h-[390px] bg-card rounded-2xl md:rounded-3xl border-2 md:border-4 border-white/20 shadow-2xl p-3 md:p-6 flex flex-col items-center justify-between gap-2 md:gap-4 hover:scale-[1.02] md:hover:scale-105 hover:border-primary/60 transition-all duration-200 cursor-pointer overflow-hidden"
           >
             <div className="w-full h-28 md:h-40 rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center bg-blue-950/30">
               <img
                 src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXjzBaZTYDfc-Z0lWKPE744CXcsJcuzFeUgHCr_sdE6g&s=10"
                 alt="Mapa de Ga"
                 className="w-full h-full object-cover"
                 style={{ imageRendering: 'pixelated' }}
               />
             </div>
             <div className="text-center">
               <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Gen IX </p>
               <p className="text-xl md:text-3xl font-black text-card-foreground">PALDEA</p>
               <p className="text-sm text-card-foreground/50 mt-1">103 Pokémon</p>
             </div>
             <div className="absolute inset-0 rounded-3xl bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
            <span
              role="button"
              tabIndex={0}
              data-pokedex-region="paldea"
              onClick={(e) => {
                e.stopPropagation();
                setPokedexRegion('paldea');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setPokedexRegion('paldea');
                }
              }}
              className="relative z-20 w-full mt-auto px-3 py-2 rounded-xl bg-secondary/20 border-2 border-secondary/40 text-secondary font-black text-sm hover:bg-secondary/30 transition-colors"
            >
              📕 POKÉDEX
            </span>
          </button>
         {/* todos */}
          <button
            onClick={() => startGame('todos')}
            data-testid="button-region-todos"
            className="group relative w-full h-[285px] md:h-[390px] bg-card rounded-2xl md:rounded-3xl border-2 md:border-4 border-white/20 shadow-2xl p-3 md:p-6 flex flex-col items-center justify-between gap-2 md:gap-4 hover:scale-[1.02] md:hover:scale-105 hover:border-primary/60 transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <div className="w-full h-28 md:h-40 rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center bg-blue-950/30">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7Ao2xP9BPbTKbFv1A1tSIhqaIt39h1-PPZqEzDzOsPA&s=10"
                alt="Mapa de Ga"
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">All  </p>
              <p className="text-xl md:text-3xl font-black text-card-foreground">TODOS</p>
              <p className="text-sm text-card-foreground/50 mt-1">1025 Pokémon</p>
            </div>
            <div className="absolute inset-0 rounded-3xl bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
            <span
              role="button"
              tabIndex={0}
              data-pokedex-region="todos"
              onClick={(e) => {
                e.stopPropagation();
                setPokedexRegion('todos');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setPokedexRegion('todos');
                }
              }}
              className="relative z-20 w-full mt-auto px-3 py-2 rounded-xl bg-secondary/20 border-2 border-secondary/40 text-secondary font-black text-sm hover:bg-secondary/30 transition-colors"
            >
              📕 POKÉDEX
            </span>
         </button>
       </div>
        {pokedexRegion && (
          <div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPokedexRegion(null)}
          >
            <div
              className="w-full max-w-6xl max-h-[88vh] overflow-hidden bg-card rounded-3xl border-4 border-white/20 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 p-5 md:p-6 border-b border-white/10">
                <div>
                  <p className="text-xs font-bold text-secondary uppercase tracking-widest">Pokédex</p>
                  <h2 className="text-2xl md:text-3xl font-black text-card-foreground uppercase">
                    {pokedexRegion}
                  </h2>
                  <p className="text-sm text-card-foreground/60 mt-1">
                    {Object.keys(REGION_DATA[pokedexRegion]).filter(isPokemonDiscovered).length}
                    {' / '}
                    {Object.keys(REGION_DATA[pokedexRegion]).length} descubiertos
                    {' · '}
                    ✨ {Object.keys(REGION_DATA[pokedexRegion]).filter(isPokemonShinyDiscovered).length} shiny
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPokedexRegion(null)}
                  className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl font-black transition-colors"
                  aria-label="Cerrar Pokédex"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto p-4 md:p-6">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {Object.keys(REGION_DATA[pokedexRegion]).map((pokemonName) => {
                    const discovered = isPokemonDiscovered(pokemonName);
                    const shinyDiscovered = isPokemonShinyDiscovered(pokemonName);
                    return (
                      <div
                        key={pokemonName}
                        className={`relative rounded-2xl border p-2 min-h-[132px] flex flex-col items-center justify-center text-center transition-all ${
                          shinyDiscovered
                            ? 'bg-yellow-400/10 border-yellow-400/60 shadow-[0_0_18px_rgba(250,204,21,0.18)]'
                            : discovered
                              ? 'bg-secondary/10 border-secondary/30'
                              : 'bg-black/20 border-white/10'
                        }`}
                      >
                        {shinyDiscovered && (
                          <span className="absolute top-1.5 right-1.5 rounded-full bg-yellow-400 px-1.5 py-0.5 text-[9px] font-black text-black">
                            ✨ SHINY
                          </span>
                        )}
                        <img
                          src={shinyDiscovered ? getPokemonShinySprite(pokemonName) : getPokemonSprite(pokemonName)}
                          alt={discovered ? `${pokemonName}${shinyDiscovered ? ' shiny' : ''}` : 'Pokémon no descubierto'}
                          className={`w-20 h-20 object-contain ${
                            discovered ? '' : 'grayscale opacity-35 brightness-50'
                          }`}
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <p className={`mt-1 text-xs font-black leading-tight ${
                          shinyDiscovered
                            ? 'text-yellow-300'
                            : discovered
                              ? 'text-card-foreground'
                              : 'text-card-foreground/30'
                        }`}>
                          {discovered ? pokemonName : '???'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 text-white/40 text-sm font-medium tracking-wide flex items-down gap-2 z-10">
          <PlayCircle className="w-4 h-4" /> Gen I ,II ,III, IV, V, VI, VII, VIII & IX Edition
        </div>
      </div>
        );
  }

  // ─── Game screen ───────────────────────────────────────────────
  const regionData = REGION_DATA[region];
  const targetClean = normalizePokemonKey(target);
  const attemptsLeft = MAX_ATTEMPTS - guesses.length;
  const hints = regionData[target] ?? [];
  const spriteUrl = isShinyTarget ? getPokemonShinySprite(target) : getPokemonSprite(target);
  const regionScore = score[region];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (status !== 'playing' || !currentGuess.trim()) return;

    const guessClean = normalizePokemonKey(currentGuess);
    const newGuesses = [...guesses, guessClean];
    const isFirstGuess = guesses.length === 0;
    let workingStats = gameStats;

    // "Hay más Pokémon": cuenta el PRIMER intento de cualquier Pokémon en 10 partidas.
    if (isFirstGuess) {
      workingStats = {
        ...workingStats,
        firstGuessGames: workingStats.firstGuessGames + 1,
      };
    }

    setGuesses(newGuesses);
    setCurrentGuess('');

    if (guessClean === targetClean) {
      setStatus('won');

      const targetKey = normalizePokemonKey(target);
      const isLegendary = LEGENDARY_KEYS.has(targetKey);
      const nextLegendaryWins =
        isLegendary && !workingStats.legendaryWins.includes(targetKey)
          ? [...workingStats.legendaryWins, targetKey]
          : workingStats.legendaryWins;

      const nextStats: GameStats = {
        ...workingStats,
        played: workingStats.played + 1,
        won: workingStats.won + 1,
        failStreak: 0,
        noHintWins: workingStats.noHintWins + (newGuesses.length === 1 ? 1 : 0),
        legendaryWins: nextLegendaryWins,
        shinyWins: workingStats.shinyWins + (isShinyTarget ? 1 : 0),
      };
      saveGameStats(nextStats);

      unlockPokemon(target);

      // Recompensa normal por acertar.
      addPokecuartos(10);

      // Un encuentro tiene un 5 % de probabilidad de ser shiny.
      // Solo se registra y paga la bonificación si lo adivinas.
      if (isShinyTarget) {
        unlockShinyPokemon(target);
        addPokecuartos(50);
      }

      setScore(s => ({
        ...s,
        [region]: {
          won: s[region].won + 1,
          total: s[region].total + 1,
        },
      }));
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setStatus('lost');

      const nextStats: GameStats = {
        ...workingStats,
        played: workingStats.played + 1,
        failStreak: workingStats.failStreak + 1,
      };
      saveGameStats(nextStats);

      setScore(s => ({
        ...s,
        [region]: {
          ...s[region],
          total: s[region].total + 1,
        },
      }));
    } else {
      if (workingStats !== gameStats) {
        saveGameStats(workingStats);
      }
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  const AttemptDot = ({ state }: { state: 'unused' | 'used' }) => (
    <div className={`relative w-8 h-8 rounded-full border-2 transition-all duration-300 ${
      state === 'unused'
        ? 'border-primary bg-primary/20 scale-100 shadow-[0_0_10px_rgba(255,203,5,0.3)]'
        : 'border-muted-foreground bg-muted-foreground/30 scale-90 opacity-50 grayscale'
    }`}>
      <div className={`absolute top-0 left-0 w-full h-1/2 rounded-t-full border-b-2 ${
        state === 'unused' ? 'bg-primary border-primary' : 'bg-muted-foreground border-muted-foreground'
      }`} />
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 bg-background z-10 ${
        state === 'unused' ? 'border-primary' : 'border-muted-foreground'
      }`} />
    </div>
  );

  const suggestions = getSuggestions(currentGuess, regionData);

  return (
    <div className="min-h-screen w-full flex flex-col items-center pt-28 pb-12 md:py-12 px-4 relative overflow-hidden">
      {overlayUI}
      <div className="fixed top-14 md:top-4 right-2 md:right-4 z-50 flex items-center gap-2 md:gap-3">
        <div className="bg-black/40 backdrop-blur-sm border border-yellow-400/30 rounded-full px-3 md:px-4 py-2 text-[11px] md:text-base text-yellow-300 font-black shadow-lg">
          🪙 {pokecuartos} Pokécuartos
        </div>
        <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-3 md:px-4 py-2 text-[11px] md:text-base text-white font-black shadow-lg">
          🔥 Racha: {visitStreak} {visitStreak === 1 ? 'día' : 'días'}
        </div>
      </div>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary/30 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-8 z-10">
        <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="font-bold text-white tracking-wide">
            {regionScore.won} <span className="text-white/50 text-sm">/ {regionScore.total}</span>
          </span>
        </div>

        {/* Region badge + change button */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full font-black text-sm tracking-widest border-2 ${
            region === 'kanto'
              ? 'bg-primary/20 border-primary text-primary'
              : 'bg-secondary/30 border-secondary text-secondary'
          }`}>
            {region.toUpperCase()}
          </span>
          <button
            onClick={() => setRegion(null)}
            className="text-white/50 hover:text-white text-xs font-semibold underline transition-colors"
          >
            Cambiar
          </button>
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-black text-primary text-center mb-8 tracking-tight text-shadow-poke z-10">
        🔥 ADIVINA EL POKÉMON 🔥
      </h1>

      <div className="w-full max-w-2xl bg-card rounded-[2rem] shadow-xl border-4 border-white/20 p-6 md:p-10 relative z-10 flex flex-col items-center">

        {/* Sprite Area */}
        <div className="relative w-48 h-48 md:w-56 md:h-56 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-secondary/10 rounded-full animate-pulse-slow" />
          {status !== 'playing' ? (
            <img
              src={spriteUrl}
              alt={target}
              className={`w-full h-full object-contain transition-all duration-700 ${
                status === 'won'
                  ? 'reveal-win drop-shadow-[0_0_20px_rgba(255,203,5,0.8)]'
                  : 'reveal-loss drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]'
              }`}
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <BallSprite ballId={equippedBall} />
          )}
        </div>

        {/* Status Messages */}
        {status === 'won' && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 text-center mb-8 w-full">
            <h2 className="text-3xl font-black text-[#22c55e] mb-2 drop-shadow-md">¡ACERTASTE! 🎉</h2>
            <p className="text-xl font-bold text-card-foreground">
              Era
              <span className="text-primary font-black uppercase text-2xl bg-secondary px-3 py-1 rounded-lg ml-2">
                {target}
              </span>
            </p>
            {isShinyTarget && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-yellow-400/60 bg-yellow-400/10 px-4 py-2 font-black text-yellow-300 shadow-lg">
                ✨ ¡SHINY! 🪙 +50 Pokécuartos
              </div>
            )}
          </div>
        )}
        {status === 'lost' && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 text-center mb-8 w-full">
            <h2 className="text-3xl font-black text-destructive mb-2 drop-shadow-md">Perdiste 😭</h2>
            <p className="text-xl font-bold text-card-foreground">
              Era
              <span className="text-primary font-black uppercase text-2xl bg-secondary px-3 py-1 rounded-lg ml-2">
                {target}
              </span>
            </p>
            {isShinyTarget && (
              <p className="mt-4 font-black text-yellow-300">
                ✨ Era shiny. Solo se guarda en la Pokédex si lo adivinas.
              </p>
            )}
          </div>
        )}

        {/* Game UI */}
        {status === 'playing' ? (
          <div className="w-full flex flex-col items-center">
            <div className="flex gap-3 mb-6">
              {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                <AttemptDot key={i} state={i < attemptsLeft ? 'unused' : 'used'} />
              ))}
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-md relative mb-8">
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  value={currentGuess}
                  onChange={(e) => setCurrentGuess(e.target.value)}
                  placeholder="¿Quién es ese Pokémon?"
                  className="w-full h-16 pl-6 pr-32 text-xl font-bold rounded-2xl border-4 border-secondary/20 focus-visible:border-secondary focus-visible:ring-secondary/30 shadow-inner bg-white text-gray-900 placeholder:text-gray-400 text-center"
                  autoComplete="off"
                  autoFocus
                  data-testid="input-guess"
                />
                <Button
                  type="submit"
                  disabled={!currentGuess.trim()}
                  className="absolute right-2 top-2 bottom-2 h-auto px-6 rounded-xl font-black text-secondary-foreground bg-primary hover:bg-primary/90 shadow-[0_4px_0_0_rgba(200,150,0,1)] active:shadow-[0_0px_0_0_rgba(200,150,0,1)] active:translate-y-1 transition-all"
                  data-testid="button-submit"
                >
                  <Search className="w-5 h-5 mr-1" />
                  DILO
                </Button>
              </div>

              {/* Autocomplete */}
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-secondary/20 overflow-hidden z-50">
                  {suggestions.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setCurrentGuess(name);
                        inputRef.current?.focus();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-secondary/10 transition-colors text-left border-b border-gray-100 last:border-b-0"
                    >
                      <img
                        src={getPokemonSprite(name)}
                        alt={name}
                        className="w-10 h-10 object-contain"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <span className="font-bold text-gray-900 text-lg">{name}</span>
                    </button>
                  ))}
                </div>
              )}
            </form>

            <div className="w-full flex flex-col gap-3">
              {guesses.map((guess, i) => (
                <div key={i} className="animate-in slide-in-from-right-8 fade-in duration-300 w-full bg-secondary/5 border-2 border-secondary/20 rounded-xl p-4 flex items-start gap-4 shadow-sm">
                  <div className="bg-destructive/10 text-destructive font-bold px-2 py-1 rounded-md text-xs whitespace-nowrap border border-destructive/20 mt-1">
                    Intento {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-card-foreground/50 line-through decoration-destructive decoration-2 mb-1">{guess}</p>
                    <div className="flex items-start gap-2 text-secondary-foreground bg-secondary px-4 py-2 rounded-lg text-sm font-medium leading-relaxed shadow-inner">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 opacity-80" />
                      <p>{hints[i]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button
              onClick={initGame}
              className="h-16 px-8 rounded-2xl font-black text-xl text-secondary-foreground bg-primary hover:bg-primary/90 shadow-[0_6px_0_0_rgba(200,150,0,1)] active:shadow-[0_0px_0_0_rgba(200,150,0,1)] active:translate-y-[6px] transition-all flex items-center gap-3"
              data-testid="button-new-game"
            >
              <RotateCcw className="w-6 h-6" />
              NUEVA PARTIDA
            </Button>
            <Button
              onClick={() => setRegion(null)}
              variant="outline"
              className="h-16 px-8 rounded-2xl font-black text-xl border-4 border-white/20 text-card-foreground hover:bg-secondary/10 transition-all flex items-center gap-3"
              data-testid="button-change-region"
            >
              Cambiar región
            </Button>
          </div>
        )}
      </div>

      <div className="mt-12 text-white/50 text-sm font-medium tracking-wide flex items-center gap-2">
        <PlayCircle className="w-4 h-4" /> Gen I &amp; II,III, IV, V, VI, VII, VIII & IXEdition
      </div>
    </div>
  );
}
