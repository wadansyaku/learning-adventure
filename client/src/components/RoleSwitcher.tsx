import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

export function RoleSwitcher() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const switchRoleMutation = trpc.auth.switchRole.useMutation({
    onSuccess: (data: { success: boolean; role: string }) => {
      toast.success(`ロールを${getRoleLabel(data.role)}に切り替えました`);
      utils.auth.me.invalidate();
      
      // ロールに応じた画面にリダイレクト
      switch (data.role) {
        case 'student':
          setLocation('/student');
          break;
        case 'teacher':
          setLocation('/teacher');
          break;
        case 'parent':
          setLocation('/parent');
          break;
        case 'admin':
          setLocation('/');
          break;
      }
    },
    onError: (error: any) => {
      toast.error(`ロール切り替えに失敗しました: ${error.message}`);
    },
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'student':
        return '生徒';
      case 'teacher':
        return '講師';
      case 'parent':
        return '保護者';
      case 'admin':
        return '管理者';
      default:
        return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student':
        return '🎓';
      case 'teacher':
        return '👨‍🏫';
      case 'parent':
        return '👪';
      case 'admin':
        return '⚙️';
      default:
        return '👤';
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <span className="text-xl">{getRoleIcon(user.role)}</span>
          <span>{getRoleLabel(user.role)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>ロールを切り替え</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* 管理者のみ表示 */}
        {user.role === 'admin' && (
          <>
            <DropdownMenuItem
              onClick={() => switchRoleMutation.mutate({ role: 'admin' })}
              disabled={switchRoleMutation.isPending}
              className="font-bold"
            >
              <span className="mr-2">⚙️</span>
              管理者画面にもどる
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem
          onClick={() => switchRoleMutation.mutate({ role: 'student' })}
          disabled={user.role === 'student' || switchRoleMutation.isPending}
        >
          <span className="mr-2">🎓</span>
          生徒
        </DropdownMenuItem>
        
        {/* 管理者のみ講師・保護者に切り替え可能 */}
        {user.role === 'admin' && (
          <>
            <DropdownMenuItem
              onClick={() => switchRoleMutation.mutate({ role: 'teacher' })}
              disabled={switchRoleMutation.isPending}
            >
              <span className="mr-2">👨‍🏫</span>
              講師
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => switchRoleMutation.mutate({ role: 'parent' })}
              disabled={switchRoleMutation.isPending}
            >
              <span className="mr-2">👪</span>
              保護者
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
