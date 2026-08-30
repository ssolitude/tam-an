# **Tâm An**

Act as a senior BA + product designer + frontend engineer. Build an MVP web app for a young woman who often loses energy/mood and feels sad when her current life is far from her aspirations. Current context: she does not have a job yet, is learning Chinese with the hope of finding work near home, and skin health is her biggest insecurity/weakness. The app is NOT a therapy/medical app; it is a gentle self-support and daily grounding companion. It should help her separate 'my current situation' from 'my worth', reduce all-or-nothing thinking, regain energy through tiny actions, maintain momentum on job search/Chinese learning/self-care, and track patterns without judgment.

BA assumptions and product principles:
1. Primary user: herself; private/personal-first.
2. Core JTBD: 'When I feel behind in life and my mood drops, help me understand what is happening, calm down, choose one doable action, and remember that progress is not the same as immediate results.'
3. Pain points: comparing reality vs ideal self, joblessness uncertainty, pressure to improve quickly, skin insecurity, energy crashes, abandoning herself when she feels low.
4. Desired outcomes: feel accompanied rather than judged; recover from a bad moment faster; maintain small daily progress; build evidence of progress; reduce self-criticism.
5. Do not use toxic positivity, forced gratitude, generic inspirational quotes, productivity guilt, calorie/weight tracking, or skin-before/after framing.
6. Include a clear disclaimer that this is a self-reflection/support tool, not medical or psychological diagnosis/treatment. If the user indicates immediate danger/self-harm, show an appropriate crisis-support prompt without pretending the app is emergency care.

Design a calm, warm, feminine-but-not-childish interface: warm off-white background, muted rose/terracotta accents, soft green secondary accent, dark readable text, rounded cards, generous whitespace, subtle motion. Avoid excessive gradients, gamification, or childish illustrations. Mobile-first and desktop responsive. Vietnamese UI.

Information architecture:
- Home / 'Hôm nay': mood + energy check-in, one grounding prompt, today's tiny actions, progress evidence, quick 'Tôi đang tụt mood' button.
- 'Tôi đang tụt mood': a 3–5 minute rescue flow. Step 1 name the feeling; Step 2 identify what triggered it (career/job, skin/appearance, comparison, money/future, learning pressure, loneliness, other); Step 3 distinguish fact vs fear vs expectation; Step 4 choose a tiny regulation action (drink water, wash face gently, breathe, step outside, lie down without guilt, write 3 lines, listen to music); Step 5 choose one next action under 10 minutes. End with a compassionate but non-saccharine message.
- 'Nhật ký': daily check-ins with mood, energy, trigger, thought, what helped, and one thing she did for herself. Show trends carefully without implying medical meaning.
- 'Tiến bộ': evidence-based progress board across 4 areas: Công việc, Tiếng Trung, Làn da & chăm sóc bản thân, Cuộc sống của mình. Focus on process milestones, not outcomes. Include 'những việc mình đã làm dù không có mood'.
- 'Mục tiêu': convert aspirations into 90-day direction → monthly focus → tiny weekly actions. Explicitly separate controllable actions from uncontrollable outcomes (e.g. getting hired, skin healing speed).
- 'Tự nói với mình': a private library of user-written reminders and reframes, editable. Seed with a few grounded reframes such as 'Mình đang ở một giai đoạn, không phải một kết luận về giá trị của mình.'
- Onboarding / elicitation: ask concise BA discovery questions before personalization: what usually happens right before the mood drops; what thoughts appear; what kind of support helps vs annoys; what makes a day feel 'good enough'; current priorities among job/Chinese/skin/self-care; preferred check-in frequency; whether she wants direct language or gentle language. Store preferences locally for MVP.

Functional requirements:
- No auth required for MVP; use localStorage so personal data stays in browser.
- Full CRUD for check-ins, tiny actions, goals, and personal reminders.
- Mood scale 1–5 and energy 1–5, with labels; no clinical interpretation.
- Rescue flow should be accessible from every page.
- Home should adapt based on current check-in and unfinished tiny actions.
- Include empty states and first-use sample content that can be removed.
- Add an end-of-day reflection, but keep it optional.
- Add a 'minimum viable day' mode: when energy <=2, the app reduces expectations to hydration/food/rest/basic hygiene + one tiny meaningful action, and explicitly says rest counts.
- Add a 'comparison reset' micro-tool for moments when social comparison triggers sadness.
- Add a 'skin day' section that validates insecurity without reinforcing appearance obsession: focus on gentle care and how she wants to treat herself, not judging skin quality.

Please first implement a polished MVP with realistic Vietnamese copy, accessible components, responsive navigation, local persistence, and no backend dependency. Make the home screen emotionally useful within 10 seconds of opening. Include a simple onboarding modal/page that collects the elicitation answers and then personalizes the home screen. Do not ask me to clarify before building; make reasonable assumptions and expose the assumptions in an in-app 'Thiết lập lại cách app hỗ trợ mình' section.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tam-an.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2afbfa75-c86d-486f-aadf-ae77c2f2128f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
