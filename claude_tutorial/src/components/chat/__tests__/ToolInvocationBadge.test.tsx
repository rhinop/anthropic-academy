import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

vi.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => (
    <span data-testid="loader" className={className} />
  ),
}));

afterEach(() => {
  cleanup();
});

function make(
  toolName: string,
  args: Record<string, any>,
  state = "partial-call",
  result?: any
) {
  return { toolName, args, state, result };
}

test("str_replace_editor create shows Creating label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={make("str_replace_editor", { command: "create", path: "/App.jsx" })}
    />
  );
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("str_replace_editor str_replace shows Editing label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={make("str_replace_editor", { command: "str_replace", path: "/components/Card.jsx" })}
    />
  );
  expect(screen.getByText("Editing /components/Card.jsx")).toBeDefined();
});

test("str_replace_editor insert shows Editing label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={make("str_replace_editor", { command: "insert", path: "/some/file.jsx" })}
    />
  );
  expect(screen.getByText("Editing /some/file.jsx")).toBeDefined();
});

test("str_replace_editor view shows Viewing label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={make("str_replace_editor", { command: "view", path: "/some/file.jsx" })}
    />
  );
  expect(screen.getByText("Viewing /some/file.jsx")).toBeDefined();
});

test("file_manager rename shows Renaming label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={make("file_manager", { command: "rename", path: "/old.jsx" })}
    />
  );
  expect(screen.getByText("Renaming /old.jsx")).toBeDefined();
});

test("file_manager delete shows Deleting label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={make("file_manager", { command: "delete", path: "/old.jsx" })}
    />
  );
  expect(screen.getByText("Deleting /old.jsx")).toBeDefined();
});

test("unknown tool shows raw toolName", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={make("some_other_tool", {})}
    />
  );
  expect(screen.getByText("some_other_tool")).toBeDefined();
});

test("pending state renders spinner", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={make("str_replace_editor", { command: "create", path: "/App.jsx" })}
    />
  );
  const loader = screen.getByTestId("loader");
  expect(loader.className).toContain("animate-spin");
});

test("result state renders green dot", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={make("str_replace_editor", { command: "create", path: "/App.jsx" }, "result", "Success")}
    />
  );
  const dot = container.querySelector(".bg-emerald-500");
  expect(dot).toBeDefined();
});
