import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export function OpenAIUsageStats() {
  const { data: summary, isLoading } = trpc.admin.getOpenAIUsageSummary.useQuery();

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">📊 OpenAI 使用状況</h3>
        <p className="text-muted-foreground">読み込み中...</p>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const totalCost = parseFloat(summary.totalCost || "0");

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">📊 OpenAI 使用状況</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">総トークン数</p>
          <p className="text-3xl font-bold text-blue-600">
            {summary.totalTokens.toLocaleString()}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">総コスト</p>
          <p className="text-3xl font-bold text-green-600">
            ${totalCost.toFixed(4)}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">API呼び出し回数</p>
          <p className="text-3xl font-bold text-purple-600">
            {summary.totalCalls}
          </p>
        </div>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>※ 最近30日間の使用状況を表示しています</p>
      </div>
    </Card>
  );
}
