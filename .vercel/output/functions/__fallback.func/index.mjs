globalThis.__nitro_main__ = import.meta.url; globalThis.__nitro_main__ = import.meta.url;
function setupVite({ manifest: manifest2, services: services2 }) {
  globalThis.__VITE_MANIFEST__ = manifest2;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = function nitroViteFetch(input, init) {
    const viteEnvName = getViteEnv(init) || getViteEnv(input);
    if (!viteEnvName) {
      return originalFetch(input, init);
    }
    const viteEnv = services2[viteEnvName];
    if (!viteEnv) {
      throw httpError(404);
    }
    if (typeof input === "string" && input[0] === "/") {
      input = new URL(input, "http://localhost");
    }
    const headers2 = new Headers(init?.headers || {});
    headers2.set("x-vite-env", viteEnvName);
    if (!(input instanceof Request) || init && Object.keys(init).join("") !== "viteEnv") {
      input = new Request(input, init);
    }
    return viteEnv.fetch(input);
  };
}
function getViteEnv(input) {
  if (!input || typeof input !== "object") {
    return;
  }
  if ("viteEnv" in input) {
    return input.viteEnv;
  }
  if (input.headers) {
    return input.headers["x-vite-env"] || input.headers.get?.("x-vite-env") || Array.isArray(input.headers) && input.headers.find((h) => h[0].toLowerCase() === "x-vite-env")?.[1];
  }
}
const manifest = { "node_modules/react/cjs/react-jsx-runtime.production.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/react/jsx-runtime.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/react/cjs/react.production.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/react/index.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/scheduler/cjs/scheduler.production.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/scheduler/index.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/react-dom/cjs/react-dom.production.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/react-dom/index.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/react-dom/cjs/react-dom-client.production.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/react-dom/client.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/@tanstack/start-client-core/dist/esm/constants.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/start-client-core/dist/esm/getStartOptions.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/isServer/client.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/@tanstack/router-core/dist/esm/utils.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/invariant.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/lru-cache.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/new-process-route-tree.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/path.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/not-found.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/qss.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/router-core/dist/esm/searchParams.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/router-core/dist/esm/root.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/redirect.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/load-matches.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/router-core/dist/esm/rewrite.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/stores.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/history/dist/esm/index.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/router.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/router-core/dist/esm/scroll-restoration.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/defer.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/@tanstack/router-core/dist/esm/link.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/@tanstack/router-core/dist/esm/manifest.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/route.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/seroval/dist/esm/production/index.mjs": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/ssr/serializer/transformer.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/ssr/serializer/RawStream.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/ssr/serializer/ShallowErrorPlugin.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/seroval-plugins/dist/esm/production/web.mjs": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/ssr/serializer/seroval-plugins.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/start-client-core/dist/esm/getDefaultSerovalPlugins.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/start-client-core/dist/esm/client-rpc/frame-decoder.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/@tanstack/start-client-core/dist/esm/client-rpc/serverFnFetcher.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/@tanstack/start-client-core/dist/esm/client-rpc/createClientRpc.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/@tanstack/start-client-core/dist/esm/client/ServerFunctionSerializationAdapter.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/@tanstack/router-core/dist/esm/ssr/ssr-match-id.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/ssr/ssr-client.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/@tanstack/react-router/dist/esm/utils.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/react-router/dist/esm/awaited.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/@tanstack/react-router/dist/esm/CatchBoundary.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/react-router/dist/esm/ClientOnly.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/react-router/dist/esm/routerContext.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/react-router/dist/esm/useRouter.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/react-router/dist/esm/matchContext.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/store/dist/esm/alien.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/@tanstack/store/dist/esm/atom.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.production.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/use-sync-external-store/shim/index.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.production.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/use-sync-external-store/shim/with-selector.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/@tanstack/react-store/dist/esm/useStore.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/@tanstack/react-router/dist/esm/useMatch.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/react-router/dist/esm/useLoaderData.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/react-router/dist/esm/useLoaderDeps.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/react-router/dist/esm/useParams.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/react-router/dist/esm/useSearch.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/react-router/dist/esm/useNavigate.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/react-router/dist/esm/useRouteContext.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/react-router/dist/esm/link.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/react-router/dist/esm/route.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/react-router/dist/esm/fileRoute.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/react-router/dist/esm/lazyRouteComponent.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/react-router/dist/esm/not-found.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/react-router/dist/esm/SafeFragment.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/react-router/dist/esm/renderRouteNotFound.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/scroll-restoration-script/client.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/@tanstack/react-router/dist/esm/scroll-restoration.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/react-router/dist/esm/Match.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/react-router/dist/esm/Transitioner.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/@tanstack/react-router/dist/esm/Matches.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/react-router/dist/esm/routerStores.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/react-router/dist/esm/router.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/react-router/dist/esm/RouterProvider.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/react-router/dist/esm/Asset.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/react-router/dist/esm/headContentUtils.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/react-router/dist/esm/HeadContent.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/react-router/dist/esm/Scripts.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/start-client-core/dist/esm/createMiddleware.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/start-client-core/dist/esm/createStart.js": { "file": "assets/start-D1LqYIDL.js" }, "src/start.ts": { "file": "assets/start-D1LqYIDL.js" }, "node_modules/@tanstack/query-core/build/modern/subscribable.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/query-core/build/modern/focusManager.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/query-core/build/modern/timeoutManager.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/query-core/build/modern/utils.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/query-core/build/modern/environmentManager.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/query-core/build/modern/thenable.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/query-core/build/modern/notifyManager.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/query-core/build/modern/onlineManager.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/query-core/build/modern/retryer.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/query-core/build/modern/removable.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/query-core/build/modern/infiniteQueryBehavior.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/query-core/build/modern/query.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/query-core/build/modern/mutation.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/query-core/build/modern/mutationCache.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/query-core/build/modern/queryCache.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/query-core/build/modern/queryClient.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/sonner/dist/index.mjs": { "file": "assets/router-CTdYHFOk.js" }, "src/components/ui/sonner.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/theme.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/userRoles.ts": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/admin.ts": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/tslib/tslib.es6.mjs": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/@supabase/functions-js/dist/module/helper.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/functions-js/dist/module/types.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/functions-js/dist/module/FunctionsClient.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/postgrest-js/dist/index.mjs": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/realtime-js/dist/module/lib/version.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/realtime-js/dist/module/lib/constants.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/realtime-js/dist/module/lib/serializer.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/realtime-js/dist/module/lib/transformers.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/phoenix/priv/static/phoenix.mjs": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/realtime-js/dist/module/phoenix/presenceAdapter.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/realtime-js/dist/module/RealtimePresence.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/realtime-js/dist/module/lib/normalizeChannelError.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/realtime-js/dist/module/phoenix/channelAdapter.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/realtime-js/dist/module/RealtimeChannel.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/realtime-js/dist/module/phoenix/socketAdapter.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/realtime-js/dist/module/RealtimeClient.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/iceberg-js/dist/index.mjs": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/storage-js/dist/index.mjs": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/auth-js/dist/module/lib/version.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/auth-js/dist/module/lib/constants.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/auth-js/dist/module/lib/errors.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/auth-js/dist/module/lib/base64url.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/auth-js/dist/module/lib/helpers.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/auth-js/dist/module/lib/fetch.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/auth-js/dist/module/lib/types.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/auth-js/dist/module/GoTrueAdminApi.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/auth-js/dist/module/lib/local-storage.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/auth-js/dist/module/lib/locks.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/auth-js/dist/module/lib/polyfills.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/auth-js/dist/module/lib/web3/ethereum.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/auth-js/dist/module/lib/webauthn.errors.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/auth-js/dist/module/lib/webauthn.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/auth-js/dist/module/GoTrueClient.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/auth-js/dist/module/AuthClient.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@supabase/supabase-js/dist/index.mjs": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/supabase/client.ts": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/username.ts": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/notificationsApi.ts": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/scheduleUtils.ts": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/supabase/mappers.ts": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/supabase/data.ts": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/supabase/auth.ts": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/auth.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/assignmentsStore.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/events.ts": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/coursesStore.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/notesStore.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/routineStore.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/systemConfig.ts": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/semesterStore.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/courseMarksSync.ts": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/examsStore.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/lib/studyStore.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/styles.css?transform-only": { "file": "assets/router-CTdYHFOk.js" }, "src/styles.css?url": { "file": "assets/router-CTdYHFOk.js" }, "src/routes/__root.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/routes/login.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/routes/_app.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/routes/index.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/routes/_app/study.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/routes/_app/settings.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/routes/_app/routine.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/routes/_app/notes.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/routes/_app/exams.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/routes/_app/exam-prep.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/routes/_app/dashboard.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/routes/_app/courses.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/routes/_app/calendar.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/routes/_app/attendance.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/routes/_app/assignments.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/routes/_app/admin.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/routes/_app/courses.index.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/routes/_app/courses.$courseId.tsx": { "file": "assets/router-CTdYHFOk.js" }, "src/routeTree.gen.ts": { "file": "assets/router-CTdYHFOk.js" }, "src/router.tsx": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/@tanstack/start-client-core/dist/esm/client/hydrateStart.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/@tanstack/react-start-client/dist/esm/hydrateStart.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/@tanstack/react-start-client/dist/esm/StartClient.js": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/@tanstack/react-start/dist/plugin/default-entry/client.tsx": { "file": "assets/index-CwGe-_1f.js" }, "node_modules/lucide-react/dist/esm/icons/loader-circle.js": { "file": "assets/login-Nmgpw0C4.js" }, "node_modules/lucide-react/dist/esm/icons/sparkles.js": { "file": "assets/login-Nmgpw0C4.js" }, "src/routes/login.tsx?tsr-split=component": { "file": "assets/login-Nmgpw0C4.js" }, "node_modules/@tanstack/react-router/dist/esm/useRouterState.js": { "file": "assets/_app-a9DmVd10.js" }, "node_modules/lucide-react/dist/esm/icons/calendar-days.js": { "file": "assets/_app-a9DmVd10.js" }, "node_modules/lucide-react/dist/esm/icons/layout-dashboard.js": { "file": "assets/_app-a9DmVd10.js" }, "node_modules/lucide-react/dist/esm/icons/list-todo.js": { "file": "assets/_app-a9DmVd10.js" }, "node_modules/lucide-react/dist/esm/icons/menu.js": { "file": "assets/_app-a9DmVd10.js" }, "node_modules/lucide-react/dist/esm/icons/notebook-pen.js": { "file": "assets/_app-a9DmVd10.js" }, "node_modules/lucide-react/dist/esm/icons/settings.js": { "file": "assets/_app-a9DmVd10.js" }, "src/routes/_app.tsx?tsr-split=component": { "file": "assets/_app-a9DmVd10.js" }, "node_modules/lucide-react/dist/esm/icons/flame.js": { "file": "assets/study-Cz5bsjwF.js" }, "node_modules/lucide-react/dist/esm/icons/maximize-2.js": { "file": "assets/study-Cz5bsjwF.js" }, "node_modules/lucide-react/dist/esm/icons/minimize-2.js": { "file": "assets/study-Cz5bsjwF.js" }, "node_modules/lucide-react/dist/esm/icons/pause.js": { "file": "assets/study-Cz5bsjwF.js" }, "node_modules/lucide-react/dist/esm/icons/play.js": { "file": "assets/study-Cz5bsjwF.js" }, "node_modules/lucide-react/dist/esm/icons/rotate-ccw.js": { "file": "assets/study-Cz5bsjwF.js" }, "node_modules/lucide-react/dist/esm/icons/target.js": { "file": "assets/study-Cz5bsjwF.js" }, "src/lib/timerSound.ts": { "file": "assets/study-Cz5bsjwF.js" }, "src/routes/_app/study.tsx?tsr-split=component": { "file": "assets/study-Cz5bsjwF.js" }, "src/lib/db/resetUserData.ts": { "file": "assets/settings-DkialIMI.js" }, "src/routes/_app/settings.tsx?tsr-split=component": { "file": "assets/settings-DkialIMI.js" }, "node_modules/lucide-react/dist/esm/icons/log-out.js": { "file": "assets/sun-AX_p2AM5.js" }, "node_modules/lucide-react/dist/esm/icons/moon.js": { "file": "assets/sun-AX_p2AM5.js" }, "node_modules/lucide-react/dist/esm/icons/sun.js": { "file": "assets/sun-AX_p2AM5.js" }, "node_modules/lucide-react/dist/esm/icons/calendar-range.js": { "file": "assets/routine-g0zy4m07.js" }, "src/routes/_app/routine.tsx?tsr-split=component": { "file": "assets/routine-g0zy4m07.js" }, "node_modules/lucide-react/dist/esm/icons/pin.js": { "file": "assets/notes-DCx_gkxc.js" }, "src/routes/_app/notes.tsx?tsr-split=component": { "file": "assets/notes-DCx_gkxc.js" }, "node_modules/lucide-react/dist/esm/icons/award.js": { "file": "assets/exams-DZOJ15U_.js" }, "node_modules/lucide-react/dist/esm/icons/calendar.js": { "file": "assets/exams-DZOJ15U_.js" }, "src/routes/_app/exams.tsx?tsr-split=component": { "file": "assets/exams-DZOJ15U_.js" }, "node_modules/lucide-react/dist/esm/icons/graduation-cap.js": { "file": "assets/graduation-cap-CUuo92-b.js" }, "src/routes/_app/exam-prep.tsx?tsr-split=component": { "file": "assets/exam-prep-Ce2HogBT.js" }, "node_modules/lucide-react/dist/esm/icons/list-checks.js": { "file": "assets/list-checks-4erwzW-h.js" }, "node_modules/lucide-react/dist/esm/icons/arrow-up-right.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lucide-react/dist/esm/icons/quote.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/isArray.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_freeGlobal.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_root.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_Symbol.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_getRawTag.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_objectToString.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseGetTag.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/isObjectLike.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/isSymbol.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_isKey.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/isObject.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/isFunction.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_coreJsData.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_isMasked.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_toSource.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseIsNative.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_getValue.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_getNative.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_nativeCreate.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_hashClear.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_hashDelete.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_hashGet.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_hashHas.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_hashSet.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_Hash.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_listCacheClear.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/eq.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_assocIndexOf.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_listCacheDelete.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_listCacheGet.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_listCacheHas.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_listCacheSet.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_ListCache.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_Map.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_mapCacheClear.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_isKeyable.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_getMapData.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_mapCacheDelete.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_mapCacheGet.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_mapCacheHas.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_mapCacheSet.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_MapCache.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/memoize.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_memoizeCapped.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_stringToPath.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_arrayMap.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseToString.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/toString.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_castPath.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_toKey.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseGet.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/get.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/isNil.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/isString.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/react-is/cjs/react-is.production.min.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/react-is/index.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/isNumber.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/isNaN.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/DataUtils.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/ShallowEqual.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/types.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/ReactUtils.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/container/Surface.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/container/Layer.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/LogUtils.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseSlice.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_castSlice.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_hasUnicode.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_asciiToArray.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_unicodeToArray.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_stringToArray.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_createCaseFirst.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/upperFirst.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/constant.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/math.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-path/src/path.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/path.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/array.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/curve/linear.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/point.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/line.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/area.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/curve/bump.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/symbol/circle.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/symbol/cross.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/symbol/diamond.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/symbol/square.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/symbol/star.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/symbol/triangle.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/symbol/wye.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/symbol.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/noop.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/curve/basis.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/curve/basisClosed.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/curve/basisOpen.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/curve/linearClosed.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/curve/monotone.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/curve/natural.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/curve/step.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/offset/none.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/order/none.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/stack.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/offset/expand.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/offset/silhouette.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-shape/src/offset/wiggle.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/shape/Symbols.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/component/DefaultLegendContent.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_stackClear.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_stackDelete.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_stackGet.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_stackHas.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_stackSet.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_Stack.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_setCacheAdd.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_setCacheHas.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_SetCache.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_arraySome.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_cacheHas.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_equalArrays.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_Uint8Array.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_mapToArray.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_setToArray.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_equalByTag.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_arrayPush.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseGetAllKeys.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_arrayFilter.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/stubArray.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_getSymbols.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseTimes.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseIsArguments.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/isArguments.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/stubFalse.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/isBuffer.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_isIndex.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/isLength.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseIsTypedArray.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseUnary.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_nodeUtil.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/isTypedArray.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_arrayLikeKeys.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_isPrototype.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_overArg.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_nativeKeys.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseKeys.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/isArrayLike.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/keys.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_getAllKeys.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_equalObjects.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_DataView.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_Promise.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_Set.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_WeakMap.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_getTag.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseIsEqualDeep.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseIsEqual.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseIsMatch.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_isStrictComparable.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_getMatchData.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_matchesStrictComparable.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseMatches.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseHasIn.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_hasPath.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/hasIn.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseMatchesProperty.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/identity.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseProperty.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_basePropertyDeep.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/property.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseIteratee.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseFindIndex.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseIsNaN.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_strictIndexOf.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseIndexOf.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_arrayIncludes.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_arrayIncludesWith.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/noop.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_createSet.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseUniq.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/uniqBy.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/payload/getUniqPayload.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/component/Legend.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_isFlattenable.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseFlatten.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_createBaseFor.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseFor.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseForOwn.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_createBaseEach.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseEach.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseMap.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseSortBy.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_compareAscending.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_compareMultiple.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseOrderBy.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_apply.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_overRest.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/constant.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_defineProperty.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseSetToString.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_shortOut.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_setToString.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseRest.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_isIterateeCall.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/sortBy.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/component/DefaultTooltipContent.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/tooltip/translate.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/component/TooltipBoundingBox.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/Global.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/component/Tooltip.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/now.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_trimmedEndIndex.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseTrim.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/toNumber.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/debounce.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/throttle.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/component/ResponsiveContainer.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/component/Cell.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/DOMUtils.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/ReduceCSSCalc.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/component/Text.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-array/src/ascending.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-array/src/descending.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-array/src/bisector.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-array/src/number.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-array/src/bisect.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/internmap/src/index.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-array/src/sort.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-array/src/ticks.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-array/src/max.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-array/src/min.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-array/src/quickselect.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-array/src/quantile.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-array/src/range.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/init.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/ordinal.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/band.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-color/src/define.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-color/src/color.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-interpolate/src/constant.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-interpolate/src/color.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-interpolate/src/rgb.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-interpolate/src/numberArray.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-interpolate/src/array.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-interpolate/src/date.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-interpolate/src/number.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-interpolate/src/object.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-interpolate/src/string.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-interpolate/src/value.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-interpolate/src/round.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-interpolate/src/piecewise.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/constant.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/number.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/continuous.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-format/src/formatDecimal.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-format/src/exponent.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-format/src/formatGroup.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-format/src/formatNumerals.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-format/src/formatSpecifier.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-format/src/formatTrim.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-format/src/formatPrefixAuto.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-format/src/formatRounded.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-format/src/formatTypes.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-format/src/identity.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-format/src/locale.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-format/src/defaultLocale.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-format/src/precisionFixed.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-format/src/precisionPrefix.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-format/src/precisionRound.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/tickFormat.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/linear.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/identity.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/nice.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/log.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/symlog.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/pow.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/radial.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/quantile.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/quantize.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/threshold.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-time/src/interval.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-time/src/millisecond.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-time/src/duration.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-time/src/second.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-time/src/minute.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-time/src/hour.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-time/src/day.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-time/src/week.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-time/src/month.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-time/src/year.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-time/src/ticks.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-time-format/src/locale.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-time-format/src/defaultLocale.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/time.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/utcTime.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/sequential.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/sequentialQuantile.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/d3-scale/src/diverging.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/victory-vendor/es/d3-scale.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseExtremum.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseGt.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/max.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseLt.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/min.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/map.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/flatMap.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/isEqual.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/decimal.js-light/decimal.mjs": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts-scale/es6/util/utils.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts-scale/es6/util/arithmetic.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts-scale/es6/getNiceTickValues.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/tiny-invariant/dist/esm/tiny-invariant.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/cartesian/ErrorBar.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/getLegendProps.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/ChartUtils.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/PolarUtils.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/component/Label.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/last.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/component/LabelList.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/shape/Sector.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/shape/Curve.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/prop-types/lib/ReactPropTypesSecret.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/prop-types/factoryWithThrowingShims.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/prop-types/index.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/fast-equals/dist/es/index.mjs": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/react-smooth/es6/setRafTimeout.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/react-smooth/es6/AnimateManager.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/react-smooth/es6/util.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/react-smooth/es6/easing.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/react-smooth/es6/configUpdate.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/react-smooth/es6/Animate.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/shape/Rectangle.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/shape/Dot.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/shape/Cross.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_getPrototype.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/isPlainObject.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/isBoolean.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/shape/Trapezoid.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/ActiveShapeUtils.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseRange.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/toFinite.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_createRange.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/range.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/CssPrefixUtils.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/cartesian/Brush.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseSome.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/some.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/IfOverflowMatches.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseAssignValue.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/mapValues.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_arrayEvery.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_baseEvery.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/every.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/BarUtils.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/cartesian/Bar.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/CartesianUtils.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/_createFind.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/toInteger.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/findIndex.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lodash/find.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/calculateViewBox.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/context/chartLayoutContext.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/cartesian/ReferenceLine.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/cartesian/ReferenceDot.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/cartesian/ReferenceArea.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/getEveryNthWithCondition.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/TickUtils.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/cartesian/getEquidistantTicks.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/cartesian/getTicks.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/cartesian/CartesianAxis.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/cartesian/CartesianGrid.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/cartesian/Area.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/cartesian/XAxis.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/cartesian/YAxis.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/DetectReferenceElementsDomain.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/eventemitter3/index.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/Events.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/chart/AccessibilityManager.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/isDomainSpecifiedByUser.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/cursor/getCursorRectangle.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/cursor/getRadialCursorPoints.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/util/cursor/getCursorPoints.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/component/Cursor.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/chart/generateCategoricalChart.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/recharts/es6/chart/AreaChart.js": { "file": "assets/dashboard-DlUMu4JH.js" }, "src/lib/constants.ts": { "file": "assets/dashboard-DlUMu4JH.js" }, "src/routes/_app/dashboard.tsx?tsr-split=component": { "file": "assets/dashboard-DlUMu4JH.js" }, "node_modules/lucide-react/dist/esm/icons/calendar-check-2.js": { "file": "assets/timer-C2rDgvF9.js" }, "node_modules/lucide-react/dist/esm/icons/timer.js": { "file": "assets/timer-C2rDgvF9.js" }, "src/routes/_app/courses.tsx?tsr-split=component": { "file": "assets/courses-DWSO2_dd.js" }, "node_modules/lucide-react/dist/esm/icons/chevron-left.js": { "file": "assets/calendar-BYUcOb-U.js" }, "src/routes/_app/calendar.tsx?tsr-split=component": { "file": "assets/calendar-BYUcOb-U.js" }, "node_modules/lucide-react/dist/esm/icons/ban.js": { "file": "assets/attendance-DMhprbWT.js" }, "node_modules/lucide-react/dist/esm/icons/user-check.js": { "file": "assets/attendance-DMhprbWT.js" }, "node_modules/lucide-react/dist/esm/icons/user-x.js": { "file": "assets/attendance-DMhprbWT.js" }, "src/components/ui/textarea.tsx": { "file": "assets/attendance-DMhprbWT.js" }, "src/routes/_app/attendance.tsx?tsr-split=component": { "file": "assets/attendance-DMhprbWT.js" }, "src/routes/_app/assignments.tsx?tsr-split=component": { "file": "assets/assignments-Cd_0_93I.js" }, "node_modules/lucide-react/dist/esm/icons/search.js": { "file": "assets/search-CF2g7OSZ.js" }, "node_modules/lucide-react/dist/esm/icons/refresh-cw.js": { "file": "assets/admin-CfKvPV3N.js" }, "node_modules/lucide-react/dist/esm/icons/user-plus.js": { "file": "assets/admin-CfKvPV3N.js" }, "node_modules/lucide-react/dist/esm/icons/users.js": { "file": "assets/admin-CfKvPV3N.js" }, "src/lib/supabase/usersAdmin.ts": { "file": "assets/admin-CfKvPV3N.js" }, "src/routes/_app/admin.tsx?tsr-split=component": { "file": "assets/admin-CfKvPV3N.js" }, "node_modules/@radix-ui/react-roving-focus/dist/index.mjs": { "file": "assets/tabs-BGBPJ98U.js" }, "node_modules/@radix-ui/react-tabs/dist/index.mjs": { "file": "assets/tabs-BGBPJ98U.js" }, "src/components/ui/tabs.tsx": { "file": "assets/tabs-BGBPJ98U.js" }, "node_modules/lucide-react/dist/esm/icons/key-round.js": { "file": "assets/ChangePasswordForm-DOSVUkKu.js" }, "src/components/ChangePasswordForm.tsx": { "file": "assets/ChangePasswordForm-DOSVUkKu.js" }, "node_modules/lucide-react/dist/esm/icons/shield.js": { "file": "assets/shield-BzuPlltJ.js" }, "node_modules/lucide-react/dist/esm/icons/mail.js": { "file": "assets/mail-F3NjZY6i.js" }, "node_modules/lucide-react/dist/esm/icons/trash-2.js": { "file": "assets/trash-2-rIKLTn3v.js" }, "node_modules/lucide-react/dist/esm/icons/pencil.js": { "file": "assets/courses.index-DRRnsnMO.js" }, "src/routes/_app/courses.index.tsx?tsr-split=component": { "file": "assets/courses.index-DRRnsnMO.js" }, "node_modules/lucide-react/dist/esm/icons/chevron-right.js": { "file": "assets/chevron-right-B7tSAgOS.js" }, "node_modules/lucide-react/dist/esm/icons/triangle-alert.js": { "file": "assets/triangle-alert-imR-iVh_.js" }, "node_modules/@radix-ui/react-dialog/node_modules/@radix-ui/react-slot/dist/index.mjs": { "file": "assets/dialog-BmgT1gFM.js" }, "node_modules/@radix-ui/react-dialog/dist/index.mjs": { "file": "assets/dialog-BmgT1gFM.js" }, "src/components/ui/dialog.tsx": { "file": "assets/dialog-BmgT1gFM.js" }, "src/components/CourseSelect.tsx": { "file": "assets/CourseSelect-BhgjpK3F.js" }, "node_modules/@radix-ui/react-presence/dist/index.mjs": { "file": "assets/index-B1Mostm-.js" }, "node_modules/lucide-react/dist/esm/icons/chevron-down.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/lucide-react/dist/esm/icons/chevron-up.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/@radix-ui/number/dist/index.mjs": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/@radix-ui/react-use-escape-keydown/dist/index.mjs": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/@radix-ui/react-focus-guards/dist/index.mjs": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/@radix-ui/react-focus-scope/dist/index.mjs": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/@floating-ui/core/dist/floating-ui.core.mjs": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/@floating-ui/react-dom/dist/floating-ui.react-dom.mjs": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/@radix-ui/react-arrow/dist/index.mjs": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/@radix-ui/react-use-size/dist/index.mjs": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/@radix-ui/react-popper/dist/index.mjs": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/@radix-ui/react-portal/dist/index.mjs": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/@radix-ui/react-select/node_modules/@radix-ui/react-slot/dist/index.mjs": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/@radix-ui/react-use-previous/dist/index.mjs": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/@radix-ui/react-visually-hidden/dist/index.mjs": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/aria-hidden/dist/es2015/index.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/react-remove-scroll-bar/dist/es2015/constants.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/use-callback-ref/dist/es2015/assignRef.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/use-callback-ref/dist/es2015/useRef.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/use-callback-ref/dist/es2015/useMergeRef.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/use-sidecar/dist/es2015/medium.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/use-sidecar/dist/es2015/exports.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/react-remove-scroll/dist/es2015/medium.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/react-remove-scroll/dist/es2015/UI.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/get-nonce/dist/es2015/index.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/react-style-singleton/dist/es2015/singleton.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/react-style-singleton/dist/es2015/hook.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/react-style-singleton/dist/es2015/component.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/react-remove-scroll-bar/dist/es2015/utils.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/react-remove-scroll-bar/dist/es2015/component.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/react-remove-scroll/dist/es2015/aggresiveCapture.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/react-remove-scroll/dist/es2015/handleScroll.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/react-remove-scroll/dist/es2015/SideEffect.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/react-remove-scroll/dist/es2015/sidecar.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/react-remove-scroll/dist/es2015/Combination.js": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/@radix-ui/react-select/dist/index.mjs": { "file": "assets/select-DHN0rxF_.js" }, "src/components/ui/select.tsx": { "file": "assets/select-DHN0rxF_.js" }, "node_modules/@radix-ui/primitive/dist/index.mjs": { "file": "assets/index-BcqomYnJ.js" }, "node_modules/@radix-ui/react-context/dist/index.mjs": { "file": "assets/index-BcqomYnJ.js" }, "node_modules/@radix-ui/react-collection/node_modules/@radix-ui/react-slot/dist/index.mjs": { "file": "assets/index-BcqomYnJ.js" }, "node_modules/@radix-ui/react-collection/dist/index.mjs": { "file": "assets/index-BcqomYnJ.js" }, "node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs": { "file": "assets/index-BcqomYnJ.js" }, "node_modules/@radix-ui/react-id/dist/index.mjs": { "file": "assets/index-BcqomYnJ.js" }, "node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs": { "file": "assets/index-BcqomYnJ.js" }, "node_modules/@radix-ui/react-primitive/dist/index.mjs": { "file": "assets/index-BcqomYnJ.js" }, "node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs": { "file": "assets/index-BcqomYnJ.js" }, "node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs": { "file": "assets/index-BcqomYnJ.js" }, "node_modules/@radix-ui/react-direction/dist/index.mjs": { "file": "assets/index-BcqomYnJ.js" }, "node_modules/lucide-react/dist/esm/icons/check.js": { "file": "assets/check-CvBesx_l.js" }, "node_modules/lucide-react/dist/esm/icons/arrow-left.js": { "file": "assets/courses._courseId-CEgci_4O.js" }, "src/routes/_app/courses.$courseId.tsx?tsr-split=component": { "file": "assets/courses._courseId-CEgci_4O.js" }, "node_modules/lucide-react/dist/esm/icons/clipboard-list.js": { "file": "assets/clipboard-list-mEJa_sXH.js" }, "node_modules/lucide-react/dist/esm/icons/book-open.js": { "file": "assets/book-open-49nqEHGe.js" }, "node_modules/lucide-react/dist/esm/icons/x.js": { "file": "assets/x-hdVcQCsH.js" }, "node_modules/lucide-react/dist/esm/icons/plus.js": { "file": "assets/plus-BYQi9liU.js" }, "node_modules/@radix-ui/react-label/node_modules/@radix-ui/react-primitive/dist/index.mjs": { "file": "assets/label-BPM5O42P.js" }, "node_modules/@radix-ui/react-label/dist/index.mjs": { "file": "assets/label-BPM5O42P.js" }, "src/components/ui/label.tsx": { "file": "assets/label-BPM5O42P.js" }, "src/components/ui/button.tsx": { "file": "assets/button-B_NfezXh.js" }, "src/components/ui/input.tsx": { "file": "assets/input-B3Kt6F9h.js" }, "node_modules/@radix-ui/react-slot/dist/index.mjs": { "file": "assets/index-0UuDEara.js" }, "node_modules/class-variance-authority/dist/index.mjs": { "file": "assets/index-0UuDEara.js" }, "node_modules/@radix-ui/react-compose-refs/dist/index.mjs": { "file": "assets/utils-CZ556u-x.js" }, "node_modules/tailwind-merge/dist/bundle-mjs.mjs": { "file": "assets/utils-CZ556u-x.js" }, "src/lib/utils.ts": { "file": "assets/utils-CZ556u-x.js" }, "node_modules/clsx/dist/clsx.mjs": { "file": "assets/clsx-DgYk2OaC.js" }, "node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.js": { "file": "assets/createLucideIcon-CEt2Dx5A.js" }, "node_modules/lucide-react/dist/esm/shared/src/utils/toKebabCase.js": { "file": "assets/createLucideIcon-CEt2Dx5A.js" }, "node_modules/lucide-react/dist/esm/shared/src/utils/toCamelCase.js": { "file": "assets/createLucideIcon-CEt2Dx5A.js" }, "node_modules/lucide-react/dist/esm/shared/src/utils/toPascalCase.js": { "file": "assets/createLucideIcon-CEt2Dx5A.js" }, "node_modules/lucide-react/dist/esm/defaultAttributes.js": { "file": "assets/createLucideIcon-CEt2Dx5A.js" }, "node_modules/lucide-react/dist/esm/shared/src/utils/hasA11yProp.js": { "file": "assets/createLucideIcon-CEt2Dx5A.js" }, "node_modules/lucide-react/dist/esm/Icon.js": { "file": "assets/createLucideIcon-CEt2Dx5A.js" }, "node_modules/lucide-react/dist/esm/createLucideIcon.js": { "file": "assets/createLucideIcon-CEt2Dx5A.js" }, "src/lib/error-capture.ts": { "file": "server.js" }, "src/lib/error-page.ts": { "file": "server.js" }, "src/server.ts": { "file": "server.js" }, "node_modules/@tanstack/router-core/dist/esm/isServer/server.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/ssr/constants.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/react-router/dist/esm/ScriptOnce.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/scroll-restoration-inline.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/scroll-restoration-script/server.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/react-start-server/dist/esm/StartServer.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/react-dom/cjs/react-dom-server-legacy.node.production.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/react-dom/cjs/react-dom-server.node.production.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/react-dom/server.node.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/ssr/tsrScript.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/ssr/ssr-server.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/cookie-es/dist/index.mjs": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/ssr/headers.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/ssr/handlerCallback.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/router-core/dist/esm/ssr/transformStreamWithRouter.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/isbot/index.mjs": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/react-router/dist/esm/ssr/renderRouterToStream.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/react-start-server/dist/esm/defaultStreamHandler.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/rou3/dist/index.mjs": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/srvx/dist/_chunks/_url.mjs": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/srvx/dist/adapters/node.mjs": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/h3-v2/dist/h3-Bz4OPZv_.mjs": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/start-server-core/dist/esm/request-response.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/start-server-core/dist/esm/constants.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/start-server-core/dist/esm/router-manifest.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/start-client-core/dist/esm/safeObjectMerge.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/start-storage-context/dist/esm/async-local-storage.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/start-client-core/dist/esm/createServerFn.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/start-client-core/dist/esm/createCsrfMiddleware.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/start-server-core/dist/esm/frame-protocol.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/start-server-core/dist/esm/server-functions-handler.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/start-server-core/dist/esm/early-hints.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/start-server-core/dist/esm/transformAssetUrls.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/start-server-core/dist/esm/inlineCss.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/start-server-core/dist/esm/finalManifest.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/start-server-core/dist/esm/serializer/ServerFunctionSerializationAdapter.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/start-server-core/dist/esm/createStartHandler.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/@tanstack/react-start/dist/default-entry/esm/server.js": { "file": "assets/server-BB9Vuddr.js" }, "node_modules/tslib/tslib.js": { "file": "assets/router-CTdYHFOk.js" }, "node_modules/tslib/modules/index.js": { "file": "assets/router-CTdYHFOk.js" } };
function lazyService(loader) {
  let promise, mod;
  return {
    fetch(req) {
      if (mod) {
        return mod.fetch(req);
      }
      if (!promise) {
        promise = loader().then((_mod) => mod = _mod.default || _mod);
      }
      return promise.then((mod2) => mod2.fetch(req));
    }
  };
}
const services = {
  ["ssr"]: lazyService(() => import("./chunks/build/server.mjs"))
};
setupVite({ manifest, services });
function defineNitroErrorHandler(handler) {
  return handler;
}
const NullProtoObj = /* @__PURE__ */ (() => {
  const e = function() {
  };
  return e.prototype = /* @__PURE__ */ Object.create(null), Object.freeze(e.prototype), e;
})();
function splitSetCookieString$1(cookiesString) {
  if (Array.isArray(cookiesString)) return cookiesString.flatMap((c) => splitSetCookieString$1(c));
  if (typeof cookiesString !== "string") return [];
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) pos += 1;
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) pos += 1;
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else pos = lastComma + 1;
      } else pos += 1;
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) cookiesStrings.push(cookiesString.slice(start));
  }
  return cookiesStrings;
}
function lazyInherit$1(target, source, sourceKey) {
  for (const key of Object.getOwnPropertyNames(source)) {
    if (key === "constructor") continue;
    const targetDesc = Object.getOwnPropertyDescriptor(target, key);
    const desc = Object.getOwnPropertyDescriptor(source, key);
    let modified = false;
    if (desc.get) {
      modified = true;
      desc.get = targetDesc?.get || function() {
        return this[sourceKey][key];
      };
    }
    if (desc.set) {
      modified = true;
      desc.set = targetDesc?.set || function(value) {
        this[sourceKey][key] = value;
      };
    }
    if (typeof desc.value === "function") {
      modified = true;
      desc.value = function(...args) {
        return this[sourceKey][key](...args);
      };
    }
    if (modified) Object.defineProperty(target, key, desc);
  }
}
const FastURL = /* @__PURE__ */ (() => {
  const NativeURL = globalThis.URL;
  const FastURL$1 = class URL {
    #url;
    #href;
    #protocol;
    #host;
    #pathname;
    #search;
    #searchParams;
    #pos;
    constructor(url) {
      if (typeof url === "string") this.#href = url;
      else {
        this.#protocol = url.protocol;
        this.#host = url.host;
        this.#pathname = url.pathname;
        this.#search = url.search;
      }
    }
    get _url() {
      if (this.#url) return this.#url;
      this.#url = new NativeURL(this.href);
      this.#href = void 0;
      this.#protocol = void 0;
      this.#host = void 0;
      this.#pathname = void 0;
      this.#search = void 0;
      this.#searchParams = void 0;
      this.#pos = void 0;
      return this.#url;
    }
    get href() {
      if (this.#url) return this.#url.href;
      if (!this.#href) this.#href = `${this.#protocol || "http:"}//${this.#host || "localhost"}${this.#pathname || "/"}${this.#search || ""}`;
      return this.#href;
    }
    #getPos() {
      if (!this.#pos) {
        const url = this.href;
        const protoIndex = url.indexOf("://");
        const pathnameIndex = protoIndex === -1 ? -1 : url.indexOf("/", protoIndex + 4);
        const qIndex = pathnameIndex === -1 ? -1 : url.indexOf("?", pathnameIndex);
        this.#pos = [
          protoIndex,
          pathnameIndex,
          qIndex
        ];
      }
      return this.#pos;
    }
    get pathname() {
      if (this.#url) return this.#url.pathname;
      if (this.#pathname === void 0) {
        const [, pathnameIndex, queryIndex] = this.#getPos();
        if (pathnameIndex === -1) return this._url.pathname;
        this.#pathname = this.href.slice(pathnameIndex, queryIndex === -1 ? void 0 : queryIndex);
      }
      return this.#pathname;
    }
    get search() {
      if (this.#url) return this.#url.search;
      if (this.#search === void 0) {
        const [, pathnameIndex, queryIndex] = this.#getPos();
        if (pathnameIndex === -1) return this._url.search;
        const url = this.href;
        this.#search = queryIndex === -1 || queryIndex === url.length - 1 ? "" : url.slice(queryIndex);
      }
      return this.#search;
    }
    get searchParams() {
      if (this.#url) return this.#url.searchParams;
      if (!this.#searchParams) this.#searchParams = new URLSearchParams(this.search);
      return this.#searchParams;
    }
    get protocol() {
      if (this.#url) return this.#url.protocol;
      if (this.#protocol === void 0) {
        const [protocolIndex] = this.#getPos();
        if (protocolIndex === -1) return this._url.protocol;
        const url = this.href;
        this.#protocol = url.slice(0, protocolIndex + 1);
      }
      return this.#protocol;
    }
    toString() {
      return this.href;
    }
    toJSON() {
      return this.href;
    }
  };
  lazyInherit$1(FastURL$1.prototype, NativeURL.prototype, "_url");
  Object.setPrototypeOf(FastURL$1.prototype, NativeURL.prototype);
  Object.setPrototypeOf(FastURL$1, NativeURL);
  return FastURL$1;
})();
const NodeResponse$1 = /* @__PURE__ */ (() => {
  const NativeResponse = globalThis.Response;
  const STATUS_CODES = globalThis.process?.getBuiltinModule?.("node:http")?.STATUS_CODES || {};
  class NodeResponse$12 {
    #body;
    #init;
    #headers;
    #response;
    constructor(body, init) {
      this.#body = body;
      this.#init = init;
    }
    get status() {
      return this.#response?.status || this.#init?.status || 200;
    }
    get statusText() {
      return this.#response?.statusText || this.#init?.statusText || STATUS_CODES[this.status] || "";
    }
    get headers() {
      if (this.#response) return this.#response.headers;
      if (this.#headers) return this.#headers;
      const initHeaders = this.#init?.headers;
      return this.#headers = initHeaders instanceof Headers ? initHeaders : new Headers(initHeaders);
    }
    get ok() {
      if (this.#response) return this.#response.ok;
      const status = this.status;
      return status >= 200 && status < 300;
    }
    get _response() {
      if (this.#response) return this.#response;
      this.#response = new NativeResponse(this.#body, this.#headers ? {
        ...this.#init,
        headers: this.#headers
      } : this.#init);
      this.#init = void 0;
      this.#headers = void 0;
      this.#body = void 0;
      return this.#response;
    }
    nodeResponse() {
      const status = this.status;
      const statusText = this.statusText;
      let body;
      let contentType;
      let contentLength;
      if (this.#response) body = this.#response.body;
      else if (this.#body) if (this.#body instanceof ReadableStream) body = this.#body;
      else if (typeof this.#body === "string") {
        body = this.#body;
        contentType = "text/plain; charset=UTF-8";
        contentLength = Buffer.byteLength(this.#body);
      } else if (this.#body instanceof ArrayBuffer) {
        body = Buffer.from(this.#body);
        contentLength = this.#body.byteLength;
      } else if (this.#body instanceof Uint8Array) {
        body = this.#body;
        contentLength = this.#body.byteLength;
      } else if (this.#body instanceof DataView) {
        body = Buffer.from(this.#body.buffer);
        contentLength = this.#body.byteLength;
      } else if (this.#body instanceof Blob) {
        body = this.#body.stream();
        contentType = this.#body.type;
        contentLength = this.#body.size;
      } else if (typeof this.#body.pipe === "function") body = this.#body;
      else body = this._response.body;
      const rawNodeHeaders = [];
      const initHeaders = this.#init?.headers;
      const headerEntries = this.#response?.headers || this.#headers || (initHeaders ? Array.isArray(initHeaders) ? initHeaders : initHeaders?.entries ? initHeaders.entries() : Object.entries(initHeaders).map(([k, v]) => [k.toLowerCase(), v]) : void 0);
      let hasContentTypeHeader;
      let hasContentLength;
      if (headerEntries) for (const [key, value] of headerEntries) {
        if (key === "set-cookie") {
          for (const setCookie of splitSetCookieString$1(value)) rawNodeHeaders.push(["set-cookie", setCookie]);
          continue;
        }
        rawNodeHeaders.push([key, value]);
        if (key === "content-type") hasContentTypeHeader = true;
        else if (key === "content-length") hasContentLength = true;
      }
      if (contentType && !hasContentTypeHeader) rawNodeHeaders.push(["content-type", contentType]);
      if (contentLength && !hasContentLength) rawNodeHeaders.push(["content-length", String(contentLength)]);
      this.#init = void 0;
      this.#headers = void 0;
      this.#response = void 0;
      this.#body = void 0;
      return {
        status,
        statusText,
        headers: rawNodeHeaders,
        body
      };
    }
  }
  lazyInherit$1(NodeResponse$12.prototype, NativeResponse.prototype, "_response");
  Object.setPrototypeOf(NodeResponse$12, NativeResponse);
  Object.setPrototypeOf(NodeResponse$12.prototype, NativeResponse.prototype);
  return NodeResponse$12;
})();
const kEventNS = "h3.internal.event.";
const kEventRes = /* @__PURE__ */ Symbol.for(`${kEventNS}res`);
const kEventResHeaders = /* @__PURE__ */ Symbol.for(`${kEventNS}res.headers`);
var H3Event = class {
  /**
  * Access to the H3 application instance.
  */
  app;
  /**
  * Incoming HTTP request info.
  *
  * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Request)
  */
  req;
  /**
  * Access to the parsed request URL.
  *
  * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/URL)
  */
  url;
  /**
  * Event context.
  */
  context;
  /**
  * @internal
  */
  static __is_event__ = true;
  constructor(req, context, app) {
    this.context = context || req.context || new NullProtoObj();
    this.req = req;
    this.app = app;
    const _url = req._url;
    this.url = _url && _url instanceof URL ? _url : new FastURL(req.url);
  }
  /**
  * Prepared HTTP response.
  */
  get res() {
    return this[kEventRes] ||= new H3EventResponse();
  }
  /**
  * Access to runtime specific additional context.
  *
  */
  get runtime() {
    return this.req.runtime;
  }
  /**
  * Tell the runtime about an ongoing operation that shouldn't close until the promise resolves.
  */
  waitUntil(promise) {
    this.req.waitUntil?.(promise);
  }
  toString() {
    return `[${this.req.method}] ${this.req.url}`;
  }
  toJSON() {
    return this.toString();
  }
  /**
  * Access to the raw Node.js req/res objects.
  *
  * @deprecated Use `event.runtime.{node|deno|bun|...}.` instead.
  */
  get node() {
    return this.req.runtime?.node;
  }
  /**
  * Access to the incoming request headers.
  *
  * @deprecated Use `event.req.headers` instead.
  *
  */
  get headers() {
    return this.req.headers;
  }
  /**
  * Access to the incoming request url (pathname+search).
  *
  * @deprecated Use `event.url.pathname + event.url.search` instead.
  *
  * Example: `/api/hello?name=world`
  * */
  get path() {
    return this.url.pathname + this.url.search;
  }
  /**
  * Access to the incoming request method.
  *
  * @deprecated Use `event.req.method` instead.
  */
  get method() {
    return this.req.method;
  }
};
var H3EventResponse = class {
  status;
  statusText;
  get headers() {
    return this[kEventResHeaders] ||= new Headers();
  }
};
const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) return defaultStatusCode;
  if (typeof statusCode === "string") statusCode = +statusCode;
  if (statusCode < 100 || statusCode > 599) return defaultStatusCode;
  return statusCode;
}
var HTTPError = class HTTPError2 extends Error {
  get name() {
    return "HTTPError";
  }
  /**
  * HTTP status code in range [200...599]
  */
  status;
  /**
  * HTTP status text
  *
  * **NOTE:** This should be short (max 512 to 1024 characters).
  * Allowed characters are tabs, spaces, visible ASCII characters, and extended characters (byte value 128–255).
  *
  * **TIP:** Use `message` for longer error descriptions in JSON body.
  */
  statusText;
  /**
  * Additional HTTP headers to be sent in error response.
  */
  headers;
  /**
  * Original error object that caused this error.
  */
  cause;
  /**
  * Additional data attached in the error JSON body under `data` key.
  */
  data;
  /**
  * Additional top level JSON body properties to attach in the error JSON body.
  */
  body;
  /**
  * Flag to indicate that the error was not handled by the application.
  *
  * Unhandled error stack trace, data and message are hidden in non debug mode for security reasons.
  */
  unhandled;
  /**
  * Check if the input is an instance of HTTPError using its constructor name.
  *
  * It is safer than using `instanceof` because it works across different contexts (e.g., if the error was thrown in a different module).
  */
  static isError(input) {
    return input instanceof Error && input?.name === "HTTPError";
  }
  /**
  * Create a new HTTPError with the given status code and optional status text and details.
  *
  * @example
  *
  * HTTPError.status(404)
  * HTTPError.status(418, "I'm a teapot")
  * HTTPError.status(403, "Forbidden", { message: "Not authenticated" })
  */
  static status(status, statusText, details) {
    return new HTTPError2({
      ...details,
      statusText,
      status
    });
  }
  constructor(arg1, arg2) {
    let messageInput;
    let details;
    if (typeof arg1 === "string") {
      messageInput = arg1;
      details = arg2;
    } else details = arg1;
    const status = sanitizeStatusCode(details?.status || details?.cause?.status || details?.status || details?.statusCode, 500);
    const statusText = sanitizeStatusMessage(details?.statusText || details?.cause?.statusText || details?.statusText || details?.statusMessage);
    const message = messageInput || details?.message || details?.cause?.message || details?.statusText || details?.statusMessage || [
      "HTTPError",
      status,
      statusText
    ].filter(Boolean).join(" ");
    super(message, { cause: details });
    this.cause = details;
    Error.captureStackTrace?.(this, this.constructor);
    this.status = status;
    this.statusText = statusText || void 0;
    const rawHeaders = details?.headers || details?.cause?.headers;
    this.headers = rawHeaders ? new Headers(rawHeaders) : void 0;
    this.unhandled = details?.unhandled ?? details?.cause?.unhandled ?? void 0;
    this.data = details?.data;
    this.body = details?.body;
  }
  /**
  * @deprecated Use `status`
  */
  get statusCode() {
    return this.status;
  }
  /**
  * @deprecated Use `statusText`
  */
  get statusMessage() {
    return this.statusText;
  }
  toJSON() {
    const unhandled = this.unhandled;
    return {
      status: this.status,
      statusText: this.statusText,
      unhandled,
      message: unhandled ? "HTTPError" : this.message,
      data: unhandled ? void 0 : this.data,
      ...unhandled ? void 0 : this.body
    };
  }
};
function isJSONSerializable(value, _type) {
  if (value === null || value === void 0) return true;
  if (_type !== "object") return _type === "boolean" || _type === "number" || _type === "string";
  if (typeof value.toJSON === "function") return true;
  if (Array.isArray(value)) return true;
  if (typeof value.pipe === "function" || typeof value.pipeTo === "function") return false;
  if (value instanceof NullProtoObj) return true;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
const kNotFound = /* @__PURE__ */ Symbol.for("h3.notFound");
const kHandled = /* @__PURE__ */ Symbol.for("h3.handled");
function toResponse(val, event, config = {}) {
  if (typeof val?.then === "function") return (val.catch?.((error) => error) || Promise.resolve(val)).then((resolvedVal) => toResponse(resolvedVal, event, config));
  const response = prepareResponse(val, event, config);
  if (typeof response?.then === "function") return toResponse(response, event, config);
  const { onResponse: onResponse$1 } = config;
  return onResponse$1 ? Promise.resolve(onResponse$1(response, event)).then(() => response) : response;
}
var HTTPResponse = class {
  #headers;
  #init;
  body;
  constructor(body, init) {
    this.body = body;
    this.#init = init;
  }
  get status() {
    return this.#init?.status || 200;
  }
  get statusText() {
    return this.#init?.statusText || "OK";
  }
  get headers() {
    return this.#headers ||= new Headers(this.#init?.headers);
  }
};
function prepareResponse(val, event, config, nested) {
  if (val === kHandled) return new NodeResponse$1(null);
  if (val === kNotFound) val = new HTTPError({
    status: 404,
    message: `Cannot find any route matching [${event.req.method}] ${event.url}`
  });
  if (val && val instanceof Error) {
    const isHTTPError = HTTPError.isError(val);
    const error = isHTTPError ? val : new HTTPError(val);
    if (!isHTTPError) {
      error.unhandled = true;
      if (val?.stack) error.stack = val.stack;
    }
    if (error.unhandled && !config.silent) console.error(error);
    const { onError: onError$1 } = config;
    return onError$1 && !nested ? Promise.resolve(onError$1(error, event)).catch((error$1) => error$1).then((newVal) => prepareResponse(newVal ?? val, event, config, true)) : errorResponse(error, config.debug);
  }
  const preparedRes = event[kEventRes];
  const preparedHeaders = preparedRes?.[kEventResHeaders];
  if (!(val instanceof Response)) {
    const res = prepareResponseBody(val, event, config);
    const status = res.status || preparedRes?.status;
    return new NodeResponse$1(nullBody(event.req.method, status) ? null : res.body, {
      status,
      statusText: res.statusText || preparedRes?.statusText,
      headers: res.headers && preparedHeaders ? mergeHeaders$1(res.headers, preparedHeaders) : res.headers || preparedHeaders
    });
  }
  if (!preparedHeaders) return val;
  try {
    mergeHeaders$1(val.headers, preparedHeaders, val.headers);
    return val;
  } catch {
    return new NodeResponse$1(nullBody(event.req.method, val.status) ? null : val.body, {
      status: val.status,
      statusText: val.statusText,
      headers: mergeHeaders$1(val.headers, preparedHeaders)
    });
  }
}
function mergeHeaders$1(base, overrides, target = new Headers(base)) {
  for (const [name, value] of overrides) if (name === "set-cookie") target.append(name, value);
  else target.set(name, value);
  return target;
}
const emptyHeaders = /* @__PURE__ */ new Headers({ "content-length": "0" });
const jsonHeaders = /* @__PURE__ */ new Headers({ "content-type": "application/json;charset=UTF-8" });
function prepareResponseBody(val, event, config) {
  if (val === null || val === void 0) return {
    body: "",
    headers: emptyHeaders
  };
  const valType = typeof val;
  if (valType === "string") return { body: val };
  if (val instanceof Uint8Array) {
    event.res.headers.set("content-length", val.byteLength.toString());
    return { body: val };
  }
  if (val instanceof HTTPResponse || val?.constructor?.name === "HTTPResponse") return val;
  if (isJSONSerializable(val, valType)) return {
    body: JSON.stringify(val, void 0, config.debug ? 2 : void 0),
    headers: jsonHeaders
  };
  if (valType === "bigint") return {
    body: val.toString(),
    headers: jsonHeaders
  };
  if (val instanceof Blob) {
    const headers2 = new Headers({
      "content-type": val.type,
      "content-length": val.size.toString()
    });
    let filename = val.name;
    if (filename) {
      filename = encodeURIComponent(filename);
      headers2.set("content-disposition", `filename="${filename}"; filename*=UTF-8''${filename}`);
    }
    return {
      body: val.stream(),
      headers: headers2
    };
  }
  if (valType === "symbol") return { body: val.toString() };
  if (valType === "function") return { body: `${val.name}()` };
  return { body: val };
}
function nullBody(method, status) {
  return method === "HEAD" || status === 100 || status === 101 || status === 102 || status === 204 || status === 205 || status === 304;
}
function errorResponse(error, debug) {
  return new NodeResponse$1(JSON.stringify({
    ...error.toJSON(),
    stack: debug && error.stack ? error.stack.split("\n").map((l) => l.trim()) : void 0
  }, void 0, debug ? 2 : void 0), {
    status: error.status,
    statusText: error.statusText,
    headers: error.headers ? mergeHeaders$1(jsonHeaders, error.headers) : jsonHeaders
  });
}
function callMiddleware(event, middleware, handler, index = 0) {
  if (index === middleware.length) return handler(event);
  const fn = middleware[index];
  let nextCalled;
  let nextResult;
  const next = () => {
    if (nextCalled) return nextResult;
    nextCalled = true;
    nextResult = callMiddleware(event, middleware, handler, index + 1);
    return nextResult;
  };
  const ret = fn(event, next);
  return is404(ret) ? next() : typeof ret?.then === "function" ? ret.then((resolved) => is404(resolved) ? next() : resolved) : ret;
}
function is404(val) {
  return val === void 0 || val === kNotFound || val?.status === 404 && val instanceof Response;
}
function toRequest(input, options) {
  if (typeof input === "string") {
    let url = input;
    if (url[0] === "/") {
      const headers2 = options?.headers ? new Headers(options.headers) : void 0;
      const host = headers2?.get("host") || "localhost";
      const proto = headers2?.get("x-forwarded-proto") === "https" ? "https" : "http";
      url = `${proto}://${host}${url}`;
    }
    return new Request(url, options);
  } else if (options || input instanceof URL) return new Request(input, options);
  return input;
}
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.req.headers.get("x-forwarded-host");
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) return xForwardedHost;
  }
  return event.req.headers.get("host") || "";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false) {
    const forwardedProto = event.req.headers.get("x-forwarded-proto");
    if (forwardedProto === "https") return "https";
    if (forwardedProto === "http") return "http";
  }
  const url = event.url || new URL(event.req.url);
  return url.protocol.slice(0, -1);
}
function getRequestURL(event, opts = {}) {
  const url = new URL(event.url || event.req.url);
  url.protocol = getRequestProtocol(event, opts);
  if (opts.xForwardedHost) {
    const host = getRequestHost(event, opts);
    if (host) {
      url.host = host;
      if (!host.includes(":")) url.port = "";
    }
  }
  return url;
}
function defineHandler(input) {
  if (typeof input === "function") return handlerWithFetch(input);
  const handler = input.handler || (input.fetch ? function _fetchHandler(event) {
    return input.fetch(event.req);
  } : NoHandler);
  return Object.assign(handlerWithFetch(input.middleware?.length ? function _handlerMiddleware(event) {
    return callMiddleware(event, input.middleware, handler);
  } : handler), input);
}
function handlerWithFetch(handler) {
  if ("fetch" in handler) return handler;
  return Object.assign(handler, { fetch: (req) => {
    if (typeof req === "string") req = new URL(req, "http://_");
    if (req instanceof URL) req = new Request(req);
    const event = new H3Event(req);
    try {
      return Promise.resolve(toResponse(handler(event), event));
    } catch (error) {
      return Promise.resolve(toResponse(error, event));
    }
  } });
}
function defineLazyEventHandler(loader) {
  let handler;
  let promise;
  const resolveLazyHandler = () => {
    if (handler) return Promise.resolve(handler);
    return promise ??= Promise.resolve(loader()).then((r) => {
      handler = toEventHandler(r) || toEventHandler(r.default);
      if (typeof handler !== "function") throw new TypeError("Invalid lazy handler", { cause: { resolved: r } });
      return handler;
    });
  };
  return defineHandler(function lazyHandler(event) {
    return handler ? handler(event) : resolveLazyHandler().then((r) => r(event));
  });
}
function toEventHandler(handler) {
  if (typeof handler === "function") return handler;
  if (typeof handler?.handler === "function") return handler.handler;
  if (typeof handler?.fetch === "function") return function _fetchHandler(event) {
    return handler.fetch(event.req);
  };
}
const NoHandler = () => kNotFound;
const H3Core = /* @__PURE__ */ (() => {
  const HTTPMethods = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "HEAD",
    "OPTIONS",
    "CONNECT",
    "TRACE"
  ];
  class H3Core$1 {
    _middleware;
    _routes = [];
    config;
    constructor(config = {}) {
      this._middleware = [];
      this.config = config;
      this.fetch = this.fetch.bind(this);
      this.request = this.request.bind(this);
      this.handler = this.handler.bind(this);
      config.plugins?.forEach((plugin) => plugin(this));
    }
    fetch(request) {
      return this._request(request);
    }
    request(_req, _init, context) {
      return this._request(toRequest(_req, _init), context);
    }
    _request(request, context) {
      const event = new H3Event(request, context, this);
      let handlerRes;
      try {
        if (this.config.onRequest) {
          const hookRes = this.config.onRequest(event);
          handlerRes = typeof hookRes?.then === "function" ? hookRes.then(() => this.handler(event)) : this.handler(event);
        } else handlerRes = this.handler(event);
      } catch (error) {
        handlerRes = Promise.reject(error);
      }
      return toResponse(handlerRes, event, this.config);
    }
    /**
    * Immediately register an H3 plugin.
    */
    register(plugin) {
      plugin(this);
      return this;
    }
    _findRoute(_event) {
    }
    _addRoute(_route) {
      this._routes.push(_route);
    }
    _getMiddleware(_event, route) {
      return route?.data.middleware ? [...this._middleware, ...route.data.middleware] : this._middleware;
    }
    handler(event) {
      const route = this._findRoute(event);
      if (route) {
        event.context.params = route.params;
        event.context.matchedRoute = route.data;
      }
      const routeHandler = route?.data.handler || NoHandler;
      const middleware = this._getMiddleware(event, route);
      return middleware.length > 0 ? callMiddleware(event, middleware, routeHandler) : routeHandler(event);
    }
    mount(base, input) {
      if ("handler" in input) {
        if (input._middleware.length > 0) this._middleware.push((event, next) => {
          return event.url.pathname.startsWith(base) ? callMiddleware(event, input._middleware, next) : next();
        });
        for (const r of input._routes) this._addRoute({
          ...r,
          route: base + r.route
        });
      } else {
        const fetchHandler = "fetch" in input ? input.fetch : input;
        this.all(`${base}/**`, function _mountedMiddleware(event) {
          const url = new URL(event.url);
          url.pathname = url.pathname.slice(base.length) || "/";
          return fetchHandler(new Request(url, event.req));
        });
      }
      return this;
    }
    all(route, handler, opts) {
      return this.on("", route, handler, opts);
    }
    on(method, route, handler, opts) {
      const _method = (method || "").toUpperCase();
      route = new URL(route, "http://_").pathname;
      this._addRoute({
        method: _method,
        route,
        handler: toEventHandler(handler),
        middleware: opts?.middleware,
        meta: {
          ...handler.meta,
          ...opts?.meta
        }
      });
      return this;
    }
    _normalizeMiddleware(fn, _opts) {
      return fn;
    }
    use(arg1, arg2, arg3) {
      let route;
      let fn;
      let opts;
      if (typeof arg1 === "string") {
        route = arg1;
        fn = arg2;
        opts = arg3;
      } else {
        fn = arg1;
        opts = arg2;
      }
      this._middleware.push(this._normalizeMiddleware(fn, {
        ...opts,
        route
      }));
      return this;
    }
  }
  for (const method of HTTPMethods) H3Core$1.prototype[method.toLowerCase()] = function(route, handler, opts) {
    return this.on(method, route, handler, opts);
  };
  return H3Core$1;
})();
function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}
class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}
function splitSetCookieString(cookiesString) {
  if (Array.isArray(cookiesString)) return cookiesString.flatMap((c) => splitSetCookieString(c));
  if (typeof cookiesString !== "string") return [];
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) pos += 1;
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) pos += 1;
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else pos = lastComma + 1;
      } else pos += 1;
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) cookiesStrings.push(cookiesString.slice(start));
  }
  return cookiesStrings;
}
function lazyInherit(target, source, sourceKey) {
  for (const key of Object.getOwnPropertyNames(source)) {
    if (key === "constructor") continue;
    const targetDesc = Object.getOwnPropertyDescriptor(target, key);
    const desc = Object.getOwnPropertyDescriptor(source, key);
    let modified = false;
    if (desc.get) {
      modified = true;
      desc.get = targetDesc?.get || function() {
        return this[sourceKey][key];
      };
    }
    if (desc.set) {
      modified = true;
      desc.set = targetDesc?.set || function(value) {
        this[sourceKey][key] = value;
      };
    }
    if (typeof desc.value === "function") {
      modified = true;
      desc.value = function(...args) {
        return this[sourceKey][key](...args);
      };
    }
    if (modified) Object.defineProperty(target, key, desc);
  }
}
const NodeResponse = /* @__PURE__ */ (() => {
  const NativeResponse = globalThis.Response;
  const STATUS_CODES = globalThis.process?.getBuiltinModule?.("node:http")?.STATUS_CODES || {};
  class NodeResponse$12 {
    #body;
    #init;
    #headers;
    #response;
    constructor(body, init) {
      this.#body = body;
      this.#init = init;
    }
    get status() {
      return this.#response?.status || this.#init?.status || 200;
    }
    get statusText() {
      return this.#response?.statusText || this.#init?.statusText || STATUS_CODES[this.status] || "";
    }
    get headers() {
      if (this.#response) return this.#response.headers;
      if (this.#headers) return this.#headers;
      const initHeaders = this.#init?.headers;
      return this.#headers = initHeaders instanceof Headers ? initHeaders : new Headers(initHeaders);
    }
    get ok() {
      if (this.#response) return this.#response.ok;
      const status = this.status;
      return status >= 200 && status < 300;
    }
    get _response() {
      if (this.#response) return this.#response;
      this.#response = new NativeResponse(this.#body, this.#headers ? {
        ...this.#init,
        headers: this.#headers
      } : this.#init);
      this.#init = void 0;
      this.#headers = void 0;
      this.#body = void 0;
      return this.#response;
    }
    nodeResponse() {
      const status = this.status;
      const statusText = this.statusText;
      let body;
      let contentType;
      let contentLength;
      if (this.#response) body = this.#response.body;
      else if (this.#body) if (this.#body instanceof ReadableStream) body = this.#body;
      else if (typeof this.#body === "string") {
        body = this.#body;
        contentType = "text/plain; charset=UTF-8";
        contentLength = Buffer.byteLength(this.#body);
      } else if (this.#body instanceof ArrayBuffer) {
        body = Buffer.from(this.#body);
        contentLength = this.#body.byteLength;
      } else if (this.#body instanceof Uint8Array) {
        body = this.#body;
        contentLength = this.#body.byteLength;
      } else if (this.#body instanceof DataView) {
        body = Buffer.from(this.#body.buffer);
        contentLength = this.#body.byteLength;
      } else if (this.#body instanceof Blob) {
        body = this.#body.stream();
        contentType = this.#body.type;
        contentLength = this.#body.size;
      } else if (typeof this.#body.pipe === "function") body = this.#body;
      else body = this._response.body;
      const rawNodeHeaders = [];
      const initHeaders = this.#init?.headers;
      const headerEntries = this.#response?.headers || this.#headers || (initHeaders ? Array.isArray(initHeaders) ? initHeaders : initHeaders?.entries ? initHeaders.entries() : Object.entries(initHeaders).map(([k, v]) => [k.toLowerCase(), v]) : void 0);
      let hasContentTypeHeader;
      let hasContentLength;
      if (headerEntries) for (const [key, value] of headerEntries) {
        if (key === "set-cookie") {
          for (const setCookie of splitSetCookieString(value)) rawNodeHeaders.push(["set-cookie", setCookie]);
          continue;
        }
        rawNodeHeaders.push([key, value]);
        if (key === "content-type") hasContentTypeHeader = true;
        else if (key === "content-length") hasContentLength = true;
      }
      if (contentType && !hasContentTypeHeader) rawNodeHeaders.push(["content-type", contentType]);
      if (contentLength && !hasContentLength) rawNodeHeaders.push(["content-length", String(contentLength)]);
      this.#init = void 0;
      this.#headers = void 0;
      this.#response = void 0;
      this.#body = void 0;
      return {
        status,
        statusText,
        headers: rawNodeHeaders,
        body
      };
    }
  }
  lazyInherit(NodeResponse$12.prototype, NativeResponse.prototype, "_response");
  Object.setPrototypeOf(NodeResponse$12, NativeResponse);
  Object.setPrototypeOf(NodeResponse$12.prototype, NativeResponse.prototype);
  return NodeResponse$12;
})();
const errorHandler$0 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    return new NodeResponse(JSON.stringify(res.body, null, 2), res);
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled;
  const status = error.status || 500;
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (status === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]"].filter(Boolean).join(" ");
    console.error(
      `[request error] ${tags} [${event.req.method}] ${url}
`,
      error
    );
  }
  const headers2 = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  if (status === 404 || !event.res.headers.has("cache-control")) {
    headers2["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    status,
    statusText: error.statusText,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status,
    statusText: error.statusText,
    headers: headers2,
    body
  };
}
const errorHandlers = [errorHandler$0];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
const plugins = [];
const headers = ((m) => function headersRouteRule(event) {
  for (const [key, value] of Object.entries(m.options || {})) {
    event.res.headers.set(key, value);
  }
});
const findRouteRules = (m, p) => {
  let r = [];
  if (p[p.length - 1] === "/") p = p.slice(0, -1) || "/";
  let s = p.split("/");
  s.length - 1;
  if (s[1] === "assets") {
    r.unshift({ data: [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }], params: { "_": s.slice(2).join("/") } });
  }
  return r;
};
const _lazy_4GuumQ = defineLazyEventHandler(() => import("./chunks/_/ssr-renderer.mjs"));
const findRoute = (m, p) => {
  if (p[p.length - 1] === "/") p = p.slice(0, -1) || "/";
  let s = p.split("/");
  s.length - 1;
  return { data: { route: "/**", handler: _lazy_4GuumQ }, params: { "_": s.slice(1).join("/") } };
};
const findRoutedMiddleware = (m, p) => {
  return [];
};
const globalMiddleware = [];
function useNitroApp() {
  return useNitroApp.__instance__ ??= initNitroApp();
}
function initNitroApp() {
  const nitroApp2 = createNitroApp();
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
  return nitroApp2;
}
function createNitroApp() {
  const hooks = createHooks();
  const captureError = (error, errorCtx) => {
    const promise = hooks.callHookParallel("error", error, errorCtx).catch((hookError) => {
      console.error("Error while capturing another error", hookError);
    });
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({ error, context: errorCtx });
      }
      if (typeof errorCtx.event.req.waitUntil === "function") {
        errorCtx.event.req.waitUntil(promise);
      }
    }
  };
  const h3App = createH3App(captureError);
  let fetchHandler = async (req) => {
    req.context ??= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    const event = { req };
    const nitroApp2 = useNitroApp();
    await nitroApp2.hooks.callHook("request", event).catch((error) => {
      captureError(error, { event, tags: ["request"] });
    });
    const response = await h3App.request(req, void 0, req.context);
    await nitroApp2.hooks.callHook("response", response, event).catch((error) => {
      captureError(error, { event, tags: ["request", "response"] });
    });
    return response;
  };
  const requestHandler = (input, init, context) => {
    const req = toRequest(input, init);
    req.context = { ...req.context, ...context };
    return Promise.resolve(fetchHandler(req));
  };
  const originalFetch = globalThis.fetch;
  const nitroFetch = (input, init) => {
    if (typeof input === "string" && input.startsWith("/")) {
      return requestHandler(input, init);
    }
    if (input instanceof Request && "_request" in input) {
      input = input._request;
    }
    return originalFetch(input, init);
  };
  globalThis.fetch = nitroFetch;
  const app = {
    _h3: h3App,
    hooks,
    fetch: requestHandler,
    captureError
  };
  return app;
}
function createH3App(captureError) {
  const DEBUG_MODE = ["1", "true", "TRUE"].includes("false");
  const h3App = new H3Core({
    debug: DEBUG_MODE,
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    }
  });
  h3App._findRoute = (event) => findRoute(event.req.method, event.url.pathname);
  h3App._getMiddleware = (event, route) => {
    const pathname = event.url.pathname;
    const method = event.req.method;
    const { routeRules, routeRuleMiddleware } = getRouteRules(method, pathname);
    event.context.routeRules = routeRules;
    return [
      ...routeRuleMiddleware,
      ...globalMiddleware,
      ...findRoutedMiddleware().map((r) => r.data),
      ...route?.data?.middleware || []
    ].filter(Boolean);
  };
  return h3App;
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = { ...currentRule.options, ...rule.options };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = { ...currentRule.params, ...layer.params };
      } else if (rule.options !== false) {
        routeRules[rule.name] = { ...rule, params: layer.params };
      }
    }
  }
  const middleware = [];
  for (const rule of Object.values(routeRules)) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
const nitroApp = useNitroApp();
const vercel = {
  fetch(req, context) {
    const isrRoute = req.headers.get("x-now-route-matches");
    if (isrRoute) {
      const url = new URL(req.url);
      url.pathname = decodeURIComponent(isrRoute);
      req = new Request(url.toString(), req);
    }
    req.runtime ??= { name: "vercel" };
    req.runtime.vercel = { context };
    req.waitUntil = context?.waitUntil;
    return nitroApp.fetch(req);
  }
};
export {
  vercel as default
};
