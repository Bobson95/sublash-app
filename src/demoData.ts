import { Subscription } from './types';

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'demo-1',
    name: 'Adobe Creative Cloud',
    cost: 54.99,
    billingCycle: 'monthly',
    category: 'Design & Creative',
    renewalDate: '2026-06-15',
    url: 'https://adobe.com',
    status: 'active',
    currencySymbol: '$',
    notes: 'Required for client video editing projects.'
  },
  {
    id: 'demo-2',
    name: 'GitHub Copilot',
    cost: 10.00,
    billingCycle: 'monthly',
    category: 'Development / DevOps',
    renewalDate: '2026-06-08',
    url: 'https://github.com',
    status: 'active',
    currencySymbol: '$',
    notes: 'AI code completion assistant.'
  },
  {
    id: 'demo-3',
    name: 'Figma Professional',
    cost: 144.00,
    billingCycle: 'yearly',
    category: 'Design & Creative',
    renewalDate: '2026-11-20',
    url: 'https://figma.com',
    status: 'active',
    currencySymbol: '$',
    notes: 'Product design & UI wireframing platform.'
  },
  {
    id: 'demo-4',
    name: 'ChatGPT Plus',
    cost: 20.00,
    billingCycle: 'monthly',
    category: 'Productivity & Office',
    renewalDate: '2026-06-02',
    url: 'https://openai.com',
    status: 'active',
    currencySymbol: '$',
    notes: 'Research and brainstorming support.'
  },
  {
    id: 'demo-5',
    name: 'Netflix Premium',
    cost: 22.99,
    billingCycle: 'monthly',
    category: 'Entertainment & Leisure',
    renewalDate: '2026-06-12',
    url: 'https://netflix.com',
    status: 'active',
    currencySymbol: '$',
    notes: 'Shared family media subscription.'
  },
  {
    id: 'demo-6',
    name: 'Google One 2TB',
    cost: 99.99,
    billingCycle: 'yearly',
    category: 'Utilities & General',
    renewalDate: '2027-01-10',
    url: 'https://one.google.com',
    status: 'active',
    currencySymbol: '$',
    notes: 'Cloud backup for personal storage.'
  },
  {
    id: 'demo-7',
    name: 'AWS DevOps Node',
    cost: 48.50,
    billingCycle: 'monthly',
    category: 'Development / DevOps',
    renewalDate: '2026-06-01',
    url: 'https://aws.amazon.com',
    status: 'paused',
    currencySymbol: '$',
    notes: 'Testing server. Currently paused to avoid idle charges.'
  }
];

export const CATEGORIES = [
  'Development / DevOps',
  'Design & Creative',
  'Productivity & Office',
  'Entertainment & Leisure',
  'Marketing & Sales',
  'Finance & Operations',
  'Utilities & General'
];

export const ALTERNATIVE_INVESTMENTS = [
  { cost: 100, label: 'Fractional Share Bundle in High-Growth ETFs 📊' },
  { cost: 500, label: 'High-Yield Savings Cash Asset (HYSA Principal) 🏦' },
  { cost: 1000, label: 'Compound Interest S&P 500 Index Fund Starter 📈' },
  { cost: 2500, label: 'Short-term U.S. Treasury Bond holding 🇺🇸' },
  { cost: 5000, label: 'Blue-Chip Dividend-yielding Equity Bundle 💸' },
  { cost: 10000, label: 'Down payment contribution for real estate equity 🏡' },
  { cost: 20000, label: 'Diversified REIT (Real Estate Investment Trust) portfolio allocation 🏢' },
  { cost: 50000, label: 'Fully-funded compounding wealth & retirement safety asset 🛡️' }
];
