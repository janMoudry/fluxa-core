import { createMeta } from "../utils/meta";

import { EventBus } from "./EventBus";
import { Scope } from "./Scope";
import type {
	FluxaConfig,
	FluxaEventMap,
	FluxaEventMeta,
	FluxaFilter,
	FluxaHandler,
} from "./types";

export class Fluxa<Events extends FluxaEventMap = FluxaEventMap> {
	private initialized = false;

	private readonly bus = new EventBus<Events>();

	private readonly contextId: string;

	constructor(private readonly options: FluxaConfig = {}) {
		this.contextId = options.context?.id ?? this.fallbackContextId();
		this.initialized = true;
	}

	scope<P extends string>(prefix: P) {
		this.ensureInitialized();
		return new Scope<Events, P>(this, prefix);
	}

	emit<K extends keyof Events>(
		event: K,
		data: Events[K],
		meta?: FluxaEventMeta,
	) {
		this.ensureInitialized();

		const baseMeta = createMeta({
			sourceId:
				typeof window !== "undefined"
					? window.location.href
					: undefined,
			sourceLocationFile: meta?.sourceLocationFile as string | undefined,
			path: [this.contextId],
			extra: meta,
		});

		this.bus.emit(event, data, baseMeta);
	}

	on<K extends keyof Events>(
		event: K,
		handler: FluxaHandler<Events[K]>,
		filter?: FluxaFilter,
	) {
		this.ensureInitialized();
		return this.bus.on(event, handler, filter);
	}

	off<K extends keyof Events>(event: K, handler: FluxaHandler<Events[K]>) {
		this.ensureInitialized();
		this.bus.off(event, handler);
	}

	destroy() {
		this.initialized = false;
	}

	private ensureInitialized() {
		if (!this.initialized) {
			throw new Error("Fluxa is not initialized.");
		}
	}

	private fallbackContextId() {
		const base =
			typeof window !== "undefined"
				? `${window.location.origin}|${window.location.pathname}`
				: "node";
		return `${base}|${Math.random().toString(16).slice(2)}`;
	}
}
