export type FluxaEventMap = Record<string, unknown>;

export type FluxaEmitFn<Events extends FluxaEventMap> = <
	K extends keyof Events,
>(
	event: K,
	data: Events[K],
	meta: FluxaEventMeta,
) => void;

export type FluxaPluginContext<Events extends FluxaEventMap> = {
	contextId: string;
	emitLocal: FluxaEmitFn<Events>;
};

export type FluxaPlugin<Events extends FluxaEventMap = FluxaEventMap> = {
	setup?: (ctx: FluxaPluginContext<Events>) => void;
	onEmit?: <K extends keyof Events>(
		event: K,
		data: Events[K],
		meta: FluxaEventMeta,
		emitLocal: FluxaEmitFn<Events>,
	) => void;
	onDestroy?: () => void;
};

export type FluxaConfig<Events extends FluxaEventMap = FluxaEventMap> = {
	context?: {
		id?: string;
		name?: string;
	};
	plugins?: FluxaPlugin<Events>[];
};

export type FluxaEmitMeta = Partial<FluxaEventMeta> & Record<string, unknown>;

export type FluxaEventMeta = {
	id: string;
	timestamp: number;
	sourceId?: string;
	sourceLocationFile?: string;
	traceId?: string;
	path?: string[];
	[key: string]: unknown;
};

export type FluxaHandler<P> = (data: P, meta: FluxaEventMeta) => void;

export type FluxaFilter = (meta: FluxaEventMeta) => boolean;
