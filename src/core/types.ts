export type FluxaEventMap = Record<string, unknown>;

export type FluxaConfig = {
	context?: {
		id?: string;
		name?: string;
	};
};

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
