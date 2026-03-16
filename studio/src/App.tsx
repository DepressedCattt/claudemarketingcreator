import React, { useEffect } from "react";
import { useStudio }        from "./store/useStudio";
import { checkHealth, listAudioFiles, loadStudioState } from "./api";
import { Header }           from "./components/Header";
import { LeftPanel }        from "./components/LeftPanel";
import { PreviewPlayer }    from "./components/PreviewPlayer";
import { PropertiesPanel }  from "./components/PropertiesPanel";
import { Timeline }         from "./components/Timeline";

const POLL_MS = 4000;

export const App: React.FC = () => {
  const { setAudioFiles, setServerOnline, setAudioTracks } = useStudio();

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
      }
    };

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [setAudioFiles, setServerOnline, setAudioTracks]);

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
