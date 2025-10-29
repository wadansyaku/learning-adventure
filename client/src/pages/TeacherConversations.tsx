import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2 } from 'lucide-react';

export default function TeacherConversations() {
  const { studentId } = useParams<{ studentId: string }>();
  const [, setLocation] = useLocation();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(
    studentId ? parseInt(studentId) : null
  );

  const { data: user, isLoading: authLoading } = trpc.auth.me.useQuery();
  const { data: students, isLoading: studentsLoading } = trpc.teacher.getMyStudents.useQuery();
  const { data: conversationHistory, isLoading: historyLoading } = trpc.chat.getConversationHistory.useQuery(
    { studentId: selectedStudent! },
    { enabled: !!selectedStudent }
  );
  const { data: sentimentDist, isLoading: sentimentLoading } = trpc.chat.getSentimentDistribution.useQuery(
    { studentId: selectedStudent! },
    { enabled: !!selectedStudent }
  );
  const { data: topicDist, isLoading: topicLoading } = trpc.chat.getTopicDistribution.useQuery(
    { studentId: selectedStudent! },
    { enabled: !!selectedStudent }
  );

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'teacher')) {
      setLocation('/');
    }
  }, [user, authLoading, setLocation]);

  if (authLoading || studentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-900 mb-6">会話履歴</h1>

        {/* 生徒選択 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>生徒を選択</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={selectedStudent || ''}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                setSelectedStudent(id);
                setLocation(`/teacher/conversations/${id}`);
              }}
            >
              <option value="">選択してください</option>
              {students?.map((student: any) => (
                <option key={student.id} value={student.id}>
                  {student.displayName}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {selectedStudent && (
          <>
            {/* 感情分布 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>感情分布（過去7日間）</CardTitle>
              </CardHeader>
              <CardContent>
                {sentimentLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-100 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">
                        {sentimentDist?.positive || 0}
                      </div>
                      <div className="text-sm text-green-600">ポジティブ</div>
                    </div>
                    <div className="text-center p-4 bg-gray-100 rounded-lg">
                      <div className="text-2xl font-bold text-gray-700">
                        {sentimentDist?.neutral || 0}
                      </div>
                      <div className="text-sm text-gray-600">ニュートラル</div>
                    </div>
                    <div className="text-center p-4 bg-red-100 rounded-lg">
                      <div className="text-2xl font-bold text-red-700">
                        {sentimentDist?.negative || 0}
                      </div>
                      <div className="text-sm text-red-600">ネガティブ</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* トピック分布 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>トピック分布（過去7日間）</CardTitle>
              </CardHeader>
              <CardContent>
                {topicLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <div className="space-y-2">
                    {Object.entries(topicDist || {}).map(([topic, count]) => (
                      <div key={topic} className="flex items-center justify-between">
                        <span className="text-gray-700">{topic}</span>
                        <span className="text-purple-600 font-bold">{count as number}回</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 会話履歴 */}
            <Card>
              <CardHeader>
                <CardTitle>会話履歴</CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <div className="space-y-4">
                    {conversationHistory?.map((conv: any) => (
                      <div key={conv.id} className="border-l-4 border-purple-500 pl-4 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500">
                            {new Date(conv.createdAt).toLocaleString('ja-JP')}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              conv.sentiment === 'positive'
                                ? 'bg-green-100 text-green-700'
                                : conv.sentiment === 'negative'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {conv.sentiment}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold text-gray-700">生徒: </span>
                          <span className="text-gray-600">{conv.userMessage}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">AI: </span>
                          <span className="text-gray-600">{conv.aiResponse}</span>
                        </div>
                        {conv.topics && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {JSON.parse(conv.topics).map((topic: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
