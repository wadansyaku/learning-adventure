import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CharacterSelect() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCharacterTypeId, setSelectedCharacterTypeId] = useState<number | null>(null);

  const { data: characterTypes, isLoading: typesLoading } = trpc.character.getAllTypes.useQuery();
  const { data: profile } = trpc.student.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === 'student' || user?.role === 'admin'),
  });
  const { data: existingCharacter } = trpc.character.getMy.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === 'student' || user?.role === 'admin'),
  });

  const createCharacterMutation = trpc.character.create.useMutation({
    onSuccess: () => {
      toast.success('なかまができたよ! 🎉');
      setLocation('/student');
    },
    onError: (error) => {
      console.error('Failed to create character:', error);
      const errorMessage = error.message || 'なかまをつくれなかったよ 😢';
      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/');
    } else if (!authLoading && isAuthenticated && user?.role !== 'student' && user?.role !== 'admin') {
      setLocation('/');
    } else if (!authLoading && isAuthenticated && existingCharacter && existingCharacter.length > 0) {
      // 既にキャラクターを持っている場合は生徒ダッシュボードにリダイレクト
      toast.info('もうなかまがいるよ!');
      setLocation('/student');
    }
  }, [authLoading, isAuthenticated, user, existingCharacter, setLocation]);

  const handleSelectCharacter = (typeId: number) => {
    setSelectedCharacterTypeId(typeId);
  };

  const handleConfirm = () => {
    if (!selectedCharacterTypeId || !characterTypes) {
      toast.error('キャラクターをえらんでね!');
      return;
    }

    const selectedType = characterTypes.find(t => t.id === selectedCharacterTypeId);
    if (!selectedType) {
      toast.error('キャラクターがみつからないよ 😢');
      return;
    }

    // レベル制限チェック
    if (profile && profile.level < selectedType.unlockLevel) {
      toast.error(`レベル${selectedType.unlockLevel}になったらえらべるよ!`);
      return;
    }

    createCharacterMutation.mutate({
      name: selectedType.name,
      animalType: selectedType.species,
      imageUrl: selectedType.imageUrl,
    });
  };

  if (authLoading || typesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-xl">よみこみちゅう...</p>
        </div>
      </div>
    );
  }

  if (!characterTypes || characterTypes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-3xl font-bold mb-4">キャラクターがいないよ</h2>
          <p className="mb-4">せんせいにそうだんしてね</p>
          <Button onClick={() => setLocation('/student')}>もどる</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-black text-shadow mb-4">
            なかまをえらぼう!
          </h1>
          <p className="text-2xl text-muted-foreground">
            いっしょにぼうけんするなかまをえらんでね
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {characterTypes.map((charType) => {
            const isLocked = profile && profile.level < charType.unlockLevel;
            const isSelected = selectedCharacterTypeId === charType.id;

            return (
              <Card
                key={charType.id}
                className={`p-6 cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-4 ring-primary scale-105'
                    : 'hover:scale-105'
                } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isLocked && handleSelectCharacter(charType.id)}
              >
                <div className="text-center">
                  <div className="mb-4 relative">
                    <img
                      src={charType.imageUrl}
                      alt={charType.name}
                      className="w-48 h-48 object-contain mx-auto"
                    />
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                        <div className="text-white text-center">
                          <div className="text-4xl mb-2">🔒</div>
                          <div className="text-xl font-bold">
                            レベル{charType.unlockLevel}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{charType.name}</h3>
                  <p className="text-muted-foreground mb-4">{charType.description}</p>
                  {charType.personality && (
                    <div className="text-sm text-muted-foreground">
                      せいかく: {charType.personality}
                    </div>
                  )}
                  {isSelected && (
                    <div className="mt-4 text-primary font-bold text-xl">
                      ✓ えらんだよ!
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setLocation('/student')}
            className="text-xl px-8 py-6"
          >
            もどる
          </Button>
          <Button
            size="lg"
            onClick={handleConfirm}
            disabled={!selectedCharacterTypeId || createCharacterMutation.isPending}
            className="text-xl px-8 py-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            {createCharacterMutation.isPending ? 'つくっているよ...' : 'けってい! ✨'}
          </Button>
        </div>
      </div>
    </div>
  );
}
