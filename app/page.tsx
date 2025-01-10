import dynamic from 'next/dynamic';

// Dynamically import the Chat component with ssr disabled to prevent hydration issues
const Chat = dynamic(() => import('@/components/chat'), { 
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-2rem)] items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading chat...</div>
    </div>
  )
});

export default function Home() {
  return (
    <main>
      <Chat />
    </main>
  );
}