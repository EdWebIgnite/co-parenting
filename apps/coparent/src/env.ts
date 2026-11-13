import { defineEnvVars } from '@sveltejs/kit/env';

// Public, build-time values only: this is a static SPA with no server.
// Optional for now so the empty shell runs before Supabase is set up.
const optional = (value: string | undefined) => value || undefined;

export const variables = defineEnvVars({
	PUBLIC_SUPABASE_URL: {
		public: true,
		static: true,
		schema: optional,
		description: 'Supabase project URL'
	},
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: {
		public: true,
		static: true,
		schema: optional,
		description: 'Supabase publishable (anon) key. Never the service role key.'
	}
});
