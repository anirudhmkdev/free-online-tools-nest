export type ToolAction = "calculate" | "convert" | "generate" | "analyze" | "check" | "format" | "export";
export interface ToolTelemetryContext {
  slug: string;
  locale: "en" | "es" | "hi";
  tier: "primary" | "secondary";
}
export interface ToolTelemetryPayload {
  tool_slug: string;
  tool_locale: ToolTelemetryContext["locale"];
  tool_action: ToolAction | "interact";
  discovery_tier: ToolTelemetryContext["tier"];
  measurement_version: "1";
}
export type ToolEvent = "tool_start" | "tool_success";
export type ToolEventSender = (event: ToolEvent, payload: ToolTelemetryPayload) => void;
const actions = new Set<ToolAction>(["calculate", "convert", "generate", "analyze", "check", "format", "export"]);

export function isProductionToolHostname(hostname: string): boolean {
  return hostname === "freeonlinetoolsnest.com" || hostname === "www.freeonlinetoolsnest.com";
}

/** A page-visit session. Callers establish validity; no user data enters this API. */
export function createToolTelemetry(context: ToolTelemetryContext, hostname: string, send: ToolEventSender) {
  let started = false;
  let succeeded = false;
  let eligible = false;
  const emit = (event: ToolEvent, action: ToolAction | "interact") => {
    if (!isProductionToolHostname(hostname)) return;
    try {
      send(event, {
        tool_slug: context.slug,
        tool_locale: context.locale,
        tool_action: action,
        discovery_tier: context.tier,
        measurement_version: "1",
      });
    } catch {
      // Measurement is optional and must never interrupt a tool.
    }
  };
  return {
    markInteraction() {
      eligible = true;
      if (started) return;
      started = true;
      emit("tool_start", "interact");
    },
    clearInteraction() { eligible = false; },
    recordSuccess(action: ToolAction) {
      if (!eligible || succeeded || !actions.has(action)) return;
      succeeded = true;
      emit("tool_success", action);
    },
  };
}
