import type { IllustrationKey } from '@/lib/visuals';

export type BlockType = 'paragraph' | 'heading' | 'list';

export interface Block {
  type: BlockType;
  text?: string;
  items?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date (yyyy-MM-dd). Formatted for display at render time. */
  date: string;
  author: string;
  /** Editorial category shown on list and detail. */
  category: string;
  /** Human-readable reading time, e.g. "4 min read". */
  readTime: string;
  illustration: IllustrationKey;
  takeaways: string[];
  blocks: Block[];
}

export const POSTS: BlogPost[] = [
  {
    slug: 'why-you-have-more-subscriptions-than-you-think',
    title: 'Why you have more subscriptions than you think',
    excerpt:
      'The average person underestimates their recurring spend by 40%. Here is where the gap hides and how to close it.',
    date: '2026-05-28',
    author: 'Recall Team',
    category: 'Spending',
    readTime: '4 min read',
    illustration: 'blog',
    takeaways: [
      'Most people carry 12+ subscriptions but only recall 7 or 8.',
      'Annual charges and free trials that converted are the most common blind spots.',
      'A five-minute audit can surface hundreds of dollars in forgotten spend.',
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'A 2025 study found that the average consumer underestimates their monthly subscription spend by nearly 40 percent. The gap is not random — it follows a pattern that anyone can uncover with a quick audit.',
      },
      { type: 'heading', text: 'Where the gap hides' },
      {
        type: 'paragraph',
        text: 'Annual charges are the biggest culprit. A $120-per-year plan feels small when you sign up, but twelve months later the charge lands and you do not remember subscribing. Free trials that quietly convert run a close second.',
      },
      {
        type: 'list',
        items: [
          'Streaming services stacked on top of each other.',
          'App subscriptions billed through the phone store.',
          'Annual renewals you set once and forgot.',
          'Free trials that converted without a reminder.',
          'Shared family plans you no longer use.',
        ],
      },
      { type: 'heading', text: 'How to close the gap' },
      {
        type: 'paragraph',
        text: 'Pull up your last three bank or credit-card statements. Highlight every recurring charge. Then open Recall and add each one — you will likely find three to five subscriptions you had forgotten about. That is money back in your pocket every month.',
      },
      {
        type: 'paragraph',
        text: 'Once everything is in Recall, set renewal reminders. You will never be surprised by a charge again, and you can decide with clear eyes which subscriptions are worth keeping.',
      },
    ],
  },
  {
    slug: 'free-trial-trap',
    title: 'The free-trial trap — and how to escape it',
    excerpt:
      'Free trials are designed to convert silently. A simple checklist to make sure you cancel before the first bill.',
    date: '2026-05-21',
    author: 'Recall Team',
    category: 'Tips',
    readTime: '3 min read',
    illustration: 'wallet',
    takeaways: [
      'Most free trials are structured to make you forget the cancel date.',
      'Setting a reminder in Recall the day you start a trial is the simplest defence.',
      'A calendar alert 48 hours before expiry gives you time to decide.',
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'Free trials feel like free money — until the first charge lands. Companies know that a significant percentage of users will forget to cancel, and they design the experience around that forgetfulness.',
      },
      { type: 'heading', text: 'Why trials convert so well' },
      {
        type: 'paragraph',
        text: 'The psychology is straightforward: once you have invested time setting up a service, the switching cost feels high. Combine that with a long gap between sign-up and billing, and the cancel date slips your mind.',
      },
      {
        type: 'list',
        items: [
          'The trial starts with a dopamine hit — you are exploring something new.',
          'No payment is taken, so your brain files it under "free".',
          'Weeks later, the charge arrives with no prior nudge.',
          'Cancelling feels like losing something you already use.',
        ],
      },
      { type: 'heading', text: 'The Recall defence' },
      {
        type: 'paragraph',
        text: 'The moment you start a trial, add it to Recall. Set the renewal date and enable a reminder for 48 hours before the trial ends. That single habit will save you from every surprise charge going forward.',
      },
      {
        type: 'paragraph',
        text: 'If you do decide to keep the subscription, you are making an active choice — not passively paying because you forgot.',
      },
    ],
  },
  {
    slug: 'local-first-why-data-privacy-matters',
    title: 'Local-first — why your financial data should stay on your device',
    excerpt:
      'Cloud sync is convenient, but your spending habits deserve privacy. Here is why Recall keeps everything local.',
    date: '2026-05-14',
    author: 'Recall Team',
    category: 'Privacy',
    readTime: '3 min read',
    illustration: 'privacy',
    takeaways: [
      'Your spending pattern is one of the most revealing data sets about you.',
      'Local-first means no server breach can expose your financial life.',
      'You can export and back up your data at any time — you are always in control.',
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'Every subscription you track reveals something about you — your habits, your priorities, your income level. When that data lives on a server, it is one breach away from being public. Recall takes a different approach.',
      },
      { type: 'heading', text: 'What local-first means' },
      {
        type: 'paragraph',
        text: 'All your data is stored in your browser using IndexedDB. Nothing is sent to a server. There is no account to create, no password to leak, no cloud database to hack. Your subscriptions stay on your device.',
      },
      {
        type: 'list',
        items: [
          'No account or sign-up required.',
          'Data lives in IndexedDB — your browser, your machine.',
          'No telemetry, no analytics tracking your behaviour.',
          'Export to JSON at any time from Settings.',
        ],
      },
      { type: 'heading', text: 'The trade-off' },
      {
        type: 'paragraph',
        text: 'The cost of local-first is that your data does not automatically sync across devices. You can use the export/import feature to move data between machines, and we may add opt-in sync in the future — but it will never be forced.',
      },
      {
        type: 'paragraph',
        text: 'Privacy is not a feature toggle. It is the foundation Recall is built on.',
      },
    ],
  },
  {
    slug: 'subscription-fatigue-and-how-to-beat-it',
    title: 'Subscription fatigue — and how to beat it',
    excerpt:
      'When every app wants a monthly fee, the mental load adds up. Here is how to simplify.',
    date: '2026-05-07',
    author: 'Recall Team',
    category: 'Guide',
    readTime: '5 min read',
    illustration: 'spend',
    takeaways: [
      'Subscription fatigue is real — the cognitive load of tracking recurring charges is draining.',
      'Consolidating overlapping services can cut your bill without sacrificing what you use.',
      'A monthly review ritual using Recall keeps the list lean and intentional.',
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'You subscribe to a music service, then a video service, then a cloud storage plan, then three productivity apps. Before long, you are paying for more than you use and the mental overhead of tracking it all becomes its own burden.',
      },
      { type: 'heading', text: 'What subscription fatigue feels like' },
      {
        type: 'paragraph',
        text: 'It is the vague anxiety when a charge notification pops up and you cannot remember what it is for. It is the guilt of knowing you are paying for things you do not use but not having the energy to sort through them.',
      },
      {
        type: 'list',
        items: [
          'You avoid checking your bank statement because it feels overwhelming.',
          'You have multiple services that do the same thing.',
          'You cannot remember the last time you used half your subscriptions.',
          'Cancelling feels like a chore, so you put it off.',
        ],
      },
      { type: 'heading', text: 'How to beat it' },
      {
        type: 'paragraph',
        text: 'Open Recall and sort your subscriptions by category. Look for overlaps — two streaming services, two cloud storage plans, three note-taking apps. Pick the one you actually use and cancel the rest. Then set a monthly reminder to review your list. Ten minutes a month is all it takes to stay in control.',
      },
      {
        type: 'paragraph',
        text: 'The goal is not to cancel everything. It is to make sure every charge is intentional. When you know exactly what you are paying for and why, subscriptions stop being a source of stress.',
      },
    ],
  },
];
