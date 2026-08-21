import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TRIGGERS, todayKey, useStore, useToday, type TriggerKey } from "@/lib/store";
import { Heart, LifeBuoy } from "lucide-react";

const FEELINGS = [
  "Buồn",
  "Trống rỗng",
  "Lo lắng",
  "Tủi thân",
  "Thất vọng với mình",
  "Mệt đến mức không muốn gì",
  "Sợ tương lai",
  "Cảm giác tụt lại phía sau",
];

const REGULATION = [
  "Uống một ly nước",
  "Rửa mặt nhẹ nhàng",
  "Hít vào 4 — giữ 4 — thở ra 6, ba lần",
  "Bước ra ngoài hai phút",
  "Nằm xuống mà không cảm thấy tội lỗi",
  "Viết 3 dòng bất kỳ",
  "Nghe một bài nhạc quen",
];

const NEXT_STEPS = [
  "Nghe 5 phút tiếng Trung, không cần chép",
  "Mở CV ra xem 5 phút rồi đóng lại",
  "Dọn một góc nhỏ trong 5 phút",
  "Nhắn cho một người mình thấy dễ chịu",
  "Đi tắm nước ấm",
  "Không làm gì thêm hôm nay",
];

export function RescueFlow({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { addCheckIn, updateCheckIn, addAction, state } = useStore();
  const { latest } = useToday();
  const gentle = state.prefs.tone === "nhe-nhang";
  const [step, setStep] = useState(0);
  const [feelings, setFeelings] = useState<string[]>([]);
  const [trigger, setTrigger] = useState<TriggerKey | undefined>();
  const [fact, setFact] = useState("");
  const [fear, setFear] = useState("");
  const [expect, setExpect] = useState("");
  const [regulation, setRegulation] = useState<string>("");
  const [next, setNext] = useState<string>("");

  const total = 5;

  const toggleFeeling = (f: string) =>
    setFeelings((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const reset = () => {
    setStep(0);
    setFeelings([]);
    setTrigger(undefined);
    setFact("");
    setFear("");
    setExpect("");
    setRegulation("");
    setNext("");
  };

  const hasContent =
    feelings.length > 0 || !!trigger || !!fact.trim() || !!fear.trim() || !!expect.trim();

  const finish = () => {
    // Không bịa mood/energy: lưu đúng những gì mình thật sự đã viết,
    // gộp vào ghi nhận hôm nay nếu đã có thay vì tạo bản ghi thứ hai.
    const entry = {
      date: todayKey(),
      trigger,
      fact: fact.trim() || undefined,
      fear: fear.trim() || undefined,
      expect: expect.trim() || undefined,
      thought: feelings.length ? `Cảm giác: ${feelings.join(", ")}` : undefined,
      helped: regulation || undefined,
      forMyself: regulation || undefined,
    };
    if (latest) updateCheckIn(latest.id, entry);
    else addCheckIn(entry);
    if (next && next !== "Không làm gì thêm hôm nay") {
      addAction({ title: next, date: todayKey(), done: false, doneWithoutMood: true });
    }
    setStep(5);
  };

  const close = () => {
    onOpenChange(false);
    if (step > 0 && step < 5 && hasContent) {
      // Giữ nháp: mở lại là tiếp tục, không mất những gì đã viết
      toast("Đã giữ lại những gì mình đã viết — mở lại để tiếp tục nhé.");
      return;
    }
    setTimeout(reset, 250);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <LifeBuoy className="size-5 text-primary" aria-hidden />
            Mình đang tụt mood
          </DialogTitle>
        </DialogHeader>

        {step < 5 && (
          <div className="mb-2">
            <Progress value={((step + 1) / total) * 100} className="h-1.5" />
            <p className="mt-2 text-xs text-muted-foreground">
              Bước {step + 1}/{total} · khoảng 3–5 phút, dừng lúc nào cũng được
            </p>
          </div>
        )}

        {step === 0 && (
          <StepBox
            title="Cảm giác lúc này tên là gì?"
            hint="Chọn bao nhiêu cũng được. Gọi đúng tên thường làm nó bớt mờ mịt."
          >
            <ChipGroup options={FEELINGS} selected={feelings} onToggle={toggleFeeling} />
          </StepBox>
        )}

        {step === 1 && (
          <StepBox title="Điều gì vừa chạm vào mình?" hint="Không cần chính xác tuyệt đối.">
            <ChipGroup
              options={TRIGGERS.map((t) => t.label)}
              selected={trigger ? [TRIGGERS.find((t) => t.key === trigger)!.label] : []}
              onToggle={(label) => setTrigger(TRIGGERS.find((t) => t.label === label)!.key)}
            />
          </StepBox>
        )}

        {step === 2 && (
          <StepBox
            title="Tách ba lớp ra một chút"
            hint="Sự thật thường nhỏ hơn nỗi sợ. Kỳ vọng thường nghiêm khắc hơn mức cần thiết."
          >
            <Field label="Sự thật đang xảy ra (chỉ điều quan sát được)">
              <Textarea
                value={fact}
                onChange={(e) => setFact(e.target.value)}
                placeholder="Ví dụ: Hôm nay mình chưa nộp đơn nào."
                rows={2}
              />
            </Field>
            <Field label="Nỗi sợ đang nói gì">
              <Textarea
                value={fear}
                onChange={(e) => setFear(e.target.value)}
                placeholder="Ví dụ: Mình sẽ mãi không tìm được việc."
                rows={2}
              />
            </Field>
            <Field label="Kỳ vọng mình đang tự đặt ra">
              <Textarea
                value={expect}
                onChange={(e) => setExpect(e.target.value)}
                placeholder="Ví dụ: Mình phải giỏi tiếng Trung trong 2 tháng."
                rows={2}
              />
            </Field>
          </StepBox>
        )}

        {step === 3 && (
          <StepBox title="Chọn một việc để cơ thể dịu lại" hint="Chỉ một việc. Nhỏ là đủ.">
            <ChipGroup
              options={REGULATION}
              selected={regulation ? [regulation] : []}
              onToggle={setRegulation}
            />
          </StepBox>
        )}

        {step === 4 && (
          <StepBox
            title="Sau đó, một việc dưới 10 phút"
            hint="Chọn 'Không làm gì thêm hôm nay' cũng là một lựa chọn hợp lệ."
          >
            <ChipGroup options={NEXT_STEPS} selected={next ? [next] : []} onToggle={setNext} />
          </StepBox>
        )}

        {step === 5 && (
          <div className="animate-rise space-y-4 py-2">
            <Heart className="size-6 text-primary" aria-hidden />
            <p className="font-display text-lg leading-relaxed">
              {hasContent
                ? gentle
                  ? "Mình vừa ở lại với chính mình thay vì bỏ mặc mình. Đó là việc khó nhất trong hôm nay, và mình đã làm."
                  : "Cảm giác này thật, nhưng nó không phải kết luận. Mình vừa xử lý nó bằng hành động thay vì bằng tự phê bình."
                : "Mình đã ghé qua và nhìn lại một chút. Không cần viết gì cũng được — dừng ở đây vẫn tính."}
            </p>
            {regulation && (
              <p className="rounded-2xl bg-sage-soft px-4 py-3 text-sm text-foreground">
                Việc dịu lại: <strong>{regulation}</strong>
                {next ? ` · Việc nhỏ tiếp theo: ${next}` : ""}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Đã lưu vào Nhật ký. Nếu mood không lên, không sao — hôm nay tính là đã đủ.
            </p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          {step > 0 && step < 5 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              Quay lại
            </Button>
          ) : (
            <span />
          )}
          {step < 4 && (
            <Button onClick={() => setStep((s) => s + 1)}>Tiếp tục</Button>
          )}
          {step === 4 && <Button onClick={finish}>Hoàn tất</Button>}
          {step === 5 && <Button onClick={close}>Đóng</Button>}
        </div>

        {step < 5 && (
          <p className="border-t pt-3 text-xs leading-relaxed text-muted-foreground">
            Đây là công cụ tự soi chiếu, không phải chẩn đoán hay điều trị tâm lý. Nếu mình đang có ý
            định làm hại bản thân, hãy liên hệ người mình tin cậy hoặc gọi 115 / Ngày Mai 096 306 1414.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StepBox({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-rise space-y-4">
      <div>
        <h3 className="text-lg">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      </div>
      {children}
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

export function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(o)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-all duration-200",
              active
                ? "border-primary bg-primary-soft font-medium text-accent-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
