# 나두랭귀지 캐러셀

> **나두 · 나의 모든 일상을 AI와 함께** — AI 튜터와 매일 배우는 외국어를 카드뉴스로.

Live: https://nadoo-language-carousel.vercel.app

[나두Ai 캐러셀](https://nadoo-carousel.vercel.app)과 같은 레이아웃·카드·뷰어·SEO 구조를 쓰고, 상단 탭으로 언어를 고릅니다:
English (`/lang/en`) · 日本語 (`/lang/ja`) · Español (`/lang/es`) · Italiano (`/lang/it`) · Русский (`/lang/ru`) · Français (`/lang/fr`).

## 구조

- `content/carousels/<slug>/` — 캐러셀 하나 = 폴더 하나 (`post.json`, `slide-XX.png/webp`, `caption.txt`, `sources.md`, `spec.json`)
  - `post.json`의 `language`(en/ja/es/it/ru/fr)로 탭이 나뉘고, `note_id`로 원본 학습 노트와 1:1 연결됩니다.
- `scripts/sync-notes.mjs` — 학습 사이트 API(`/api/v1/notes`, `/api/v1/items?include=all`)에서 아직 캐러셀이 없는 노트를 찾아
  루틴을 실행하는 어시스턴트가 채운 JSON으로 9장 구성(표지 → 오늘의 포인트 → 표현 4장 → 교정 노트 → 3줄 요약 → 저장·복습)을 만들고, 헤드리스 Chrome으로
  1080×1350 슬라이드를 렌더링합니다.
- `scripts/lib/slides.mjs` — 슬라이드 디자인 (밝은 배경 + 언어별 포인트 색: en 파랑, ja 벚꽃 핑크, es 오렌지, it 초록, ru 보라, fr 틸;
  학습 사이트와 같은 팔레트). 디자인만 바꿨다면 `npm run render-slides` (내용은 `spec.json` 그대로, API 호출 없음).
- `scripts/lib/anonymity.mjs` — 엄격한 익명성 게이트. 대기 파일에 쓰기 전에 이름·가족 호칭을 지우고,
  결과물에 금지 패턴이 남으면 아무것도 쓰지 않고 실패합니다.
- `scripts/check-anonymity.mjs` — `content/`, `app/`, `components/`, `lib/` 전체를 다시 검사 (`npm run check-anon`).
- 하단 쿠팡 파트너스 배너: `components/CoupangBanner.tsx` (푸터, `rel="sponsored"`, 공시 문구 포함).

## 새 캐러셀 만들기 (일일 루틴용, 멱등)

유료 API 호출 없이 2단계로 돌립니다.

```bash
cd /workspace/hub/nadoo-language-carousel && ./scripts/daily-sync.sh prepare   # PENDING=<파일> 출력
# 어시스턴트가 /workspace/shared/nadoo-language-carousel/pending-carousels.json 의
# items[].carousel 을 instructions + schema 대로 채움 (만들지 않을 항목은 null)
cd /workspace/hub/nadoo-language-carousel && ./scripts/daily-sync.sh finish    # 검증·렌더·익명성 검사·PR/merge
```

- 새 노트가 없으면 대기 파일이 0건이고 `finish`는 `No new carousels. Done.`으로 끝납니다. 여러 번 돌려도 안전합니다.
- `finish`: 스키마·익명성 검증 → 렌더링 → `check-anonymity` → 브랜치 → `gh pr create --fill --base main` →
  `gh pr merge --squash --delete-branch`. 검증 실패 항목이 있으면 아무것도 커밋하지 않고 실패하니 파일을 고쳐 다시 실행합니다.
- 직접 실행: `node scripts/sync-notes.mjs --prepare [--out=FILE] [--lang=en,ja] [--date=YYYY-MM-DD] [--refresh] [--force] [--dry-run]`,
  `node scripts/sync-notes.mjs --apply=FILE`.

필요한 값 (환경 변수 또는 박스의 `/home/box/agent-data/box-secrets.json`): `LANGSTUDY_API_KEY`, `LANGSTUDY_BASE_URL` (`langstudy`).
Chrome 경로는 `CHROME_BIN` (기본 `google-chrome`), 폰트는 Pretendard + Noto Sans CJK.

## 개발

```bash
npm ci
npm run dev      # optimize-images 후 next dev
npm run build    # prebuild가 content 슬라이드를 public/carousels로 최적화
```
