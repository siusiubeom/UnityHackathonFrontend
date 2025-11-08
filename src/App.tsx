import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * NK→SK 농업 적성 추천: React(Typescript) 단일 파일 프론트엔드 (모바일 퍼스트 리디자인)
 * - 기존 기능 동일: 12문항 입력 → POST /recommendations → GET /matches
 * - 색상 팔레트: 연두 #afff46, 아주 연한 연두 #f9fff1, 짙은 녹색 #284100
 * - 상단 고정 스텝바 + 하단 고정 액션바로 모바일 UX 강화
 * - 변경 사항:
 *   1) /matches 출력은 "보고서 스타일" 카드 UI로 표시 (원본 텍스트/JSON은 더 이상 사용자에게 노출하지 않음)
 *   2) 타입 세이프 파서 추가 (any 미사용)
 */

const API_BASE =
    import.meta.env.VITE_API_BASE ||
    "https://unityhackathonbackend.onrender.com";

/* -------------------- 테마 주입 -------------------- */
const injectTheme = () => {
    const id = "nk-sk-theme";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
  :root{
    --green-bright:#afff46;
    --green-pale:#f9fff1;
    --green-deep:#284100;
    --text:#111827;
    --muted:#6b7280;
    --ring:#28410033;
    --danger:#b91c1c;
    --bg:#f8fafc;
    --card:#ffffff;
    --border:#e5e7eb;
    --radius:16px;
    --shadow:0 8px 30px rgba(0,0,0,.06);
    --space-1:6px;
    --space-2:10px;
    --space-3:14px;
    --space-4:18px;
    --space-5:24px;
  }
  @media (prefers-color-scheme: dark){
    :root{
      --text:#e5e7eb;
      --muted:#9ca3af;
      --bg:#0b0f0d;
      --card:#0f1412;
      --border:#1f2937;
      --ring:#afff4626;
      --shadow:0 8px 30px rgba(0,0,0,.35);
    }
  }
  * { box-sizing:border-box; }
  html, body, #root { height:100%; }
  body {
    margin:0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, "Apple SD Gothic Neo", "Malgun Gothic", Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans KR", sans-serif;
    color:var(--text);
    background:var(--bg);
    -webkit-font-smoothing:antialiased;
    -moz-osx-font-smoothing:grayscale;
  }
  .app {
    min-height:100%;
    display:flex;
    flex-direction:column;
  }
  .container {
    width:100%;
    max-width:960px;
    margin:0 auto;
    padding: var(--space-5) var(--space-4) 120px; /* 하단 고정바 높이 확보 */
  }
  @media (min-width: 640px){
    .container{ padding: var(--space-5) 28px 140px; }
  }
  .card{
    background:var(--card);
    border:1px solid var(--border);
    border-radius:var(--radius);
    padding:var(--space-5);
    box-shadow:var(--shadow);
  }
  .title{
    font-weight:900;
    color:var(--green-deep);
    letter-spacing:-0.01em;
    margin:0;
  }
  .subtitle{ color:var(--muted); margin-top:4px; }
  .topbar{
    position:sticky; top:0; z-index:30;
    background:linear-gradient(0deg, transparent, var(--bg) 60%);
    backdrop-filter:saturate(140%) blur(6px);
    padding: 10px var(--space-4) var(--space-2);
    border-bottom:1px solid color-mix(in oklab, var(--border) 60%, transparent);
  }
  .progress{ height:10px; background:#e5e7eb40; border-radius:999px; overflow:hidden; }
  .progress > span{ display:block; height:100%; background:var(--green-bright); box-shadow: inset 0 0 0 1px #00000012; transition:width .25s ease; }
  .row{ display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
  .sp-between{ justify-content:space-between; }
  .btn{
    appearance:none; border:1px solid var(--green-deep); color:var(--green-deep);
    background:#fff; border-radius:14px; padding:12px 16px; font-weight:800; cursor:pointer;
    transition:transform .06s ease, background .2s ease, opacity .2s ease;
    touch-action:manipulation;
  }
  .btn:active{ transform: translateY(1px) scale(.99); }
  .btn[disabled]{ opacity:.5; cursor:not-allowed; }
  .btn.primary{ background:var(--green-deep); color:#fff; border-color:var(--green-deep); }
  .btn.ghost{ border-color:transparent; background:transparent; color:var(--green-deep); }
  .chips{ display:flex; flex-wrap:wrap; gap:10px; }
  .pill{
    display:inline-flex; align-items:center; gap:8px;
    padding:12px 14px; border-radius:14px; border:1px solid var(--border);
    background: color-mix(in oklab, var(--card) 85%, #ffffff 15%);
    cursor:pointer; user-select:none; min-height:44px;
    line-height:1.15; font-weight:700;
    transition: box-shadow .15s ease, border-color .15s ease, transform .06s ease, background .2s ease;
    will-change: transform;
  }
  .pill:hover{ box-shadow:0 2px 10px #00000010; }
  .pill:active{ transform: translateY(1px); }
  .pill[data-active="true"]{
    background: var(--green-pale);
    border-color: var(--green-deep);
    color: var(--green-deep);
    box-shadow: 0 0 0 3px var(--ring);
  }
  .pill .dot{
    width:10px; height:10px; border-radius:999px; border:2px solid currentColor;
    background:transparent; display:inline-block;
  }
  .pill[data-active="true"] .dot{ background: currentColor; }
  .q-label{ font-weight:900; margin: 6px 0 10px; font-size: 16px; }
  .hint{ color:var(--muted); font-size:13px; }
  .err{ color:var(--danger); font-size:13px; }
  .field{
    display:block; width:100%; padding:14px 16px; border-radius:14px; border:1px solid var(--border);
    outline:none; background:var(--card); color:var(--text); font-size:16px;
  }
  .field:focus{ border-color: var(--green-deep); box-shadow: 0 0 0 4px var(--ring); }
  textarea.field{ line-height:1.5; }
  .result{
    background:#0b0f0d; color:#d1fae5; border-radius:12px; padding:16px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; overflow:auto;
  }
  .kbd{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background:#111827; color:#fff; border-radius:6px; padding:2px 6px; }

  /* 하단 고정 액션바 */
  .actionbar{
    position:fixed; left:0; right:0; bottom:0; z-index:40;
    background: color-mix(in oklab, var(--card) 88%, var(--bg) 12%);
    border-top:1px solid var(--border);
    padding: 10px var(--space-4) calc(env(safe-area-inset-bottom) + 12px);
    box-shadow: 0 -8px 30px rgba(0,0,0,.08);
  }
  .actionbar-inner{ max-width:960px; margin:0 auto; display:flex; gap:10px; }

  /* 스켈레톤 */
  .skeleton{
    background: linear-gradient(90deg, #e5e7eb10, #e5e7eb40, #e5e7eb10);
    background-size: 300% 100%;
    animation: shimmer 1.2s ease-in-out infinite;
    border-radius: 10px; height: 14px;
  }
  @keyframes shimmer {
    0%{ background-position: 0% 0; }
    100%{ background-position: 100% 0; }
  }

  /* 보고서 카드 스타일 */
  .report-list{ display:flex; flex-direction:column; gap:16px; }
  .report-card .badge{
    display:inline-block; font-weight:800; padding:6px 10px; border-radius:999px;
    background:var(--green-pale); color:var(--green-deep); border:1px solid var(--green-deep);
  }
  .report-meta{ display:flex; flex-wrap:wrap; gap:8px; margin:8px 0 2px; }
  .report-chip{
    display:inline-flex; gap:6px; align-items:center; padding:8px 10px; border-radius:12px; border:1px solid var(--border);
    background: color-mix(in oklab, var(--card) 90%, #ffffff 10%); font-weight:700;
  }
  .report-section{ margin-top:12px; }
  .report-section h4{ margin:0 0 6px; font-size:16px; color:var(--green-deep); }
  .report-section ul{ margin:0; padding-left:18px; }
  .report-section li{ margin:4px 0; }
  .small-muted{ color:var(--muted); font-size:12px; }

  /* 모션 최소화 */
  @media (prefers-reduced-motion: reduce){
    .btn, .pill, .progress > span { transition: none !important; }
  }
  `;
    document.head.appendChild(style);
};

/* -------------------- 타입 -------------------- */

type YesNo = "Y" | "N";

type Answers = {
    q1: YesNo;
    q2: string[];
    q3: number;
    q4: string[];
    q5: string[];
    q6: string[];
    q7: "높음" | "보통" | "낮음";
    q8: string[];
    q9: "바빠도 괜찮다(높음 가능)" | "중간 정도가 좋다" | "낮은 노동 강도 선호";
    q10: string;
    q11: "수도권" | "강원" | "충청" | "전라" | "경상" | "제주" | "상관없음";
    q12:
        | "취업(농장 근로)"
        | "창업(귀농·작물 재배)"
        | "기술직(스마트팜 운영·드론 등)"
        | "안정적인 단순작업"
        | "아직 모르겠다";
    run_model: boolean;
};

type RecommendResponse =
    | { llm_result?: unknown } & Record<string, unknown>
    | Record<string, unknown>;

type MatchItem = {
    분야: string;
    적합_이유: string;
    권장_지역_작목: string[];
    진입경로: string[];
    필요역량_장비_자본: string;
    다음단계: string[];
};

/* -------------------- 상수 -------------------- */
const OPTS = {
    q2: [
        "논농사(쌀)",
        "밭농사(옥수수·콩·감자 등)",
        "과수(사과·배·복숭아 등)",
        "시설채소(온실·비닐하우스)",
        "축산(돼지·소·닭 등)",
        "산림·약초",
        "수산(양식 포함)",
    ],
    q4: [
        "경작/재배",
        "관리감독(분조장·작업반장 등)",
        "기계·설비 운전(트랙터·양수기 등)",
        "가공/선별",
        "축사 관리",
        "기타(직접 입력)",
    ],
    q5: [
        "노지 재배",
        "고랭지 재배",
        "관수(점적/스프링클러) 운용",
        "무경운/보존농업",
        "유기/저투입 농법",
        "수경재배(양액재배)",
        "스마트 농업 요소(센서·자동제어)",
        "축분·퇴비 자원화 경험",
        "기타(직접 입력)",
    ],
    q6: ["야외(논·밭)", "온실/시설", "기계·장비 중심", "동물 돌봄(축산)", "관리/기록/데이터 기반 작업", "상관없음"],
    q7: ["높음", "보통", "낮음"],
    q8: ["스마트팜", "과수원", "채소·특용작물", "축산", "도시농업", "농산물 가공", "농기계·드론 기술", "기타(직접 입력)"],
    q9: ["바빠도 괜찮다(높음 가능)", "중간 정도가 좋다", "낮은 노동 강도 선호"],
    q11: ["수도권", "강원", "충청", "전라", "경상", "제주", "상관없음"],
    q12: ["취업(농장 근로)", "창업(귀농·작물 재배)", "기술직(스마트팜 운영·드론 등)", "안정적인 단순작업", "아직 모르겠다"],
} as const;

/* -------------------- 유틸 -------------------- */
const required = (v: unknown) =>
    v === undefined ? false : typeof v === "string" ? v.trim() !== "" : true;
const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, n));
const toErr = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** 안전한 타입가드 유틸 */
const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null && !Array.isArray(v);

const isStringArray = (v: unknown): v is string[] =>
    Array.isArray(v) && v.every((x) => typeof x === "string");

const isMatchItem = (v: unknown): v is MatchItem => {
    if (!isRecord(v)) return false;
    return (
        typeof v["분야"] === "string" &&
        typeof v["적합_이유"] === "string" &&
        isStringArray(v["권장_지역_작목"]) &&
        isStringArray(v["진입경로"]) &&
        typeof v["필요역량_장비_자본"] === "string" &&
        isStringArray(v["다음단계"])
    );
};

const isMatchArray = (v: unknown): v is MatchItem[] =>
    Array.isArray(v) && v.every(isMatchItem);

/** ✅ /matches 응답 파서 (any 미사용) */
function parseMatches(raw: string): MatchItem[] {
    try {
        const j = JSON.parse(raw) as unknown;

        // 1) 응답이 바로 배열
        if (isMatchArray(j)) return j;

        // 2) { matches: [...] }
        if (isRecord(j)) {
            const maybe = j["matches"];
            if (isMatchArray(maybe)) return maybe;
        }
    } catch {
        // noop - 아래 fallback으로 이동
    }

    // 3) fallback: 줄단위 텍스트에서 JSON 덩어리만 추출 시도 (강건성 확보)
    //    예: 서버가 불필요한 로그와 함께 JSON을 섞어 보낸 경우
    const firstBracket = raw.indexOf("[");
    const lastBracket = raw.lastIndexOf("]");
    if (firstBracket >= 0 && lastBracket > firstBracket) {
        try {
            const sliced = raw.slice(firstBracket, lastBracket + 1);
            const j2 = JSON.parse(sliced) as unknown;
            if (isMatchArray(j2)) return j2;
        } catch {
            // ignore
        }
    }

    return [];
}

/* -------------------- API -------------------- */
async function postRecommendations(payload: Answers): Promise<RecommendResponse> {
    const res = await fetch(`${API_BASE}/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`POST /recommendations failed: ${res.status}`);
    return res.json();
}
async function getMatches(): Promise<string> {
    const res = await fetch(`${API_BASE}/matches`);
    if (!res.ok) throw new Error(`GET /matches failed: ${res.status}`);
    return res.text();
}

/* -------------------- 공용 컴포넌트 -------------------- */

const Pill: React.FC<{
    active?: boolean;
    label: string;
    onClick?: () => void;
    roleType?: "radio" | "checkbox";
    ariaChecked?: boolean;
}> = ({ active, label, onClick, roleType = "checkbox", ariaChecked }) => (
    <button
        type="button"
        className="pill"
        data-active={active}
        onClick={onClick}
        role={roleType}
        aria-checked={ariaChecked ?? active}
    >
        <span className="dot" aria-hidden />
        <span>{label}</span>
    </button>
);

const StepNav: React.FC<{
    idx: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
    canNext: boolean;
}> = ({ idx, total, onPrev, onNext, canNext }) => {
    const pct = Math.round(((idx + 1) / total) * 100);
    return (
        <div className="topbar">
            <div className="container" style={{ padding: 0 }}>
                <div className="row sp-between" style={{ marginBottom: 10 }}>
                    <div className="row" style={{ gap: 8 }}>
                        <strong>
                            단계 {idx + 1} / {total}
                        </strong>
                        <span className="hint">진행률 {pct}%</span>
                    </div>
                    <div className="row">
                        <button
                            className="btn ghost"
                            onClick={onPrev}
                            disabled={idx === 0}
                            aria-label="이전 단계"
                        >
                            ← 이전
                        </button>
                        <button
                            className="btn primary"
                            onClick={onNext}
                            disabled={!canNext}
                            aria-label={idx + 1 === total ? "제출" : "다음 단계"}
                        >
                            {idx + 1 === total ? "제출" : "다음 →"}
                        </button>
                    </div>
                </div>
                <div className="progress" aria-hidden>
                    <span style={{ width: `${pct}%` }} />
                </div>
            </div>
        </div>
    );
};

/* -------------------- 보고서 렌더러 -------------------- */

const ReportCard: React.FC<{ item: MatchItem; index: number }> = ({
                                                                      item,
                                                                      index,
                                                                  }) => {
    const [region, ...restRegions] = item["권장_지역_작목"];
    return (
        <div className="card report-card">
            <div className="row sp-between" style={{ alignItems: "flex-start" }}>
                <div>
                    <div className="badge">추천 #{index + 1}</div>
                    <h3 className="title" style={{ fontSize: 22, marginTop: 8 }}>
                        {item["분야"]}
                    </h3>
                    <p className="small-muted" style={{ marginTop: 2 }}>
                        본인의 경험, 선호, 노동 강도 선호 등을 반영한 제안
                    </p>
                </div>
            </div>

            <div className="report-section" style={{ marginTop: 10 }}>
                <h4>왜 적합한가요?</h4>
                <p style={{ margin: 0 }}>{item["적합_이유"]}</p>
            </div>

            <div className="report-section">
                <h4>권장 지역·작목</h4>
                <div className="report-meta">
                    {region && <span className="report-chip">우선: {region}</span>}
                    {restRegions.map((r, i) => (
                        <span key={i} className="report-chip">
              대안: {r}
            </span>
                    ))}
                </div>
            </div>

            <div className="report-section">
                <h4>진입 경로</h4>
                <ul>
                    {item["진입경로"].map((s, i) => (
                        <li key={i}>{s}</li>
                    ))}
                </ul>
            </div>

            <div className="report-section">
                <h4>필요 역량 · 장비 · 자본</h4>
                <p style={{ margin: 0 }}>{item["필요역량_장비_자본"]}</p>
            </div>

            <div className="report-section">
                <h4>다음 단계</h4>
                <ul>
                    {item["다음단계"].map((s, i) => (
                        <li key={i}>{s}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const ReportList: React.FC<{ items: MatchItem[] }> = ({ items }) => {
    if (!items.length) {
        return (
            <div className="card">
                <h3 className="title" style={{ fontSize: 20, marginBottom: 8 }}>
                    결과
                </h3>
                <p className="hint" role="status">
                    아직 표시할 추천이 없습니다. 설문을 제출해 주세요.
                </p>
            </div>
        );
    }
    return (
        <div className="report-list">
            {items.map((it, i) => (
                <ReportCard key={`${it["분야"]}-${i}`} item={it} index={i} />
            ))}
        </div>
    );
};

/* -------------------- 메인 -------------------- */

const App: React.FC = () => {
    useEffect(() => injectTheme(), []);

    const total = 12;
    const [idx, setIdx] = useState(0);

    // 폼 상태
    const [q1, setQ1] = useState<YesNo | undefined>();
    const [q2, setQ2] = useState<string[]>([]);
    const [q3, setQ3] = useState<string>("");
    const [q4, setQ4] = useState<string[]>([]);
    const [q5, setQ5] = useState<string[]>([]);
    const [q6, setQ6] = useState<string[]>([]);
    const [q7, setQ7] = useState<"높음" | "보통" | "낮음" | undefined>();
    const [q8, setQ8] = useState<string[]>([]);
    const [q9, setQ9] = useState<Answers["q9"] | undefined>();
    const [q10, setQ10] = useState("");
    const [q11, setQ11] = useState<Answers["q11"] | undefined>();
    const [q12, setQ12] = useState<Answers["q12"] | undefined>();

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [posting, setPosting] = useState(false);
    const [fetchErr, setFetchErr] = useState<string>("");

    // 보고서 데이터
    const [matchItems, setMatchItems] = useState<MatchItem[]>([]);

    // 섹션 컨테이너 ref (에러/이동 시 스크롤)
    const sectionRef = useRef<HTMLDivElement>(
        undefined as unknown as HTMLDivElement
    );
    useEffect(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [idx]);

    // 검증
    const validators: Record<number, () => boolean> = {
        0: () => required(q1),
        1: () => true,
        2: () => {
            if (q3.trim() === "") return false;
            const n = Number(q3);
            return Number.isFinite(n) && n >= 0 && n <= 80;
        },
        3: () => true,
        4: () => true,
        5: () => true,
        6: () => required(q7),
        7: () => true,
        8: () => required(q9),
        9: () => true,
        10: () => required(q11),
        11: () => required(q12),
    };

    const canNext = useMemo(() => {
        const v = validators[idx];
        return v ? v() : true;
    }, [idx, q1, q3, q7, q9, q11, q12]);

    const next = () => {
        if (!canNext) {
            setErrors((e) => ({ ...e, [idx]: "필수 항목을 입력해주세요." }));
            // 에러가 있으면 시각적 강조
            setTimeout(() => {
                sectionRef.current?.animate?.(
                    [
                        { transform: "translateX(0)" },
                        { transform: "translateX(-6px)" },
                        { transform: "translateX(6px)" },
                        { transform: "translateX(0)" },
                    ],
                    { duration: 180 }
                );
            }, 0);
            return;
        }
        setErrors((e) => ({ ...e, [idx]: "" }));
        setIdx((i) => clamp(i + 1, 0, total - 1));
    };
    const prev = () => setIdx((i) => clamp(i - 1, 0, total - 1));

    const toggle = (arr: string[], setArr: (v: string[]) => void, v: string) => {
        if (arr.includes(v)) setArr(arr.filter((x) => x !== v));
        else setArr([...arr, v]);
    };

    const submit = async () => {
        if (posting) return;
        const payload: Answers = {
            q1: (q1 as YesNo) ?? "N",
            q2,
            q3: (() => {
                const n = Number(q3 || 0);
                return clamp(Number.isFinite(n) ? n : 0, 0, 80);
            })(),
            q4,
            q5,
            q6,
            q7: q7 ?? "보통",
            q8,
            q9: q9 ?? "중간 정도가 좋다",
            q10,
            q11: q11 ?? "상관없음",
            q12: q12 ?? "아직 모르겠다",
            run_model: true,
        };
        setPosting(true);
        setFetchErr("");
        setMatchItems([]);
        try {
            // 1) 추천을 트리거 (응답 본문은 화면에 직접 노출하지 않음)
            await postRecommendations(payload);
            // 2) 매치 결과 조회 후 파싱 → 보고서 렌더링
            const txt = await getMatches();
            const items = parseMatches(txt);
            setMatchItems(items);
            if (!items.length) {
                setFetchErr("결과를 해석할 수 없습니다. 관리자에게 문의해주세요.");
            }
        } catch (e) {
            setFetchErr(toErr(e));
        } finally {
            setPosting(false);
        }
    };

    /* 마지막 단계 자동 제출 없음 (원본 유지) */

    const Section: React.FC<{ show: boolean; children: React.ReactNode }> = ({
                                                                                 show,
                                                                                 children,
                                                                             }) => <div style={{ display: show ? "block" : "none" }}>{children}</div>;

    const pct = Math.round(((idx + 1) / total) * 100);

    return (
        <div className="app">
            <StepNav
                idx={idx}
                total={total}
                onPrev={prev}
                onNext={() => (idx === total - 1 ? submit() : next())}
                canNext={canNext}
            />

            <div className="container">
                <div
                    className="row"
                    style={{ alignItems: "flex-start", marginBottom: 12 }}
                >
                    <div style={{ flex: 1, minWidth: 260 }}>
                        <h1 className="title" style={{ fontSize: 28 }}>
                            NK→SK 농업 적성 추천
                        </h1>
                        <p className="subtitle">
                            12문항을 단계별로 입력하고 한 번에 추천을 받아보세요.
                        </p>
                    </div>
                    <a
                        className="btn"
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            window.location.reload();
                        }}
                        aria-label="새로 시작"
                    >
                        새로 시작
                    </a>
                </div>

                <div ref={sectionRef} className="card">
                    {/* 1 */}
                    <Section show={idx === 0}>
                        <div className="q-label">1️⃣ 농업을 하셨나요?</div>
                        <div className="row" role="radiogroup" aria-label="농업 경험 여부">
                            {(["Y", "N"] as const).map((v) => (
                                <Pill
                                    key={v}
                                    label={v}
                                    active={q1 === v}
                                    onClick={() => setQ1(v)}
                                    roleType="radio"
                                    ariaChecked={q1 === v}
                                />
                            ))}
                        </div>
                        {errors[0] && (
                            <div className="err" style={{ marginTop: 8 }}>
                                {errors[0]}
                            </div>
                        )}
                    </Section>

                    {/* 2 */}
                    <Section show={idx === 1}>
                        <div className="q-label">
                            2️⃣ 어느 분야를 하셨나요?{" "}
                            <span className="hint">(다중 선택)</span>
                        </div>
                        <div className="chips" aria-label="경험 분야">
                            {OPTS.q2.map((o) => (
                                <Pill
                                    key={o}
                                    label={o}
                                    active={q2.includes(o)}
                                    onClick={() => toggle(q2, setQ2, o)}
                                    roleType="checkbox"
                                />
                            ))}
                        </div>
                        <div className="hint" style={{ marginTop: 6 }}>
                            칩을 눌러 선택/해제
                        </div>
                    </Section>

                    {/* 3 */}
                    <Section show={idx === 2}>
                        <label className="q-label" htmlFor="yearExp">
                            3️⃣ 얼마나 오래 하셨나요? <span className="hint">(년 단위)</span>
                        </label>
                        <input
                            id="yearExp"
                            className="field"
                            inputMode="numeric"
                            placeholder="0~80"
                            value={q3}
                            aria-describedby="yearHint"
                            onChange={(e) => {
                                // digits only
                                const v = e.target.value.replace(/[^\d]/g, "");
                                setQ3(v);
                            }}
                        />
                        <div id="yearHint" className="hint" style={{ marginTop: 6 }}>
                            숫자만 입력
                        </div>
                        {errors[2] && (
                            <div className="err" style={{ marginTop: 8 }}>
                                {errors[2]}
                            </div>
                        )}
                    </Section>

                    {/* 4 */}
                    <Section show={idx === 3}>
                        <div className="q-label">
                            4️⃣ 북한에서 주로 맡았던 역할은 무엇인가요?{" "}
                            <span className="hint">(다중 선택)</span>
                        </div>
                        <div className="chips">
                            {OPTS.q4.map((o) => (
                                <Pill
                                    key={o}
                                    label={o}
                                    active={q4.includes(o)}
                                    onClick={() => toggle(q4, setQ4, o)}
                                />
                            ))}
                        </div>
                        {q4.includes("기타(직접 입력)") && (
                            <input
                                className="field"
                                placeholder="기타 내용 입력"
                                style={{ marginTop: 10 }}
                                onBlur={(e) => {
                                    const t = e.target.value.trim();
                                    if (t)
                                        setQ4([...q4.filter((x) => x !== "기타(직접 입력)"), t]);
                                }}
                            />
                        )}
                    </Section>

                    {/* 5 */}
                    <Section show={idx === 4}>
                        <div className="q-label">
                            5️⃣ 사용해본 재배 시스템/방식은 무엇인가요?{" "}
                            <span className="hint">(다중 선택)</span>
                        </div>
                        <div className="chips">
                            {OPTS.q5.map((o) => (
                                <Pill
                                    key={o}
                                    label={o}
                                    active={q5.includes(o)}
                                    onClick={() => toggle(q5, setQ5, o)}
                                />
                            ))}
                        </div>
                        {q5.includes("기타(직접 입력)") && (
                            <input
                                className="field"
                                placeholder="기타 내용 입력"
                                style={{ marginTop: 10 }}
                                onBlur={(e) => {
                                    const t = e.target.value.trim();
                                    if (t)
                                        setQ5([...q5.filter((x) => x !== "기타(직접 입력)"), t]);
                                }}
                            />
                        )}
                    </Section>

                    {/* 6 */}
                    <Section show={idx === 5}>
                        <div className="q-label">
                            6️⃣ 선호하는 작업 환경을 선택해주세요.{" "}
                            <span className="hint">(다중 선택)</span>
                        </div>
                        <div className="chips">
                            {OPTS.q6.map((o) => (
                                <Pill
                                    key={o}
                                    label={o}
                                    active={q6.includes(o)}
                                    onClick={() => toggle(q6, setQ6, o)}
                                />
                            ))}
                        </div>
                    </Section>

                    {/* 7 */}
                    <Section show={idx === 6}>
                        <div className="q-label">7️⃣ 본인의 체력 수준은 어느 정도라고 생각하시나요?</div>
                        <div className="row" role="radiogroup" aria-label="체력 수준">
                            {OPTS.q7.map((o) => (
                                <Pill
                                    key={o}
                                    label={o}
                                    active={q7 === o}
                                    onClick={() => setQ7(o)}
                                    roleType="radio"
                                    ariaChecked={q7 === o}
                                />
                            ))}
                        </div>
                        {errors[6] && (
                            <div className="err" style={{ marginTop: 8 }}>
                                {errors[6]}
                            </div>
                        )}
                    </Section>

                    {/* 8 */}
                    <Section show={idx === 7}>
                        <div className="q-label">
                            8️⃣ 남한 농업에서 배우고 싶은 분야가 있나요?{" "}
                            <span className="hint">(다중 선택)</span>
                        </div>
                        <div className="chips">
                            {OPTS.q8.map((o) => (
                                <Pill
                                    key={o}
                                    label={o}
                                    active={q8.includes(o)}
                                    onClick={() => toggle(q8, setQ8, o)}
                                />
                            ))}
                        </div>
                        {q8.includes("기타(직접 입력)") && (
                            <input
                                className="field"
                                placeholder="기타 내용 입력"
                                style={{ marginTop: 10 }}
                                onBlur={(e) => {
                                    const t = e.target.value.trim();
                                    if (t)
                                        setQ8([...q8.filter((x) => x !== "기타(직접 입력)"), t]);
                                }}
                            />
                        )}
                    </Section>

                    {/* 9 */}
                    <Section show={idx === 8}>
                        <div className="q-label">9️⃣ 노동 강도에 대한 선호를 말씀해주세요.</div>
                        <div className="row" role="radiogroup" aria-label="노동 강도 선호">
                            {OPTS.q9.map((o) => (
                                <Pill
                                    key={o}
                                    label={o}
                                    active={q9 === o}
                                    onClick={() => setQ9(o)}
                                    roleType="radio"
                                    ariaChecked={q9 === o}
                                />
                            ))}
                        </div>
                        {errors[8] && (
                            <div className="err" style={{ marginTop: 8 }}>
                                {errors[8]}
                            </div>
                        )}
                    </Section>

                    {/* 10 */}
                    <Section show={idx === 9}>
                        <label className="q-label" htmlFor="extraJob">
                            🔟 농업 외에 다른 직업 경험도 있나요?{" "}
                            <span className="hint">(서술형, 없으면 비워두기)</span>
                        </label>
                        <textarea
                            id="extraJob"
                            className="field"
                            rows={4}
                            placeholder="예: 토목 보조, 기계 정비 등"
                            value={q10}
                            onChange={(e) => setQ10(e.target.value)}
                        />
                    </Section>

                    {/* 11 */}
                    <Section show={idx === 10}>
                        <div className="q-label">1️⃣1️⃣ 정착 희망 지역이 있나요?</div>
                        <div className="row" role="radiogroup" aria-label="정착 희망 지역">
                            {OPTS.q11.map((o) => (
                                <Pill
                                    key={o}
                                    label={o}
                                    active={q11 === o}
                                    onClick={() => setQ11(o)}
                                    roleType="radio"
                                    ariaChecked={q11 === o}
                                />
                            ))}
                        </div>
                        {errors[10] && (
                            <div className="err" style={{ marginTop: 8 }}>
                                {errors[10]}
                            </div>
                        )}
                    </Section>

                    {/* 12 */}
                    <Section show={idx === 11}>
                        <div className="q-label">1️⃣2️⃣ 장기적으로 어떤 형태의 농업을 원하시나요?</div>
                        <div className="row" role="radiogroup" aria-label="장기 희망 형태">
                            {OPTS.q12.map((o) => (
                                <Pill
                                    key={o}
                                    label={o}
                                    active={q12 === o}
                                    onClick={() => setQ12(o)}
                                    roleType="radio"
                                    ariaChecked={q12 === o}
                                />
                            ))}
                        </div>
                        {errors[11] && (
                            <div className="err" style={{ marginTop: 8 }}>
                                {errors[11]}
                            </div>
                        )}
                    </Section>

                    <div
                        className="row"
                        style={{ marginTop: 18, justifyContent: "space-between" }}
                    >
            <span className="hint">
              서버: <span className="kbd">{API_BASE}</span> · 제출 시 12문항을 한
              번에 전송합니다.
            </span>
                        {idx === total - 1 && (
                            <button className="btn primary" onClick={submit} disabled={posting}>
                                {posting ? "제출 중…" : "제출하기"}
                            </button>
                        )}
                    </div>
                </div>

                {/* 보고서 UI (원본 JSON/텍스트는 사용자에게 노출하지 않음) */}
                {(fetchErr || matchItems.length > 0) && (
                    <div style={{ marginTop: 16 }}>
                        {fetchErr && (
                            <div className="card" role="alert" style={{ marginBottom: 12 }}>
                                <h3
                                    className="title"
                                    style={{ fontSize: 20, marginBottom: 8, color: "var(--text)" }}
                                >
                                    결과
                                </h3>
                                <div className="err">{fetchErr}</div>
                            </div>
                        )}
                        <ReportList items={matchItems} />
                    </div>
                )}

                <footer
                    style={{ margin: "24px 0 120px", textAlign: "center", color: "var(--muted)" }}
                >
          <span>
            © {new Date().getFullYear()} NK→SK Agri Coach · theme:{" "}
              <span className="kbd">#afff46 / #f9fff1 / #284100</span>
          </span>
                </footer>
            </div>

            {/* 하단 고정 액션바 (모바일 사용성 강화) */}
            <div className="actionbar" aria-hidden={false}>
                <div className="actionbar-inner">
                    <button className="btn" style={{ flex: 1 }} onClick={prev} disabled={idx === 0}>
                        ← 이전
                    </button>
                    <div className="row" style={{ gap: 10, flex: 2 }}>
                        <div className="row" style={{ gap: 8, flex: 1, alignItems: "center" }}>
                            <div className="progress" style={{ width: "100%" }}>
                                <span style={{ width: `${pct}%` }} />
                            </div>
                            <span
                                className="hint"
                                aria-live="polite"
                                style={{ minWidth: 60, textAlign: "right" }}
                            >
                {pct}%
              </span>
                        </div>
                        <button
                            className="btn primary"
                            style={{ flex: 1 }}
                            onClick={() => (idx === total - 1 ? submit() : next())}
                            disabled={!canNext || posting}
                        >
                            {idx + 1 === total ? (posting ? "제출 중…" : "제출") : "다음 →"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
