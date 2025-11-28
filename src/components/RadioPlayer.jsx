import React, { useRef, useState } from "react";
import { Play, Pause, Radio } from "lucide-react";

const RadioPlayer = () => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const streamUrl = "https://stream-relay-geo.ntslive.net/stream"; // soothing ambient station

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
    } else {
      el.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="fixed bottom-6 right-6 bg-emerald-800 text-white rounded-full shadow-lg p-4 flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-all">
      <audio ref={audioRef} src={streamUrl} preload="none" />
      <button onClick={togglePlay} aria-label="Toggle radio">
        {playing ? <Pause size={26} /> : <Radio size={26} />}
      </button>
    </div>
  );
};

export default RadioPlayer;
