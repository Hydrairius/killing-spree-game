/**
 * Card image paths - PRD §6
 * Place images in public/assets/cards/ — see docs/CARD_ART_LIST.md
 */
const CARD_ASSETS_BASE = '/assets/cards';

/** Base ID from card (e.g. "katana_0" → "katana") */
export function getCardBaseId(cardId: string): string {
  return cardId.replace(/_\d+$/, '');
}

/** URL for a card's face image. Use .png; image may 404 if not yet added. */
export function getCardImageUrl(cardId: string): string {
  return `${CARD_ASSETS_BASE}/${getCardBaseId(cardId)}.png`;
}

/** URL for card back (draw pile, hidden cards). */
export function getCardBackUrl(): string {
  return `${CARD_ASSETS_BASE}/card_back.png`;
}
