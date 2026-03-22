import type { Pet } from '../types/pet';

export type AnimalType =
  | 'cat'
  | 'dog'
  | 'bird'
  | 'fish'
  | 'rabbit'
  | 'hamster'
  | 'reptile'
  | 'other';
export type AnimalFilter = AnimalType | 'all';

const animalFilters: AnimalFilter[] = [
  'all',
  'cat',
  'dog',
  'bird',
  'fish',
  'rabbit',
  'hamster',
  'reptile',
  'other',
];

export const animalTypeLabels: Record<AnimalFilter, string> = {
  all: 'All Animals',
  cat: 'Cat',
  dog: 'Dog',
  bird: 'Bird',
  fish: 'Fish',
  rabbit: 'Rabbit',
  hamster: 'Hamster',
  reptile: 'Reptile',
  other: 'Other Animal',
};

export const animalTypePluralLabels: Record<AnimalFilter, string> = {
  all: 'All Animals',
  cat: 'Cats',
  dog: 'Dogs',
  bird: 'Birds',
  fish: 'Fish',
  rabbit: 'Rabbits',
  hamster: 'Hamsters',
  reptile: 'Reptiles',
  other: 'Other Animals',
};

export const ANIMAL_TYPES: AnimalType[] = [
  'cat', 'dog', 'bird', 'fish', 'rabbit', 'hamster', 'reptile', 'other',
];

// Words matched against a pet's name and description to figure out its animal type
const animalKeywords: Record<AnimalType, string[]> = {
  cat: ['cat', 'cats', 'kitten', 'kitty', 'feline'],
  dog: ['dog', 'dogs', 'puppy', 'pup', 'canine'],
  bird: ['bird', 'birds', 'parrot', 'parakeet', 'cockatiel'],
  fish: ['fish', 'goldfish', 'betta', 'guppy', 'tetra', 'koi'],
  rabbit: ['rabbit', 'rabbits', 'bunny', 'bunnies'],
  hamster: ['hamster', 'hamsters', 'gerbil', 'gerbils', 'guinea pig', 'guinea pigs'],
  reptile: ['reptile', 'reptiles', 'lizard', 'lizards', 'gecko', 'geckos', 'turtle', 'turtles', 'snake', 'snakes'],
  other: [],
};

// Manual type overrides for specific Pexels images where keyword matching would be wrong
const knownAnimalTypesByImageId: Record<string, AnimalType> = {
  '1108099': 'dog',
  '2607544': 'dog',
  '1851164': 'dog',
  '1741205': 'cat',
  '290204': 'cat',
  '895259': 'dog',
  '220938': 'dog',
  '53966': 'rabbit',
  '485294': 'dog',
  '1619690': 'dog',
  '2664417': 'dog',
  '126407': 'cat',
  '1591939': 'dog',
  '1390784': 'dog',
  '1383397': 'cat',
  '1521304': 'cat',
  '37337': 'cat',
  '326012': 'rabbit',
  '407037': 'reptile',
  '886210': 'fish',
  '56733': 'bird',
};

const classifiedAnimalTypes = animalFilters.filter((filter): filter is AnimalType => (
  filter !== 'all' && filter !== 'other'
));

function getPexelsImageId(imageUrl: string): string | null {
  const match = imageUrl.match(/\/photos\/(\d+)\//);
  return match?.[1] ?? null;
}

// Determines what kind of animal a pet is — checks the manual table first, then keywords
export function getAnimalType(pet: Pet): AnimalType {
  const imageId = getPexelsImageId(pet.imageUrl);
  if (imageId && knownAnimalTypesByImageId[imageId]) {
    return knownAnimalTypesByImageId[imageId];
  }

  const searchableText = `${pet.title} ${pet.description}`.toLocaleLowerCase();

  for (const animalType of classifiedAnimalTypes) {
    if (animalKeywords[animalType].some(keyword => searchableText.includes(keyword))) {
      return animalType;
    }
  }

  return 'other';
}

// Returns the display name for a pet's animal type (e.g. "Cat", "Dog")
export function getAnimalLabel(pet: Pet): string {
  return animalTypeLabels[getAnimalType(pet)];
}
