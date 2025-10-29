import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

export default function CharacterChat() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: profile } = trpc.student.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'student',
  });

  const chatMutation = trpc.character.chat.useMutation({
    onSuccess: (data: { response: string }) => {
      setChatHistory(prev => [...prev, { role: 'assistant', content: String(data.response) }]);
      setIsTyping(false);
    },
    onError: () => {
      toast.error('エラーがはっせいしました');
      setIsTyping(false);
    },
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'student')) {
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setMessage('');
    setIsTyping(true);

    chatMutation.mutate({
      characterId: 1, // Default character ID
      message: userMessage,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-xl">よみこみちゅう...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/student')}
            className="text-lg"
          >
            ← もどる
          </Button>
          <h1 className="text-3xl font-black text-primary">キャラクターとおはなし</h1>
        </div>

        {/* チャットエリア */}
        <Card className="p-6 bg-white/90 backdrop-blur shadow-2xl mb-4 h-[60vh] overflow-y-auto">
          {chatHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐻</div>
              <h3 className="text-2xl font-bold mb-2">こんにちは!</h3>
              <p className="text-lg text-muted-foreground">
                なにかきいてみてね!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatHistory.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="text-2xl mb-2">🐻</div>
                    )}
                    <p className="text-lg whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-4 rounded-2xl">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>
          )}
        </Card>

        {/* 入力エリア */}
        <div className="flex gap-2">
          <Input 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="メッセージをにゅうりょく..."
            className="text-lg p-6"
            disabled={isTyping}
          />
          <Button 
            size="lg"
            onClick={handleSend}
            disabled={!message.trim() || isTyping}
            className="px-8 text-xl"
          >
            そうしん
          </Button>
        </div>

        {/* ヒント */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            💡 ヒント: 「さんすうをおしえて」「ストーリーのつづきは?」などきいてみよう!
          </p>
        </div>
      </div>
    </div>
  );
}
