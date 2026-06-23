// Empty shim for the `server-only` marker module so that server-side services
// (which import "server-only" for Next.js bundling safety) can be imported from
// standalone tsx scripts. Only used via scripts/tsconfig.json path mapping.
export {}
