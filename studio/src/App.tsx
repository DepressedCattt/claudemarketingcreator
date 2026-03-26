import React, { useEffect } from "react";
import { useStudio }        from "./store/useStudio";
import { checkHealth, listAudioFiles, loadStudioState, listSfx, loadCues } from "./api";
import { Header }           from "./components/Header";
import { LeftPanel }        from "./components/LeftPanel";
import { PreviewPlayer }    from "./components/PreviewPlayer";
import { PropertiesPanel }  from "./components/PropertiesPanel";
import { Timeline }         from "./components/Timeline";
import { REGISTRY }         from "./registry";

const POLL_MS = 4000;

export const App: React.FC = () => {
  const { setAudioFiles, setServerOnline, setAudioTracks, setSfxMap, setCues, activeCompId } = useStudio();

  // Poll server health + refresh audio library
  useEffect(() => {
    const poll = async () => {
      const ok = await checkHealth();
      setServerOnline(ok);
      if (ok) {
        try {
          const files = await listAudioFiles();
          setAudioFiles(files);
        } catch { /* server briefly offline */ }

        try {
          const state = await loadStudioState();
          Object.entries(state.audioTracks ?? {}).forEach(([id, tracks]) => {
            setAudioTracks(id, tracks);
          });
        } catch { /* first run, no state yet */ }

        try {
          const lib = await listSfx();
          const map: Record<string, string> = {};
          for (const [key, defaultId] of Object.entries(lib.defaults)) {
            if (!defaultId) continue;
            const entry = lib.entries.find(e => e.id === defaultId);
            if (entry) map[key] = `/audio/sfx/${entry.file}`;
          }
          setSfxMap(map);
        } catch { /* no sfx library yet */ }

        try {
          const apiCues = await loadCues(activeCompId);
          if (apiCues.length > 0) {
            setCues(activeCompId, apiCues);
          } else {
            const reg = REGISTRY.find((c) => c.id === activeCompId);
            if (reg?.cues?.length) setCues(activeCompId, reg.cues);
          }
        } catch { /* no cues yet */ }
      }
    };

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [setAudioFiles, setServerOnline, setAudioTracks, setSfxMap, setCues, activeCompId]);

  return (
    <div style={{
      display:             "grid",
      gridTemplateRows:    "44px 1fr 260px",
      gridTemplateColumns: "260px 1fr 260px",
      gridTemplateAreas:   `"header  header  header"
                            "left    center  right"
                            "timeline timeline timeline"`,
      height:   "100vh",
      width:    "100vw",
      overflow: "hidden",
      background: "#111",
    }}>
      <div style={{ gridArea: "header" }}>
        <Header />
      </div>

      <div style={{ gridArea: "left", borderRight: "1px solid #2a2a2a", overflow: "hidden" }}>
        <LeftPanel />
      </div>

      <div style={{ gridArea: "center", background: "#141414", overflow: "hidden" }}>
        <PreviewPlayer />
      </div>

      <div style={{ gridArea: "right", borderLeft: "1px solid #2a2a2a", overflow: "hidden" }}>
        <PropertiesPanel />
      </div>

      <div style={{ gridArea: "timeline", borderTop: "1px solid #2a2a2a", overflow: "hidden" }}>
        <Timeline />
      </div>
    </div>
  );
};
