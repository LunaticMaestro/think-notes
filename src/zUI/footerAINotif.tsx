
import { RiRobot2Fill } from "react-icons/ri";
import { BreathingCircle } from "./breathingCircle";
import {LinkedInLink} from "./footerLN"

type FooterAIProps = {
  samplersAvailability: {
    available: number;
    total: number;
  };
};

export function FooterAI({ samplersAvailability }: FooterAIProps) {
  const busy = Math.max(
    0,
    samplersAvailability.total - samplersAvailability.available,
  );

  const isLoading = busy > 0;

  return (
    <div
      style={{
        padding: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      {isLoading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {Array.from(
            { length: samplersAvailability.available },
            (_, i) => (
              <RiRobot2Fill
                key={`available-${i}`}
                color="hsl(var(--accent))"
              />
            ),
          )}

          {Array.from({ length: busy }, (_, i) => (
            <BreathingCircle key={`busy-${i}`} size={8} />
          ))}
        </div>
      )}

      <span>
        {isLoading
          ? "Background stuff, continue to use the app."
          : "On-device AI. Only you know your notes."}
      </span>
      <span>
        <LinkedInLink
            username="/thatdeepak"
            url="https://www.linkedin.com/in/thatDeepak/"
            />
      </span>
    </div>
  );
}
