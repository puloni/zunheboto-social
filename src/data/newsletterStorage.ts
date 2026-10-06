import { NewsletterSubscriber, NewsletterPreferences } from '../types';

export type { NewsletterPreferences, NewsletterSubscriber };

export const DEFAULT_NEWSLETTER_PREFERENCES: NewsletterPreferences = {
  breaking_news: true,
  weekly_digest: true,
  culture_heritage: true,
  local_directory: false,
  emergency_alerts: true
};

/**
 * Initial mock subscriber records representing local residents and community stakeholders across Zunheboto.
 */
export const INITIAL_NEWSLETTER_SUBSCRIBERS: NewsletterSubscriber[] = [
  {
    id: 'sub_zh_101',
    email: 'kivika.zh@gmail.com',
    name: 'Kivika Yeptho',
    colony: 'DC Hill',
    subscribed_at: '2026-08-14T09:30:00Z',
    status: 'active',
    source: 'homepage_banner',
    preferences: {
      breaking_news: true,
      weekly_digest: true,
      culture_heritage: true,
      local_directory: true,
      emergency_alerts: true
    }
  },
  {
    id: 'sub_zh_102',
    email: 'hikithe.chishi@nagalandgov.in',
    name: 'Hikithe Chishi',
    colony: 'Old Town Colony',
    subscribed_at: '2026-08-18T14:15:00Z',
    status: 'active',
    source: 'article_footer',
    preferences: {
      breaking_news: true,
      weekly_digest: true,
      culture_heritage: true,
      local_directory: false,
      emergency_alerts: true
    }
  },
  {
    id: 'sub_zh_103',
    email: 'inoli.sumi@outlook.com',
    name: 'Inoli Sumi',
    colony: 'South Point',
    subscribed_at: '2026-08-22T11:00:00Z',
    status: 'active',
    source: 'homepage_banner',
    preferences: {
      breaking_news: true,
      weekly_digest: true,
      culture_heritage: true,
      local_directory: true,
      emergency_alerts: true
    }
  },
  {
    id: 'sub_zh_104',
    email: 'ghato.zhe@yahoo.com',
    name: 'Ghato Zhimomi',
    colony: 'Project Colony',
    subscribed_at: '2026-08-29T16:45:00Z',
    status: 'active',
    source: 'footer',
    preferences: {
      breaking_news: true,
      weekly_digest: false,
      culture_heritage: true,
      local_directory: false,
      emergency_alerts: true
    }
  },
  {
    id: 'sub_zh_105',
    email: 'tsukoli.v@gmail.com',
    name: 'Tsukoli V. Achumi',
    colony: 'Laghilato Colony',
    subscribed_at: '2026-09-01T07:20:00Z',
    status: 'active',
    source: 'article_footer',
    preferences: {
      breaking_news: true,
      weekly_digest: true,
      culture_heritage: true,
      local_directory: true,
      emergency_alerts: true
    }
  }
];

const STORAGE_KEY = 'zs_newsletter_subscribers_v1';

/**
 * Loads subscribers from persistent browser storage or returns the initial mock list.
 */
export function getStoredSubscribers(): NewsletterSubscriber[] {
  if (typeof window === 'undefined') {
    return INITIAL_NEWSLETTER_SUBSCRIBERS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NEWSLETTER_SUBSCRIBERS));
      return INITIAL_NEWSLETTER_SUBSCRIBERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_NEWSLETTER_SUBSCRIBERS;
  } catch (err) {
    console.error('Failed to read newsletter storage:', err);
    return INITIAL_NEWSLETTER_SUBSCRIBERS;
  }
}

/**
 * Saves subscribers to mock persistent storage.
 */
export function saveSubscribersToStorage(subscribers: NewsletterSubscriber[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscribers));
  } catch (err) {
    console.error('Failed to write newsletter storage:', err);
  }
}

export interface SubscribeResult {
  success: boolean;
  message: string;
  isNew: boolean;
  subscriber: NewsletterSubscriber;
}

/**
 * Captures an email to the mock storage file, validating duplicates and updating preferences if already subscribed.
 */
export function captureSubscriberEmail(
  email: string,
  options?: {
    name?: string;
    colony?: string;
    source?: string;
    preferences?: Partial<NewsletterPreferences>;
  }
): SubscribeResult {
  const normalizedEmail = email.trim().toLowerCase();
  
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('Please provide a valid email address.');
  }

  const subscribers = getStoredSubscribers();
  const existingIdx = subscribers.findIndex(
    (s) => s.email.toLowerCase() === normalizedEmail
  );

  const preferences: NewsletterPreferences = {
    ...DEFAULT_NEWSLETTER_PREFERENCES,
    ...(options?.preferences || {})
  };

  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    // Already in storage: update preferences and ensure active status
    const existing = subscribers[existingIdx];
    const updated: NewsletterSubscriber = {
      ...existing,
      name: options?.name?.trim() || existing.name,
      colony: options?.colony?.trim() || existing.colony,
      status: 'active',
      preferences,
      source: options?.source || existing.source
    };
    subscribers[existingIdx] = updated;
    saveSubscribersToStorage(subscribers);

    return {
      success: true,
      message: 'Your newsletter subscription preferences have been refreshed and updated.',
      isNew: false,
      subscriber: updated
    };
  }

  // Create new subscriber entry
  const newSubscriber: NewsletterSubscriber = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: normalizedEmail,
    name: options?.name?.trim() || undefined,
    colony: options?.colony?.trim() || undefined,
    subscribed_at: now,
    status: 'active',
    source: options?.source || 'web_subscribe',
    preferences
  };

  const updatedList = [newSubscriber, ...subscribers];
  saveSubscribersToStorage(updatedList);

  return {
    success: true,
    message: 'Thank you for subscribing! You will receive new articles and district updates.',
    isNew: true,
    subscriber: newSubscriber
  };
}

/**
 * Unsubscribes an email from the mock list.
 */
export function unsubscribeEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const subscribers = getStoredSubscribers();
  const updated = subscribers.map((s) =>
    s.email.toLowerCase() === normalized ? { ...s, status: 'unsubscribed' as const } : s
  );
  saveSubscribersToStorage(updated);
  return true;
}

/**
 * Resets storage back to default mock dataset.
 */
export function resetMockSubscribers(): NewsletterSubscriber[] {
  saveSubscribersToStorage(INITIAL_NEWSLETTER_SUBSCRIBERS);
  return INITIAL_NEWSLETTER_SUBSCRIBERS;
}

/**
 * Exports stored subscribers as JSON formatted string.
 */
export function exportSubscribersJSON(): string {
  const list = getStoredSubscribers();
  return JSON.stringify(list, null, 2);
}

/**
 * Exports stored subscribers as standard CSV string.
 */
export function exportSubscribersCSV(): string {
  const list = getStoredSubscribers();
  const header = 'ID,Email,Name,Colony,Subscribed At,Status,Source,Breaking News,Weekly Digest,Culture Heritage,Directory,Emergency';
  const rows = list.map((s) => [
    s.id,
    `"${s.email}"`,
    `"${s.name || ''}"`,
    `"${s.colony || ''}"`,
    s.subscribed_at,
    s.status,
    `"${s.source}"`,
    s.preferences?.breaking_news ? 'Yes' : 'No',
    s.preferences?.weekly_digest ? 'Yes' : 'No',
    s.preferences?.culture_heritage ? 'Yes' : 'No',
    s.preferences?.local_directory ? 'Yes' : 'No',
    s.preferences?.emergency_alerts ? 'Yes' : 'No'
  ].join(','));
  return [header, ...rows].join('\n');
}
