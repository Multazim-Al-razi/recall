/**
 * Attribution registry for third-party visual assets.
 *
 * Every illustration / icon library used in Recall is listed here with its
 * licence and whether attribution is required. The About page renders this
 * list so authors are always credited. Resources were discovered via
 * TOOOLS.design (https://www.toools.design/free-open-source-illustrations).
 *
 * Add a new entry here BEFORE shipping any asset from a new source.
 */

export type LicenceKind = 'CC0' | 'Free (no attribution)' | 'Free (attribution required)' | 'ISC';

export interface Credit {
  /** Library / collection name. */
  name: string;
  /** Original author or maintainer. */
  author: string;
  /** Homepage. */
  url: string;
  /** Plain-language licence summary. */
  licence: LicenceKind;
  /** Whether we are obligated to display credit. */
  attributionRequired: boolean;
  /** Where / how it is used in Recall. */
  usage: string;
}

export const CREDITS: Credit[] = [
  {
    name: 'unDraw',
    author: 'Katerina Limpitsouni',
    url: 'https://undraw.co',
    licence: 'Free (no attribution)',
    attributionRequired: false,
    usage: 'Hero and category illustrations across Home, Dashboard, and Subscriptions.',
  },
  {
    name: 'Storyset',
    author: 'Freepik',
    url: 'https://storyset.com',
    licence: 'Free (attribution required)',
    attributionRequired: true,
    usage: 'Pana-style potted-plant and finance illustrations on onboarding, pricing, empty states, and profile.',
  },
  {
    name: 'Lucide',
    author: 'Lucide Contributors',
    url: 'https://lucide.dev',
    licence: 'ISC',
    attributionRequired: false,
    usage: 'Interface icons — navigation, actions, trends, and statuses.',
  },
  {
    name: 'Simple Icons',
    author: 'Simple Icons Contributors',
    url: 'https://simpleicons.org',
    licence: 'CC0',
    attributionRequired: false,
    usage: 'Brand logos for subscription providers (served via cdn.simpleicons.org).',
  },
  {
    name: 'Inter',
    author: 'Rasmus Andersson',
    url: 'https://rsms.me/inter/',
    licence: 'Free (no attribution)',
    attributionRequired: false,
    usage: 'Primary typeface across the entire interface.',
  },
];

/**
 * Resources curated from TOOOLS.design that are cleared for future use.
 * Surfaced on the About page so contributors know which wells are safe to
 * draw from — and which require crediting the author.
 */
export interface ResourceTip {
  name: string;
  url: string;
  note: string;
  attributionRequired: boolean;
}

export const APPROVED_RESOURCES: ResourceTip[] = [
  {
    name: 'unDraw',
    url: 'https://undraw.co',
    note: 'Brand-colour-matched SVG illustrations. No attribution required.',
    attributionRequired: false,
  },
  {
    name: 'Open Doodles',
    url: 'https://www.opendoodles.com',
    note: 'Sketchy hand-drawn people. CC0 — public domain.',
    attributionRequired: false,
  },
  {
    name: 'Lukasz Adam',
    url: 'https://lukaszadam.com/illustrations',
    note: 'Free SVG illustrations for commercial use, no attribution.',
    attributionRequired: false,
  },
  {
    name: 'ManyPixels',
    url: 'https://www.manypixels.co/gallery',
    note: '2,800+ open-source vectors, personal and commercial use.',
    attributionRequired: false,
  },
  {
    name: 'Storyset',
    url: 'https://storyset.com',
    note: 'Customizable, animatable illustrations. Free WITH attribution to Storyset.',
    attributionRequired: true,
  },
  {
    name: 'Icons8 Ouch!',
    url: 'https://icons8.com/illustrations',
    note: 'High-quality vector + 3D illustrations. Free WITH attribution.',
    attributionRequired: true,
  },
  {
    name: 'Open Peeps',
    url: 'https://www.openpeeps.com',
    note: 'Hand-drawn mix-and-match people library. MIT license.',
    attributionRequired: false,
  },
  {
    name: 'Humaaans',
    url: 'https://www.humaaans.com',
    note: 'Mix-and-match diverse human characters. CC0 — public domain.',
    attributionRequired: false,
  },
  {
    name: 'Fresh Folk',
    url: 'https://freshfolk.com',
    note: 'Diverse, inclusive character illustrations. Free for commercial use.',
    attributionRequired: false,
  },
  {
    name: 'IRA Design',
    url: 'https://iradesign.io',
    note: 'Gradient-based illustrations with in-browser color customization. Free.',
    attributionRequired: false,
  },
  {
    name: 'DrawKit',
    url: 'https://drawkit.io',
    note: 'Hand-illustrated SVG sets. MIT license for free collections.',
    attributionRequired: false,
  },
  {
    name: 'illlustrations.co',
    url: 'https://illlustrations.co',
    note: '100+ everyday scene illustrations. MIT license.',
    attributionRequired: false,
  },
  {
    name: 'Blush Design',
    url: 'https://blush.design',
    note: 'Artist-illustrated diverse characters. Free WITH attribution.',
    attributionRequired: true,
  },
  {
    name: 'Streamline',
    url: 'https://streamlinehq.com',
    note: '160K+ icons and illustrations. CC BY 4.0 — free WITH attribution.',
    attributionRequired: true,
  },
  {
    name: 'Reshot',
    url: 'https://reshot.com',
    note: 'Clean, minimal vector illustrations. Free, no attribution.',
    attributionRequired: false,
  },
  {
    name: 'Avataaars',
    url: 'https://www.avataaars.com',
    note: 'Avatar generator with customizable features. MIT license.',
    attributionRequired: false,
  },
];
