// The pet shape used everywhere in the app — "url" from the API becomes "imageUrl" here
export interface Pet {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  created: string;
  fileSize?: number; // Only known for pets whose image filename matches our size lookup table
}
