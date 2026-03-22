import type { Pet } from '../types/pet';

export type Crew = {
  id: string;
  members: Pet[];
  name: string;
  tagline: string;
  since: string;
};

// Taglines for two-pet crews
const TAGLINES_PAIR = [
  'Partners in mischief',
  'Thick as thieves',
  'The dynamic duo',
  'Better together',
  'Two peas in a pod',
  'Trouble times two',
  'Besties for life',
  'Ride or die',
  'Double the trouble',
  'Goals honestly',
  'Partners in crime',
  'The inseparable pair',
  'Living their best lives',
  'Partners in everything',
  'A duo for the ages',
  'The original odd couple',
  'Totally unhinged, together',
  'Two legends, one timeline',
];

// Taglines for three-pet crews
const TAGLINES_TRIO = [
  'Three of a kind',
  'The trio everyone needs',
  'Good things come in threes',
  'Triple the chaos',
  'The gang is all here',
  'An unstoppable trio',
  'The trifecta',
  'Chaos incarnate',
  'The golden trio',
  'Mayhem, managed',
  'Three legends',
  'The dream team',
];

// Simple hash used to pick taglines and seed the random grouping — same input always gives same output
export function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function formatSince(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Friends since day one';
    return `Friends since ${d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  } catch {
    return 'Friends since day one';
  }
}

// Builds a crew object from a list of pets, generating the name, tagline, and "since" date
function makeCrew(members: Pet[]): Crew {
  const id = members.map(m => m.id.slice(0, 6)).sort().join('-');

  // Use short first names unless the pet title already names a pair
  const names = members.map(m => {
    const t = m.title.trim();
    return t.includes('&') ? t : t.split(/\s+/)[0];
  });
  const name =
    names.length === 2
      ? `${names[0]} & ${names[1]}`
      : `${names[0]}, ${names[1]} & ${names[2]}`;

  const crewHash = hashString(id);
  const taglines = members.length >= 3 ? TAGLINES_TRIO : TAGLINES_PAIR;
  const tagline = taglines[crewHash % taglines.length];

  const earliest = [...members]
    .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())[0]
    .created;

  return { id, members, name, tagline, since: formatSince(earliest) };
}

// Simple seeded PRNG (xorshift32) so crew groupings are stable for a given
// set of pets — same input always produces the same crews regardless of when
// or how many times buildCrews is called.
function makeRng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 0x100000000;
  };
}

// Groups all pets into crews of 2 or 3; always produces the same groupings for the same pet list
export function buildCrews(pets: Pet[]): Crew[] {
  if (pets.length < 2) return [];

  const seed = hashString(pets.map(p => p.id).sort().join(','));
  const rng = makeRng(seed);

  const MAX = 12;
  const usedIds = new Set<string>();
  const crews: Crew[] = [];

  // Guaranteed crew: Woody + Tim & Jim
  const woodyPet  = pets.find(p => p.title.trim() === 'Woody');
  const timJimPet = pets.find(p => p.title.trim() === 'Tim & Jim');
  if (woodyPet && timJimPet) {
    crews.push(makeCrew([woodyPet, timJimPet]));
    usedIds.add(woodyPet.id);
    usedIds.add(timJimPet.id);
  }

  // Shuffle the remaining pets with the seeded rng so the order is stable
  const pool = pets.filter(p => !usedIds.has(p.id));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Pull pets from the pool in groups of 2 or 3 — no pet ever repeats
  let i = 0;
  while (i < pool.length && crews.length < MAX) {
    const remaining = pool.length - i;
    if (remaining < 2) break;
    const size = remaining >= 3 && rng() > 0.45 ? 3 : 2;
    crews.push(makeCrew(pool.slice(i, i + size)));
    i += size;
  }

  return crews;
}
