import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { MessageCircleHeart, Pencil, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/tu-noi-voi-minh")({
  head: () => ({
    meta: [
      { title: "Tự nói với mình — Hôm nay của mình" },
      {
        name: "description",
        content:
          "Thư viện những câu mình cần nghe vào ngày tụt mood — do chính mình viết, theo cách mình thấy dễ chịu.",
      },
      { property: "og:title", content: "Tự nói với mình — Hôm nay của mình" },
      {
        property: "og:description",
        content: "Những câu nói dịu dàng do chính mình viết cho mình.",
      },
    ],
  }),
  component: SelfTalkPage,
});

const PROMPTS = [
  "Mình cần nghe điều gì vào lúc thấy mình chậm hơn mọi người?",
  "Câu nào giúp mình bớt soi gương và tự trách làn da?",
  "Mình muốn được nhắc điều gì khi sợ tương lai?",
  "Nếu một người bạn thân đang ở hoàn cảnh của mình, mình sẽ nói gì với họ?",
];

function SelfTalkPage() {
  const { state, addReminder, updateReminder, removeReminder } = useStore();
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [promptIdx, setPromptIdx] = useState(0);

  const { prefs, reminders } = state;

  const add = () => {
    if (!text.trim()) return;
    addReminder(text.trim());
    setText("");
    toast.success("Đã thêm một câu cho riêng mình.");
  };

  const saveEdit = () => {
    if (!editingId || !editText.trim()) return;
    updateReminder(editingId, editText.trim());
    setEditingId(null);
    setEditText("");
    toast.success("Đã cập nhật.");
  };

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="flex items-center gap-2 text-2xl md:text-3xl">
          <MessageCircleHeart className="size-6 text-primary" aria-hidden />
          Tự nói với mình
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Vào ngày tụt mood, não mình thường chỉ nhớ những câu tự trách. Trang này giữ sẵn những
          câu khác — do chính mình viết lúc tỉnh táo — để lúc cần chỉ việc mở ra đọc.
        </p>
      </header>

      {prefs.supportThatHelps && (
        <section className="animate-rise rounded-3xl border border-sage/40 bg-sage-soft p-5">
          <h2 className="text-sm font-semibold">Kiểu hỗ trợ mình từng nói là dễ chịu</h2>
          <p className="mt-1.5 text-sm leading-relaxed">“{prefs.supportThatHelps}”</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Những câu mình viết nên theo hướng này.{" "}
            <Link to="/thiet-lap" className="text-primary underline-offset-2 hover:underline">
              Sửa trong Thiết lập
            </Link>
          </p>
        </section>
      )}

      <section className="surface animate-rise space-y-3 p-6">
        <h2 className="text-lg">Viết một câu mới</h2>
        <button
          type="button"
          onClick={() => setPromptIdx((i) => (i + 1) % PROMPTS.length)}
          className="rounded-2xl bg-secondary/70 px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary"
        >
          Gợi ý: {PROMPTS[promptIdx]}
        </button>
        <Textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Viết như mình đang nói với một người bạn thân đang mệt."
          aria-label="Câu mới tự nói với mình"
        />
        <div className="flex items-center gap-3">
          <Button onClick={add} disabled={!text.trim()}>
            <Plus className="mr-1 size-4" aria-hidden />
            Giữ câu này lại
          </Button>
          <span className="text-xs text-muted-foreground">
            Không cần hay ho — câu thật lòng luôn tốt hơn câu đúng.
          </span>
        </div>
      </section>

      <ul className="space-y-3">
        {reminders.map((r) => (
          <li key={r.id} className="surface animate-rise p-5">
            {editingId === r.id ? (
              <div className="space-y-3">
                <Textarea
                  rows={2}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  aria-label="Chỉnh sửa câu"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEdit} disabled={!editText.trim()}>
                    Lưu
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    Huỷ
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <p className="flex-1 font-display text-base leading-relaxed">
                  “{r.text}”
                  {r.sample && (
                    <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 align-middle font-sans text-xs text-muted-foreground">
                      Ví dụ mẫu
                    </span>
                  )}
                </p>
                <span className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(r.id);
                      setEditText(r.text);
                    }}
                    aria-label="Chỉnh sửa câu này"
                    className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
                  >
                    <Pencil className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmDeleteId === r.id) {
                        removeReminder(r.id);
                        setConfirmDeleteId(null);
                        toast("Đã xoá câu này.");
                      } else {
                        setConfirmDeleteId(r.id);
                      }
                    }}
                    onBlur={() => setConfirmDeleteId((id) => (id === r.id ? null : id))}
                    aria-label={
                      confirmDeleteId === r.id ? "Bấm lần nữa để xác nhận xoá" : "Xoá câu này"
                    }
                    className={
                      confirmDeleteId === r.id
                        ? "rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive"
                        : "rounded-full p-2 text-muted-foreground hover:bg-secondary"
                    }
                  >
                    {confirmDeleteId === r.id ? (
                      "Xác nhận xoá"
                    ) : (
                      <Trash2 className="size-4" aria-hidden />
                    )}
                  </button>
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>

      {reminders.length === 0 && (
        <p className="animate-rise text-sm text-muted-foreground">
          Chưa có câu nào. Bắt đầu bằng một câu mình ước có người nói với mình hôm nay.
        </p>
      )}
    </div>
  );
}
