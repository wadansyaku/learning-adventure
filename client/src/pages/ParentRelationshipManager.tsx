import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, Trash2, Users } from "lucide-react";

export function ParentRelationshipManager() {
  const { user } = useAuth();
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  const { data: relationships, refetch: refetchRelationships } = trpc.admin.getAllParentChildren.useQuery();
  const { data: parents } = trpc.admin.getAllParents.useQuery();
  const { data: students } = trpc.admin.getAllStudentsWithDetails.useQuery();

  const addMutation = trpc.admin.addParentChild.useMutation({
    onSuccess: () => {
      toast.success('親子関係を追加しました');
      refetchRelationships();
      setSelectedParent(null);
      setSelectedStudent(null);
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const removeMutation = trpc.admin.removeParentChild.useMutation({
    onSuccess: () => {
      toast.success('親子関係を削除しました');
      refetchRelationships();
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const handleAdd = () => {
    if (!selectedParent || !selectedStudent) {
      toast.error('保護者と生徒を選択してください');
      return;
    }
    addMutation.mutate({ parentUserId: selectedParent, studentId: selectedStudent });
  };

  const handleRemove = (id: number) => {
    if (confirm('この親子関係を削除しますか?')) {
      removeMutation.mutate({ id });
    }
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-purple-600" />
            <CardTitle>親子関係を追加</CardTitle>
          </div>
          <CardDescription>保護者と生徒を選択して関係を設定します</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">保護者</label>
              <select
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={selectedParent || ''}
                onChange={(e) => setSelectedParent(Number(e.target.value))}
              >
                <option value="">選択してください</option>
                {parents?.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name} ({parent.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">生徒</label>
              <select
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={selectedStudent || ''}
                onChange={(e) => setSelectedStudent(Number(e.target.value))}
              >
                <option value="">選択してください</option>
                {students?.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.displayName} ({student.userName})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleAdd}
                disabled={!selectedParent || !selectedStudent || addMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {addMutation.isPending ? '追加中...' : '追加'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <CardTitle>親子関係一覧</CardTitle>
          </div>
          <CardDescription>現在設定されている親子関係</CardDescription>
        </CardHeader>
        <CardContent>
          {relationships && relationships.length > 0 ? (
            <div className="space-y-2">
              {relationships.map((rel: any) => (
                <div
                  key={rel.id}
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {rel.parentName} → {rel.studentName}
                    </p>
                    <p className="text-sm text-slate-500">
                      関係: {rel.relationship} | 登録日: {new Date(rel.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemove(rel.id)}
                    disabled={removeMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">まだ親子関係が設定されていません</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
