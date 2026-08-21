import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ---------------------------------- types --------------------------------- */

export type TriggerKey =
  | "cong-viec"
  | "lan-da"
  | "so-sanh"
  | "tien-tuong-lai"
  | "hoc-tap"
  | "co-don"
  | "khac";

export const TRIGGERS: { key: TriggerKey; label: string }[] = [
  { key: "cong-viec", label: "Công việc / chuyện xin việc" },
  { key: "lan-da", label: "Làn da & ngoại hình" },
  { key: "so-sanh", label: "So sánh với người khác" },
  { key: "tien-tuong-lai", label: "Tiền & tương lai" },
  { key: "hoc-tap", label: "Áp lực học tiếng Trung" },
  { key: "co-don", label: "Cảm giác một mình" },
  { key: "khac", label: "Điều khác" },
];

export const MOOD_LABELS = [
  "Rất nặng nề",
  "Buồn, hơi trống",
  "Bình bình",
  "Nhẹ nhàng hơn",
  "Khá ổn",
];

export const ENERGY_LABELS = [
  "Cạn kiệt",
  "Rất thấp",
  "Đủ để làm việc nhỏ",
  "Tương đối ổn",
  "Nhiều năng lượng",
];

export type AreaKey = "cong-viec" | "tieng-trung" | "lan-da" | "cuoc-song";

export const AREAS: { key: AreaKey; label: string; note: string }[] = [
  {
    key: "cong-viec",
    label: "Công việc",
    note: "Tính bằng việc mình đã làm, không tính bằng việc đã được nhận hay chưa.",
  },
  {
    key: "tieng-trung",
    label: "Tiếng Trung",
    note: "Học 10 phút vẫn là học. Không cần ngày nào cũng giỏi hơn ngày trước.",
  },
  {
    key: "lan-da",
    label: "Làn da & chăm sóc bản thân",
    note: "Ghi lại cách mình đối xử với mình, không đánh giá da đẹp hay xấu.",
  },
  {
    key: "cuoc-song",
    label: "Cuộc sống của mình",
    note: "Những điều làm ngày hôm nay dễ thở hơn một chút.",
  },
];

export type CheckIn = {
  id: string;
  date: string; // yyyy-mm-dd
  createdAt: string;
  mood?: number | undefined; // 1..5 — optional, never fabricated
  energy?: number | undefined; // 1..5 — optional, never fabricated
  fact?: string | undefined; // sự thật quan sát được (rescue flow)
  fear?: string | undefined; // nỗi sợ (rescue flow)
  expect?: string | undefined; // kỳ vọng tự đặt (rescue flow)
  trigger?: TriggerKey | undefined;
  thought?: string | undefined;
  helped?: string | undefined;
  forMyself?: string | undefined;
  eveningNote?: string | undefined;
  sample?: boolean | undefined;
};

export type TinyAction = {
  id: string;
  title: string;
  area?: AreaKey | undefined;
  date: string;
  done: boolean;
  doneWithoutMood?: boolean | undefined;
  sample?: boolean | undefined;
};

export type Goal = {
  id: string;
  area: AreaKey;
  direction90: string;
  monthFocus: string;
  weeklyActions: string[];
  outOfControl: string[];
  sample?: boolean | undefined;
};

export type Reminder = { id: string; text: string; sample?: boolean | undefined };

export type Prefs = {
  onboarded: boolean;
  name: string;
  beforeDrop: string;
  usualThoughts: string;
  supportThatHelps: string;
  supportThatAnnoys: string;
  goodEnoughDay: string;
  priorities: AreaKey[];
  checkInFrequency: "moi-ngay" | "vai-lan-tuan" | "khi-can";
  tone: "nhe-nhang" | "truc-tiep";
};

export type State = {
  version: number;
  prefs: Prefs;
  checkIns: CheckIn[];
  actions: TinyAction[];
  goals: Goal[];
  reminders: Reminder[];
};

/* --------------------------------- helpers -------------------------------- */

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export const formatDate = (key: string) => {
  const [y, m, d] = key.split("-");
  return `${d}/${m}/${y}`;
};

const defaultPrefs: Prefs = {
  onboarded: false,
  name: "",
  beforeDrop: "",
  usualThoughts: "",
  supportThatHelps: "",
  supportThatAnnoys: "",
  goodEnoughDay: "",
  priorities: ["cong-viec", "tieng-trung", "lan-da"],
  checkInFrequency: "moi-ngay",
  tone: "nhe-nhang",
};

const SCHEMA_VERSION = 1;

const seedState = (): State => ({
  version: SCHEMA_VERSION,
  prefs: defaultPrefs,
  checkIns: [
    {
      id: uid(),
      date: todayKey(),
      createdAt: new Date().toISOString(),
      mood: 3,
      energy: 3,
      trigger: "cong-viec",
      thought: "Mình sợ mình đang chậm hơn mọi người.",
      helped: "Đi ra ngoài 10 phút.",
      forMyself: "Uống nước đủ và không mở điện thoại lúc vừa dậy.",
      sample: true,
    },
  ],
  actions: [
    { id: uid(), title: "Uống một ly nước", date: todayKey(), done: false, sample: true },
    {
      id: uid(),
      title: "Học 10 phút tiếng Trung (chỉ nghe cũng được)",
      area: "tieng-trung",
      date: todayKey(),
      done: false,
      sample: true,
    },
    {
      id: uid(),
      title: "Rửa mặt nhẹ nhàng, không soi gương quá 1 phút",
      area: "lan-da",
      date: todayKey(),
      done: false,
      sample: true,
    },
  ],
  goals: [
    {
      id: uid(),
      area: "cong-viec",
      direction90: "Có một công việc gần nhà mà mình thấy làm được.",
      monthFocus: "Chuẩn bị CV và nộp đều đặn, không cần hoàn hảo.",
      weeklyActions: ["Nộp 3 đơn mỗi tuần", "Sửa CV 20 phút", "Tập nói giới thiệu 5 phút"],
      outOfControl: ["Nhà tuyển dụng có phản hồi hay không", "Thời điểm được nhận"],
      sample: true,
    },
    {
      id: uid(),
      area: "lan-da",
      direction90: "Đối xử với da bằng sự kiên nhẫn thay vì sốt ruột.",
      monthFocus: "Giữ một routine đơn giản, làm được cả những ngày mệt.",
      weeklyActions: ["Rửa mặt dịu nhẹ mỗi tối", "Ngủ trước 23h30 4 tối/tuần"],
      outOfControl: ["Da lành nhanh hay chậm", "Cách người khác nhìn mình"],
      sample: true,
    },
  ],
  reminders: [
    {
      id: uid(),
      text: "Mình đang ở một giai đoạn, không phải một kết luận về giá trị của mình.",
      sample: true,
    },
    {
      id: uid(),
      text: "Chưa có việc không có nghĩa là mình không có khả năng. Nó nghĩa là mình đang trong quá trình.",
      sample: true,
    },
    {
      id: uid(),
      text: "Hôm nay mình chỉ cần làm một việc nhỏ. Nghỉ cũng được tính.",
      sample: true,
    },
    {
      id: uid(),
      text: "Da mình đang được chăm, không phải đang bị chấm điểm.",
      sample: true,
    },
  ],
});

const KEY = "hom-nay-cua-minh.v1";

/* --------------------------------- context -------------------------------- */

type Ctx = {
  state: State;
  hydrated: boolean;
  setPrefs: (p: Partial<Prefs>) => void;
  addCheckIn: (c: Omit<CheckIn, "id" | "createdAt">) => void;
  updateCheckIn: (id: string, patch: Partial<CheckIn>) => void;
  removeCheckIn: (id: string) => void;
  addAction: (a: Omit<TinyAction, "id">) => void;
  updateAction: (id: string, patch: Partial<TinyAction>) => void;
  removeAction: (id: string) => void;
  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  addReminder: (text: string) => void;
  updateReminder: (id: string, text: string) => void;
  removeReminder: (id: string) => void;
  clearSamples: () => void;
  resetAll: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => seedState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>;
        if (parsed.version === SCHEMA_VERSION) {
          setState({ ...seedState(), ...parsed, prefs: { ...defaultPrefs, ...parsed.prefs } });
        }
        // unknown schema version: keep seed state rather than guessing at the shape
      }
    } catch {
      /* ignore corrupt data */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked */
    }
  }, [state, hydrated]);

  const value = useMemo<Ctx>(() => {
    const patch = (fn: (s: State) => State) => setState((s) => fn(s));
    return {
      state,
      hydrated,
      setPrefs: (p) => patch((s) => ({ ...s, prefs: { ...s.prefs, ...p } })),
      addCheckIn: (c) =>
        patch((s) => ({
          ...s,
          checkIns: [{ ...c, id: uid(), createdAt: new Date().toISOString() }, ...s.checkIns],
        })),
      updateCheckIn: (id, p) =>
        patch((s) => ({
          ...s,
          checkIns: s.checkIns.map((c) => (c.id === id ? { ...c, ...p, sample: false } : c)),
        })),
      removeCheckIn: (id) =>
        patch((s) => ({ ...s, checkIns: s.checkIns.filter((c) => c.id !== id) })),
      addAction: (a) => patch((s) => ({ ...s, actions: [...s.actions, { ...a, id: uid() }] })),
      updateAction: (id, p) =>
        patch((s) => ({
          ...s,
          actions: s.actions.map((a) => (a.id === id ? { ...a, ...p } : a)),
        })),
      removeAction: (id) => patch((s) => ({ ...s, actions: s.actions.filter((a) => a.id !== id) })),
      addGoal: (g) => patch((s) => ({ ...s, goals: [...s.goals, { ...g, id: uid() }] })),
      updateGoal: (id, p) =>
        patch((s) => ({
          ...s,
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...p, sample: false } : g)),
        })),
      removeGoal: (id) => patch((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) })),
      addReminder: (text) =>
        patch((s) => ({ ...s, reminders: [{ id: uid(), text }, ...s.reminders] })),
      updateReminder: (id, text) =>
        patch((s) => ({
          ...s,
          reminders: s.reminders.map((r) => (r.id === id ? { ...r, text, sample: false } : r)),
        })),
      removeReminder: (id) =>
        patch((s) => ({ ...s, reminders: s.reminders.filter((r) => r.id !== id) })),
      clearSamples: () =>
        patch((s) => ({
          ...s,
          checkIns: s.checkIns.filter((c) => !c.sample),
          actions: s.actions.filter((a) => !a.sample),
          goals: s.goals.filter((g) => !g.sample),
          reminders: s.reminders.filter((r) => !r.sample),
        })),
      resetAll: () => setState({ ...seedState(), prefs: { ...defaultPrefs, onboarded: false } }),
    };
  }, [state, hydrated]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function useToday() {
  const { state } = useStore();
  const key = todayKey();
  const todayCheckIns = state.checkIns.filter((c) => c.date === key);
  const latest = todayCheckIns[0];
  const todayActions = state.actions.filter((a) => a.date === key);
  return {
    key,
    latest,
    todayCheckIns,
    todayActions,
    lowEnergy: latest?.energy != null && latest.energy <= 2,
  };
}

export function useStreakEvidence() {
  const { state } = useStore();
  return useCallback(() => {
    const doneActions = state.actions.filter((a) => a.done);
    const withoutMood = state.actions.filter((a) => a.done && a.doneWithoutMood);
    const days = new Set(state.checkIns.map((c) => c.date));
    return {
      doneCount: doneActions.length,
      withoutMoodCount: withoutMood.length,
      dayCount: days.size,
    };
  }, [state])();
}
