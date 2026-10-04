import { describe, expect, it, vi } from "vitest";
import { createToolTelemetry, isProductionToolHostname, type ToolAction } from "./tool-telemetry";

const context = { slug: "word-counter", locale: "en", tier: "primary" } as const;
describe("semantic tool measurement", () => {
  it("excludes default output, resets, and repeated operations", () => {
    const send = vi.fn();
    const session = createToolTelemetry(context, "freeonlinetoolsnest.com", send);
    session.recordSuccess("analyze");
    expect(send).not.toHaveBeenCalled();
    session.markInteraction();
    session.clearInteraction();
    session.recordSuccess("analyze");
    expect(send.mock.calls.map(call => call[0])).toEqual(["tool_start"]);
    session.markInteraction();
    session.recordSuccess("analyze");
    session.recordSuccess("analyze");
    session.markInteraction();
    expect(send.mock.calls.map(call => call[0])).toEqual(["tool_start", "tool_success"]);
  });
  it("sends only the fixed measurement fields", () => {
    const send = vi.fn();
    const session = createToolTelemetry(context, "www.freeonlinetoolsnest.com", send);
    session.markInteraction();
    session.recordSuccess("analyze");
    expect(send.mock.calls[1]).toEqual(["tool_success", {
      tool_slug: "word-counter", tool_locale: "en", tool_action: "analyze",
      discovery_tier: "primary", measurement_version: "1",
    }]);
    session.recordSuccess("user supplied content" as ToolAction);
    expect(send).toHaveBeenCalledTimes(2);
  });
  it.each(["localhost", "127.0.0.1", "freeonlinetoolsnest.pages.dev", "preview.freeonlinetoolsnest.pages.dev", "freeonlinetoolsnest.com.evil.example"])("excludes %s", hostname => {
    const send = vi.fn();
    const session = createToolTelemetry(context, hostname, send);
    session.markInteraction(); session.recordSuccess("generate");
    expect(send).not.toHaveBeenCalled();
    expect(isProductionToolHostname(hostname)).toBe(false);
  });
  it("survives unavailable or throwing analytics", () => {
    const session = createToolTelemetry(context, "freeonlinetoolsnest.com", () => { throw new Error("unavailable"); });
    expect(() => { session.markInteraction(); session.recordSuccess("check"); }).not.toThrow();
  });
  it("rejects an action outside the fixed vocabulary", () => {
    const send = vi.fn();
    const session = createToolTelemetry(context, "freeonlinetoolsnest.com", send);
    session.markInteraction(); session.recordSuccess("filename.txt" as ToolAction);
    expect(send).toHaveBeenCalledTimes(1);
  });
});
