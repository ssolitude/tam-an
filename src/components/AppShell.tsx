import { createContext, useContext, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookHeart,
  Compass,
  LifeBuoy,
  MessageCircleHeart,
  Sparkles,
  Sun,
} from "lucide-react";
import { RescueFlow } from "@/components/RescueFlow";
import { Onboarding } from "@/components/Onboarding";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RescueContext = createContext<{ openRescue: () => void }>({ openRescue: () => {} });
export const useRescue = () => useContext(RescueContext);

const NAV = [
  { to: "/", label: "Hôm nay", icon: Sun },
  { to: "/nhat-ky", label: "Nhật ký", icon: BookHeart },
  { to: "/tien-bo", label: "Tiến bộ", icon: Sparkles },
  { to: "/muc-tieu", label: "Mục tiêu", icon: Compass },
  { to: "/tu-noi-voi-minh", label: "Tự nói với mình", icon: MessageCircleHeart },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [rescueOpen, setRescueOpen] = useState(false);

  return (
    <RescueContext.Provider value={{ openRescue: () => setRescueOpen(true) }}>
      <div className="warm-veil min-h-screen">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
            <Link to="/" className="mr-auto flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-primary-soft">
                <Sun className="size-4 text-primary" aria-hidden />
              </span>
              <span className="font-display text-base font-semibold">Hôm nay của mình</span>
            </Link>
            <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 md:flex">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  activeOptions={{ exact: n.to === "/" }}
                  className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-primary-soft data-[status=active]:font-medium data-[status=active]:text-accent-foreground"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to="/thiet-lap"
                className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-primary-soft data-[status=active]:text-accent-foreground"
              >
                Thiết lập
              </Link>
            </nav>
            <Button
              size="sm"
              onClick={() => setRescueOpen(true)}
              className="rounded-full"
              aria-haspopup="dialog"
            >
              <LifeBuoy className="mr-1 size-4" aria-hidden />
              Tụt mood
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 pb-32 pt-6 md:pb-16">{children}</main>

        <footer className="mx-auto max-w-5xl px-4 pb-28 md:pb-10">
          <p className="rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            Đây là công cụ tự soi chiếu và đồng hành hằng ngày, <strong>không</strong> phải ứng dụng y
            tế hay tâm lý, không chẩn đoán và không điều trị. Nếu mình đang cảm thấy không an toàn
            hoặc có ý định làm hại bản thân, hãy nói với một người mình tin cậy, gọi 115, hoặc đường
            dây Ngày Mai 096 306 1414. Dữ liệu chỉ được lưu trong trình duyệt của mình.
          </p>
        </footer>

        <nav
          aria-label="Điều hướng dưới"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden"
        >
          <div className="mx-auto flex max-w-lg">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[11px] text-muted-foreground",
                  "data-[status=active]:font-medium data-[status=active]:text-primary",
                )}
              >
                <n.icon className="size-5" aria-hidden />
                <span className="text-center leading-tight">{n.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <RescueFlow open={rescueOpen} onOpenChange={setRescueOpen} />
        <Onboarding />
      </div>
    </RescueContext.Provider>
  );
}
