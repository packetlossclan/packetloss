import Image from "next/image";
import type { CSSProperties } from "react";

export const CREW_HEX: Record<string, string> = {
  red: "#c1424a",
  blue: "#3d6fb8",
  green: "#4a8a5c",
  pink: "#c879a8",
  orange: "#d18854",
  yellow: "#d4c060",
  cyan: "#5db3c9",
  lime: "#7fab5a",
  purple: "#7a5db3",
  white: "#d8dae8",
  black: "#2a2d3e",
};

interface CrewmateProps {
  size?: number;
  variant?: "crew" | "impostor" | "ghost";
  hero?: boolean;
  walking?: boolean;
}

export function Crewmate({
  size = 120,
  variant = "crew",
  hero = false,
  walking = false,
}: CrewmateProps) {
  const filter = [
    variant === "ghost" ? "opacity(0.45) grayscale(0.3)" : "",
    hero
      ? "drop-shadow(0 18px 32px rgba(0,0,0,0.6))"
      : "drop-shadow(0 6px 12px rgba(0,0,0,0.4))",
  ]
    .filter(Boolean)
    .join(" ");

  const animation: string | undefined = walking
    ? "crewmate-walk 1.4s ease-in-out infinite"
    : hero
      ? "crewmate-idle 4s ease-in-out infinite"
      : undefined;

  const w = size;
  const h = Math.round(size * (198 / 150));

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        width: w,
        height: h,
        animation,
        willChange: "transform",
      }}
    >
      <Image
        src="/images/crewmate-orange.webp"
        alt="Crewmate"
        width={w}
        height={h}
        style={{ display: "block", width: "100%", height: "100%", filter }}
      />
      {variant === "impostor" && (
        <span
          style={{
            position: "absolute",
            left: `${(58 / 150) * 100}%`,
            top: `${(38 / 198) * 100}%`,
            width: `${(60 / 150) * 100}%`,
            height: `${(46 / 198) * 100}%`,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at 50% 55%, rgba(255,46,77,0.85) 0%, rgba(255,46,77,0.4) 40%, rgba(255,46,77,0) 75%)",
            mixBlendMode: "screen" as CSSProperties["mixBlendMode"],
            pointerEvents: "none",
            animation: "pulse-eye 2.4s ease-in-out infinite",
          }}
        />
      )}
    </span>
  );
}

interface CrewChipProps {
  color?: string;
  size?: number;
}

export function CrewChip({ color = "red", size = 10 }: CrewChipProps) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: CREW_HEX[color] ?? color,
        boxShadow: "0 0 0 1px rgba(0,0,0,0.4) inset, 0 0 6px rgba(0,0,0,0.5)",
        verticalAlign: "middle",
        flexShrink: 0,
      }}
    />
  );
}
