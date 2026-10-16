
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/tools" | "/tools/[id]";
		RouteParams(): {
			"/tools/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string | undefined };
			"/tools": { id?: string | undefined };
			"/tools/[id]": { id: string }
		};
		Pathname(): "/" | `/tools/${string}` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/_headers" | "/favicon.svg" | "/icons/icon-192.png" | "/icons/icon-512.png" | "/icons/icon-maskable-512.png" | "/manifest.webmanifest" | "/robots.txt" | "/sw.js" | "/theme-init.js" | string & {};
	}
}