import { Loader2 } from "lucide-react";

interface Props {
  toolInvocation: {
    toolName: string;
    state: string;
    args: Record<string, any>;
    result?: any;
  };
}

function getLabel(toolName: string, args: Record<string, any>): string {
  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return `Creating ${args.path}`;
      case "str_replace":
        return `Editing ${args.path}`;
      case "insert":
        return `Editing ${args.path}`;
      case "view":
        return `Viewing ${args.path}`;
      default:
        return "Editing file";
    }
  }
  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename":
        return `Renaming ${args.path}`;
      case "delete":
        return `Deleting ${args.path}`;
      default:
        return "Managing file";
    }
  }
  return toolName;
}

export function ToolInvocationBadge({ toolInvocation }: Props) {
  const { toolName, state, args, result } = toolInvocation;
  const label = getLabel(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {state === "result" && result ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
