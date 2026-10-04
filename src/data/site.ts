// All site copy, pricing and availability lives here.
// Brand name, prices and build weeks are the things you'll edit most.

export const brand = {
  name: 'Shipped', // product name — swap in one place
  parent: 'RemotoLabs', // Shipped is a RemotoLabs product (logo: public/brand/remotolabs.png)
  parentUrl: '#', // TODO: RemotoLabs website URL
  parentLine: 'A productized website studio by', // sits before the RemotoLabs logo in the hero
  theme: 'black' as 'black' | 'green', // colour scheme; 'green' = original dark green
  domain: 'shipped.studio',
  email: 'hello@shipped.studio',
  tagline: 'Websites without the agency.',
  callLink: '#book-a-call', // replace with your Cal.com / Calendly link
};

// Show the orange "Placeholder" tags on stand-in imagery. Off = clean preview.
export const showPlaceholderTags = false;

// ---------------------------------------------------------------------------
// Packages
// ---------------------------------------------------------------------------

export type PackageId = 'landing' | 'website' | 'websiteplus';

export interface Package {
  id: PackageId;
  name: string;
  price: number;
  priceLabel: string;
  days: string;
  pitch: string;
  bestFor: string;
  includes: string[];
  payment: string;
  depositPct: number;
  featured?: boolean;
  pages: number; // included pages
  sections: number; // included sections across all pages
  sitemap: { page: string; blocks: string[] }[]; // a typical build, shown at checkout
}

// What a "section" is, shown wherever scope is described.
export const sectionExplainer =
  'A section is one full-width block on a page: a hero, a feature grid, testimonials, a pricing table, an FAQ, a form. Blog posts and case studies share one template, so 50 posts still count once.';
export const extraPageSections = 6; // sections included with each extra page

export const packages: Package[] = [
  {
    id: 'landing',
    name: 'Landing',
    price: 1750,
    priceLabel: '$1,750',
    days: '5 business days',
    pitch: 'One page that does one job very well.',
    bestFor: 'Launches, campaigns, events, consultants, restaurants, new products.',
    includes: [
      'One page, up to 8 sections',
      'Page strategy & structure',
      'Copy assistance',
      'Custom visual design',
      'Motion & interactions',
      'Lead or contact form',
      'Basic SEO & analytics',
      'Domain connection & launch',
      '1 revision round',
    ],
    payment: 'Paid in full to reserve',
    depositPct: 100,
    pages: 1,
    sections: 8,
    sitemap: [
      { page: 'Landing page', blocks: ['Hero', 'Problem', 'How it works', 'Features', 'Proof', 'Offer', 'FAQ', 'Sign-up form'] },
    ],
  },
  {
    id: 'website',
    name: 'Website',
    price: 4000,
    priceLabel: '$4,000',
    days: '10 business days',
    pitch: 'A full company website. Strategy to launch.',
    bestFor: 'Startups, studios, SMBs and anyone overdue for a redesign.',
    includes: [
      'Up to 5 pages, 30 sections',
      'Sitemap & conversion structure',
      'Copywriting (first draft by us)',
      'Custom design',
      'CMS for blog, work or team',
      'Motion & interactions',
      'Forms & 2 integrations',
      'SEO foundations & analytics',
      'Domain setup & launch',
      '2 revision rounds',
    ],
    payment: '50% to reserve, 50% before launch',
    depositPct: 50,
    featured: true,
    pages: 5,
    sections: 30,
    sitemap: [
      { page: 'Home', blocks: ['Hero', 'Logos', 'Services', 'How it works', 'Featured work', 'Testimonials', 'FAQ', 'CTA'] },
      { page: 'About', blocks: ['Intro', 'Story', 'Team', 'Values', 'CTA'] },
      { page: 'Services', blocks: ['Hero', 'Service list', 'Process', 'Pricing', 'FAQ', 'CTA'] },
      { page: 'Work or Blog (CMS)', blocks: ['Index', 'Filters', 'Post / case template', 'Related'] },
      { page: 'Contact', blocks: ['Form', 'Details & map', 'Booking'] },
    ],
  },
  {
    id: 'websiteplus',
    name: 'Website+',
    price: 8500,
    priceLabel: '$8,500',
    days: '15–20 business days',
    pitch: 'Agency-level work. None of the agency.',
    bestFor: 'Funded startups, premium brands, hospitality, architecture, fashion.',
    includes: [
      'Up to 12 pages, 70 sections',
      'Positioning & messaging',
      'Full copywriting',
      'Art direction & custom visual assets',
      'Custom design system',
      'Advanced motion & interactions',
      'Advanced CMS & integrations',
      'SEO foundations & analytics',
      'Advanced QA & launch',
      '3 revision rounds',
      '30 days post-launch support',
    ],
    payment: '50% to reserve, 50% before launch',
    depositPct: 50,
    pages: 12,
    sections: 70,
    sitemap: [
      { page: 'Home', blocks: ['Hero', 'Logos', 'Positioning', 'Services', 'Work', 'Process', 'Testimonials', 'Stats', 'FAQ', 'CTA'] },
      { page: 'About', blocks: ['Intro', 'Story', 'Team', 'Values', 'Press', 'CTA'] },
      { page: 'Services × 3', blocks: ['5 sections each'] },
      { page: 'Work index + case template', blocks: ['Index', 'Filters', 'Case hero', 'Results', 'Gallery', 'Next project'] },
      { page: 'Pricing', blocks: ['Plans', 'Compare', 'FAQ', 'CTA'] },
      { page: 'Blog index + post template', blocks: ['Index', 'Categories', 'Post', 'Related'] },
      { page: 'Careers', blocks: ['Culture', 'Benefits', 'Open roles'] },
      { page: 'Contact', blocks: ['Form', 'Offices', 'Booking'] },
    ],
  },
];

// Comparison rows for the "compare packages" table. Order matches `packages`.
export const compareRows: { label: string; values: [string, string, string] }[] = [
  { label: 'Price', values: ['$1,750', '$4,000', 'from $8,500'] },
  { label: 'Timeline', values: ['5 days', '10 days', '15–20 days'] },
  { label: 'Pages', values: ['1', 'Up to 5', 'Up to 12'] },
  { label: 'Sections', values: ['Up to 8', 'Up to 30', 'Up to 70'] },
  { label: 'Strategy', values: ['Page structure', 'Sitemap + conversion', 'Positioning + messaging'] },
  { label: 'Copy', values: ['Assisted', 'Written by us', 'Fully written'] },
  { label: 'Design', values: ['Custom', 'Custom', 'Custom design system'] },
  { label: 'CMS', values: ['—', 'Included', 'Advanced'] },
  { label: 'Motion', values: ['Included', 'Included', 'Advanced'] },
  { label: 'Integrations', values: ['Form', '2 included', '4 included'] },
  { label: 'Revision rounds', values: ['1', '2', '3'] },
  { label: 'Post-launch support', values: ['7 days', '14 days', '30 days'] },
];

// ---------------------------------------------------------------------------
// Add-ons
// ---------------------------------------------------------------------------

export interface AddOn {
  id: string;
  group: 'Content' | 'Features' | 'Brand & motion' | 'Timing';
  name: string;
  detail: string;
  price: number;
  priceLabel: string;
  notFor?: PackageId[]; // hidden for packages that already include it
  addDays?: number; // per unit; fractions add up and round up
  qty?: boolean; // stepper instead of checkbox
  was?: string; // original price, shown struck through during a promo
  promo?: string; // promo label
}

export const addOns: AddOn[] = [
  { id: 'page', group: 'Content', name: 'Extra page', detail: 'A new page with up to 6 sections. Designed, written, built.', price: 400, priceLabel: '+$400', notFor: ['landing'], addDays: 1, qty: true },
  { id: 'section', group: 'Content', name: 'Extra section', detail: 'One more block on any page: gallery, pricing table, FAQ…', price: 150, priceLabel: '+$150', addDays: 0.25, qty: true },
  { id: 'copy', group: 'Content', name: 'Full copywriting', detail: 'Every word written by us, from a 30-min voice note.', price: 1200, priceLabel: '+$1,200', notFor: ['websiteplus'] },
  { id: 'multilingual', group: 'Content', name: 'Second language', detail: 'Locale setup, switcher and translated pages.', price: 0, priceLabel: 'Free', was: '+$900', promo: 'Promo', addDays: 2 },
  { id: 'cms', group: 'Features', name: 'Advanced CMS', detail: 'Filters, categories, references, multiple collections.', price: 750, priceLabel: '+$750', notFor: ['landing', 'websiteplus'] },
  { id: 'integration', group: 'Features', name: 'Integration', detail: 'Booking, CRM, newsletter or payments. Per tool.', price: 250, priceLabel: '+$250', qty: true },
  { id: 'shop', group: 'Features', name: 'Shop', detail: 'Up to 25 products via Shopify or Framer commerce.', price: 1500, priceLabel: 'from +$1,500', notFor: ['landing'], addDays: 5 },
  { id: 'brand', group: 'Brand & motion', name: 'Brand identity sprint', detail: 'Logo, type, colour and a one-page guideline.', price: 2500, priceLabel: '+$2,500', addDays: 5 },
  { id: 'motion', group: 'Brand & motion', name: 'Signature motion / 3D', detail: 'One hero moment people screenshot.', price: 1200, priceLabel: '+$1,200', addDays: 2 },
  { id: 'rush', group: 'Timing', name: 'Rush', detail: 'Cuts the timeline by ~40%. Subject to availability.', price: 1000, priceLabel: '+$1,000' },
];

// ---------------------------------------------------------------------------
// Build calendar — 2 build slots per week (≈8 projects a month)
// Week dates are Mondays. Edit `booked` as slots fill.
// ---------------------------------------------------------------------------

export interface BuildWeek {
  start: string; // ISO date, Monday
  label: string;
  slots: number;
  booked: number;
}

export const buildWeeks: BuildWeek[] = [
  { start: '2026-10-05', label: 'Oct 5', slots: 2, booked: 2 },
  { start: '2026-10-12', label: 'Oct 12', slots: 2, booked: 2 },
  { start: '2026-10-19', label: 'Oct 19', slots: 2, booked: 1 },
  { start: '2026-10-26', label: 'Oct 26', slots: 2, booked: 1 },
  { start: '2026-11-02', label: 'Nov 2', slots: 2, booked: 0 },
  { start: '2026-11-09', label: 'Nov 9', slots: 2, booked: 0 },
];

export const openWeeks = buildWeeks.filter((w) => w.booked < w.slots);
export const nextWeek = openWeeks[0];
export const openSlotsThisMonth = (() => {
  if (!nextWeek) return 0;
  const month = nextWeek.start.slice(0, 7);
  return buildWeeks
    .filter((w) => w.start.startsWith(month))
    .reduce((n, w) => n + (w.slots - w.booked), 0);
})();
export const monthName = nextWeek
  ? new Date(nextWeek.start + 'T00:00:00').toLocaleString('en-US', { month: 'long' })
  : '';

// ---------------------------------------------------------------------------
// Work — PLACEHOLDER device shots. Swap each `img` for your own project
// screenshots (put files in public/work/ and point img there) as they ship.
// ---------------------------------------------------------------------------

export const work = [
  { title: 'Content platform', industry: 'Media / SaaS', pkg: 'Website+', days: '15-day build', scope: ['Strategy', 'Copy', 'Art direction', 'CMS'], focus: 'Editorial homepage + CMS', img: '/placeholder/tablet-method.webp' },
  { title: 'Studio website', industry: 'Creative studio', pkg: 'Website', days: '10-day build', scope: ['Design', 'CMS', 'Motion'], focus: 'Portfolio-first redesign', img: '/placeholder/phone-red.webp' },
  { title: 'Health brand', industry: 'Health / D2C', pkg: 'Website', days: '10-day build', scope: ['Design', 'Framer', 'Integrations'], focus: 'Sign-up flow, mobile first', img: '/placeholder/tablet-pharmacy.webp' },
  { title: 'App launch', industry: 'Consumer tech', pkg: 'Landing', days: '5-day build', scope: ['Copy', 'Design', 'Analytics'], focus: 'Waitlist landing page', img: '/placeholder/phone-hands.webp' },
  { title: 'Venture fund', industry: 'Venture capital', pkg: 'Landing', days: '5-day build', scope: ['Copy', 'Design', 'Motion'], focus: 'Thesis + founder intake', img: '/placeholder/tablet-founder.webp' },
  { title: 'Annual report', industry: 'Professional services', pkg: 'Website+', days: '18-day build', scope: ['Messaging', 'Design system', 'CMS'], focus: 'Interactive report microsite', img: '/placeholder/tablet-desk.webp' },
];

// ---------------------------------------------------------------------------
// Testimonials — PLACEHOLDERS. Never ship invented names or quotes.
// ---------------------------------------------------------------------------

export const testimonials = [
  { quote: 'Shockingly easy. We filled in a brief on Tuesday and stopped thinking about it until the review link showed up.', who: '[Client name]', role: '[Role], [Company]', meta: 'Website · live in 10 days' },
  { quote: 'We expected this to take months. Ten days later, we were live.', who: '[Client name]', role: '[Role], [Company]', meta: 'Website · live in 10 days' },
  { quote: 'The first version already felt like us. Our feedback was mostly about commas.', who: '[Client name]', role: '[Role], [Company]', meta: 'Website+ · live in 16 days' },
  { quote: 'It felt more like buying software than hiring an agency. In the best way.', who: '[Client name]', role: '[Role], [Company]', meta: 'Landing · live in 5 days' },
  { quote: 'We barely had to manage anything. Which, for a three-person team, was the whole point.', who: '[Client name]', role: '[Role], [Company]', meta: 'Website · live in 11 days' },
];

// ---------------------------------------------------------------------------
// Process
// ---------------------------------------------------------------------------

export const process = [
  {
    n: '01', day: 'Day 0', title: 'Tell us about your business',
    body: 'A 20-minute guided brief. Paste links, drop files, record a voice note if typing feels like homework.',
    list: ['Current site', 'Logo & brand files', 'Sites you love (and hate)', 'Competitors', 'Goals'],
    note: 'No meeting required.',
  },
  {
    n: '02', day: 'Days 1–2', title: 'We figure out the website',
    body: 'You get one page that says what the site is for, who it talks to and what every page needs to do.',
    list: ['Positioning', 'Sitemap', 'Hierarchy', 'Conversion flow', 'Copy', 'Visual direction'],
    note: 'Approve it with one click.',
  },
  {
    n: '03', day: 'Days 3–7', title: 'We build it',
    body: 'Design and development happen together, in the real thing. No static mockups waiting three weeks for a developer.',
    list: ['Design', 'Development', 'Motion', 'CMS', 'Integrations'],
    note: 'Watch it take shape on your dashboard.',
  },
  {
    n: '04', day: 'Day 8', title: 'You review',
    body: 'You get a working website, not a PDF. Click on anything and leave a comment right there. One consolidated round.',
    list: ['Live preview link', 'Comment in place', 'Desktop & mobile'],
    note: 'Everyone on your team can comment.',
  },
  {
    n: '05', day: 'Days 9–10', title: 'We launch',
    body: 'Final QA, then live on your domain. You get the keys, a short walkthrough video and support while it settles in.',
    list: ['Responsive QA', 'SEO basics', 'Analytics', 'Forms', 'Domain', 'CMS'],
    note: 'Live. Done.',
  },
];

// ---------------------------------------------------------------------------
// Old way vs. this way
// ---------------------------------------------------------------------------

export const agencySteps = [
  'Book a call', 'Discovery call', 'Proposal', 'Negotiation', 'Kickoff', 'Workshops', 'Sitemap',
  'Wireframes', 'Meetings', 'Design', 'Feedback', 'More meetings', 'Dev handoff', 'QA', 'Delays', 'Launch',
];
export const ourSteps = ['Choose', 'Brief', 'Build', 'Review', 'Launch'];

export const comparison: [string, string, string][] = [
  ['How you start', 'Request a proposal', 'Choose online'],
  ['Price', 'Find out in 2 weeks', 'On the page. Fixed.'],
  ['Timeline', '2–4 months', '5–20 business days'],
  ['Meetings', 'Weekly, minimum', 'None required'],
  ['Who you talk to', 'An account manager', 'The people building it'],
  ['Design → development', 'Handoff, then wait', 'Same team, same week'],
  ['Changes', 'Billed hourly', 'Clear add-ons, priced upfront'],
  ['Launch date', '“Q3, hopefully”', 'Known before you pay'],
  ['Scope', 'Grows with every call', 'Written down on day one'],
];

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export const faq: { group: string; items: { q: string; a: string }[] }[] = [
  {
    group: 'The work',
    items: [
      { q: 'Is this a template?', a: 'No. The process is standardised; the website isn’t. Every site starts from your business, your content and your audience, and gets its own layout, type, art direction and motion. We reuse infrastructure (components, QA checklists, setup scripts), the same way a good kitchen reuses knives.' },
      { q: 'Why can you work so quickly?', a: 'Because we removed the parts of an agency project that aren’t the website: proposals, status meetings, presentations, handoffs between departments. Design and development happen together, and our internal systems do the repetitive setup and research. The hours that remain go into the creative decisions.' },
      { q: 'Can you redesign an existing website?', a: 'Yes, and most of our projects are redesigns. Send us the current URL in the brief. We audit what works, keep what earns its place and rebuild the rest. We can also set up redirects so you keep your search rankings.' },
      { q: 'Can you build custom websites?', a: 'Every site is custom-designed. If you mean custom code (a web app, complex logic, a backend), that’s outside the fixed packages. Tell us what you need and we’ll say honestly whether it fits Website+ with add-ons or needs a separate scope.' },
      { q: 'What if my project is more complex?', a: 'Pick the closest package and mention it in the brief, or book a 15-minute call first. If it doesn’t fit, we tell you before any money changes hands. We’d rather turn down a project than squeeze it into the wrong box.' },
    ],
  },
  {
    group: 'Platform',
    items: [
      { q: 'What platform do you use?', a: 'Framer by default. It’s fast, beautiful, easy for your team to edit and hosts reliably. If you have a strong reason for something else, tell us in the brief.' },
      { q: 'Do you use Framer?', a: 'Yes. It lets us design and build in the same tool, which is a big part of why we’re fast, and it means your team can edit text, images and CMS content without calling a developer.' },
      { q: 'Can you use Webflow?', a: 'Yes, on Website and Website+, for teams already invested in Webflow. Timelines can run a couple of days longer.' },
      { q: 'Can you build Shopify?', a: 'For small catalogues, yes: add the Shop add-on (up to 25 products). Large stores with complex catalogues, subscriptions or custom checkout logic need their own scope.' },
      { q: 'Is hosting included?', a: 'Hosting is paid directly to the platform (Framer’s site plans start around $15–30/month), so it sits in your account, under your name. We set it all up.' },
    ],
  },
  {
    group: 'Content & copy',
    items: [
      { q: 'Do I need to have copy ready?', a: 'No. Landing includes copy assistance: you give us the raw material, we shape it. Website includes a first draft written by us. Website+ is fully written. If you already have copy you love, we’ll use it.' },
      { q: 'Can you write the copy?', a: 'Yes. Copywriting is included in Website and Website+, and available as an add-on for Landing. We work from your brief and, if you like, a 30-minute voice note. Talking is faster than writing.' },
      { q: 'Do I need branding already?', a: 'A logo and a rough sense of colour is enough. No brand at all? Add the Brand identity sprint and we’ll design one before the build starts.' },
      { q: 'Can you do SEO?', a: 'Every package includes SEO foundations: clean structure, metadata, fast pages, sitemap, redirects and analytics. Ongoing SEO content (articles, keyword strategy) is priced separately after launch.' },
    ],
  },
  {
    group: 'Scope & revisions',
    items: [
      { q: 'What happens if I need more than 5 pages?', a: 'Add extra pages at $400 each (up to 6 sections per page), or single sections at $150. If you need more than three extra pages, Website+ is usually better value. The configurator shows your page and section count as you go.' },
      { q: 'What counts as a page, and what’s a section?', a: 'A page is a unique URL with its own layout. A section is one full-width block on it: a hero, a feature grid, testimonials, a pricing table, a form. Packages include both a page count and a section count, so a 40-block homepage doesn’t sneak in as “one page”. Blog posts or case studies built from one CMS template count once. Legal pages (privacy, terms) are free.' },
      { q: 'What if I need additional revisions?', a: 'Extra rounds are $400 each on Landing and $600 on Website and Website+. A round is one consolidated set of feedback, so collect everyone’s notes first. Small fixes after launch are covered by post-launch support.' },
      { q: 'Can you integrate forms, CRM, email or booking systems?', a: 'Yes. Forms are always included. Website includes two integrations (e.g. HubSpot, Mailchimp, Cal.com, Calendly) and Website+ four. Extra integrations are $250 each.' },
    ],
  },
  {
    group: 'Working together',
    items: [
      { q: 'Do we have to meet?', a: 'No meetings required. Everything (brief, approvals, feedback, launch) runs through your project dashboard. Most clients never book a call, and nothing suffers for it.' },
      { q: 'Can we have a call?', a: 'Of course. Book 15 minutes before you buy, or a call during the project whenever you need one. We’re async by default, not unreachable.' },
      { q: 'What happens if I am late sending content or feedback?', a: 'The timeline pauses until we have it. If a project is paused for more than 10 business days, it moves to the next open build week. Your money and your place don’t disappear, but the launch date does shift.' },
      { q: 'What happens if the timeline changes?', a: 'If we’re late, you get a new date the same day we know, and the explanation. If the delay is on our side and exceeds 5 business days, we refund the Rush fee if you paid one, and add a free revision round.' },
    ],
  },
  {
    group: 'Buying',
    items: [
      { q: 'How do I reserve a build week?', a: 'Pick a package, add what you need, choose an open week and pay. The week is held for you the moment payment clears. No back-and-forth to confirm.' },
      { q: 'What happens after I pay?', a: 'You get a confirmation with your build week and a link to your dashboard. The brief takes about 20 minutes. Finish it at least 2 business days before your week starts and you’re all set.' },
      { q: 'What payment structure do you recommend?', a: 'Landing is paid in full upfront. It’s short and the amount is small. Website and Website+ are 50% to reserve and 50% before launch, paid from the review link. You never pay the final half for something you haven’t seen working.' },
      { q: 'Can the project be refunded?', a: 'Full refund up to 7 days before your build week starts. After that, the deposit secures capacity we’ve turned other projects away for, so it’s non-refundable, but you can move to another open week once at no cost.' },
      { q: 'Should deposits be refundable?', a: 'Our view: refundable until we turn work down for you, then not. That’s why the cut-off is 7 days before your week. It’s fair to you and it keeps the calendar honest for everyone else.' },
    ],
  },
  {
    group: 'After launch',
    items: [
      { q: 'Will I own the website?', a: 'Yes. The site, the content, the design files and the domain are yours. Everything lives in accounts you control.' },
      { q: 'Can my team edit the site?', a: 'Yes. Text, images and CMS content are editable in Framer’s visual editor. You get a short walkthrough video made for your site specifically.' },
      { q: 'What happens after launch?', a: 'Every package includes post-launch support (7, 14 or 30 days) for bugs and small tweaks. After that you can run it yourself or join a Care plan.' },
      { q: 'Can you maintain the website?', a: 'Yes. Care plans start at $300/month for updates, new sections, landing pages and monitoring. Optional and cancellable any time.' },
    ],
  },
];
