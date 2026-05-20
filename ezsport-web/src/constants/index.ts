export * from './routes';

export const SPORT_TYPES = ['Pickleball', 'Cầu lông', 'Bóng đá', 'Tennis', 'Bóng rổ'] as const;

export const USER_ROLES = {
  PLAYER: 'player',
  OWNER: 'owner',
  ADMIN: 'admin',
} as const;
