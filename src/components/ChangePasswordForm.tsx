import { useState } from "react";
import { KeyRound } from "lucide-react";
import { changePassword } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Props = {
  userId: string;
  compact?: boolean;
};

export function ChangePasswordForm({ userId, compact }: Props) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      toast.error("New passwords do not match");
      return;
    }
    setBusy(true);
    const { error } = await changePassword(userId, current, next);
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Password updated");
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  return (
    <form onSubmit={(e) => void submit(e)} className={compact ? "mt-4 space-y-3" : "mt-4 space-y-4"}>
      <div className="space-y-2">
        <Label htmlFor="pw-current">Current password</Label>
        <Input
          id="pw-current"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          className={compact ? "h-9" : undefined}
        />
      </div>
      <div className={compact ? "grid gap-3 sm:grid-cols-2" : "space-y-4"}>
        <div className="space-y-2">
          <Label htmlFor="pw-new">New password</Label>
          <Input
            id="pw-new"
            type="password"
            autoComplete="new-password"
            minLength={6}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            className={compact ? "h-9" : undefined}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw-confirm">Confirm new password</Label>
          <Input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className={compact ? "h-9" : undefined}
          />
        </div>
      </div>
      <Button type="submit" disabled={busy} className="gap-2" variant={compact ? "secondary" : "default"}>
        <KeyRound className="h-4 w-4" />
        {busy ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
