/**
 * Ad Primitives — shared, production-quality building blocks for Remotion ad compositions.
 *
 * These are the proven, battle-tested patterns extracted from the best compositions.
 * Every primitive is colour-agnostic, resolution-independent, and spring-based.
 *
 * USAGE RULES (enforced by the Prompt Director):
 *   1. ALWAYS import a primitive when one matches the visual need.
 *   2. NEVER rebuild a primitive from scratch inside a composition.
 *   3. Each ad MUST also create 3-5 novel inline components for
 *      story-specific visuals — primitives handle infrastructure,
 *      novel components handle creative differentiation.
 *
 * GRADUATION: When a novel inline component appears in 3+ compositions,
 * it should be extracted here as a new primitive.
 */

// ── Foundation ────────────────────────────────────────────────────────────────
export { SceneFade } from "./SceneFade";
export { BlurWord } from "./BlurWord";
export { WordLine } from "./WordLine";
export type { WordConfig } from "./WordLine";

// ── Glow System ──────────────────────────────────────────────────────────────
export { GlowCard } from "./GlowCard";
export { GlowOrb } from "./GlowOrb";

// ── Data Visualisation ───────────────────────────────────────────────────────
export { AnimatedConnector } from "./AnimatedConnector";
export { ProgressRing } from "./ProgressRing";
export { NotificationBadge } from "./NotificationBadge";

// ── Composite Layouts ────────────────────────────────────────────────────────
export { DashboardShell } from "./DashboardShell";
export { KanbanBoard } from "./KanbanBoard";
export type { KanbanCardData, KanbanColumnData } from "./KanbanBoard";
export { NotificationStack } from "./NotificationStack";
export type { NotificationItem } from "./NotificationStack";
