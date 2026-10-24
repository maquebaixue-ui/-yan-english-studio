// The checked-in static build has no private server. Only server.mjs marks its
// own HTML response as local; public hosting never probes a visitor's computer.
export const LOCAL_SERVICE=globalThis.document?.querySelector('meta[name="yan-runtime"]')?.content==='local';
export const HOSTED_SERVICE=globalThis.document?.querySelector('meta[name="yan-runtime"]')?.content==='hosted';
