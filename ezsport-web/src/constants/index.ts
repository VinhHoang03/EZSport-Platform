export * from './routes';

export const SPORT_TYPES = ['Pickleball', 'Cầu lông'] as const;

export const USER_ROLES = {
  PLAYER: 'player',
  OWNER: 'owner',
  ADMIN: 'admin',
} as const;
