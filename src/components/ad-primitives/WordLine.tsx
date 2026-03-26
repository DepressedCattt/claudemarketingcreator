/**
 * WordLine — horizontally-centred row of staggered BlurWord entrances.
 *
 * Pass an array of word configs and a vertical position.  Each word
 * staggers in using BlurWord with the given delay.
 */

import React from "react";
import { BlurWord } from "./BlurWord";

export interface WordConfig {
  text: string;
  weight?: number;
  color?: string;
}

interface Props {
  words: WordConfig[];
  /** Vertical position (absolute top in px). */
  y: number;
  /** Font size in px (default 160). */
  size?: number;
  /** Frame delay between each word (default 5). */
  stagger?: number;
  /** Frame offset before the first word starts (default 0). */
  baseDelay?: number;
  fontFamily?: string;
  /** Default text color applied when a word doesn't specify its own. */
  defaultColor?: string;
  springConfig?: { stiffness: number; damping: number; mass: number };
}

export const WordLine: React.FC<Props> = ({
  words,
  y,
  size = 160,
  stagger = 5,
  baseDelay = 0,
  fontFamily,
  defaultColor = "#F8FAFC",
  springConfig,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: y,
      transform: "translateY(-50%)",
      textAlign: "center",
      display: "flex",
      justifyContent: "center",
      gap: size * 0.3,
      whiteSpace: "pre",
    }}
  >
    {words.map((w, i) => (
      <BlurWord
        key={i}
        text={w.text}
        delay={baseDelay + i * stagger}
        fontWeight={w.weight ?? 400}
        color={w.color ?? defaultColor}
        size={size}
        fontFamily={fontFamily}
        springConfig={springConfig}
      />
    ))}
  </div>
);
