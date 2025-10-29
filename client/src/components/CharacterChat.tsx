import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { trpc } from '../lib/trpc';
import { Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface CharacterChatProps {
  characterName: string;
  characterEmoji: string;
  studentLevel: number;
  studentXP: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function CharacterChat({ characterName, characterEmoji, studentLevel, studentXP }: CharacterChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // プロファイルチェック
  const { data: profile } = trpc.student.getProfile.useQuery();

  const chatMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }]);
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    }
  });

  const greetingMutation = trpc.chat.getGreeting.useMutation({
    onSuccess: (data) => {
      setMessages([{
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }]);
    }
  });

  // 初回マウント時にキャラクターから挨拶
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      greetingMutation.mutate();
    }
  }, [isOpen]);

  // メッセージが追加されたら最下部にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate({ message: input });
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // プロファイルがない場合は表示しない
  if (!profile) {
    return null;
  }

  if (!isOpen) {
    return (
      <Card className="p-4 mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-400 transition-all cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-4">
          <div className="text-6xl animate-bounce">{characterEmoji}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-green-800 mb-1">{characterName}とおはなししよう!</h3>
            <p className="text-green-600">クリックしてかいわをはじめよう ✨</p>
          </div>
          <Sparkles className="w-8 h-8 text-green-500" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-5xl">{characterEmoji}</div>
          <div>
            <h3 className="text-2xl font-bold text-green-800">{characterName}</h3>
            <p className="text-sm text-green-600">あなたのがくしゅうパートナー</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="text-green-700 border-green-300 hover:bg-green-100"
        >
          とじる
        </Button>
      </div>

      {/* メッセージ表示エリア */}
      <div className="bg-white rounded-lg p-4 mb-4 h-64 overflow-y-auto border-2 border-green-200">
        {messages.length === 0 && greetingMutation.isPending && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
              <p className="text-green-600">かんがえちゅう...</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-green-100 text-green-900'
              }`}
            >
              <p className="text-base whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {msg.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="text-left mb-3">
            <div className="inline-block bg-green-100 text-green-900 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-bounce">●</div>
                <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</div>
                <div className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="メッセージをにゅうりょく..."
          className="flex-1 px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 text-base"
          disabled={chatMutation.isPending}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || chatMutation.isPending}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>

      {/* ヒント */}
      <p className="text-xs text-green-600 mt-2 text-center">
        💡 {characterName}はあなたのがくしゅうをおうえんしてくれるよ！
      </p>
    </Card>
  );
}
