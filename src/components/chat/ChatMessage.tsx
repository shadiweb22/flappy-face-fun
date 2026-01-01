import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export const ChatMessage = ({ role, content, isStreaming }: ChatMessageProps) => {
  const isUser = role === "user";

  // Parse thinking tags from DeepSeek R1
  const parseContent = (text: string) => {
    const thinkMatch = text.match(/<think>([\s\S]*?)<\/think>/);
    const thinkContent = thinkMatch ? thinkMatch[1].trim() : null;
    const mainContent = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    return { thinkContent, mainContent };
  };

  const { thinkContent, mainContent } = parseContent(content);

  return (
    <div
      className={cn(
        "flex gap-4 p-4 rounded-2xl transition-all duration-300",
        isUser
          ? "bg-gradient-to-r from-primary/10 to-primary/5 ml-8"
          : "bg-gradient-to-r from-secondary/50 to-secondary/30 mr-8"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          isUser
            ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground"
            : "bg-gradient-to-br from-accent to-accent/70 text-accent-foreground"
        )}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {isUser ? "You" : "DeepSeek AI"}
        </p>
        
        {thinkContent && (
          <div className="bg-muted/50 rounded-lg p-3 border border-border/50 mb-2">
            <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Thinking...
            </p>
            <p className="text-sm text-muted-foreground italic whitespace-pre-wrap">
              {thinkContent}
            </p>
          </div>
        )}
        
        <div className="text-foreground leading-relaxed whitespace-pre-wrap">
          {mainContent || (isStreaming ? (
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          ) : null)}
        </div>
      </div>
    </div>
  );
};
