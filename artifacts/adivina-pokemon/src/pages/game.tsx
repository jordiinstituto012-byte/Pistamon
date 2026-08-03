import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { pokemones, pokemonesJohto, getPokemonSprite } from '../data/pokemon';
import { Search, Trophy, RotateCcw, AlertCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Region = 'kanto' | 'johto';

const REGION_DATA: Record<Region, Record<string, string[]>> = {
  kanto: pokemones,
  johto: pokemonesJohto,
};

function getSuggestions(query: string, regionData: Record<string, string[]>): string[] {
  if (!query.trim()) return [];
  const q = query.trim().toLowerCase();
  return Object.keys(regionData)
    .filter(name => name.trim().toLowerCase().startsWith(q))
    .slice(0, 3);
}

const MAX_ATTEMPTS = 4;

// Pokeball SVG used in multiple places
function PokeBallSVG() {
  return (
    <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 drop-shadow-xl" aria-label="Poké Ball">
      <path d="M 5 50 A 45 45 0 0 1 95 50 Z" fill="#FF1111" />
      <path d="M 5 50 A 45 45 0 0 0 95 50 Z" fill="#FFFFFF" />
      <circle cx="50" cy="50" r="45" fill="none" stroke="#222" strokeWidth="5" />
      <rect x="5" y="46" width="90" height="8" fill="#222" />
      <circle cx="50" cy="50" r="14" fill="#FFFFFF" stroke="#222" strokeWidth="5" />
      <circle cx="50" cy="50" r="7" fill="#EEEEEE" />
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
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const startGame = (r: Region) => {
    const names = Object.keys(REGION_DATA[r]);
    const randomIndex = Math.floor(Math.random() * names.length);
    setRegion(r);
    setTarget(names[randomIndex]);
    setGuesses([]);
    setCurrentGuess('');
    setStatus('playing');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const initGame = () => {
    if (!region) return;
    startGame(region);
  };

  useEffect(() => {
    if (region) setTimeout(() => inputRef.current?.focus(), 100);
  }, [region]);

  // ─── Region selector ───────────────────────────────────────────
  if (!region) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary/30 rounded-full blur-[80px] pointer-events-none" />

        <h1 className="text-4xl md:text-5xl font-black text-primary text-center mb-4 tracking-tight z-10">
          🔥 ADIVINA EL POKÉMON 🔥
        </h1>
        <p className="text-white/70 text-lg font-semibold mb-12 z-10">Elige tu región para empezar</p>

        <div className="flex flex-col sm:flex-row gap-6 z-10">
          {/* Kanto */}
          <button
            onClick={() => startGame('kanto')}
            data-testid="button-region-kanto"
            className="group relative w-64 bg-card rounded-3xl border-4 border-white/20 shadow-2xl p-8 flex flex-col items-center gap-4 hover:scale-105 hover:border-primary/60 transition-all duration-200 cursor-pointer"
          >
            <div className="w-24 h-24 flex items-center justify-center">
              <PokeBallSVG />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Gen I</p>
              <p className="text-3xl font-black text-card-foreground">KANTO</p>
              <p className="text-sm text-card-foreground/50 mt-1">151 Pokémon</p>
            </div>
            <div className="absolute inset-0 rounded-3xl bg-primary/0 group-hover:bg-primary/5 transition-colors" />
          </button>

          {/* Johto */}
          <button
            onClick={() => startGame('johto')}
            data-testid="button-region-johto"
            className="group relative w-64 bg-card rounded-3xl border-4 border-white/20 shadow-2xl p-8 flex flex-col items-center gap-4 hover:scale-105 hover:border-primary/60 transition-all duration-200 cursor-pointer"
          >
            <div className="w-24 h-24 flex items-center justify-center">
              {/* Great Ball for Johto */}
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
                <path d="M 5 50 A 45 45 0 0 1 95 50 Z" fill="#3B4CCA" />
                <path d="M 5 50 A 45 45 0 0 1 30 14 L 38 28 A 28 28 0 0 0 23 50 Z" fill="#CC3333" />
                <path d="M 5 50 A 45 45 0 0 0 95 50 Z" fill="#FFFFFF" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#222" strokeWidth="5" />
                <rect x="5" y="46" width="90" height="8" fill="#222" />
                <circle cx="50" cy="50" r="14" fill="#FFFFFF" stroke="#222" strokeWidth="5" />
                <circle cx="50" cy="50" r="7" fill="#EEEEEE" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Gen II</p>
              <p className="text-3xl font-black text-card-foreground">JOHTO</p>
              <p className="text-sm text-card-foreground/50 mt-1">100 Pokémon</p>
            </div>
            <div className="absolute inset-0 rounded-3xl bg-primary/0 group-hover:bg-primary/5 transition-colors" />
          </button>
        </div>

        <div className="mt-16 text-white/40 text-sm font-medium tracking-wide flex items-center gap-2 z-10">
          <PlayCircle className="w-4 h-4" /> Gen I & II Edition
        </div>
      </div>
    );
  }

  // ─── Game screen ───────────────────────────────────────────────
  const regionData = REGION_DATA[region];
  const targetClean = target.trim().toLowerCase();
  const attemptsLeft = MAX_ATTEMPTS - guesses.length;
  const hints = regionData[target] ?? [];
  const spriteUrl = getPokemonSprite(target);
  const regionScore = score[region];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (status !== 'playing' || !currentGuess.trim()) return;

    const guessClean = currentGuess.trim().toLowerCase();
    const newGuesses = [...guesses, guessClean];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (guessClean === targetClean) {
      setStatus('won');
      setScore(s => ({ ...s, [region]: { won: s[region].won + 1, total: s[region].total + 1 } }));
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setStatus('lost');
      setScore(s => ({ ...s, [region]: { ...s[region], total: s[region].total + 1 } }));
    } else {
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
    <div className="min-h-screen w-full flex flex-col items-center py-12 px-4 relative overflow-hidden">
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
            <PokeBallSVG />
          )}
        </div>

        {/* Status Messages */}
        {status === 'won' && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 text-center mb-8 w-full">
            <h2 className="text-3xl font-black text-[#22c55e] mb-2 drop-shadow-md">¡ACERTASTE! 🎉</h2>
            <p className="text-xl font-bold text-card-foreground">Era <span className="text-primary font-black uppercase text-2xl bg-secondary px-3 py-1 rounded-lg ml-2">{target}</span></p>
          </div>
        )}
        {status === 'lost' && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 text-center mb-8 w-full">
            <h2 className="text-3xl font-black text-destructive mb-2 drop-shadow-md">Perdiste 😭</h2>
            <p className="text-xl font-bold text-card-foreground">Era <span className="text-primary font-black uppercase text-2xl bg-secondary px-3 py-1 rounded-lg ml-2">{target}</span></p>
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
        <PlayCircle className="w-4 h-4" /> Gen I &amp; II Edition
      </div>
    </div>
  );
}
