import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * NK→SK 농업 적성 추천: Modern UI Edition
 * - Enhanced visual design with animations and modern aesthetics
 * - Color system: #afff46, #f9fff1, #284100
 * - Type-safe throughout (no 'any')
 */

const API_BASE =
    import.meta.env?.VITE_API_BASE || "https://unityhackathonbackend.onrender.com";

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
    --bg:#fafbfc;
    --card:#ffffff;
    --border:#e5e7eb;
    --radius:20px;
    --shadow:0 20px 60px rgba(40,65,0,.08);
    --shadow-lg:0 30px 80px rgba(40,65,0,.12);
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
      --bg:#0a0d0b;
      --card:#0f1412;
      --border:#1f2f1f;
      --ring:#afff4626;
      --shadow:0 20px 60px rgba(0,0,0,.4);
      --shadow-lg:0 30px 80px rgba(0,0,0,.5);
    }
  }
  * { box-sizing:border-box; margin:0; padding:0; }
  html, body, #root { height:100%; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
    color:var(--text);
    background:var(--bg);
    -webkit-font-smoothing:antialiased;
    -moz-osx-font-smoothing:grayscale;
    line-height:1.6;
  }
  
  /* Animated background pattern */
  body::before {
    content: '';
    position: fixed;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: 
      radial-gradient(circle at 20% 50%, rgba(175,255,70,.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(40,65,0,.02) 0%, transparent 50%);
    animation: float 20s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }
  
  @keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(30px, -30px) rotate(120deg); }
    66% { transform: translate(-20px, 20px) rotate(240deg); }
  }
  
  .app {
    min-height:100%;
    display:flex;
    flex-direction:column;
    position: relative;
    z-index: 1;
  }
  
  .container {
    width:100%;
    max-width:960px;
    margin:0 auto;
    padding: var(--space-5) var(--space-4) 140px;
    position: relative;
  }
  
  @media (min-width: 640px){
    .container{ padding: 32px 28px 160px; }
  }
  
  /* Glassmorphic card */
  .card{
    background: color-mix(in oklab, var(--card) 95%, var(--green-pale) 5%);
    backdrop-filter: blur(20px) saturate(140%);
    border:1px solid color-mix(in oklab, var(--border) 60%, var(--green-bright) 5%);
    border-radius:var(--radius);
    padding:var(--space-5);
    box-shadow:var(--shadow);
    position: relative;
    overflow: hidden;
    transition: transform .3s ease, box-shadow .3s ease;
  }
  
  .card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--green-bright), var(--green-deep));
    opacity: 0;
    transition: opacity .3s ease;
  }
  
  .card:hover::before {
    opacity: 1;
  }
  
  .title{
    font-weight:900;
    color:var(--green-deep);
    letter-spacing:-0.02em;
    line-height: 1.2;
  }
  
  .subtitle{ 
    color:var(--muted); 
    margin-top:8px;
    font-size: 15px;
  }
  
  /* Sticky topbar with blur */
  .topbar{
    position:sticky; 
    top:0; 
    z-index:30;
    background: color-mix(in oklab, var(--bg) 80%, transparent 20%);
    backdrop-filter: saturate(180%) blur(20px);
    padding: 14px var(--space-4) 12px;
    border-bottom:1px solid color-mix(in oklab, var(--border) 40%, transparent);
    box-shadow: 0 4px 30px rgba(40,65,0,.04);
  }
  
  /* Animated progress bar */
  .progress{ 
    height:8px; 
    background: color-mix(in oklab, var(--border) 50%, transparent); 
    border-radius:999px; 
    overflow:hidden;
    position: relative;
  }
  
  .progress::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255,255,255,.3), 
      transparent
    );
    animation: shimmer 2s infinite;
  }
  
  .progress > span{ 
    display:block; 
    height:100%; 
    background: linear-gradient(90deg, var(--green-bright), var(--green-deep));
    box-shadow: 0 0 10px rgba(175,255,70,.3);
    transition: width .4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
  
  .row{ display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
  .sp-between{ justify-content:space-between; }
  
  /* Modern button styles */
  .btn{
    appearance:none; 
    border:2px solid transparent; 
    color:var(--green-deep);
    background:#fff; 
    border-radius:16px; 
    padding:14px 20px; 
    font-weight:800; 
    cursor:pointer;
    transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
    touch-action:manipulation;
    position: relative;
    overflow: hidden;
    font-size: 15px;
  }
  
  .btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(175,255,70,.2);
    transform: translate(-50%, -50%);
    transition: width .4s ease, height .4s ease;
  }
  
  .btn:active::before {
    width: 300px;
    height: 300px;
  }
  
  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(40,65,0,.15);
  }
  
  .btn:active{ 
    transform: translateY(0) scale(.98); 
  }
  
  .btn[disabled]{ 
    opacity:.4; 
    cursor:not-allowed;
    transform: none !important;
  }
  
  .btn.primary{ 
    background: linear-gradient(135deg, var(--green-bright) 0%, var(--green-deep) 100%);
    color:#fff; 
    border-color:transparent;
    box-shadow: 0 4px 20px rgba(40,65,0,.2);
  }
  
  .btn.primary:hover {
    box-shadow: 0 8px 30px rgba(40,65,0,.3);
  }
  
  .btn.ghost{ 
    border-color:transparent; 
    background:transparent; 
    color:var(--green-deep);
    font-weight: 700;
  }
  
  .btn.ghost:hover {
    background: var(--green-pale);
    transform: translateY(-1px);
  }
  
  .chips{ display:flex; flex-wrap:wrap; gap:10px; }
  
  /* Modern pill design */
  .pill{
    display:inline-flex; 
    align-items:center; 
    gap:10px;
    padding:14px 18px; 
    border-radius:16px; 
    border:2px solid var(--border);
    background: var(--card);
    cursor:pointer; 
    user-select:none; 
    min-height:48px;
    line-height:1.3; 
    font-weight:700;
    font-size: 14px;
    transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }
  
  .pill::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(175,255,70,.1), transparent);
    transition: left .5s ease;
  }
  
  .pill:hover::before {
    left: 100%;
  }
  
  .pill:hover{ 
    box-shadow: 0 4px 20px rgba(40,65,0,.1);
    transform: translateY(-2px);
    border-color: color-mix(in oklab, var(--border) 50%, var(--green-bright) 50%);
  }
  
  .pill:active{ 
    transform: translateY(0) scale(.98); 
  }
  
  .pill[data-active="true"]{
    background: var(--green-pale);
    border-color: var(--green-deep);
    color: var(--green-deep);
    box-shadow: 0 0 0 4px var(--ring), 0 8px 25px rgba(40,65,0,.15);
    transform: translateY(-2px);
  }
  
  .pill .dot{
    width:12px; 
    height:12px; 
    border-radius:999px; 
    border:2px solid currentColor;
    background:transparent;
    transition: all .2s ease;
    flex-shrink: 0;
  }
  
  .pill[data-active="true"] .dot{ 
    background: currentColor;
    box-shadow: 0 0 8px currentColor;
  }
  
  .q-label{ 
    font-weight:900; 
    margin: 8px 0 14px; 
    font-size: 17px;
    color: var(--green-deep);
  }
  
  .hint{ 
    color:var(--muted); 
    font-size:13px;
    font-weight: 500;
  }
  
  .err{ 
    color:var(--danger); 
    font-size:13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .err::before {
    content: '⚠';
    font-size: 16px;
  }
  
  .field{
    display:block; 
    width:100%; 
    padding:16px 18px; 
    border-radius:16px; 
    border:2px solid var(--border);
    outline:none; 
    background:var(--card); 
    color:var(--text); 
    font-size:16px;
    transition: all .2s ease;
    font-weight: 500;
  }
  
  .field:focus{ 
    border-color: var(--green-deep); 
    box-shadow: 0 0 0 4px var(--ring), 0 4px 20px rgba(40,65,0,.1);
    background: var(--green-pale);
  }
  
  textarea.field{ 
    line-height:1.6;
    resize: vertical;
    min-height: 120px;
  }
  
  .kbd{ 
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; 
    background: var(--green-deep); 
    color: var(--green-bright); 
    border-radius:8px; 
    padding:4px 8px;
    font-size: 12px;
    font-weight: 700;
    border: 1px solid rgba(175,255,70,.2);
  }

  /* Enhanced action bar */
  .actionbar{
    position:fixed; 
    left:0; 
    right:0; 
    bottom:0; 
    z-index:40;
    background: color-mix(in oklab, var(--card) 90%, var(--bg) 10%);
    backdrop-filter: blur(30px) saturate(180%);
    border-top:1px solid color-mix(in oklab, var(--border) 50%, transparent);
    padding: 14px var(--space-4) calc(env(safe-area-inset-bottom) + 14px);
    box-shadow: 0 -10px 40px rgba(40,65,0,.12);
  }
  
  .actionbar-inner{ 
    max-width:960px; 
    margin:0 auto; 
    display:flex; 
    gap:12px; 
    align-items: center;
  }

  /* Report cards with modern styling */
  .report-list{ 
    display:flex; 
    flex-direction:column; 
    gap:20px; 
  }
  
  .report-card {
    transition: transform .3s ease, box-shadow .3s ease;
  }
  
  .report-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
  
  .report-card .badge{
    display:inline-block; 
    font-weight:800; 
    padding:8px 14px; 
    border-radius:12px;
    background: linear-gradient(135deg, var(--green-bright), var(--green-deep));
    color:#fff;
    border:none;
    font-size: 13px;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(40,65,0,.2);
  }
  
  .report-meta{ 
    display:flex; 
    flex-wrap:wrap; 
    gap:10px; 
    margin:12px 0 4px; 
  }
  
  .report-chip{
    display:inline-flex; 
    gap:8px; 
    align-items:center; 
    padding:10px 14px; 
    border-radius:12px; 
    border:2px solid var(--border);
    background: var(--card);
    font-weight:700;
    font-size: 13px;
    transition: all .2s ease;
  }
  
  .report-chip:hover {
    border-color: var(--green-bright);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(40,65,0,.1);
  }
  
  .report-section{ 
    margin-top:20px;
    padding-top: 16px;
    border-top: 2px solid color-mix(in oklab, var(--border) 40%, transparent);
  }
  
  .report-section h4{ 
    margin:0 0 10px; 
    font-size:17px; 
    color:var(--green-deep);
    font-weight: 900;
    letter-spacing: -0.01em;
  }
  
  .report-section ul{ 
    margin:0; 
    padding-left:20px; 
  }
  
  .report-section li{ 
    margin:8px 0;
    line-height: 1.6;
  }
  
  .small-muted{ 
    color:var(--muted); 
    font-size:13px;
    font-weight: 500;
  }
  
  /* Skeleton loader */
  .skeleton{
    background: linear-gradient(90deg, 
      color-mix(in oklab, var(--border) 30%, transparent), 
      color-mix(in oklab, var(--border) 60%, transparent),
      color-mix(in oklab, var(--border) 30%, transparent)
    );
    background-size: 300% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
    border-radius: 12px; 
    height: 16px;
  }

  /* Fade in animation */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .card, .report-card {
    animation: fadeIn .5s ease-out;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce){
    *, *::before, *::after { 
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
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

type RecommendResponse = Record<string, unknown>;

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
    q6: [
        "야외(논·밭)",
        "온실/시설",
        "기계·장비 중심",
        "동물 돌봄(축산)",
        "관리/기록/데이터 기반 작업",
        "상관없음",
    ],
    q7: ["높음", "보통", "낮음"] as const,
    q8: [
        "스마트팜",
        "과수원",
        "채소·특용작물",
        "축산",
        "도시농업",
        "농산물 가공",
        "농기계·드론 기술",
        "기타(직접 입력)",
    ],
    q9: ["바빠도 괜찮다(높음 가능)", "중간 정도가 좋다", "낮은 노동 강도 선호"] as const,
    q11: ["수도권", "강원", "충청", "전라", "경상", "제주", "상관없음"] as const,
    q12: [
        "취업(농장 근로)",
        "창업(귀농·작물 재배)",
        "기술직(스마트팜 운영·드론 등)",
        "안정적인 단순작업",
        "아직 모르겠다",
    ] as const,
} as const;

/* -------------------- 유틸 -------------------- */
const required = (v: unknown) =>
    v === undefined ? false : typeof v === "string" ? v.trim() !== "" : true;
const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, n));
const toErr = (e: unknown) => (e instanceof Error ? e.message : String(e));

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

function parseMatches(raw: string): MatchItem[] {
    try {
        const j = JSON.parse(raw) as unknown;
        if (isMatchArray(j)) return j;
        if (isRecord(j)) {
            const maybe = j["matches"];
            if (isMatchArray(maybe)) return maybe;
        }
    } catch {
        // fallback
    }

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
    return res.json() as Promise<RecommendResponse>;
}

async function getMatches(): Promise<string> {
    const res = await fetch(`${API_BASE}/matches`);
    if (!res.ok) throw new Error(`GET /matches failed: ${res.status}`);
    return res.text();
}

/* -------------------- 컴포넌트 -------------------- */

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
                <div className="row sp-between" style={{ marginBottom: 12 }}>
                    <div className="row" style={{ gap: 10 }}>
                        <strong style={{ fontSize: 15 }}>
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
                    <h3 className="title" style={{ fontSize: 24, marginTop: 12 }}>
                        {item["분야"]}
                    </h3>
                    <p className="small-muted" style={{ marginTop: 4 }}>
                        본인의 경험, 선호, 노동 강도 선호 등을 반영한 제안
                    </p>
                </div>
            </div>

            <div className="report-section" style={{ marginTop: 12 }}>
                <h4>왜 적합한가요?</h4>
                <p style={{ margin: 0 }}>{item["적합_이유"]}</p>
            </div>

            <div className="report-section">
                <h4>권장 지역·작목</h4>
                <div className="report-meta">
                    {region && <span className="report-chip">우선: {region}</span>}
                    {restRegions.map((r, i) => (
                        <span key={i} className="report-chip">
                            ✨ 대안: {r}
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

const Section: React.FC<{ show: boolean; children: React.ReactNode }> = ({
                                                                             show,
                                                                             children,
                                                                         }) => <div style={{ display: show ? "block" : "none" }}>{children}</div>;

/* -------------------- 메인 -------------------- */

const App: React.FC = () => {
    useEffect(() => injectTheme(), []);

    const total = 12;
    const [idx, setIdx] = useState(0);

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
    const [matchItems, setMatchItems] = useState<MatchItem[]>([]);

    const sectionRef = useRef<HTMLDivElement>(null!);

    useEffect(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [idx]);

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
            await postRecommendations(payload);
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
                    style={{ alignItems: "flex-start", marginBottom: 20 }}
                >
                    <div style={{ flex: 1, minWidth: 260 }}>
                        <h1 className="title" style={{ fontSize: 32 }}>
                            NK→SK 농업 적성 추천
                        </h1>
                        <p className="subtitle">
                            12문항을 단계별로 입력하고 맞춤형 추천을 받아보세요
                        </p>
                    </div>
                    <button
                        className="btn"
                        onClick={() => window.location.reload()}
                        aria-label="새로 시작"
                    >
                        새로 시작
                    </button>
                </div>

                <div ref={sectionRef} className="card">
                    <Section show={idx === 0}>
                        <div className="q-label">농업을 하셨나요?</div>
                        <div className="row" role="radiogroup" aria-label="농업 경험 여부">
                            {(["Y", "N"] as const).map((v) => (
                                <Pill
                                    key={v}
                                    label={v === "Y" ? "네 (Yes)" : "아니오 (No)"}
                                    active={q1 === v}
                                    onClick={() => setQ1(v)}
                                    roleType="radio"
                                    ariaChecked={q1 === v}
                                />
                            ))}
                        </div>
                        {errors[0] && (
                            <div className="err" style={{ marginTop: 10 }}>
                                {errors[0]}
                            </div>
                        )}
                    </Section>

                    <Section show={idx === 1}>
                        <div className="q-label">
                            어느 분야를 하셨나요?{" "}
                            <span className="hint">(다중 선택 가능)</span>
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
                        <div className="hint" style={{ marginTop: 8 }}>
                            💡 여러 개 선택 가능합니다
                        </div>
                    </Section>

                    <Section show={idx === 2}>
                        <label className="q-label" htmlFor="yearExp">
                            얼마나 오래 하셨나요? <span className="hint">(년 단위)</span>
                        </label>
                        <input
                            id="yearExp"
                            className="field"
                            inputMode="numeric"
                            placeholder="예: 5"
                            value={q3}
                            aria-describedby="yearHint"
                            onChange={(e) => {
                                const v = e.target.value.replace(/[^\d]/g, "");
                                setQ3(v);
                            }}
                        />
                        <div id="yearHint" className="hint" style={{ marginTop: 8 }}>
                            0~80 사이의 숫자를 입력하세요
                        </div>
                        {errors[2] && (
                            <div className="err" style={{ marginTop: 10 }}>
                                {errors[2]}
                            </div>
                        )}
                    </Section>

                    <Section show={idx === 3}>
                        <div className="q-label">
                            북한에서 주로 맡았던 역할은 무엇인가요?{" "}
                            <span className="hint">(다중 선택 가능)</span>
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
                                placeholder="기타 내용을 입력하세요"
                                style={{ marginTop: 12 }}
                                onBlur={(e) => {
                                    const t = e.target.value.trim();
                                    if (t)
                                        setQ4([...q4.filter((x) => x !== "기타(직접 입력)"), t]);
                                }}
                            />
                        )}
                    </Section>

                    <Section show={idx === 4}>
                        <div className="q-label">
                            사용해본 재배 시스템/방식은 무엇인가요?{" "}
                            <span className="hint">(다중 선택 가능)</span>
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
                                placeholder="기타 내용을 입력하세요"
                                style={{ marginTop: 12 }}
                                onBlur={(e) => {
                                    const t = e.target.value.trim();
                                    if (t)
                                        setQ5([...q5.filter((x) => x !== "기타(직접 입력)"), t]);
                                }}
                            />
                        )}
                    </Section>

                    <Section show={idx === 5}>
                        <div className="q-label">
                            선호하는 작업 환경을 선택해주세요{" "}
                            <span className="hint">(다중 선택 가능)</span>
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

                    <Section show={idx === 6}>
                        <div className="q-label">본인의 체력 수준은 어느 정도라고 생각하시나요?</div>
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
                            <div className="err" style={{ marginTop: 10 }}>
                                {errors[6]}
                            </div>
                        )}
                    </Section>

                    <Section show={idx === 7}>
                        <div className="q-label">
                            남한 농업에서 배우고 싶은 분야가 있나요?{" "}
                            <span className="hint">(다중 선택 가능)</span>
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
                                placeholder="기타 내용을 입력하세요"
                                style={{ marginTop: 12 }}
                                onBlur={(e) => {
                                    const t = e.target.value.trim();
                                    if (t)
                                        setQ8([...q8.filter((x) => x !== "기타(직접 입력)"), t]);
                                }}
                            />
                        )}
                    </Section>

                    <Section show={idx === 8}>
                        <div className="q-label">노동 강도에 대한 선호를 말씀해주세요</div>
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
                            <div className="err" style={{ marginTop: 10 }}>
                                {errors[8]}
                            </div>
                        )}
                    </Section>

                    <Section show={idx === 9}>
                        <label className="q-label" htmlFor="extraJob">
                            농업 외에 다른 직업 경험도 있나요?{" "}
                            <span className="hint">(선택사항)</span>
                        </label>
                        <textarea
                            id="extraJob"
                            className="field"
                            rows={4}
                            placeholder="예: 토목 보조, 기계 정비 등 (없으면 비워두셔도 됩니다)"
                            value={q10}
                            onChange={(e) => setQ10(e.target.value)}
                        />
                    </Section>

                    <Section show={idx === 10}>
                        <div className="q-label">정착 희망 지역이 있나요?</div>
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
                            <div className="err" style={{ marginTop: 10 }}>
                                {errors[10]}
                            </div>
                        )}
                    </Section>

                    <Section show={idx === 11}>
                        <div className="q-label">장기적으로 어떤 형태의 농업을 원하시나요?</div>
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
                            <div className="err" style={{ marginTop: 10 }}>
                                {errors[11]}
                            </div>
                        )}
                    </Section>

                    <div
                        className="row"
                        style={{ marginTop: 20, justifyContent: "space-between", alignItems: "center" }}
                    >
                        <span className="hint">
                            디버깅용 서버: <span className="kbd">{API_BASE}</span>
                        </span>
                        {idx === total - 1 && (
                            <button className="btn primary" onClick={submit} disabled={posting}>
                                {posting ? "제출 중…" : "제출하기"}
                            </button>
                        )}
                    </div>
                </div>

                {(fetchErr || matchItems.length > 0) && (
                    <div style={{ marginTop: 20 }}>
                        {fetchErr && (
                            <div className="card" role="alert" style={{ marginBottom: 16 }}>
                                <h3
                                    className="title"
                                    style={{ fontSize: 20, marginBottom: 10, color: "var(--text)" }}
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
                    style={{ margin: "32px 0 140px", textAlign: "center", color: "var(--muted)" }}
                >
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                        © {new Date().getFullYear()} NK→SK Agri Coach
                    </span>
                </footer>
            </div>

            <div className="actionbar" aria-hidden={false}>
                <div className="actionbar-inner">
                    <button className="btn" style={{ flex: 1 }} onClick={prev} disabled={idx === 0}>
                        ← 이전
                    </button>
                    <div className="row" style={{ gap: 12, flex: 2 }}>
                        <div className="row" style={{ gap: 10, flex: 1, alignItems: "center" }}>
                            <div className="progress" style={{ width: "100%" }}>
                                <span style={{ width: `${pct}%` }} />
                            </div>
                            <span
                                className="hint"
                                aria-live="polite"
                                style={{ minWidth: 50, textAlign: "right", fontWeight: 700 }}
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
                            {idx + 1 === total ? (posting ? "제출 중" : "제출") : "다음 →"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;