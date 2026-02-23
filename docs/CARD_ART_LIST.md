# Card Art Images to Generate — Killing Spree

Use this list when generating or commissioning card artwork. Each unique card needs one image. Multiple copies in the deck use the same art.

**Suggested specs:** 420×600 px (7:10 ratio) or similar card proportion; consistent style across all cards.

---

## Shared / UI Assets

| # | Asset | Description | Notes | Status |
|---|-------|-------------|-------|--------|
| 0 | **Card Back** (`card_back.png`) | Symmetrical red emblem on black background; dark grey metallic-style border. Central design: solid red circle, cross-shaped starburst, concentric rings, outer diagonal bursts. Action/tactical theme. | Used for draw pile and face-down hidden cards. **Display:** No CSS border (image has its own); `object-fit: contain` to prevent cropping. Source: 682×1024 px. | ✓ Done |

---

## Weapons (14 unique)

### Melee
| # | Card ID | Name |
|---|---------|------|
| 1 | katana | Katana |
| 2 | combat_knife | Combat Knife |
| 3 | baseball_bat | Baseball Bat |
| 4 | morning_star | Morning Star |
| 5 | chainsaw | Chainsaw |

### Ranged
| # | Card ID | Name |
|---|---------|------|
| 6 | glock | Glock |
| 7 | revolver | Revolver |
| 8 | 44_magnum | 44 Magnum |
| 9 | crossbow | Crossbow |
| 10 | assault_rifle | Assault Rifle |
| 11 | throwing_knives | Throwing Knives |
| 12 | bow | Bow |
| 13 | barrett_m82 | Barrett M82 |
| 14 | rocket_launcher | Rocket Launcher |

---

## Utility (13 unique)

| # | Card ID | Name |
|---|---------|------|
| 15 | medkit | Medkit |
| 16 | bandage | Bandage |
| 17 | bear_trap | Bear Trap |
| 18 | molotov | Molotov Cocktail |
| 19 | kevlar_vest | Kevlar Vest |
| 20 | chain_mail | Chain Mail |
| 21 | heavy_chestplate | Heavy Chestplate |
| 22 | dynamite | Dynamite |
| 23 | grenade | Grenade |
| 24 | petty_thief | Petty Thief |
| 25 | forgery | Forgery |
| 26 | adrenaline | Adrenaline |
| 27 | poison_dart | Poison Dart |

---

## Special (8 unique)

| # | Card ID | Name |
|---|---------|------|
| 28 | final_spree | Final Spree |
| 29 | healing_wish | Healing Wish |
| 30 | mecha_suit | Mecha Suit |
| 31 | war_elephant | War Elephant |
| 32 | dog_squad | Dog Squad |
| 33 | devils_blessing | Devil's Blessing |
| 34 | mass_panic | Mass Panic |
| 35 | execution_order | Execution Order |

---

## Hidden (8 unique)

| # | Card ID | Name |
|---|---------|------|
| 36 | land_mine | Land Mine |
| 37 | claymore | Claymore |
| 38 | poisonous_apple | Poisonous Apple |
| 39 | protective_bubble | Protective Bubble |
| 40 | magic_mirror | Magic Mirror |
| 41 | spike_trap | Spike Trap |
| 42 | shadow_dodge | Shadow Dodge |
| 43 | counterstrike | Counterstrike |

---

## Summary

| Category | Count |
|----------|-------|
| Card Back | 1 |
| Weapons | 14 |
| Utility | 13 |
| Special | 8 |
| Hidden | 8 |
| **Total** | **44 images** |

---

## Folder Location

**Put all card images in:**
```
public/assets/cards/
```

## File Naming

Use the card ID as the filename (`.png` or `.jpg`):
```
public/assets/cards/card_back.png    ← Draw pile & face-down hidden cards (✓ in place)
public/assets/cards/katana.png
public/assets/cards/medkit.png
public/assets/cards/spike_trap.png
public/assets/cards/devils_blessing.png
...
```

The game loads images from `/assets/cards/{id}.png`. If a file is missing, a styled placeholder is shown.
