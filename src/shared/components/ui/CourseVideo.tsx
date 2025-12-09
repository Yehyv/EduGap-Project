import React, { useRef, useState } from "react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";

export default function CourseVideo({ videoUrl }) {
  const [lastTime, setLastTime] = useState(0);
  const playerRef = useRef(null);

  const playerOptions = {
    controls: [
      "play-large",
      "play",
      "progress",
      "current-time",
      "mute",
      "volume",
      "settings",
      "fullscreen",
    ],
  };

  return (
    <div className="video-wrapper">
      <Plyr
        ref={playerRef}
        source={{
          type: "video",
          sources: [
            {
              src: videoUrl,
              type: "video/mp4",
            },
          ],
        }}
        options={playerOptions}
        onTimeUpdate={(e) => {
          const current = e.detail.plyr.currentTime;
          setLastTime(current);
        }}
        onSeeking={(e) => {
          const player = e.detail.plyr;
          if (player.currentTime > lastTime) {
            player.currentTime = lastTime; // يمنع التقديم
          }
        }}
      />
    </div>
  );
}
