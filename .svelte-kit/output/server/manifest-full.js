export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["_headers","favicon.svg","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","manifest.webmanifest","robots.txt","sw.js","theme-init.js"]),
	mimeTypes: {".svg":"image/svg+xml",".png":"image/png",".webmanifest":"application/manifest+json",".txt":"text/plain",".js":"text/javascript"},
	_: {
		client: {start:"_app/immutable/entry/start.CWpbS8M4.js",app:"_app/immutable/entry/app.B5MbrS7t.js",imports:["_app/immutable/entry/start.CWpbS8M4.js","_app/immutable/chunks/BGAQJqMo.js","_app/immutable/chunks/BjVp15d1.js","_app/immutable/chunks/Dt-HX3Vu.js","_app/immutable/chunks/CXARvUpp.js","_app/immutable/entry/app.B5MbrS7t.js","_app/immutable/chunks/BjVp15d1.js","_app/immutable/chunks/xihTtKlq.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/tools/[id]",
				pattern: /^\/tools\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
