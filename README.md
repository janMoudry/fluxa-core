# Fluxa Core

Fluxa Core is the minimal, type-safe in-memory event bus extracted from Fluxa.
It provides `Fluxa()` initialization, typed `emit/on/off`, and optional `scope()` namespacing.

- Typed event bus (TypeScript generics)
- In-memory only (no cross-tab/frame transports)
- Metadata per event
- Optional namespacing via `scope()`

## Installation

```
npm install @moudrey/fluxa-core
# or
pnpm add @moudrey/fluxa-core
# or
yarn add @moudrey/fluxa-core
```

The package ships ESM and CJS builds:

- ESM import: `import { Fluxa } from '@moudrey/fluxa-core'`
- CJS require: `const { Fluxa } = require('@moudrey/fluxa-core')`

## Quick start

```ts
import { Fluxa } from "@moudrey/fluxa-core";

type Events = {
  "counter:increment": { amount: number };
  "user:login": { id: string };
};

const bus = new Fluxa<Events>({
  context: { id: "app" },
});

const off = bus.on("counter:increment", (payload, meta) => {
  console.log("Increment by", payload.amount, "meta:", meta);
});

bus.emit("counter:increment", { amount: 1 });

// Unsubscribe
off();
```

### Namespacing with scope()

```ts
type Events = {
  "ui:click": { id: string };
};

const bus = new Fluxa<Events>();
const ui = bus.scope("ui");

ui.on("click", (data) => console.log("UI click", data));
ui.emit("click", { id: "btn1" });
```

Note: `scope("prefix")` only transforms the event name at runtime; typing stays intact if your `Events` map includes the prefixed keys.

## Metadata and filters

Each event carries metadata:

```ts
export type FluxaEventMeta = {
  id: string;
  timestamp: number;
  sourceId?: string;
  sourceLocationFile?: string;
  traceId?: string;
  path?: string[];
  [key: string]: unknown;
};
```

You can add a metadata filter per handler:

```ts
bus.on(
  "user:login",
  (payload) => {
    // ...
  },
  (meta) => meta.sourceId?.includes("app.example.com") === true,
);
```

## API reference

- `new Fluxa<Events>(options?: FluxaConfig)`
  - `options.context?: { id?: string; name?: string }`
  - `options.plugins?: FluxaPlugin[]`
- `emit(event, data, metaExtra?)`
- `on(event, handler, filter?) => () => void`
- `off(event, handler)`
- `scope(prefix)`
- `destroy()`

## Plugins

Fluxa Core supports lightweight plugins for transports or integrations.

```ts
type FluxaPlugin<Events> = {
  setup?: (ctx: { contextId: string; emitLocal: FluxaEmitFn }) => void;
  onEmit?: (event, data, meta, emitLocal) => void;
  onDestroy?: () => void;
};
```

- `setup` runs once during construction.
- `onEmit` runs on every `emit()` call. Use `emitLocal` to dispatch without re-invoking plugins.
- `onDestroy` is called from `destroy()`.

## Maintainer notes

- `npm run build` – build with `tsup` into `dist`
- `npm run typecheck` – `tsc --noEmit`
- `npm run test` – `vitest`

## License

MIT © Jan Moudrý
# fluxa-core
