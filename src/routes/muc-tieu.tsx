import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChipGroup } from "@/components/RescueFlow";
import { toast } from "sonner";
import { AREAS, useStore, type AreaKey, type Goal } from "@/lib/store";
import { Compass, Pencil, Plus, ShieldCheck, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/muc-tieu")({
  head: () => ({
    meta: [
      { title: "Mục tiêu — Hôm nay của mình" },
      {
        name: "description",
        content:
          "Định hướng 90 ngày theo từng mảng sống: việc mình kiểm soát được và việc nằm ngoài tầm tay mình.",
      },
      { property: "og:title", content: "Mục tiêu — Hôm nay của mình" },
      {
        property: "og:description",
        content: "Tập trung vào việc trong tầm tay, buông nhẹ việc ngoài tầm kiểm soát.",
      },
    ],
  }),
  component: GoalsPage,
});

type GoalDraft = {
  area: AreaKey;
  direction90: string;
  monthFocus: string;
  weeklyActions: string; // mỗi dòng một việc
  outOfControl: string; // mỗi dòng một điều
};

const lines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

function GoalsPage() {
  const { state, addGoal, updateGoal, removeGoal } = useStore();
  const [writing, setWriting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<GoalDraft>({
    area: state.prefs.priorities[0] ?? "cuoc-song",
    direction90: "",
    monthFocus: "",
    weeklyActions: "",
    outOfControl: "",
  });

  const startEdit = (g: Goal) => {
    setEditingId(g.id);
    setWriting(false);
    setDraft({
      area: g.area,
      direction90: g.direction90,
      monthFocus: g.monthFocus,
      weeklyActions: g.weeklyActions.join("\n"),
      outOfControl: g.outOfControl.join("\n"),
    });
  };

  const cancel = () => {
    setWriting(false);
    setEditingId(null);
  };

  const save = () => {
    if (!draft.direction90.trim()) {
      toast("Mình viết một dòng định hướng 90 ngày nhé — ngắn thôi cũng được.");
      return;
    }
    const payload = {
      area: draft.area,
      direction90: draft.direction90.trim(),
      monthFocus: draft.monthFocus.trim(),
      weeklyActions: lines(draft.weeklyActions),
      outOfControl: lines(draft.outOfControl),
    };
    if (editingId) {
      updateGoal(editingId, payload);
      toast.success("Đã cập nhật mục tiêu.");
    } else {
      addGoal(payload);
      toast.success("Đã thêm định hướng mới.");
    }
    cancel();
  };

  const goals = state.goals;

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="flex items-center gap-2 text-2xl md:text-3xl">
          <Compass className="size-6 text-primary" aria-hidden />
          Mục tiêu theo cách của mình
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Không phải KPI. Mỗi mục tiêu gồm hai phần: việc mình làm được (và sẽ làm chậm rãi), và
          những điều ngoài tầm tay mình (để mình buông nhẹ thay vì tự trách).
        </p>
      </header>

      {!writing && !editingId && (
        <Button
          onClick={() => setWriting(true)}
          variant="secondary"
          className="animate-rise rounded-full"
        >
          <Plus className="mr-1 size-4" aria-hidden />
          Thêm định hướng mới
        </Button>
      )}

      {(writing || editingId) && (
        <section className="surface animate-rise space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">{editingId ? "Chỉnh lại định hướng" : "Định hướng mới"}</h2>
            <button
              type="button"
              onClick={cancel}
              aria-label="Đóng form"
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Thuộc mảng nào?</p>
            <ChipGroup
              options={AREAS.map((a) => a.label)}
              selected={[AREAS.find((a) => a.key === draft.area)!.label]}
              onToggle={(label) =>
                setDraft((d) => ({ ...d, area: AREAS.find((a) => a.label === label)!.key }))
              }
            />
          </div>
          <Field label="Định hướng 90 ngày — mình muốn đi về đâu?">
            <Input
              value={draft.direction90}
              onChange={(e) => setDraft((d) => ({ ...d, direction90: e.target.value }))}
              placeholder="Ví dụ: Có một nhịp sống mình không muốn trốn."
            />
          </Field>
          <Field label="Tháng này mình tập trung gì? (một việc thôi cũng được)">
            <Input
              value={draft.monthFocus}
              onChange={(e) => setDraft((d) => ({ ...d, monthFocus: e.target.value }))}
              placeholder="Ví dụ: Giữ nhịp học 10 phút, không cần tiến nhanh."
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Việc trong tầm tay mình (mỗi dòng một việc)">
              <Textarea
                rows={4}
                value={draft.weeklyActions}
                onChange={(e) => setDraft((d) => ({ ...d, weeklyActions: e.target.value }))}
                placeholder={"Nộp 3 đơn mỗi tuần\nNghe tiếng Trung 10 phút/ngày"}
              />
            </Field>
            <Field label="Điều ngoài tầm kiểm soát — mình chọn buông nhẹ">
              <Textarea
                rows={4}
                value={draft.outOfControl}
                onChange={(e) => setDraft((d) => ({ ...d, outOfControl: e.target.value }))}
                placeholder={"Nhà tuyển dụng có trả lời hay không\nDa lành nhanh hay chậm"}
              />
            </Field>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={save}>{editingId ? "Lưu thay đổi" : "Lưu định hướng"}</Button>
            <span className="text-xs text-muted-foreground">
              Mục tiêu có thể đổi bất cứ lúc nào — đổi hướng không phải thất bại.
            </span>
          </div>
        </section>
      )}

      {goals.length === 0 ? (
        <section className="surface animate-rise p-6 text-sm leading-relaxed text-muted-foreground">
          Chưa có định hướng nào. Mình có thể bắt đầu bằng một câu rất nhỏ cho 90 ngày tới.
        </section>
      ) : (
        <ul className="space-y-4">
          {goals.map((g) => {
            const area = AREAS.find((a) => a.key === g.area);
            return (
              <li key={g.id} className="surface animate-rise p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-accent-foreground">
                    {area?.label}
                  </span>
                  {g.sample && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                      Ví dụ mẫu
                    </span>
                  )}
                  <span className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(g)}
                      aria-label={`Chỉnh sửa định hướng ${area?.label}`}
                      className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
                    >
                      <Pencil className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirmDeleteId === g.id) {
                          removeGoal(g.id);
                          setConfirmDeleteId(null);
                          toast("Đã xoá định hướng.");
                        } else {
                          setConfirmDeleteId(g.id);
                        }
                      }}
                      onBlur={() => setConfirmDeleteId((id) => (id === g.id ? null : id))}
                      aria-label={
                        confirmDeleteId === g.id ? "Bấm lần nữa để xác nhận xoá" : "Xoá định hướng"
                      }
                      className={
                        confirmDeleteId === g.id
                          ? "rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive"
                          : "rounded-full p-2 text-muted-foreground hover:bg-secondary"
                      }
                    >
                      {confirmDeleteId === g.id ? (
                        "Xác nhận xoá"
                      ) : (
                        <Trash2 className="size-4" aria-hidden />
                      )}
                    </button>
                  </span>
                </div>

                <p className="mt-3 font-display text-lg leading-relaxed">{g.direction90}</p>
                {g.monthFocus && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tháng này: {g.monthFocus}
                  </p>
                )}
                {area && (
                  <p className="mt-2 text-xs italic text-muted-foreground">{area.note}</p>
                )}

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold">Trong tầm tay mình</h3>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {g.weeklyActions.map((w) => (
                        <li key={w} className="flex items-start gap-2">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                          {w}
                        </li>
                      ))}
                      {g.weeklyActions.length === 0 && (
                        <li className="text-muted-foreground">Chưa viết — thêm khi mình muốn.</li>
                      )}
                    </ul>
                  </div>
                  <div className="rounded-2xl bg-sage-soft/70 p-4">
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                      <ShieldCheck className="size-4 text-sage" aria-hidden />
                      Ngoài tầm tay — mình buông nhẹ
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {g.outOfControl.map((o) => (
                        <li key={o} className="flex items-start gap-2">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sage" aria-hidden />
                          {o}
                        </li>
                      ))}
                      {g.outOfControl.length === 0 && (
                        <li className="text-muted-foreground">Chưa viết.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
