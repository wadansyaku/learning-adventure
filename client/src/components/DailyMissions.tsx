import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Progress } from "@/components/ui/progress";

export function DailyMissions() {
  const { data: missions, isLoading } = trpc.dailyMission.getMyProgress.useQuery();

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-4">📅 きょうのミッション</h3>
        <p className="text-muted-foreground">読み込み中...</p>
      </Card>
    );
  }

  if (!missions || missions.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-4">📅 きょうのミッション</h3>
        <p className="text-muted-foreground">ミッションがありません</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-2xl font-bold mb-4">📅 きょうのミッション</h3>
      
      <div className="space-y-4">
        {missions.map((mission) => {
          const targetCount = mission.targetCount || 1;
          const progress = (mission.currentCount / targetCount) * 100;
          const isCompleted = mission.isCompleted;

          return (
            <div
              key={mission.id}
              className={`p-4 rounded-lg border-2 ${
                isCompleted
                  ? 'bg-green-50 border-green-300'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    {isCompleted && <span>✅</span>}
                    {mission.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {mission.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">
                    {mission.currentCount} / {mission.targetCount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    🪙 {mission.coinReward} ⭐ {mission.xpReward}
                  </div>
                </div>
              </div>
              
              <Progress value={progress} className="h-2" />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
