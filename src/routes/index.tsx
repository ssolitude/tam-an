import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Scale } from "@/components/Scale";
import { ComparisonReset } from "@/components/ComparisonReset";
import { useRescue } from "@/components/AppShell";
import {
  AREAS,
  ENERGY_LABELS,
  MOOD_LABELS,
  TRIGGERS,
  todayKey,
  useStore,
  useToday,
  type AreaKey,
} from "@/lib/store";
import { Droplets, LifeBuoy, Moon, Plus, Sparkles, Trash2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hôm nay của mình — bạn đồng hành dịu dàng mỗi ngày" },
      {
        name: "description",
        content:
          "Không gian riêng để ghi nhận cảm xúc, hạ áp lực và chọn một việc nhỏ khả thi cho hôm nay.",
      },
      { property: "og:title", content: "Hôm nay của mình" },
      {
        property: "og:description",
        content: "Ghi nhận mood và năng lượng, làm dịu lúc tụt mood, giữ tiến bộ nhỏ mỗi ngày.",
      },
    ],
  }),
  component: Home,
});

const GROUNDING = [
  "Hít vào 4 nhịp, thở ra 6 nhịp. Ba lần. Không cần nghĩ gì thêm.",
  "Kể tên ba thứ mình đang nhìn thấy quanh mình lúc này.",
  "Đặt tay lên ngực và nói: hiện tại mình đang ổn ở mức có thể.",
  "Uống một ngụm nước và để ý cảm giác nước đi qua cổ.",
  "Ngồi thẳng lại một chút, thả vai xuống, thở một hơi dài.",
];

function Home() {
  const { state, addCheckIn, addAction, updateAction, removeAction, updateCheckIn } = useStore();
  const { latest, todayActions, lowEnergy } = useToday();
  const { openRescue } = useRescue();
  const { prefs } = state;

  const [mood, setMood] = useState<number | undefined>(latest?.mood);
  const [energy, setEnergy] = useState<number | undefined>(latest?.energy);
  const [newAction, setNewAction] = useState("");
  const [newArea, setNewArea] = useState<AreaKey | undefined>(prefs.priorities[0]);
  const [evening, setEvening] = useState(latest?.eveningNote ?? "");

  const grounding = GROUNDING[new Date().getDate() % GROUNDING.length];
  const doneToday = todayActions.filter((a) => a.done).length;
  const undone = todayActions.filter((a) => !a.done);
  const evidence = {
    days: new Set(state.checkIns.map((c) => c.date)).size,
    done: state.actions.filter((a) => a.done).length,
    withoutMood: state.actions.filter((a) => a.done && a.doneWithoutMood).length,
  };

  const greeting = prefs.name ? `Chào ${prefs.name}` : "Chào mình";
  const gentle = prefs.tone === "nhe-nhang";

  const saveCheckIn = () => {
    if (!mood || !energy) return;
    if (latest) updateCheckIn(latest.id, { mood, energy });
    else addCheckIn({ date: todayKey(), mood, energy });
  };

  return (
    <div className="space-y-6">
      <section className="animate-rise surface p-6 md:p-8">
        <p className="text-sm text-muted-foreground">
          Hôm nay,{" "}
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1 className="mt-1 text-2xl md:text-3xl">
          {greeting}. Mình không cần khá lên mới được ở đây.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {!latest
            ? "Bắt đầu bằng hai câu hỏi ngắn. Không có câu trả lời sai, và mình không bị chấm điểm."
            : latest.mood != null && latest.energy != null
              ? gentle
                ? `Mình đã ghi nhận hôm nay: ${MOOD_LABELS[latest.mood - 1]?.toLowerCase()}, năng lượng ${ENERGY_LABELS[latest.energy - 1]?.toLowerCase()}. Cứ đi chậm thôi.`
                : `Đã ghi nhận: mood ${latest.mood}/5, năng lượng ${latest.energy}/5. Giờ chọn một việc vừa sức.`
              : "Mình đã ghi nhận hôm nay rồi. Cứ đi chậm thôi."}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={openRescue} className="rounded-full">
            <LifeBuoy className="mr-1 size-4" aria-hidden />
            Tôi đang tụt mood
          </Button>
          <ComparisonReset />
        </div>
      </section>

      {lowEnergy && (
        <section className="animate-rise rounded-3xl border border-sage/40 bg-sage-soft p-6">
          <h2 className="flex items-center gap-2 text-lg">
            <Moon className="size-5 text-sage" aria-hidden />
            Chế độ “ngày tối giản”
          </h2>
          <p className="mt-2 text-sm leading-relaxed">
            Năng lượng hôm nay thấp, nên kỳ vọng được hạ xuống. Hôm nay chỉ cần: uống nước, ăn một
            thứ gì đó, vệ sinh cơ bản, nghỉ ngơi — và nếu còn sức thì một việc nhỏ có ý nghĩa với
            mình. <strong>Nghỉ được tính là đã làm.</strong>
          </p>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {["Uống nước", "Ăn nhẹ dù không thấy ngon", "Rửa mặt / đánh răng", "Nằm nghỉ 20 phút"].map(
              (t) => (
                <li key={t} className="flex items-center gap-2">
                  <Droplets className="size-4 shrink-0 text-sage" aria-hidden />
                  {t}
                </li>
              ),
            )}
          </ul>
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="surface animate-rise space-y-5 p-6">
          <h2 className="text-lg">Ghi nhận nhanh</h2>
          <Scale
            id="mood"
            label="Cảm xúc lúc này (1–5)"
            labels={MOOD_LABELS}
            value={mood}
            onChange={setMood}
          />
          <Scale
            id="energy"
            label="Năng lượng lúc này (1–5)"
            labels={ENERGY_LABELS}
            value={energy}
            onChange={setEnergy}
          />
          <div className="flex items-center gap-2">
            <Button onClick={saveCheckIn} disabled={!mood || !energy}>
              {latest ? "Cập nhật hôm nay" : "Lưu ghi nhận"}
            </Button>
            <Link to="/nhat-ky" className="text-sm text-primary underline-offset-4 hover:underline">
              Ghi chi tiết hơn
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Thang điểm này chỉ để mình tự quan sát, không mang ý nghĩa chẩn đoán.
          </p>
        </section>

        <section className="surface animate-rise space-y-4 p-6">
          <div>
            <h2 className="text-lg">Một câu để về lại với hiện tại</h2>
            <p className="mt-2 rounded-2xl bg-secondary/70 px-4 py-3 text-sm leading-relaxed">
              {grounding}
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold">Bằng chứng mình vẫn đang đi</h3>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                { n: evidence.days, l: "ngày đã ghi nhận" },
                { n: evidence.done, l: "việc nhỏ đã làm" },
                { n: evidence.withoutMood, l: "việc làm dù không có mood" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-primary-soft/60 px-3 py-3 text-center">
                  <p className="font-display text-2xl">{s.n}</p>
                  <p className="mt-1 text-xs leading-tight text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="surface animate-rise p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg">Việc nhỏ hôm nay</h2>
          <p className="text-sm text-muted-foreground">
            {todayActions.length === 0
              ? "Chưa có việc nào — thêm một việc rất nhỏ thôi."
              : `${doneToday}/${todayActions.length} đã làm${undone.length ? ` · còn ${undone.length} việc đang chờ, không sao cả` : " · đủ cho hôm nay"}`}
          </p>
        </div>

        <ul className="mt-4 space-y-2">
          {todayActions.map((a) => (
            <li
              key={a.id}
              className="flex items-start gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3"
            >
              <Checkbox
                id={`act-${a.id}`}
                checked={a.done}
                onCheckedChange={(v) => updateAction(a.id, { done: !!v })}
                className="mt-0.5"
              />
              <label htmlFor={`act-${a.id}`} className="flex-1 cursor-pointer text-sm">
                <span className={a.done ? "text-muted-foreground line-through" : ""}>{a.title}</span>
                {a.area && (
                  <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    {AREAS.find((x) => x.key === a.area)?.label}
                  </span>
                )}
              </label>
              <button
                type="button"
                onClick={() => updateAction(a.id, { doneWithoutMood: !a.doneWithoutMood })}
                className={`rounded-full px-2 py-1 text-xs ${a.doneWithoutMood ? "bg-sage-soft text-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                aria-pressed={!!a.doneWithoutMood}
              >
                dù không có mood
              </button>
              <button
                type="button"
                onClick={() => removeAction(a.id)}
                aria-label={`Xoá việc ${a.title}`}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>

        <form
          className="mt-4 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newAction.trim()) return;
            addAction({
              title: newAction.trim(),
              date: todayKey(),
              done: false,
              ...(newArea ? { area: newArea } : {}),
            });
            setNewAction("");
          }}
        >
          <Input
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            placeholder="Ví dụ: nghe 5 phút tiếng Trung"
            aria-label="Việc nhỏ mới"
            className="min-w-48 flex-1"
          />
          <select
            aria-label="Mảng"
            value={newArea ?? ""}
            onChange={(e) => setNewArea((e.target.value || undefined) as AreaKey | undefined)}
            className="rounded-xl border border-input bg-card px-3 py-2 text-sm"
          >
            <option value="">Không phân loại</option>
            {AREAS.map((a) => (
              <option key={a.key} value={a.key}>
                {a.label}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            <Plus className="mr-1 size-4" aria-hidden />
            Thêm
          </Button>
        </form>
      </section>

      <section className="surface animate-rise p-6">
        <h2 className="flex items-center gap-2 text-lg">
          <Sparkles className="size-5 text-primary" aria-hidden />
          Ngày da của mình
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Chỗ này không đánh giá da đẹp hay xấu, không so sánh trước — sau. Chỉ ghi lại mình đã đối
          xử với mình thế nào.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "Rửa mặt dịu nhẹ",
            "Dưỡng ẩm",
            "Chống nắng",
            "Không soi gương quá lâu",
            "Không tự nặn / cào",
            "Ngủ sớm hơn một chút",
          ].map((t) => (
            <Button
              key={t}
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() =>
                addAction({ title: t, area: "lan-da", date: todayKey(), done: true })
              }
            >
              {t}
            </Button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Bấm để ghi nhận là mình đã làm. Da cần thời gian, và thời gian không phải lỗi của mình.
        </p>
      </section>

      <section className="surface animate-rise p-6">
        <h2 className="text-lg">Nhìn lại cuối ngày (không bắt buộc)</h2>
        <Textarea
          className="mt-3"
          rows={3}
          value={evening}
          onChange={(e) => setEvening(e.target.value)}
          placeholder="Một điều hôm nay dễ thở hơn mình tưởng, hoặc một điều mình đã tử tế với mình."
          aria-label="Nhìn lại cuối ngày"
        />
        <div className="mt-3 flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              if (latest) updateCheckIn(latest.id, { eveningNote: evening });
              else addCheckIn({ date: todayKey(), mood: mood ?? 3, energy: energy ?? 3, eveningNote: evening });
            }}
          >
            Lưu
          </Button>
          <span className="text-sm text-muted-foreground">Bỏ trống cũng hoàn toàn ổn.</span>
        </div>
      </section>

      <section className="animate-rise rounded-3xl border border-border bg-secondary/50 p-6">
        <h2 className="text-lg">Nhắc mình một câu</h2>
        <p className="mt-2 font-display text-lg leading-relaxed">
          “{state.reminders[0]?.text ?? "Mình đang ở một giai đoạn, không phải một kết luận về giá trị của mình."}”
        </p>
        <Link
          to="/tu-noi-voi-minh"
          className="mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline"
        >
          Xem thư viện “Tự nói với mình”
        </Link>
      </section>

      {TRIGGERS.length === 0 && null}
    </div>
  );
}
