'use client';

import { Message } from '@/components/chat';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex w-full items-start gap-4 p-4',
        isAssistant ? 'bg-muted/50' : 'bg-background'
      )}
    >
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
        {isAssistant ? (
          <Bot className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-sm text-muted-foreground">
          {isAssistant ? 'Assistant' : 'You'}
        </p>
        <div className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
          {message.content}
        </div>
      </div>
    </div>
  );
}