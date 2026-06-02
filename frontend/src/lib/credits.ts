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
      'Every illustration in Recall — hero, category, onboarding, profile, blog, and data-viz states across Home, Dashboard, Subscriptions, Analytics, and Settings. All recoloured to the Rausch sienna accent.',
  },
  {
    name: 'Storyset',
    author: 'Freepik',
    url: 'https://storyset.com',
    licence: 'Free (attribution required)',
    attributionRequired: true,
    usage:
      'Character-rich illustrations on the About page (support, wallet, and autonomy scenes), recoloured to the Rausch sienna accent.',
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
    usage: 'Brand logos for subscription providers.',
  },
  {
    name: 'Inter',
    author: 'Rasmus Andersson',
    url: 'https://rsms.me/inter/',
    licence: 'Free (no attribution)',
    attributionRequired: false,
    usage: 'Body text, labels, buttons, and all numbers across the interface.',
  },
  {
    name: 'Fraunces',
    author: 'Undercase Type',
    url: 'https://fonts.google.com/specimen/Fraunces',
    licence: 'Free (no attribution)',
    attributionRequired: false,
    usage: 'Display serif for page titles and section headings.',
  },
];


