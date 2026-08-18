import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ComparisonReset() {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState("");
  const [missing, setMissing] = useState("");
  const [step, setStep] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setStep(0);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          Vừa so sánh với người khác
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đặt lại sau một lần so sánh</DialogTitle>
        </DialogHeader>
        {step === 0 && (
          <div className="animate-rise space-y-4">
            <label className="block space-y-1.5 text-sm font-medium">
              Mình vừa nhìn thấy điều gì?
              <Textarea
                rows={2}
                value={seen}
                onChange={(e) => setSeen(e.target.value)}
                placeholder="Ví dụ: bạn cũ đăng ảnh đi làm ở công ty lớn."
              />
            </label>
            <label className="block space-y-1.5 text-sm font-medium">
              Nó làm mình sợ rằng mình đang thiếu điều gì?
              <Textarea
                rows={2}
                value={missing}
                onChange={(e) => setMissing(e.target.value)}
              />
            </label>
            <Button onClick={() => setStep(1)} className="w-full">
              Tiếp tục
            </Button>
          </div>
        )}
        {step === 1 && (
          <div className="animate-rise space-y-3 text-sm leading-relaxed">
            <p className="rounded-2xl bg-secondary/70 px-4 py-3">
              Mình vừa so một <strong>khoảnh khắc đã được chọn lọc</strong> của người khác với{" "}
              <strong>toàn bộ đời sống bên trong</strong> của mình. Hai thứ đó không cùng đơn vị đo.
            </p>
            <p className="rounded-2xl bg-sage-soft px-4 py-3">
              Điều mình không thấy: những tháng họ chờ đợi, những lần bị từ chối, những ngày họ cũng
              không muốn ra khỏi giường.
            </p>
            <p className="rounded-2xl bg-primary-soft/60 px-4 py-3">
              Câu hỏi hữu ích hơn: <em>hôm nay mình có thể làm một việc nhỏ nào cho hướng đi của
              mình?</em> Đó là phần duy nhất thuộc về mình.
            </p>
            <Button className="w-full" onClick={() => setOpen(false)}>
              Mình quay lại việc của mình
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
