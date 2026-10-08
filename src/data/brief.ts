// Everything the /start/ "Build your site" flow asks, in one place.
// The answers are saved as one structured brief (see BriefData in src/scripts/brief.ts).
import type { PackageId } from './site';
import references from './references.json';

// Where a finished brief is POSTed as JSON. Empty = the brief stays in the visitor's
// browser and they can download it (until the database is connected).
export const briefEndpoint = '';

export interface Stage {
  id: string;
  name: string;
  title: string; // plain part of the headline
  accent: string; // serif-italic part
  intro: string;
  figure: string; // Hairline figure (see @lucasmarkes/hairline)
}

export const stages: Stage[] = [
  { id: 'basics', name: 'Basics', title: 'Start with', accent: 'the business.', intro: 'What you’re building, who it’s for, and what a visitor should do next.', figure: 'query' },
  { id: 'direction', name: 'Direction', title: 'Show us', accent: 'your taste.', intro: 'Show, don’t describe. Tap the sites that feel right, then tune the dials.', figure: 'loupe' },
  { id: 'content', name: 'Content', title: 'What’s already', accent: 'in the drawer?', intro: 'Logo, fonts, photos, copy. Bring what you have, skip what you don’t.', figure: 'drawer' },
  { id: 'pages', name: 'Pages', title: 'Build it', accent: 'block by block.', intro: 'Map every page yourself, or drop everything on us and we’ll propose the structure.', figure: 'exploded' },
  { id: 'features', name: 'Features', title: 'Plug in', accent: 'the moving parts.', intro: 'Forms, bookings, languages, domain. Tick what you need and we’ll ask only about those.', figure: 'patch' },
  { id: 'review', name: 'Review', title: 'One last look.', accent: 'Then it’s ours.', intro: 'Check the brief, fill any gaps, and send it in.', figure: 'settle' },
];

// ---------------------------------------------------------------------------
// 01 Basics
// ---------------------------------------------------------------------------

export const industries = [
  { id: 'saas', name: 'SaaS / AI / Tech' },
  { id: 'creative', name: 'Creative / Studio / Agency' },
  { id: 'services', name: 'Professional services' },
  { id: 'ecommerce', name: 'E-commerce / Product' },
  { id: 'hospitality', name: 'Hospitality' },
  { id: 'architecture', name: 'Architecture / Real estate' },
  { id: 'health', name: 'Health / Wellness' },
  { id: 'fashion', name: 'Fashion / Beauty' },
  { id: 'culture', name: 'Culture / Art / Media' },
  { id: 'food', name: 'Food / Beverage' },
  { id: 'finance', name: 'Finance / Web3' },
  { id: 'personal', name: 'Personal brand' },
  { id: 'other', name: 'Other' },
] as const;

// Which other categories feel close, for filling the reference grid past the 3 direct matches.
export const neighbours: Record<string, string[]> = {
  saas: ['finance', 'creative', 'services', 'ecommerce'],
  creative: ['personal', 'culture', 'architecture', 'saas'],
  services: ['finance', 'saas', 'architecture', 'health'],
  ecommerce: ['fashion', 'food', 'saas', 'creative'],
  hospitality: ['food', 'architecture', 'fashion', 'culture'],
  architecture: ['creative', 'hospitality', 'culture', 'fashion'],
  health: ['services', 'saas', 'fashion', 'food'],
  fashion: ['ecommerce', 'culture', 'hospitality', 'creative'],
  culture: ['creative', 'personal', 'architecture', 'fashion'],
  food: ['hospitality', 'ecommerce', 'fashion', 'health'],
  finance: ['saas', 'services', 'creative', 'architecture'],
  personal: ['creative', 'culture', 'saas', 'fashion'],
};

export const goals = [
  { id: 'book_call', name: 'People book a call' },
  { id: 'buy', name: 'People buy' },
  { id: 'understand', name: 'People understand what we do' },
  { id: 'contact', name: 'People contact us' },
  { id: 'sign_up', name: 'People sign up' },
  { id: 'visit', name: 'People visit a location' },
  { id: 'other', name: 'Something else' },
];

// ---------------------------------------------------------------------------
// 02 Direction
// ---------------------------------------------------------------------------

export interface Reference {
  id: string;
  slug: string;
  title: string;
  url: string;
  cats: string[]; // business categories it shows for, best first
  mode: string;
  styles: string[];
  vibes: string[];
  structure?: string;
  northstar?: string;
  palette: string[];
  h: number; // height of the scroll strip (public/refs/<slug>.full.webp) at 520px wide
  original: string; // full 1440px capture, for the expanded view
  editorial: boolean; // in an inspo editor collection
  similar: string[]; // inspo's nearest neighbours that are also in the pool
}
export const refs = references as Reference[];
export const refsPerPage = 12;

// Style filters over the pool. They move matching sites to the front rather than hide the rest.
const has = (list: string[], ...v: string[]) => v.some((x) => list.includes(x));
export const refFilters: { id: string; name: string; test: (r: Reference) => boolean }[] = [
  { id: 'editorial', name: 'Editorial', test: (r) => has(r.styles, 'editorial') },
  { id: 'bold', name: 'Bold', test: (r) => has(r.vibes, 'loud', 'raw') || has(r.styles, 'brutalism', 'maximalism') },
  { id: 'playful', name: 'Playful', test: (r) => has(r.styles, 'playful') || has(r.vibes, 'playful') },
  { id: 'luxe', name: 'Luxe', test: (r) => has(r.vibes, 'luxe') },
  { id: 'warm', name: 'Warm', test: (r) => has(r.vibes, 'warm') },
  { id: 'technical', name: 'Technical', test: (r) => has(r.vibes, 'technical') },
  { id: 'experimental', name: 'Experimental', test: (r) => has(r.styles, 'futurist', 'brutalism', 'maximalism') },
  { id: 'dark', name: 'Dark', test: (r) => r.mode === 'dark' },
  { id: 'light', name: 'Light', test: (r) => r.mode === 'light' },
];
export const maxRefs = 3;

export const traits = ['Typography', 'Layout', 'Colours', 'Motion', 'Photography', 'Simplicity', 'Density', 'Navigation', 'Overall feeling'];

export const sliders = [
  { id: 'dark_light', left: 'Light', right: 'Dark' },
  { id: 'minimal_expressive', left: 'Minimal', right: 'Expressive' },
  { id: 'editorial_digital', left: 'Editorial', right: 'Digital / Tech' },
  { id: 'serious_playful', left: 'Serious', right: 'Playful' },
  { id: 'quiet_bold', left: 'Quiet', right: 'Bold' },
  { id: 'classic_experimental', left: 'Classic', right: 'Experimental' },
];
// Asked on its own, after the sliders: the brutalism-panic guard.
export const pushSlider = { id: 'safe_experimental', left: 'Keep it safe', right: 'Push it' };

export const motionLevels = [
  { id: 'still', n: '01', name: 'Still', detail: 'Mostly static. Content first.', intensity: 0, play: false },
  { id: 'subtle', n: '02', name: 'Subtle', detail: 'Transitions and micro-interactions.', intensity: 0.25, play: true },
  { id: 'dynamic', n: '03', name: 'Dynamic', detail: 'Scroll animation and movement.', intensity: 0.6, play: true },
  { id: 'wild', n: '04', name: 'Wild', detail: 'Interactive. Experimental.', intensity: 1, play: true },
];

// ---------------------------------------------------------------------------
// 03 Content
// ---------------------------------------------------------------------------

export const assets = [
  { id: 'logo', name: 'Logo', accept: '.svg,.ai,.eps,.pdf,.png', hint: 'SVG, AI, EPS or PNG' },
  { id: 'guidelines', name: 'Brand guidelines', accept: '.pdf', hint: 'PDF' },
  { id: 'fonts', name: 'Fonts', accept: '.otf,.ttf,.woff,.woff2,.zip', hint: 'OTF, TTF, WOFF or a zip' },
  { id: 'palette', name: 'Colour palette', accept: 'image/*,.pdf,.ase', hint: 'Hex codes below, or a file' },
  { id: 'photography', name: 'Photography', accept: 'image/*', hint: 'JPG, PNG, WebP' },
  { id: 'product', name: 'Product images', accept: 'image/*', hint: 'JPG, PNG, WebP' },
  { id: 'illustrations', name: 'Illustrations', accept: 'image/*,.svg,.ai', hint: 'SVG, AI, PNG' },
  { id: 'videos', name: 'Videos', accept: 'video/*', hint: 'MP4, MOV' },
  { id: 'copy', name: 'Copy', accept: '.pdf,.doc,.docx,.txt,.md', hint: 'Docs, PDF, text' },
];

export const locked = ['Logo', 'Colours', 'Typography', 'Messaging', 'Other'];

export const copyStatus = [
  { id: 'final', name: 'It’s final', detail: 'Use exactly what I provide.' },
  { id: 'rough', name: 'I have rough copy', detail: 'Polish it.' },
  { id: 'info', name: 'I have information', detail: 'Turn it into website copy.' },
  { id: 'nothing', name: 'I have basically nothing', detail: 'Help me create it.' },
];

// ---------------------------------------------------------------------------
// 04 Pages
// ---------------------------------------------------------------------------

// `g` draws the block's mini wireframe in the live "Your site" panel.
export const blockTypes = [
  { id: 'hero', name: 'Hero', g: 'hero' },
  { id: 'logo_cloud', name: 'Logo cloud', g: 'logos' },
  { id: 'intro', name: 'Intro', g: 'text' },
  { id: 'services', name: 'Services', g: 'grid3' },
  { id: 'features', name: 'Features', g: 'grid3' },
  { id: 'how_it_works', name: 'How it works', g: 'steps' },
  { id: 'case_studies', name: 'Case studies', g: 'grid2' },
  { id: 'testimonials', name: 'Testimonials', g: 'quote' },
  { id: 'gallery', name: 'Gallery', g: 'gallery' },
  { id: 'team', name: 'Team', g: 'grid4' },
  { id: 'pricing', name: 'Pricing', g: 'grid3' },
  { id: 'faq', name: 'FAQ', g: 'rows' },
  { id: 'cta', name: 'CTA', g: 'cta' },
  { id: 'contact', name: 'Contact', g: 'form' },
  { id: 'footer', name: 'Footer', g: 'footer' },
  { id: 'custom', name: 'Custom', g: 'text' },
] as const;
export type BlockType = (typeof blockTypes)[number]['id'];

// Starting structure per package, and the one we recommend from "the dump".
export const templates: Record<PackageId | 'unsure', { page: string; blocks: BlockType[] }[]> = {
  landing: [{ page: 'Home', blocks: ['hero', 'intro', 'features', 'how_it_works', 'testimonials', 'faq', 'cta', 'contact'] }],
  website: [
    { page: 'Home', blocks: ['hero', 'logo_cloud', 'services', 'how_it_works', 'case_studies', 'testimonials', 'cta'] },
    { page: 'About', blocks: ['intro', 'team', 'cta'] },
    { page: 'Services', blocks: ['services', 'pricing', 'faq'] },
    { page: 'Contact', blocks: ['contact'] },
  ],
  websiteplus: [
    { page: 'Home', blocks: ['hero', 'logo_cloud', 'intro', 'services', 'case_studies', 'how_it_works', 'testimonials', 'faq', 'cta'] },
    { page: 'About', blocks: ['intro', 'team', 'gallery', 'cta'] },
    { page: 'Services', blocks: ['hero', 'services', 'how_it_works', 'pricing', 'faq', 'cta'] },
    { page: 'Work', blocks: ['case_studies', 'gallery', 'cta'] },
    { page: 'Journal', blocks: ['intro', 'custom'] },
    { page: 'Contact', blocks: ['contact', 'faq'] },
  ],
  unsure: [
    { page: 'Home', blocks: ['hero', 'intro', 'services', 'case_studies', 'testimonials', 'cta'] },
    { page: 'About', blocks: ['intro', 'team'] },
    { page: 'Contact', blocks: ['contact'] },
  ],
};

// The goal decides which block closes the home page in a recommended structure.
export const goalBlock: Record<string, BlockType> = {
  book_call: 'cta',
  buy: 'pricing',
  understand: 'how_it_works',
  contact: 'contact',
  sign_up: 'cta',
  visit: 'contact',
  other: 'cta',
};

export const dumpKinds = ['PDFs', 'Notion exports', 'Old decks', 'Word docs', 'Brand book', 'Images', 'Videos', 'Random notes'];

// ---------------------------------------------------------------------------
// 05 Features — each one opens only its own follow-up questions
// ---------------------------------------------------------------------------

type Field = { id: string; label: string; type?: 'text' | 'url' | 'chips'; options?: string[]; placeholder?: string };

export const features: { id: string; name: string; fields: Field[] }[] = [
  { id: 'forms', name: 'Contact forms', fields: [{ id: 'fields', label: 'What should the form ask?', placeholder: 'Name, email, budget, message…' }, { id: 'to', label: 'Send submissions to', placeholder: 'hello@yourcompany.com' }] },
  { id: 'newsletter', name: 'Newsletter', fields: [{ id: 'provider', label: 'Provider', type: 'chips', options: ['Mailchimp', 'Beehiiv', 'Kit', 'Substack', 'Not yet'] }] },
  { id: 'booking', name: 'Calendly / booking', fields: [{ id: 'url', label: 'Paste your booking URL', type: 'url', placeholder: 'https://cal.com/…' }] },
  { id: 'whatsapp', name: 'WhatsApp', fields: [{ id: 'number', label: 'Number, with country code', placeholder: '+54 9 11 …' }] },
  { id: 'cms', name: 'CMS', fields: [{ id: 'content', label: 'What will you update yourself?', type: 'chips', options: ['Blog', 'Work / cases', 'Team', 'Products', 'Events', 'Jobs'] }] },
  { id: 'blog', name: 'Blog', fields: [{ id: 'posts', label: 'Existing posts to bring over', placeholder: 'None, ~20, 200+…' }] },
  { id: 'ecommerce', name: 'E-commerce', fields: [{ id: 'platform', label: 'Platform', type: 'chips', options: ['Shopify', 'Framer', 'Stripe', 'Not sure'] }, { id: 'products', label: 'How many products?', placeholder: 'About 12' }] },
  { id: 'payments', name: 'Payments', fields: [{ id: 'what', label: 'What are people paying for?', placeholder: 'Deposits, tickets, courses…' }] },
  { id: 'login', name: 'Login', fields: [{ id: 'who', label: 'Who logs in, and what do they see?', placeholder: 'Clients see their project files' }] },
  { id: 'multilingual', name: 'Multilingual', fields: [{ id: 'primary', label: 'Primary language', placeholder: 'English' }, { id: 'more', label: 'Additional languages', type: 'chips', options: ['Spanish', 'Portuguese', 'French', 'German', 'Italian', 'Other'] }] },
  { id: 'search', name: 'Search', fields: [{ id: 'what', label: 'What should be searchable?', placeholder: 'Articles, products…' }] },
  { id: 'maps', name: 'Maps', fields: [{ id: 'address', label: 'Address(es) to show', placeholder: 'Street, city' }] },
  { id: 'analytics', name: 'Analytics', fields: [{ id: 'tool', label: 'Tool', type: 'chips', options: ['Google Analytics', 'Plausible', 'Fathom', 'Meta Pixel', 'You pick'] }] },
  { id: 'crm', name: 'CRM', fields: [{ id: 'tool', label: 'Which one?', type: 'chips', options: ['HubSpot', 'Salesforce', 'Pipedrive', 'Attio', 'Other'] }] },
  { id: 'custom', name: 'Custom integration', fields: [{ id: 'what', label: 'What needs to talk to what?', placeholder: 'Form → Airtable → Slack' }] },
];
