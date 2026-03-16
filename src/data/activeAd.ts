/**
 * Active Ad Configuration
 *
 * ─────────────────────────────────────────────────────────────────
 * THIS IS THE FILE YOU EDIT TO SWITCH ADS.
 * ─────────────────────────────────────────────────────────────────
 *
 * To preview a different ad:
 *   1. Import a different example below
 *   2. Set it as the value of `activeAd`
 *   3. Save and the Remotion Studio will hot-reload
 *
 * To create a NEW ad:
 *   1. Duplicate one of the example files in ./examples/
 *   2. Edit the config values for your brand
 *   3. Import it here and set it as activeAd
 *
 * Examples available:
 *   - startupMarketplaceAd  →  dark startup, full 7-scene arc (~22s)
 *   - localServiceAd        →  white/green, local business, offer-forward (~15s)
 *   - appShowcaseAd         →  dark app, UI-focused, 5 scenes (~16s)
 */

import { sharedSalonChairAd }   from "./examples/sharedSalonChair";
// import { sharedSalonBetaAd }    from "./examples/sharedSalonBeta";
// import { startupMarketplaceAd } from "./examples/startupMarketplace";
// import { localServiceAd }       from "./examples/localService";
// import { appShowcaseAd }        from "./examples/appShowcase";

import { AdConfig } from "./types";

// ← Change this line to switch ads
export const activeAd: AdConfig = sharedSalonChairAd;
