import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChipGroup } from "@/components/RescueFlow";
import { toast } from "sonner";
import { AREAS, useStore, type AreaKey, type Prefs } from "@/lib/store";
import { Eraser, Settings2, Trash2 } from "lucide-react";

export const Route = createFileRoute("/thiet-lap")({
  head: () => ({
    meta: [
      { title: "Thiết lập — Hôm nay của mình" },
      {
        name: "description",
        content:
          "Chỉnh cách app gọi mình, tông giọng, nhịp check-in và quản lý dữ liệu lưu trong trình duyệt.",
      },
      { property: "og:title", content: "Thiết lập — Hôm nay của mình" },
      {
        property: "og:description",
        content: "Cá nhân hoá và quản lý dữ liệu của mình.",
      },
    ],
  }),
  component: SettingsPage,
});

const FREQ: { key: Prefs["checkInFrequency"]; label: string }[] = [
  { key: "moi-ngay", label: "Mỗi ngày một lần" },
  { key: "vai-lan-tuan", label: "Vài lần một tuần" },
  { key: "khi-can", label: "Chỉ khi mình cần" },
];

function SettingsPage() {
  const { state, setPrefs, clearSamples, resetAll } = useStore();
  const [draft, setDraft] = useState<Prefs>(state.prefs);
  const [confirmSamples, setConfirmSamples] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const set = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const togglePriority = (label: string) => {
    const key = AREAS.find((a) => a.label === label)!.key;
    if (draft.priorities.includes(key)) {
      set("priorities", draft.priorities.filter((k) => k !== key));
    } else if (draft.priorities.length < 3) {
      set("priorities", [...draft.priorities, key]);
    }
  };

  const save = () => {
    setPrefs({ ...draft, name: draft.name.trim().slice(0, 40) });
    toast.success("Đã lưu thiết lập.");
  };

  const hasSamples =
    state.checkIns.some((c) => c.sample) ||
    state.actions.some((a) => a.sample) ||
    state.goals.some((g) => g.sample) ||
    state.reminders.some((r) => r.sample);

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="flex items-center gap-2 text-2xl md:text-3xl">
          <Settings2 className="size-6 text-primary" aria-hidden />
          Thiết lập
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Mọi thứ ở đây chỉ lưu trong trình duyệt này, không gửi đi đâu. Mình có thể đổi bất cứ lúc
          nào.
        </p>
      </header>

      <section className="surface animate-rise space-y-5 p-6">
        <h2 className="text-lg">Về mình</h2>
        <Field label="Mình muốn được gọi là">
          <Input value={draft.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <div>
          <p className="mb-2 text-sm font-medium">Giai đoạn này mình ưu tiên (tối đa 3)</p>
          <ChipGroup
            options={AREAS.map((a) => a.label)}
            selected={AREAS.filter((a) => draft.priorities.includes(a.key)).map((a) => a.label)}
            onToggle={togglePriority}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Nhịp ghi nhận</p>
          <ChipGroup
            options={FREQ.map((f) => f.label)}
            selected={[FREQ.find((f) => f.key === draft.checkInFrequency)!.label]}
            onToggle={(l) => set("checkInFrequency", FREQ.find((f) => f.label === l)!.key)}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Cách nói mình thích</p>
          <ChipGroup
            options={["Nhẹ nhàng, chậm rãi", "Trực tiếp, rõ ràng"]}
            selected={[
              draft.tone === "nhe-nhang" ? "Nhẹ nhàng, chậm rãi" : "Trực tiếp, rõ ràng",
            ]}
            onToggle={(l) => set("tone", l.startsWith("Nhẹ") ? "nhe-nhang" : "truc-tiep")}
          />
        </div>
      </section>

      <section className="surface animate-rise space-y-4 p-6">
        <h2 className="text-lg">Để app hiểu mình hơn</h2>
        <Field label="Thường thì ngay trước lúc mood tụt, chuyện gì xảy ra?">
          <Textarea
            rows={2}
            value={draft.beforeDrop}
            onChange={(e) => set("beforeDrop", e.target.value)}
          />
        </Field>
        <Field label="Những suy nghĩ hay xuất hiện lúc đó">
          <Textarea
            rows={2}
            value={draft.usualThoughts}
            onChange={(e) => set("usualThoughts", e.target.value)}
          />
        </Field>
        <Field label="Kiểu hỗ trợ làm mình dễ chịu">
          <Textarea
            rows={2}
            value={draft.supportThatHelps}
            onChange={(e) => set("supportThatHelps", e.target.value)}
          />
        </Field>
        <Field label="Kiểu làm mình khó chịu (app sẽ tránh)">
          <Textarea
            rows={2}
            value={draft.supportThatAnnoys}
            onChange={(e) => set("supportThatAnnoys", e.target.value)}
          />
        </Field>
        <Field label="Một ngày 'đủ ổn' của mình là">
          <Textarea
            rows={2}
            value={draft.goodEnoughDay}
            onChange={(e) => set("goodEnoughDay", e.target.value)}
          />
        </Field>
        <Button onClick={save}>Lưu thiết lập</Button>
      </section>

      <section className="animate-rise space-y-4 rounded-3xl border border-border bg-secondary/40 p-6">
        <h2 className="text-lg">Dữ liệu của mình</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Toàn bộ ghi nhận, việc nhỏ, mục tiêu và câu nhắc chỉ nằm trong trình duyệt này
          (localStorage). Xoá dữ liệu trình duyệt sẽ xoá cả chúng.
        </p>
        <div className="flex flex-wrap gap-3">
          {hasSamples && (
            <Button
              variant="secondary"
              onClick={() => {
                if (confirmSamples) {
                  clearSamples();
                  setConfirmSamples(false);
                  toast.success("Đã xoá toàn bộ dữ liệu ví dụ mẫu.");
                } else {
                  setConfirmSamples(true);
                }
              }}
              onBlur={() => setConfirmSamples(false)}
            >
              <Eraser className="mr-1 size-4" aria-hidden />
              {confirmSamples ? "Bấm lần nữa để xoá dữ liệu mẫu" : "Xoá các ví dụ mẫu"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              if (confirmReset) {
                resetAll();
                setConfirmReset(false);
                toast("Đã xoá toàn bộ dữ liệu. Mình bắt đầu lại từ đầu nhé.");
              } else {
                setConfirmReset(true);
              }
            }}
            onBlur={() => setConfirmReset(false)}
            className="border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-1 size-4" aria-hidden />
            {confirmReset ? "Chắc chắn xoá hết? Bấm lần nữa" : "Xoá toàn bộ & bắt đầu lại"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          “Xoá toàn bộ” sẽ đưa app về trạng thái ban đầu, gồm cả màn hình chào lần đầu.
        </p>
      </section>
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
