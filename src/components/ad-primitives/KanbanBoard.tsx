/**
 * KanbanBoard — horizontal column layout with staggered card entrances.
 *
 * Pass an array of columns, each with a title, accent colour, and
 * card data.  Columns slide in with a spring; cards within each
 * column stagger based on their index.
 */

import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

const DEFAULT_FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;
const DEFAULT_SPRING = { stiffness: 155, damping: 22, mass: 0.85 };

export interface KanbanCardData {
  title: string;
  subtitle?: string;
  value?: string;
}

export interface KanbanColumnData {
  title: string;
  color: string;
  cards: KanbanCardData[];
}

interface Props {
  columns: KanbanColumnData[];
  /** Spring progress 0→1 controlling the entrance. */
  progress: number;
  /** Absolute top position of the board. */
  y?: number;
  /** Absolute left position of the board. */
  x?: number;
  /** Width of each column in px. */
  columnWidth?: number;
  /** Gap between columns in px. */
  columnGap?: number;
  /** Frame stagger between columns. */
  columnStagger?: number;
  /** Frame stagger between cards within a column. */
  cardStagger?: number;
  bgColor?: string;
  surfaceColor?: string;
  textColor?: string;
  textDimColor?: string;
  fontFamily?: string;
  springConfig?: { stiffness: number; damping: number; mass: number };
}

const KanbanCard: React.FC<{
  data: KanbanCardData;
  color: string;
  delay: number;
  bgColor: string;
  textColor: string;
  textDimColor: string;
  fontFamily: string;
  fps: number;
}> = ({ data, color, delay, bgColor, textColor, textDimColor, fontFamily, fps }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: DEFAULT_SPRING });
  return (
    <div
      style={{
        padding: "16px 18px",
        borderRadius: 14,
        background: bgColor,
        border: `1px solid ${textDimColor}12`,
        marginBottom: 10,
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `${color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily,
            fontSize: 14,
            fontWeight: 700,
            color,
          }}
        >
          {data.title.charAt(0)}
        </div>
        <div>
          <div style={{ fontFamily, fontSize: 17, fontWeight: 600, color: textColor }}>
            {data.title}
          </div>
          {data.subtitle && (
            <div style={{ fontFamily, fontSize: 13, color: textDimColor }}>
              {data.subtitle}
            </div>
          )}
        </div>
      </div>
      {data.value && (
        <div style={{ fontFamily, fontSize: 15, fontWeight: 600, color }}>
          {data.value}
        </div>
      )}
    </div>
  );
};

export const KanbanBoard: React.FC<Props> = ({
  columns,
  progress,
  y = 320,
  x = 220,
  columnWidth = 780,
  columnGap = 60,
  columnStagger = 6,
  cardStagger = 4,
  bgColor = "#1E293B",
  surfaceColor = "#1E293B",
  textColor = "#F8FAFC",
  textDimColor = "#64748B",
  fontFamily = DEFAULT_FONT,
  springConfig = DEFAULT_SPRING,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {columns.map((col, colIdx) => {
        const colDelay = colIdx * columnStagger;
        const colP =
          spring({
            frame: Math.max(0, frame - colDelay),
            fps,
            config: springConfig,
          }) * progress;

        return (
          <div
            key={colIdx}
            style={{
              position: "absolute",
              left: x + colIdx * (columnWidth + columnGap),
              top: y,
              width: columnWidth,
              opacity: colP,
              transform: `translateY(${(1 - colP) * 40}px)`,
            }}
          >
            {/* Column header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
                padding: "0 4px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: col.color,
                  }}
                />
                <span style={{ fontFamily, fontSize: 20, fontWeight: 600, color: textColor }}>
                  {col.title}
                </span>
              </div>
              <span
                style={{
                  fontFamily,
                  fontSize: 16,
                  fontWeight: 500,
                  color: textDimColor,
                  background: `${textDimColor}15`,
                  padding: "2px 10px",
                  borderRadius: 8,
                }}
              >
                {col.cards.length}
              </span>
            </div>

            {/* Cards */}
            {col.cards.map((card, cardIdx) => (
              <KanbanCard
                key={cardIdx}
                data={card}
                color={col.color}
                delay={colDelay + columnStagger + cardIdx * cardStagger}
                bgColor={bgColor}
                textColor={textColor}
                textDimColor={textDimColor}
                fontFamily={fontFamily}
                fps={fps}
              />
            ))}
          </div>
        );
      })}
    </>
  );
};
