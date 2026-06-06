import { describe, it, expect, vi } from "vitest";

import { Fluxa } from "../src/core/Fluxa";
import type { FluxaEventMeta, FluxaPlugin } from "../src/core/types";

type Events = {
	"counter:inc": { amount: number };
	"ui:click": { id: string };
};

type RemoteCounterEmitter = (
	payload: Events["counter:inc"],
	meta: FluxaEventMeta,
) => void;

describe("Fluxa core: emit/on/off + scope", () => {
	it("emits and receives via memory bus by default", () => {
		const bus = new Fluxa<Events>({ context: { id: "ctx-A" } });
		const calls: Array<{
			payload: Events["counter:inc"];
			meta: FluxaEventMeta;
		}> = [];
		const off = bus.on("counter:inc", (payload, meta) =>
			calls.push({ payload, meta }),
		);

		bus.emit(
			"counter:inc",
			{ amount: 2 },
			{ traceId: "t1", id: "custom-id", timestamp: Date.now() },
		);

		expect(calls).toHaveLength(1);
		expect(calls[0].payload.amount).toBe(2);
		expect(calls[0].meta.id).toBeDefined();
		expect(calls[0].meta.timestamp).toBeTypeOf("number");
		expect(calls[0].meta.path).toEqual(["ctx-A"]);
		expect(calls[0].meta.traceId).toBe("t1");

		off();

		bus.emit("counter:inc", { amount: 3 });
		expect(calls).toHaveLength(1);
	});

	it("scope() prefixes event names", () => {
		const bus = new Fluxa<Events>({ context: { id: "ctx-A" } });
		const ui = bus.scope("ui");
		let clicks = 0;
		const off = ui.on("click", () => clicks++);
		ui.emit("click", { id: "b1" });
		expect(clicks).toBe(1);
		off();
		ui.emit("click", { id: "b2" });
		expect(clicks).toBe(1);
	});

	it("notifies plugins after local event delivery", () => {
		const onEvent = vi.fn();
		const bus = new Fluxa<Events>({
			context: { id: "ctx-A" },
			plugins: [{ onEvent }],
		});

		bus.emit("counter:inc", { amount: 4 }, { traceId: "t-event" });

		expect(onEvent).toHaveBeenCalledTimes(1);
		expect(onEvent).toHaveBeenCalledWith(
			"counter:inc",
			{ amount: 4 },
			expect.objectContaining({ traceId: "t-event", path: ["ctx-A"] }),
		);
	});

	it("notifies plugins for events delivered through emitLocal", () => {
		const remote: { emit?: RemoteCounterEmitter } = {};
		const onEvent = vi.fn();
		const plugin: FluxaPlugin<Events> = {
			setup(ctx) {
				remote.emit = (payload, meta) => {
					ctx.emitLocal("counter:inc", payload, meta);
				};
			},
			onEvent,
		};
		const bus = new Fluxa<Events>({
			context: { id: "ctx-A" },
			plugins: [plugin],
		});
		const handler = vi.fn();
		bus.on("counter:inc", handler);

		expect(remote.emit).toBeTypeOf("function");
		if (!remote.emit) throw new Error("Missing remote emitter.");
		const dispatchRemote = remote.emit;
		dispatchRemote(
			{ amount: 7 },
			{ id: "remote-1", timestamp: 1, path: ["remote"] },
		);

		expect(handler).toHaveBeenCalledTimes(1);
		expect(onEvent).toHaveBeenCalledTimes(1);
		expect(onEvent).toHaveBeenCalledWith(
			"counter:inc",
			{ amount: 7 },
			expect.objectContaining({ id: "remote-1", path: ["remote"] }),
		);
	});
});
