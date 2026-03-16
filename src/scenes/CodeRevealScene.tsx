/**
 * CodeRevealScene
 *
 * A syntax-highlighted code block that types itself out line by line.
 * Features a realistic IDE window chrome, blinking cursor, and
 * language-aware keyword colouring.
 *
 * Required sceneProps (CodeRevealSceneProps):
 *   lines         — array of code strings
 *   language      — "typescript" | "python" | "javascript" | "bash" etc.
 *   headline      — optional headline above the code window
 *   charsPerFrame — characters revealed per frame (default: 2)
 *   lineDelay     — frames between lines starting (default: 24)
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AdConfig, CodeRevealSceneProps } from "../data/types";
import { GlassCard } from "../components/GlassCard";
import { FilmGrain } from "../components/FilmGrain";
import { useFadeIn, useFadeOut } from "../utils/animation";
import { getTypography } from "../utils/typography";

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

// ─── Syntax token colours ─────────────────────────────────────────────────────

const TOKEN_COLORS = {
  keyword:  "#c678dd", // purple   — import, const, function, return, if
  string:   "#98c379", // green    — "quoted strings"
  comment:  "#5c6370", // grey     — // comments
  number:   "#d19a66", // orange   — numeric values
  type:     "#e5c07b", // yellow   — types, interfaces
  function: "#61afef", // blue     — function names
  operator: "#56b6c2", // cyan     — =>, =, +, -
  default:  "#abb2bf", // light grey
};

const KEYWORDS = ["import", "export", "const", "let", "var", "function", "return",
  "if", "else", "for", "while", "class", "interface", "type", "async", "await",
  "from", "default", "new", "this", "extends", "implements", "def", "print",
  "True", "False", "None", "and", "or", "not", "in", "is", "elif"];

function tokenizeLine(line: string): { text: string; color: string }[] {
  if (line.trimStart().startsWith("//") || line.trimStart().startsWith("#")) {
    return [{ text: line, color: TOKEN_COLORS.comment }];
  }
  if (line.includes('"') || line.includes("'") || line.includes("`")) {
    // Simple: colour whole line if it has strings
    return [{ text: line, color: TOKEN_COLORS.string }];
  }
  for (const kw of KEYWORDS) {
    if (new RegExp(`\\b${kw}\\b`).test(line)) {
      return [{ text: line, color: TOKEN_COLORS.keyword }];
    }
  }
  if (/^\s*\d/.test(line)) return [{ text: line, color: TOKEN_COLORS.number }];
  if (/[A-Z]/.test(line[0] || "")) return [{ text: line, color: TOKEN_COLORS.type }];
  return [{ text: line, color: TOKEN_COLORS.default }];
}

// ─── Scene ────────────────────────────────────────────────────────────────────

export const CodeRevealScene: React.FC<Props> = ({ config, durationFrames, sceneProps }) => {
  const { brand } = config;
  const frame = useCurrentFrame();

  const props = (sceneProps ?? {}) as unknown as CodeRevealSceneProps;
  const lines         = props.lines         ?? [];
  const language      = props.language      ?? "typescript";
  const headline      = props.headline;
  const charsPerFrame = props.charsPerFrame ?? 2;
  const lineDelay     = props.lineDelay     ?? 24;

  const sceneOpacity    = useFadeOut(durationFrames, 10);
  const headlineOpacity = useFadeIn(4, 14);

  // Cursor blink
  const cursorOpacity = Math.round(frame / 8) % 2 === 0 ? 1 : 0;

  // Find which line is currently being typed
  const activeLineIndex = Math.min(
    lines.length - 1,
    Math.floor(frame / lineDelay)
  );

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      <AbsoluteFill style={{ background: "#0D1117" }} />
      <FilmGrain opacity={0.03} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 52px",
          gap: 28,
        }}
      >
        {headline && (
          <div
            style={{
              opacity: headlineOpacity,
              fontFamily: "'Courier New', monospace",
              fontSize: 36,
              fontWeight: 700,
              color: brand.colors.accent,
              letterSpacing: "0.08em",
              marginBottom: 4,
            }}
          >
            {headline}
          </div>
        )}

        {/* IDE Window Chrome */}
        <div
          style={{
            background: "#1e2030",
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          }}
        >
          {/* Title bar */}
          <div
            style={{
              background: "#252739",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {["#ff5f57", "#ffbd2e", "#28c840"].map((c, i) => (
              <div
                key={i}
                style={{ width: 14, height: 14, borderRadius: "50%", background: c }}
              />
            ))}
            <div
              style={{
                marginLeft: 12,
                fontFamily: "'Courier New', monospace",
                fontSize: 18,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.05em",
              }}
            >
              {language === "python" ? "main.py" : language === "bash" ? "deploy.sh" : "index.ts"}
            </div>
          </div>

          {/* Code body */}
          <div style={{ padding: "24px 0", minHeight: 300 }}>
            {lines.map((line, lineIdx) => {
              const lineStartFrame = lineIdx * lineDelay;
              if (frame < lineStartFrame) return null;

              const elapsed = frame - lineStartFrame;
              const visibleChars = Math.min(line.length, Math.floor(elapsed * charsPerFrame));
              const isCurrentLine = lineIdx === activeLineIndex;
              const visibleText = line.slice(0, visibleChars);
              const tokens = tokenizeLine(visibleText);

              return (
                <div
                  key={lineIdx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "4px 0",
                    background: isCurrentLine ? "rgba(255,255,255,0.03)" : "transparent",
                    minHeight: 38,
                  }}
                >
                  {/* Line number */}
                  <div
                    style={{
                      width: 56,
                      textAlign: "right",
                      paddingRight: 20,
                      fontFamily: "'Courier New', monospace",
                      fontSize: 20,
                      color: "rgba(255,255,255,0.2)",
                      userSelect: "none",
                      flexShrink: 0,
                    }}
                  >
                    {lineIdx + 1}
                  </div>

                  {/* Code text */}
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: 22, lineHeight: 1.5 }}>
                    {tokens.map((token, ti) => (
                      <span key={ti} style={{ color: token.color }}>
                        {token.text}
                      </span>
                    ))}
                    {/* Blinking cursor on active line */}
                    {isCurrentLine && visibleChars < line.length && (
                      <span
                        style={{
                          display: "inline-block",
                          width: 2,
                          height: "1.2em",
                          background: brand.colors.accent,
                          marginLeft: 2,
                          verticalAlign: "text-bottom",
                          opacity: cursorOpacity,
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
