import React, {
  useRef, useEffect, useCallback, useState, Component,
  type ErrorInfo,
} from "react";

function useFullscreen(ref: React.RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const enter = useCallback(() => {
    ref.current?.requestFullscreen().catch(() => {});
  }, [ref]);

  const exit = useCallback(() => {
    document.exitFullscreen().catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    isFullscreen ? exit() : enter();
  }, [isFullscreen, enter, exit]);

  return { isFullscreen, toggle };
}
import { Player, type PlayerRef }                        from "@remotion/player";
import { useStudio }                                      from "../store/useStudio";
import { getComp }                                        from "../registry";
import { CompositionWithAudio, type CompositionWithAudioProps } from "./CompositionWithAudio";

// ─── Error boundary ────────────────────────────────────────────────────────
class PlayerErrorBoundary extends Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error("[Studio] Composition render error:", err, info);
  }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          height: "100%", padding: 24, background: "#1a0a0a",
          color: "#f87171", fontFamily: "monospace", fontSize: 12,
          textAlign: "center", gap: 12,
        }}>
          <div style={{ fontSize: 24 }}>⚠</div>
          <div style={{ fontWeight: 700 }}>Composition error</div>
          <div style={{
            background: "#2a0a0a", border: "1px solid #450a0a",
            borderRadius: 6, padding: "10px 14px",
            maxWidth: 480, wordBreak: "break-word", lineHeight: 1.5,
          }}>
            {err.message}
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              marginTop: 8, padding: "6px 16px", borderRadius: 4,
              background: "#450a0a", border: "1px solid #f87171",
              color: "#f87171", cursor: "pointer", fontSize: 11,
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Transport icon button ─────────────────────────────────────────────────
const Icon: React.FC<{
  children: string;
  title?: string;
  onClick?: () => void;
  active?: boolean;
  size?: number;
}> = ({ children, title, onClick, active, size = 15 }) => (
  <button
    title={title}
    onClick={onClick}
    style={{
      background:     active ? "#0070f330" : "transparent",
      border:         active ? "1px solid #0070f3" : "1px solid transparent",
      borderRadius:   4,
      color:          active ? "#60a5fa" : "#aaa",
      width:          30,
      height:         30,
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      fontSize:       size,
      cursor:         "pointer",
      transition:     "all 0.1s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = active ? "#0070f330" : "#2a2a2a")}
    onMouseLeave={(e) => (e.currentTarget.style.background = active ? "#0070f330" : "transparent")}
  >
    {children}
  </button>
);

// ─── Main component ─────────────────────────────────────────────────────────
export const PreviewPlayer: React.FC = () => {
  const { activeCompId, frame, playing, setFrame, setPlaying, audioTracks } = useStudio();
  const comp          = getComp(activeCompId);
  const tracks        = (activeCompId && audioTracks[activeCompId]) ?? [];
  const playerRef     = useRef<PlayerRef>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);

  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(canvasAreaRef);
  const [displayW, setDisplayW] = useState(0);
  const [displayH, setDisplayH] = useState(0);

  // Recalculate Player display size whenever the container or comp changes
  useEffect(() => {
    const el = canvasAreaRef.current;
    if (!el || !comp) return;

    const recalc = () => {
      const { width: cw, height: ch } = el.getBoundingClientRect();
      const aspect = comp.width / comp.height;
      let w = cw;
      let h = w / aspect;
      if (h > ch) { h = ch; w = h * aspect; }
      setDisplayW(Math.floor(w));
      setDisplayH(Math.floor(h));
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [comp]);

  // ── Spacebar play/pause
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        if (playing) playerRef.current?.pause();
        else         playerRef.current?.play();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing]);

  // ── Sync Player → store
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onFrame = (e: { detail: { frame: number } }) => setFrame(e.detail.frame);
    const onPlay  = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    player.addEventListener("frameupdate", onFrame);
    player.addEventListener("play",        onPlay);
    player.addEventListener("pause",       onPause);
    return () => {
      player.removeEventListener("frameupdate", onFrame);
      player.removeEventListener("play",        onPlay);
      player.removeEventListener("pause",       onPause);
    };
  }, [setFrame, setPlaying, comp]);

  // ── Sync store → Player (external seeks from timeline)
  const lastSeeked = useRef(-1);
  useEffect(() => {
    if (!playerRef.current || playing) return;
    if (frame === lastSeeked.current) return;
    lastSeeked.current = frame;
    playerRef.current.seekTo(frame);
  }, [frame, playing]);

  // ── Transport
  const handlePlayPause = useCallback(() => {
    if (!playerRef.current) return;
    if (playing) playerRef.current.pause();
    else         playerRef.current.play();
  }, [playing]);

  const handleStop = useCallback(() => {
    playerRef.current?.pause();
    playerRef.current?.seekTo(0);
    setFrame(0);
  }, [setFrame]);

  const stepFrame = useCallback((delta: number) => {
    if (!playerRef.current || !comp) return;
    const next = Math.max(0, Math.min(frame + delta, comp.durationInFrames - 1));
    playerRef.current.seekTo(next);
    setFrame(next);
  }, [frame, comp, setFrame]);

  if (!comp) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100%", color: "#444",
      }}>
        Select a composition
      </div>
    );
  }

  const durationSec = (comp.durationInFrames / comp.fps).toFixed(1);
  const currentSec  = (frame / comp.fps).toFixed(2);
  const progress    = comp.durationInFrames > 0 ? frame / comp.durationInFrames : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#141414" }}>

      {/* ── Canvas area — measured by ResizeObserver ── */}
      <div
        ref={canvasAreaRef}
        style={{
          flex:           1,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          overflow:       "hidden",
          padding:        16,
          background:     "#0e0e0e",
          // Fullscreen styles applied via CSS so the bg fills the screen
          ...(isFullscreen ? { padding: 0, background: "#000" } : {}),
        }}
      >
        {displayW > 0 && displayH > 0 ? (
          <div style={{
            width:        displayW,
            height:       displayH,
            flexShrink:   0,
            borderRadius: 2,
            overflow:     "hidden",
            background:   "#000",
          }}>
            <PlayerErrorBoundary key={activeCompId}>
              {tracks.length > 0 ? (
                // When audio tracks exist, wrap the composition so the Player
                // can hear them during preview.
                <Player
                  key={`${activeCompId}-audio`}
                  ref={playerRef}
                  component={CompositionWithAudio}
                  durationInFrames={comp.durationInFrames}
                  fps={comp.fps}
                  compositionWidth={comp.width}
                  compositionHeight={comp.height}
                  style={{ width: "100%", height: "100%", display: "block" }}
                  inputProps={{
                    innerComponent: comp.component,
                    innerProps:     comp.defaultProps ?? {},
                    audioTracks:    tracks,
                  } satisfies CompositionWithAudioProps}
                  clickToPlay={false}
                  controls={false}
                  acknowledgeRemotionLicense
                  renderLoading={() => (
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      height: "100%", background: "#111", color: "#555", fontSize: 12,
                    }}>
                      Loading…
                    </div>
                  )}
                />
              ) : (
                // No audio — render the composition directly (cheaper path)
                <Player
                  key={activeCompId}
                  ref={playerRef}
                  component={comp.component}
                  durationInFrames={comp.durationInFrames}
                  fps={comp.fps}
                  compositionWidth={comp.width}
                  compositionHeight={comp.height}
                  style={{ width: "100%", height: "100%", display: "block" }}
                  inputProps={comp.defaultProps}
                  clickToPlay={false}
                  controls={false}
                  acknowledgeRemotionLicense
                  renderLoading={() => (
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      height: "100%", background: "#111", color: "#555", fontSize: 12,
                    }}>
                      Loading…
                    </div>
                  )}
                />
              )}
            </PlayerErrorBoundary>
          </div>
        ) : (
          <div style={{ color: "#333", fontSize: 12 }}>Measuring…</div>
        )}
      </div>

      {/* ── Progress bar (clickable scrub) ── */}
      <div
        style={{ height: 4, background: "#1a1a1a", flexShrink: 0, cursor: "pointer" }}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const f = Math.round(((e.clientX - r.left) / r.width) * comp.durationInFrames);
          playerRef.current?.seekTo(f);
          setFrame(f);
        }}
      >
        <div style={{
          width: `${progress * 100}%`, height: "100%",
          background: "#0070f3", transition: "width 0.05s",
        }} />
      </div>

      {/* ── Transport controls ── */}
      <div style={{
        height:     48,
        display:    "flex",
        alignItems: "center",
        padding:    "0 12px",
        gap:        4,
        background: "#191919",
        borderTop:  "1px solid #2a2a2a",
        flexShrink: 0,
      }}>
        <Icon title="Stop"            onClick={handleStop}>⏹</Icon>
        <Icon title="Step back 1f"    onClick={() => stepFrame(-1)}>◀</Icon>
        <Icon
          title={playing ? "Pause" : "Play"}
          onClick={handlePlayPause}
          active={playing}
          size={18}
        >
          {playing ? "⏸" : "▶"}
        </Icon>
        <Icon title="Step forward 1f" onClick={() => stepFrame(1)}>▶</Icon>
        <Icon title="Back 10f"        onClick={() => stepFrame(-10)}>⏮</Icon>
        <Icon title="Forward 10f"     onClick={() => stepFrame(10)}>⏭</Icon>

        <div style={{ flex: 1 }} />

        <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888", whiteSpace: "nowrap" }}>
          {currentSec}s / {durationSec}s
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#555", whiteSpace: "nowrap", marginLeft: 8 }}>
          f {frame} / {comp.durationInFrames}
        </div>
        <div style={{ width: 1, height: 20, background: "#333", margin: "0 8px" }} />
        <div style={{ fontSize: 10, color: "#555" }}>
          {comp.width}×{comp.height} · {comp.fps}fps
        </div>

        <div style={{ width: 1, height: 20, background: "#333", margin: "0 8px" }} />

        {/* Fullscreen toggle */}
        <button
          title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
          onClick={toggleFullscreen}
          style={{
            background:     isFullscreen ? "#1e3a5f" : "transparent",
            border:         isFullscreen ? "1px solid #0070f3" : "1px solid transparent",
            borderRadius:   4,
            color:          isFullscreen ? "#60a5fa" : "#888",
            width:          30,
            height:         30,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            fontSize:       14,
            cursor:         "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = isFullscreen ? "#1e3a5f" : "#2a2a2a")}
          onMouseLeave={(e) => (e.currentTarget.style.background = isFullscreen ? "#1e3a5f" : "transparent")}
        >
          {isFullscreen ? "⊡" : "⛶"}
        </button>
      </div>
    </div>
  );
};
