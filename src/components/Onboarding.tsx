import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ChipGroup } from "@/components/RescueFlow";
import { AREAS, useStore, type AreaKey, type Prefs } from "@/lib/store";

const FREQ: { key: Prefs["checkInFrequency"]; label: string }[] = [
  { key: "moi-ngay", label: "Mỗi ngày một lần" },
  { key: "vai-lan-tuan", label: "Vài lần một tuần" },
  { key: "khi-can", label: "Chỉ khi mình cần" },
];

export function Onboarding() {
  const { state, hydrated, setPrefs } = useStore();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Partial<Prefs>>({});
  const open = hydrated && !state.prefs.onboarded;
  const total = 5;

  const set = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const val = <K extends keyof Prefs>(k: K): Prefs[K] => (draft[k] ?? state.prefs[k]) as Prefs[K];

  const togglePriority = (label: string) => {
    const key = AREAS.find((a) => a.label === label)!.key;
    const cur = (val("priorities") as AreaKey[]) ?? [];
    if (cur.includes(key)) {
      set("priorities", cur.filter((k) => k !== key));
    } else if (cur.length < 3) {
      set("priorities", [...cur, key]);
    }
  };

  const finish = () => {
    setPrefs({ ...draft, name: (draft.name ?? state.prefs.name).trim().slice(0, 40), onboarded: true });
    setStep(0);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) finish(); // Esc / click-outside = bỏ qua, không bao giờ kẹt trong dialog
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 0 ? "Chào mình" : "Để app hiểu mình hơn một chút"}
          </DialogTitle>
        </DialogHeader>

        <Progress value={((step + 1) / total) * 100} className="h-1.5" />

        {step === 0 && (
          <div className="animate-rise space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Đây là một chỗ riêng để mình quay về vào những ngày thấy mình đang cách xa cuộc sống
              mình mong muốn. App không đánh giá, không thúc mình phải tích cực, và không cần mình
              phải khá lên mới được dùng.
            </p>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Mình muốn được gọi là gì?</span>
              <Input
                value={val("name")}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Tên hoặc cách gọi thân mật"
              />
            </label>
            <p className="rounded-2xl bg-secondary/70 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              5 bước ngắn, bỏ qua câu nào cũng được — bấm ra ngoài hoặc nút Bỏ qua là xong. Mọi
              thứ chỉ lưu trong trình duyệt này. Đây không phải công cụ y tế hay tâm lý.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="animate-rise space-y-4">
            <Field
              label="Thường thì ngay trước lúc mood tụt, chuyện gì xảy ra?"
              hint="Ví dụ: lướt mạng thấy người quen có việc, soi gương lâu, ngủ ít."
            >
              <Textarea
                rows={3}
                value={val("beforeDrop")}
                onChange={(e) => set("beforeDrop", e.target.value)}
              />
            </Field>
            <Field label="Những suy nghĩ nào hay xuất hiện lúc đó?">
              <Textarea
                rows={3}
                value={val("usualThoughts")}
                onChange={(e) => set("usualThoughts", e.target.value)}
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="animate-rise space-y-4">
            <Field label="Kiểu hỗ trợ nào làm mình dễ chịu?">
              <Textarea
                rows={2}
                value={val("supportThatHelps")}
                onChange={(e) => set("supportThatHelps", e.target.value)}
                placeholder="Ví dụ: được nhắc là mình vẫn ổn, được gợi ý việc nhỏ."
              />
            </Field>
            <Field label="Kiểu nào làm mình thấy khó chịu? App sẽ tránh.">
              <Textarea
                rows={2}
                value={val("supportThatAnnoys")}
                onChange={(e) => set("supportThatAnnoys", e.target.value)}
                placeholder="Ví dụ: câu nói tích cực sáo rỗng, bị hối phải cố gắng."
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="animate-rise space-y-4">
            <Field label="Một ngày thế nào thì mình thấy 'đủ ổn'?">
              <Textarea
                rows={3}
                value={val("goodEnoughDay")}
                onChange={(e) => set("goodEnoughDay", e.target.value)}
                placeholder="Ví dụ: ăn đủ, học 10 phút, không tự mắng mình."
              />
            </Field>
            <div>
              <p className="text-sm font-medium">Giai đoạn này mình muốn ưu tiên gì?</p>
              <p className="mb-3 mt-1 text-sm text-muted-foreground">Chọn tối đa 2–3 mảng.</p>
              <ChipGroup
                options={AREAS.map((a) => a.label)}
                selected={AREAS.filter((a) => (val("priorities") as AreaKey[]).includes(a.key)).map(
                  (a) => a.label,
                )}
                onToggle={togglePriority}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-rise space-y-5">
            <div>
              <p className="text-sm font-medium">Mình muốn ghi nhận (check-in) bao lâu một lần?</p>
              <div className="mt-3">
                <ChipGroup
                  options={FREQ.map((f) => f.label)}
                  selected={[FREQ.find((f) => f.key === val("checkInFrequency"))!.label]}
                  onToggle={(l) => set("checkInFrequency", FREQ.find((f) => f.label === l)!.key)}
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Mình thích cách nói nào hơn?</p>
              <div className="mt-3">
                <ChipGroup
                  options={["Nhẹ nhàng, chậm rãi", "Trực tiếp, rõ ràng"]}
                  selected={[
                    val("tone") === "nhe-nhang" ? "Nhẹ nhàng, chậm rãi" : "Trực tiếp, rõ ràng",
                  ]}
                  onToggle={(l) =>
                    set("tone", l.startsWith("Nhẹ") ? "nhe-nhang" : "truc-tiep")
                  }
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              Quay lại
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={finish}>
              Bỏ qua
            </Button>
            {step < total - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Tiếp tục</Button>
            ) : (
              <Button onClick={finish}>Bắt đầu</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {hint && <span className="block text-sm text-muted-foreground">{hint}</span>}
      {children}
    </label>
  );
}
