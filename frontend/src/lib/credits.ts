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

export type LicenceKind = 'CC0' | 'Free (no attribution)' | 'Free (attribution required)' | 'ISC' | 'MIT';

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
    usage:
      'Hero, category, and data-viz illustrations across Home, Dashboard, Subscriptions, Analytics, and Settings — including the savings-goal, projection, empty-wallet, control-panel, reviews, and security states.',
  },
  {
    name: 'Storyset',
    author: 'Freepik',
    url: 'https://storyset.com',
    licence: 'Free (attribution required)',
    attributionRequired: true,
    usage:
      'Pana-style potted-plant and finance illustrations on onboarding, pricing, empty states, profile, and the Analytics hero. Attribution required and displayed on the About page.',
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
  {
    name: 'Open Peeps',
    author: 'Pablo Stanley',
    url: 'https://www.openpeeps.com',
    licence: 'CC0',
    attributionRequired: false,
    usage: 'Hand-drawn people illustrations for profile, welcome, and FAQ alternative illustrations.',
  },
  {
    name: 'Lukasz Adam',
    author: 'Lukasz Adam',
    url: 'https://lukaszadam.com/illustrations',
    licence: 'CC0',
    attributionRequired: false,
    usage: 'Minimal SVG illustrations for notifications, goals, settings, and alternative hero/empty states.',
  },
];


