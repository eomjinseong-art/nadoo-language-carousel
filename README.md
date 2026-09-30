# 나두랭귀지 캐러셀

> **나두 · 나의 모든 일상을 AI와 함께** — AI 튜터와 매일 배우는 외국어를 카드뉴스로.

Live: https://nadoo-language-carousel.vercel.app

[나두Ai 캐러셀](https://nadoo-carousel.vercel.app)과 같은 레이아웃·카드·뷰어·SEO 구조를 쓰고, 상단 탭으로 언어를 고릅니다:
English (`/lang/en`) · 日本語 (`/lang/ja`) · Español (`/lang/es`) · Italiano (`/lang/it`) · Русский (`/lang/ru`).

## 구조

- `content/carousels/<slug>/` — 캐러셀 하나 = 폴더 하나 (`post.json`, `slide-XX.png/webp`, `caption.txt`, `sources.md`, `spec.json`)
  - `post.json`의 `language`(en/ja/es/it/ru)로 탭이 나뉘고, `note_id`로 원본 학습 노트와 1:1 연결됩니다.
- `scripts/sync-notes.mjs` — 학습 사이트 API(`/api/v1/notes`, `/api/v1/items?include=all`)에서 아직 캐러셀이 없는 노트를 찾아
  OpenAI로 9장 구성(표지 → 오늘의 포인트 → 표현 4장 → 교정 노트 → 3줄 요약 → 저장·복습)을 만들고, 헤드리스 Chrome으로
  나두Ai 캐러셀과 같은 스타일의 1080×1350 슬라이드를 렌더링합니다.
- `scripts/lib/anonymity.mjs` — 엄격한 익명성 게이트. 원본 노트를 모델에 보내기 전에 이름·가족 호칭을 지우고,
  결과물에 금지 패턴이 남으면 아무것도 쓰지 않고 실패합니다.
- `scripts/check-anonymity.mjs` — `content/`, `app/`, `components/`, `lib/` 전체를 다시 검사 (`npm run check-anon`).
- 하단 쿠팡 파트너스 배너: `components/CoupangBanner.tsx` (푸터, `rel="sponsored"`, 공시 문구 포함).

## 새 캐러셀 만들기 (일일 루틴용, 멱등)

```bash
cd /workspace/hub/nadoo-language-carousel && ./scripts/daily-sync.sh
```

- 새 노트가 없으면 아무것도 바꾸지 않고 `No new carousels. Done.`으로 끝납니다. 여러 번 돌려도 안전합니다.
- 새 노트가 있으면: 캐러셀 생성 → 익명성 검사 → 브랜치 → `gh pr create --fill --base main` → `gh pr merge --squash --delete-branch`.
  Vercel이 `main`을 자동 배포합니다.
- 생성만 하고 커밋은 직접 하려면: `node scripts/sync-notes.mjs` (옵션: `--lang=en,ja`, `--date=YYYY-MM-DD`,
  `--refresh` 노트가 나중에 수정됐으면 다시 생성, `--force` 강제 재생성, `--dry-run`).

필요한 값 (환경 변수 또는 박스의 `/home/box/agent-data/box-secrets.json`):
`LANGSTUDY_API_KEY`, `LANGSTUDY_BASE_URL` (`langstudy`), `LCAR_OPENAI_API_KEY` (`card.OPENAI_API_KEY_FIXED`), 선택 `OPENAI_MODEL` (기본 `gpt-5.4`).
Chrome 경로는 `CHROME_BIN` (기본 `google-chrome`), 폰트는 Pretendard + Noto Sans CJK.

## 개발

```bash
npm ci
npm run dev      # optimize-images 후 next dev
npm run build    # prebuild가 content 슬라이드를 public/carousels로 최적화
```
