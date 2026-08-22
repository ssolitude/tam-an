import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Scale } from "@/components/Scale";
import { ChipGroup } from "@/components/RescueFlow";
import { toast } from "sonner";
import {
  ENERGY_LABELS,
  MOOD_LABELS,
  TRIGGERS,
  formatDate,
  todayKey,
  useStore,
  type CheckIn,
  type TriggerKey,
} from "@/lib/store";
import { BookHeart, Pencil, Plus, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/nhat-ky")({
  head: () => ({
    meta: [
      { title: "Nhật ký — Hôm nay của mình" },
      {
        name: "description",
        content:
          "Đọc lại và ghi thêm những ghi nhận cảm xúc của mình: mood, năng lượng, điều đã giúp, điều mình làm cho mình.",
      },
      { property: "og:title", content: "Nhật ký — Hôm nay của mình" },
      {
        property: "og:description",
        content: "Nơi lưu lại những lần mình đã ở lại với chính mình.",
      },
    ],
  }),
  component: JournalPage,
});

type EntryDraft = {
  mood?: number | undefined;
  energy?: number | undefined;
  trigger?: TriggerKey | undefined;
  thought: string;
  helped: string;
  forMyself: string;
  eveningNote: string;
};

const emptyDraft: EntryDraft = {
  mood: undefined,
  energy: undefined,
  trigger: undefined,
  thought: "",
  helped: "",
  forMyself: "",
  eveningNote: "",
};

function JournalPage() {
  const { state, addCheckIn, updateCheckIn, removeCheckIn } = useStore();
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState<EntryDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const entries = state.checkIns;

  const hasContent =
    !!draft.thought.trim() || !!draft.helped.trim() || !!draft.forMyself.trim() ||
    !!draft.eveningNote.trim() || draft.mood != null || draft.energy != null || !!draft.trigger;

  const toPatch = (d: EntryDraft) => ({
    ...(d.mood != null ? { mood: d.mood } : {}),
    ...(d.energy != null ? { energy: d.energy } : {}),
    trigger: d.trigger,
    thought: d.thought.trim() || undefined,
    helped: d.helped.trim() || undefined,
    forMyself: d.forMyself.trim() || undefined,
    eveningNote: d.eveningNote.trim() || undefined,
  });

  const saveNew = () => {
    if (!hasContent) {
      toast("Mình chưa viết gì — không cần ép mình.");
      return;
    }
    addCheckIn({ date: todayKey(), ...toPatch(draft) });
    setDraft(emptyDraft);
    setWriting(false);
    toast.success("Đã lưu vào nhật ký.");
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateCheckIn(editingId, toPatch(draft));
    setEditingId(null);
    setDraft(emptyDraft);
    toast.success("Đã cập nhật.");
  };

  const startEdit = (c: CheckIn) => {
    setEditingId(c.id);
    setWriting(false);
    setDraft({
      mood: c.mood,
      energy: c.energy,
      trigger: c.trigger,
      thought: c.thought ?? "",
      helped: c.helped ?? "",
      forMyself: c.forMyself ?? "",
      eveningNote: c.eveningNote ?? "",
    });
  };

  const cancelForm = () => {
    setWriting(false);
    setEditingId(null);
    setDraft(emptyDraft);
  };

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="flex items-center gap-2 text-2xl md:text-3xl">
          <BookHeart className="size-6 text-primary" aria-hidden />
          Nhật ký của mình
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Mỗi dòng ở đây là một lần mình chọn ở lại với chính mình. Đọc lại không phải để chấm
          điểm — chỉ để thấy mình đã đi qua những gì.
        </p>
      </header>

      {!writing && !editingId && (
        <Button onClick={() => setWriting(true)} className="animate-rise rounded-full">
          <Plus className="mr-1 size-4" aria-hidden />
          Ghi thêm một dòng
        </Button>
      )}

      {(writing || editingId) && (
        <section className="surface animate-rise space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">{editingId ? "Chỉnh lại ghi nhận" : "Ghi nhận mới"}</h2>
            <button
              type="button"
              onClick={cancelForm}
              aria-label="Đóng form"
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Scale
              id="j-mood"
              label="Cảm xúc (không bắt buộc)"
              labels={MOOD_LABELS}
              value={draft.mood}
              onChange={(v) => setDraft((d) => ({ ...d, mood: v }))}
            />
            <Scale
              id="j-energy"
              label="Năng lượng (không bắt buộc)"
              labels={ENERGY_LABELS}
              value={draft.energy}
              onChange={(v) => setDraft((d) => ({ ...d, energy: v }))}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Điều gì đang chạm vào mình?</p>
            <ChipGroup
              options={TRIGGERS.map((t) => t.label)}
              selected={
                draft.trigger ? [TRIGGERS.find((t) => t.key === draft.trigger)!.label] : []
              }
              onToggle={(label) => {
                const key = TRIGGERS.find((t) => t.label === label)!.key;
                setDraft((d) => ({ ...d, trigger: d.trigger === key ? undefined : key }));
              }}
            />
          </div>
          <Field label="Điều mình đang nghĩ / cảm thấy">
            <Textarea
              rows={3}
              value={draft.thought}
              onChange={(e) => setDraft((d) => ({ ...d, thought: e.target.value }))}
              placeholder="Viết tự do, không cần mạch lạc."
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Điều gì đã giúp một chút?">
              <Textarea
                rows={2}
                value={draft.helped}
                onChange={(e) => setDraft((d) => ({ ...d, helped: e.target.value }))}
              />
            </Field>
            <Field label="Mình đã làm gì cho mình?">
              <Textarea
                rows={2}
                value={draft.forMyself}
                onChange={(e) => setDraft((d) => ({ ...d, forMyself: e.target.value }))}
              />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={editingId ? saveEdit : saveNew}>
              {editingId ? "Lưu thay đổi" : "Lưu ghi nhận"}
            </Button>
            <span className="text-xs text-muted-foreground">Bỏ trống ô nào cũng được.</span>
          </div>
        </section>
      )}

      {entries.length === 0 ? (
        <section className="surface animate-rise p-6 text-sm leading-relaxed text-muted-foreground">
          Chưa có ghi nhận nào. Ngày nào mình quay lại đây cũng được — nhật ký không đòi hỏi sự
          đều đặn.
        </section>
      ) : (
        <ul className="space-y-4">
          {entries.map((c) => {
            const triggerLabel = TRIGGERS.find((t) => t.key === c.trigger)?.label;
            return (
              <li key={c.id} className="surface animate-rise p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{formatDate(c.date)}</p>
                  {c.sample && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                      Ví dụ mẫu
                    </span>
                  )}
                  <span className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      aria-label="Chỉnh sửa ghi nhận"
                      className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
                    >
                      <Pencil className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirmDeleteId === c.id) {
                          removeCheckIn(c.id);
                          setConfirmDeleteId(null);
                          toast("Đã xoá ghi nhận.");
                        } else {
                          setConfirmDeleteId(c.id);
                        }
                      }}
                      onBlur={() => setConfirmDeleteId((id) => (id === c.id ? null : id))}
                      aria-label={confirmDeleteId === c.id ? "Bấm lần nữa để xác nhận xoá" : "Xoá ghi nhận"}
                      className={
                        confirmDeleteId === c.id
                          ? "rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive"
                          : "rounded-full p-2 text-muted-foreground hover:bg-secondary"
                      }
                    >
                      {confirmDeleteId === c.id ? (
                        "Xác nhận xoá"
                      ) : (
                        <Trash2 className="size-4" aria-hidden />
                      )}
                    </button>
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {c.mood != null && (
                    <span className="rounded-full bg-primary-soft px-2.5 py-1">
                      Cảm xúc: {MOOD_LABELS[c.mood - 1]}
                    </span>
                  )}
                  {c.energy != null && (
                    <span className="rounded-full bg-sage-soft px-2.5 py-1">
                      Năng lượng: {ENERGY_LABELS[c.energy - 1]}
                    </span>
                  )}
                  {triggerLabel && (
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">
                      {triggerLabel}
                    </span>
                  )}
                </div>

                <dl className="mt-3 space-y-3 text-sm leading-relaxed">
                  {c.thought && <EntryField term="Điều mình nghĩ" value={c.thought} />}
                  {c.fact && <EntryField term="Sự thật" value={c.fact} />}
                  {c.fear && <EntryField term="Nỗi sợ" value={c.fear} />}
                  {c.expect && <EntryField term="Kỳ vọng tự đặt" value={c.expect} />}
                  {c.helped && <EntryField term="Điều đã giúp" value={c.helped} />}
                  {c.forMyself && <EntryField term="Mình đã làm cho mình" value={c.forMyself} />}
                  {c.eveningNote && <EntryField term="Nhìn lại cuối ngày" value={c.eveningNote} />}
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function EntryField({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{term}</dt>
      <dd className="mt-0.5">{value}</dd>
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
