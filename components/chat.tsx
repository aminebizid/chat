'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/components/ui/chat-message';
import { useChatStore } from '@/lib/websocket';
import { SendHorizontal, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

function Chat() {
  const { messages, isConnected, isStreaming, addMessage, updateMessage, setIsConnected, setIsStreaming } = useChatStore();
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const currentMessageRef = useRef<Message | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [showScrollButton, setShowScrollButton] = useState(false);

  const { register, handleSubmit, reset } = useForm<{ message: string }>();

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:3001`;
    
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log('Connected to WebSocket');
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      // Try to reconnect after 2 seconds
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 2000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'stream-start') {
          setIsStreaming(true);
          currentMessageRef.current = {
            id: crypto.randomUUID(),
            content: '',
            role: 'assistant',
            timestamp: new Date(),
          };
          addMessage(currentMessageRef.current);
        } else if (data.type === 'stream-end') {
          setIsStreaming(false);
          currentMessageRef.current = null;
        } else if (data.content && currentMessageRef.current) {
          const newContent = currentMessageRef.current.content + data.content;
          currentMessageRef.current.content = newContent;
          updateMessage(currentMessageRef.current.id, newContent);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      ws.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!showScrollButton) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showScrollButton]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
    setShowScrollButton(!isAtBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
  };

  const onSubmit = handleSubmit(({ message }) => {
    if (!message.trim() || !isConnected || isStreaming) return;

    const userMessage = {
      id: crypto.randomUUID(),
      content: message,
      role: 'user' as const,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    ws.current?.send(JSON.stringify({ message }));
    reset();
  });

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col gap-4 mx-auto max-w-3xl p-4">
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 space-y-4 overflow-y-auto rounded-lg border bg-background p-4 relative"
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
        
        {showScrollButton && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full shadow-lg pointer-events-auto hover:shadow-xl transition-shadow"
              onClick={scrollToBottom}
            >
              <ArrowDown className="h-4 w-4" />
              <span className="sr-only">Scroll to bottom</span>
            </Button>
          </div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2"
      >
        <Input
          {...register('message')}
          placeholder="Type your message..."
          className="flex-1"
          disabled={!isConnected || isStreaming}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!isConnected || isStreaming}
          className={cn(
            'transition-opacity',
            (!isConnected || isStreaming) && 'opacity-50'
          )}
        >
          <SendHorizontal className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}

export default Chat;