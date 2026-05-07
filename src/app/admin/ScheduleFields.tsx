"use client";

import { useState } from "react";

export type ScheduleType =
  | "minutes"
  | "hours"
  | "days"
  | "once"
  | "daily_time"
  | "specific_dates";

interface Props {
  defaultType?: ScheduleType;
  defaultInterval?: number | null;
  defaultTime?: string | null;
  defaultDates?: string | null;
}

const inputStyle: React.CSSProperties = {
  background: "var(--void-200)",
  border: "1px solid var(--void-400)",
  borderRadius: 4,
  color: "var(--hull-100)",
  fontFamily: "var(--font-mono)",
  fontSize: 13,
  padding: "6px 10px",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  color: "var(--hull-300)",
  letterSpacing: ".06em",
  textTransform: "uppercase",
  marginBottom: 4,
};

const fieldStyle: React.CSSProperties = { marginBottom: 14 };

const btnSmall: React.CSSProperties = {
  background: "var(--void-300)",
  color: "var(--hull-100)",
  border: "none",
  borderRadius: 4,
  padding: "6px 12px",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const btnRemove: React.CSSProperties = {
  background: "var(--impostor-500)",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  padding: "6px 10px",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  cursor: "pointer",
};

const INTERVAL_DEFAULTS: Record<string, number> = {
  minutes: 30,
  hours: 24,
  days: 7,
};

const TYPE_LABELS: Record<ScheduleType, string> = {
  minutes: "A cada N minutos",
  hours: "A cada N horas",
  days: "A cada N dias",
  once: "Hora definida (uma vez só)",
  daily_time: "Hora definida (todos os dias)",
  specific_dates: "Hora definida em datas específicas",
};

export function ScheduleFields({
  defaultType = "hours",
  defaultInterval,
  defaultTime,
  defaultDates,
}: Props) {
  const [type, setType] = useState<ScheduleType>(defaultType);
  const [interval, setInterval] = useState<number>(
    defaultInterval ?? INTERVAL_DEFAULTS[defaultType] ?? 24,
  );
  const [dates, setDates] = useState<string[]>(() => {
    try {
      return defaultDates ? JSON.parse(defaultDates) : [];
    } catch {
      return [];
    }
  });

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as ScheduleType;
    setType(newType);
    if (!defaultInterval && INTERVAL_DEFAULTS[newType]) {
      setInterval(INTERVAL_DEFAULTS[newType]);
    }
  };

  const addDate = () => setDates((d) => [...d, ""]);
  const removeDate = (i: number) => setDates((d) => d.filter((_, j) => j !== i));
  const updateDate = (i: number, val: string) =>
    setDates((d) => d.map((v, j) => (j === i ? val : v)));

  const intervalLabel =
    type === "minutes" ? "minutos" : type === "hours" ? "horas" : "dias";

  return (
    <div>
      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="scheduleType">Tipo de periodicidade</label>
        <select
          id="scheduleType"
          name="scheduleType"
          value={type}
          onChange={handleTypeChange}
          style={inputStyle}
        >
          {(Object.keys(TYPE_LABELS) as ScheduleType[]).map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      {(type === "minutes" || type === "hours" || type === "days") && (
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="scheduleInterval">Intervalo ({intervalLabel})</label>
          <input
            id="scheduleInterval"
            name="scheduleInterval"
            type="number"
            min={1}
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            required
            style={inputStyle}
          />
        </div>
      )}

      {type === "once" && (
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="scheduleTime-once">Data e hora (única)</label>
          <input
            id="scheduleTime-once"
            name="scheduleTime"
            defaultValue={defaultTime ?? ""}
            required
            style={inputStyle}
          />
        </div>
      )}

      {type === "daily_time" && (
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="scheduleTime-daily">Horário diário</label>
          <input
            id="scheduleTime-daily"
            name="scheduleTime"
            defaultValue={defaultTime ?? ""}
            required
            style={inputStyle}
          />
        </div>
      )}

      {type === "specific_dates" && (
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="scheduleDates-0">
            Datas específicas ({dates.length} selecionada
            {dates.length !== 1 ? "s" : ""})
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {dates.map((d, i) => (
              <div key={d + String(i)} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  id={i === 0 ? "scheduleDates-0" : undefined}
                  type="datetime-local"
                  value={d}
                  onChange={(e) => updateDate(i, e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button type="button" onClick={() => removeDate(i)} style={btnRemove}>
                  ×
                </button>
              </div>
            ))}
            <div>
              <button type="button" onClick={addDate} style={btnSmall}>
                + Adicionar data
              </button>
            </div>
          </div>
          <input
            type="hidden"
            name="scheduleDates"
            value={JSON.stringify(dates.filter(Boolean))}
          />
        </div>
      )}
    </div>
  );
}
