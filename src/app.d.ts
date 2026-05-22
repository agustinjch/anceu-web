declare global {
	namespace App {
		interface Platform {
			env?: {
				DATABASE_URL?: string;
				STRIPE_SECRET_KEY?: string;
				STRIPE_PUBLISHABLE_KEY?: string;
				STRIPE_WEBHOOK_SECRET?: string;
				RESEND_API_KEY?: string;
				R2_ACCOUNT_ID?: string;
				R2_ACCESS_KEY_ID?: string;
				R2_SECRET_ACCESS_KEY?: string;
				R2_BUCKET_NAME?: string;
				R2_PUBLIC_DOMAIN?: string;
				SESSION_SECRET?: string;
				MAGIC_LINK_SECRET?: string;
				PUBLIC_SITE_URL?: string;
				ADMIN_NOTIFICATION_EMAIL?: string;
			};
			context?: {
				waitUntil(promise: Promise<unknown>): void;
			};
			caches?: CacheStorage & { default: Cache };
		}
	}
}

export {};