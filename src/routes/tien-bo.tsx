import { createFileRoute, Link } from "@tanstack/react-router";
import { MOOD_LABELS, ENERGY_LABELS, useStore } from "@/lib/store";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/tien-bo")({
  head: () => ({
    meta: [
      { title: "Tiến bộ — Hôm nay của mình" },
      {
        name: "description",
        content:
          "Nhìn lại những ngày mình đã ghi nhận, những việc nhỏ đã làm — bằng chứng mình vẫn đang đi, không phải điểm số.",
      },
      { property: "og:title", content: "Tiến bộ — Hôm nay của mình" },
      {
        property: "og:description",
        content: "Tiến bộ ở đây không phải đường thẳng đi lên, mà là việc mình vẫn chưa bỏ mình.",
      },
    ],
  }),
  component: ProgressPage,
});

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function ProgressPage() {
  const { state } = useStore();
  const { prefs } = state;

  // Chỉ tính dữ liệu thật của mình, không tính các ví dụ mẫu.
  const checkIns = state.checkIns.filter((c) => !c.sample);
  const actions = state.actions.filter((a) => !a.sample);

  const daySet = new Set(checkIns.map((c) => c.date));
  const done = actions.filter((a) => a.done);
  const withoutMood = done.filter((a) => a.doneWithoutMood);

  // Lưới 28 ngày gần nhất
  const days: { key: string; label: string; checked: boolean; mood?: number }[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const entry = checkIns.find((c) => c.date === key);
    days.push({
      key,
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      checked: !!entry,
      ...(entry?.mood != null ? { mood: entry.mood } : {}),
    });
  }

  // Xu hướng cảm xúc: các ghi nhận có mood, tối đa 14 lần gần nhất, xếp cũ → mới
  const moodTrend = checkIns
    .filter((c) => c.mood != null)
    .slice(0, 14)
    .reverse();

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="flex items-center gap-2 text-2xl md:text-3xl">
          <Sparkles className="size-6 text-primary" aria-hidden />
          Tiến bộ của mình
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Trang này không chấm điểm và không có “chuỗi ngày bị gãy”. Nó chỉ giữ bằng chứng cho
          những lúc mình quên rằng mình vẫn đang đi.
        </p>
      </header>

      <section className="surface animate-rise p-6">
        <h2 className="text-lg">Bằng chứng mình vẫn đang đi</h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { n: daySet.size, l: "ngày đã ghi nhận" },
            { n: done.length, l: "việc nhỏ đã làm" },
            { n: withoutMood.length, l: "việc làm dù không có mood" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-primary-soft/60 px-3 py-4 text-center">
              <p className="font-display text-3xl">{s.n}</p>
              <p className="mt-1 text-xs leading-tight text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
        {withoutMood.length > 0 && (
          <p className="mt-4 rounded-2xl bg-sage-soft px-4 py-3 text-sm leading-relaxed">
            Có {withoutMood.length} việc mình làm trong lúc hoàn toàn không có mood. Đó là loại
            cố gắng khó nhất — và nó được tính trọn vẹn.
          </p>
        )}
      </section>

      <section className="surface animate-rise p-6">
        <h2 className="text-lg">28 ngày gần nhất</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ô sáng là ngày mình đã quay lại ghi nhận. Ô tối không có nghĩa là mình thất bại — chỉ là
          ngày mình chưa ghé qua.
        </p>
        <div className="mt-4 grid grid-cols-7 gap-1.5" role="list" aria-label="Các ngày đã ghi nhận trong 28 ngày qua">
          {days.map((d) => (
            <div
              key={d.key}
              role="listitem"
              title={`${d.label}${d.checked ? " — đã ghi nhận" : ""}`}
              aria-label={`${d.label}${d.checked ? ", đã ghi nhận" : ", chưa ghi nhận"}`}
              className={`flex aspect-square items-center justify-center rounded-lg text-[10px] ${
                d.checked
                  ? "bg-primary-soft font-medium text-accent-foreground"
                  : "bg-secondary/60 text-muted-foreground/60"
              }`}
            >
              {d.label.split("/")[0]}
            </div>
          ))}
        </div>
      </section>

      <section className="surface animate-rise p-6">
        <h2 className="text-lg">Nhịp cảm xúc gần đây</h2>
        {moodTrend.length < 2 ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Cần thêm vài ghi nhận có chấm cảm xúc để thấy nhịp. Không vội — con số chỉ để quan sát,
            không để kết luận gì về mình.
          </p>
        ) : (
          <>
            <div className="mt-4 flex h-32 items-end gap-1.5" role="img" aria-label="Biểu đồ cột mức cảm xúc các lần ghi nhận gần nhất">
              {moodTrend.map((c) => (
                <div key={c.id} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-primary/70"
                    style={{ height: `${((c.mood ?? 1) / 5) * 100}%` }}
                    title={`${MOOD_LABELS[(c.mood ?? 1) - 1]}`}
                  />
                  <span className="text-[9px] text-muted-foreground">
                    {c.date.slice(8)}/{c.date.slice(5, 7)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{MOOD_LABELS[0]}</span>
              <span>{MOOD_LABELS[4]}</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Cảm xúc lên xuống là chuyện bình thường của con người, không phải dấu hiệu mình làm
              sai.
            </p>
          </>
        )}
      </section>

      {prefs.goodEnoughDay && (
        <section className="animate-rise rounded-3xl border border-border bg-secondary/50 p-6">
          <h2 className="text-lg">Một ngày “đủ ổn” của mình là</h2>
          <p className="mt-2 font-display text-lg leading-relaxed">“{prefs.goodEnoughDay}”</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Đây là thước đo của mình — không phải thước đo của ai khác.{" "}
            <Link to="/thiet-lap" className="text-primary underline-offset-4 hover:underline">
              Chỉnh lại trong Thiết lập
            </Link>
            .
          </p>
        </section>
      )}

      {checkIns.length === 0 && (
        <p className="animate-rise text-sm text-muted-foreground">
          Chưa có dữ liệu thật nào (các con số trên chưa tính ví dụ mẫu). Bắt đầu từ{" "}
          <Link to="/" className="text-primary underline-offset-4 hover:underline">
            trang Hôm nay
          </Link>{" "}
          khi mình sẵn sàng.
        </p>
      )}

      {ENERGY_LABELS.length === 0 && null}
    </div>
  );
}
