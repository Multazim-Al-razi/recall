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
    date: '2026-06-02',
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
    date: '2026-06-01',
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
      'Cloud is convenient, but your spending habits deserve privacy. Here is why Recall keeps everything local.',
    date: '2026-05-30',
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
    date: '2026-05-28',
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
  {
    slug: 'subscription-creep-how-small-charges-add-up',
    title: 'The $200/month problem: how subscription creep drains your budget',
    excerpt:
      'A $9 charge here, a $12 charge there — and suddenly your monthly burn is double what you expected. Here is the math behind subscription creep.',
    date: '2026-05-25',
    author: 'Recall Team',
    category: 'Spending',
    readTime: '4 min read',
    illustration: 'blog',
    takeaways: [
      'Small recurring charges under $15 are the hardest to notice and the easiest to forget.',
      'Subscription creep adds an average of $130–$200 per month to household bills over five years.',
      'Categorising your subscriptions in Recall makes the pattern visible at a glance.',
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'You sign up for a $9 productivity app. Two months later, a $12 design tool. Then a $7 cloud backup, a $15 music family plan, and a $5 news subscription. Individually, each charge feels trivial. Together, they add up to $48 per month — $576 per year — on services you may barely use.',
      },
      { type: 'heading', text: 'Why small charges hide so well' },
      {
        type: 'paragraph',
        text: 'Banks and credit-card statements group charges chronologically, not by type. A $9 charge buried between a grocery run and a gas fill-up disappears visually. Research from the Bureau of Labor Statistics shows that consumers underestimate their total recurring spend by 30–40%, and the gap is almost entirely made up of charges under $15.',
      },
      {
        type: 'list',
        items: [
          'Charges under $10 blend into daily spending and never trigger a second look.',
          'Annual plans that break down to a small monthly equivalent feel negligible.',
          'Bundled services (storage + music + video) hide the true cost per feature.',
          'Family plans split across members make individual cost opaque.',
        ],
      },
      { type: 'heading', text: 'How to spot the creep' },
      {
        type: 'paragraph',
        text: 'Open Recall and look at your category breakdown. If any single category exceeds 20% of your total monthly spend, drill in. You will often find two or three services doing the same job. Cancel the duplicates, and the "small" savings compound quickly — cutting $30/month is $360/year back in your pocket.',
      },
      {
        type: 'paragraph',
        text: 'Set a monthly review reminder in Recall. Even a five-minute check keeps the creep from building back up.',
      },
    ],
  },
  {
    slug: 'annual-vs-monthly-billing-when-to-commit',
    title: 'Annual vs monthly billing: the real math behind when to commit',
    excerpt:
      'Annual plans advertise 20% savings — but they lock you in for a year. Here is how to decide which billing cycle actually saves you money.',
    date: '2026-05-23',
    author: 'Recall Team',
    category: 'Guide',
    readTime: '5 min read',
    illustration: 'blog',
    takeaways: [
      'Annual plans save 15–25% on paper, but only if you use the service for the full year.',
      'Monthly billing is better for services you are still evaluating or use seasonally.',
      'Recall can flag which subscriptions are annual so you can plan the renewal ahead of time.',
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'Most SaaS companies push annual billing hard. The pitch is simple: pay for twelve months up front and save 20%. On a $15/month service, that is $36 saved per year. Sounds like a no-brainer — until you stop using the service in month four.',
      },
      { type: 'heading', text: 'The break-even calculation' },
      {
        type: 'paragraph',
        text: 'Before committing to an annual plan, ask: will I use this service for at least ten of the next twelve months? If the answer is uncertain, monthly billing is the better deal even at a higher per-month rate. The 20% "savings" vanish the moment you stop using the product.',
      },
      {
        type: 'list',
        items: [
          'Streaming services: go monthly if your viewing habits are seasonal.',
          'Productivity tools: annual only after 3+ months of consistent daily use.',
          'Cloud storage: annual makes sense if your data volume is stable.',
          'Fitness apps: monthly until you have a 6-month streak.',
        ],
      },
      { type: 'heading', text: 'How to track the difference' },
      {
        type: 'paragraph',
        text: 'In Recall, mark your annual subscriptions with the "yearly" billing cycle. The analytics view will show your annual commitments separately from monthly ones. Before each annual renewal, check whether the service earned another year of your money — or whether switching to monthly (or cancelling) makes more sense.',
      },
      {
        type: 'paragraph',
        text: 'The best deal is not the cheapest per month — it is the one that matches how you actually use the service.',
      },
    ],
  },
  {
    slug: 'ten-minute-subscription-audit',
    title: 'How to run a 10-minute subscription audit that saves real money',
    excerpt:
      'You do not need a spreadsheet or an hour of free time. Here is a focused audit routine that surfaces wasted spend in under ten minutes.',
    date: '2026-05-20',
    author: 'Recall Team',
    category: 'Tips',
    readTime: '3 min read',
    illustration: 'blog',
    takeaways: [
      'A focused 10-minute audit once a month catches most wasted spend.',
      'The three-question filter (use, overlap, value) eliminates decision paralysis.',
      'Recall makes the audit instant — your full subscription list is already in one place.',
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'Most people avoid auditing their subscriptions because it feels like a big project. It does not have to be. A ten-minute monthly check — done consistently — catches more waste than an annual deep dive you keep putting off.',
      },
      { type: 'heading', text: 'The three-question filter' },
      {
        type: 'paragraph',
        text: 'For each subscription in your list, ask three questions in order. If any answer is "no", that subscription is a candidate for cancellation.',
      },
      {
        type: 'list',
        items: [
          'Have I used this in the last 30 days?',
          'Does another subscription I already pay for do the same thing?',
          'Is the value I get worth more than the monthly cost?',
        ],
      },
      { type: 'heading', text: 'The 10-minute routine' },
      {
        type: 'paragraph',
        text: 'Open Recall. Sort by "last used" or by category. Run the three questions on each subscription. Cancel anything that fails. Set a recurring monthly reminder in Recall so the audit happens automatically. That is the entire routine.',
      },
      {
        type: 'paragraph',
        text: 'In practice, most people cancel two to three subscriptions in their first audit, saving $20–$50 per month. The monthly check takes five to ten minutes and prevents new creep from building up.',
      },
    ],
  },
  {
    slug: 'psychology-of-unused-subscriptions',
    title: 'Why we keep paying for subscriptions we never use',
    excerpt:
      'Behavioural economics explains why your gym membership, cloud storage, and streaming services survive long after you stop using them.',
    date: '2026-05-16',
    author: 'Recall Team',
    category: 'Spending',
    readTime: '4 min read',
    illustration: 'blog',
    takeaways: [
      'The endowment effect makes cancelling feel like a loss, even when you are not using the service.',
      'Status quo bias keeps subscriptions alive because changing anything requires effort.',
      'Making the cost visible in Recall breaks both biases by turning abstract charges into concrete numbers.',
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'You have a gym membership you have not used in four months. A cloud storage plan at half capacity. A second streaming service you opened exactly once. You know you should cancel — but you keep paying. Why?',
      },
      { type: 'heading', text: 'The endowment effect' },
      {
        type: 'paragraph',
        text: 'Behavioural economists call this the endowment effect: once you own something, you value it more than you would if you were buying it fresh. Cancelling a $12/month service feels like losing $12, even though you are gaining $12 back every month. The loss framing is powerful enough to keep millions of subscriptions alive across the economy.',
      },
      { type: 'heading', text: 'Status quo bias' },
      {
        type: 'paragraph',
        text: 'Even when you decide to cancel, the actual process — finding the cancellation page, clicking through retention offers, confirming — creates friction. Status quo bias means you default to doing nothing. Companies design their cancellation flows to exploit this exact psychology.',
      },
      {
        type: 'list',
        items: [
          'Endowment effect: "I might need it later" overvalues future utility.',
          'Status quo bias: cancelling requires effort, so you defer.',
          'Anchoring: the original price feels "right" even if usage drops.',
          'Sunk cost fallacy: "I already paid for the year" keeps you engaged with a dead service.',
        ],
      },
      { type: 'heading', text: 'Breaking the cycle' },
      {
        type: 'paragraph',
        text: 'The antidote is making the cost concrete. When Recall shows "$144/year" next to a service you have not used in months, the number is hard to ignore. Pair that with a monthly audit reminder, and the biases lose their grip — you start cancelling based on actual usage, not emotional attachment.',
      },
    ],
  },
  {
    slug: 'overlapping-services-the-hidden-doubled-spend',
    title: 'Stacking vs switching: the hidden cost of overlapping services',
    excerpt:
      'Two streaming services, three note apps, two cloud drives — overlapping subscriptions are the most common form of wasted spend. Here is how to spot and fix them.',
    date: '2026-05-12',
    author: 'Recall Team',
    category: 'Tips',
    readTime: '4 min read',
    illustration: 'blog',
    takeaways: [
      'The average household has 2–3 categories with overlapping subscriptions.',
      'Overlap waste averages $25–$40 per month — enough for a meaningful savings.',
      'Recall\'s category view makes overlaps visible at a glance.',
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'You subscribe to Netflix and Disney+ and HBO Max. You use Google Drive and Dropbox and iCloud. You have Notion and Obsidian and Apple Notes. Each pair overlaps in function, and you are paying full price for all of them.',
      },
      { type: 'heading', text: 'Where overlaps hide' },
      {
        type: 'paragraph',
        text: 'Overlaps are not always obvious. Two music services might have different catalogues, but you only listen to one. Two cloud drives might store different file types, but you could consolidate with ten minutes of file management. The overlap is not in the features — it is in the usage.',
      },
      {
        type: 'list',
        items: [
          'Streaming: check which service you actually watch most content on.',
          'Cloud storage: total your usage across all drives — you likely only need one plan.',
          'Productivity: pick the app you open daily and cancel the rest.',
          'News: one subscription usually covers the sources you actually read.',
          'Music: family plans often cover multiple services for less than two individual plans.',
        ],
      },
      { type: 'heading', text: 'The consolidation test' },
      {
        type: 'paragraph',
        text: 'For each category with multiple subscriptions, try a one-month experiment: cancel all but your most-used service. If you do not notice the missing ones after 30 days, keep them cancelled. If you do, you can always resubscribe — and now you know which one earns its place.',
      },
      {
        type: 'paragraph',
        text: 'Open Recall\'s category view and look for any category with more than two entries. That is almost always where the overlap waste lives.',
      },
    ],
  },
  {
    slug: 'building-a-subscription-budget',
    title: 'How to build a subscription budget that actually sticks',
    excerpt:
      'Most budget advice ignores recurring charges. Here is a simple framework that makes subscription spending predictable and intentional.',
    date: '2026-05-08',
    author: 'Recall Team',
    category: 'Guide',
    readTime: '5 min read',
    illustration: 'blog',
    takeaways: [
      'A subscription budget is a fixed monthly number — not "whatever auto-renews".',
      'The 5% rule: total subscriptions should not exceed 5% of your take-home pay.',
      'Recall\'s monthly burn KPI is the number to watch — keep it under your budget line.',
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'Traditional budgets focus on variable spending — groceries, gas, dining out. But recurring charges are the most predictable part of your monthly outflow, and the easiest to optimise. A subscription budget turns a vague category into a concrete number you can defend.',
      },
      { type: 'heading', text: 'The 5% rule' },
      {
        type: 'paragraph',
        text: 'Financial planners suggest that total recurring subscriptions should not exceed 5% of your monthly take-home pay. For someone earning $4,000/month after tax, that is $200. If your Recall monthly burn is above that number, you are over-subscribed relative to your income.',
      },
      {
        type: 'list',
        items: [
          'Calculate your take-home pay for the month.',
          'Multiply by 0.05 — that is your subscription budget.',
          'Check your Recall monthly burn against that number.',
          'If you are over, use the three-question audit to trim.',
          'Review quarterly as your income changes.',
        ],
      },
      { type: 'heading', text: 'Making it stick' },
      {
        type: 'paragraph',
        text: 'The budget only works if you check it. Set a monthly reminder in Recall to review your monthly burn. The KPI tile at the top of your dashboard shows the exact number — compare it to your 5% line. When a new subscription pushes you over, something else has to go.',
      },
      {
        type: 'paragraph',
        text: 'Over time, the budget becomes a filter: before adding a new subscription, you check whether it fits. That single habit prevents subscription creep more effectively than any annual audit.',
      },
    ],
  },
];
