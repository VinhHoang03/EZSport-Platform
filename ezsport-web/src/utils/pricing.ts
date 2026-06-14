export type PriceRange = {
  min: number;
  max: number;
};

const toVndAmount = (raw: string) => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return 0;

  const value = Number(digits);
  if (!Number.isFinite(value)) return 0;

  return value > 0 && value < 1000 ? value * 1000 : value;
};

export const parseVenuePriceRange = (priceText?: string, fallback?: number): PriceRange => {
  const prices = String(priceText || '')
    .match(/\d[\d.,]*/g)
    ?.map(toVndAmount)
    .filter(price => price > 0) ?? [];

  if (prices.length) {
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  const fallbackPrice = Number(fallback || 0);
  return {
    min: Number.isFinite(fallbackPrice) ? fallbackPrice : 0,
    max: Number.isFinite(fallbackPrice) ? fallbackPrice : 0,
  };
};
