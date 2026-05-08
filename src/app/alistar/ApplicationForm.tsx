"use client";

import { useState, useEffect, useTransition } from "react";
import { submitApplication } from "./actions";

interface IbgeState {
  id: number;
  sigla: string;
  nome: string;
}

interface IbgeCity {
  id: number;
  nome: string;
}

interface Props {
  username: string;
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  color: "var(--hull-300)",
  letterSpacing: ".10em",
  textTransform: "uppercase",
  marginBottom: 6,
  fontFamily: "var(--font-mono)",
};

const inputStyle: React.CSSProperties = {
  background: "var(--void-200)",
  border: "1px solid var(--void-400)",
  borderRadius: 6,
  color: "var(--hull-100)",
  fontFamily: "var(--font-mono)",
  fontSize: 14,
  padding: "10px 14px",
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 0.15s",
};

const fieldStyle: React.CSSProperties = { marginBottom: 20 };

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "none",
};

export function ApplicationForm({ username }: Props) {
  const [country, setCountry] = useState("Brasil");
  const [states, setStates] = useState<IbgeState[]>([]);
  const [cities, setCities] = useState<IbgeCity[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isPending, startTransition] = useTransition();

  // Load Brazilian states from IBGE
  useEffect(() => {
    if (country !== "Brasil") {
      setStates([]);
      setCities([]);
      setSelectedState("");
      setSelectedCity("");
      return;
    }
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then((r) => r.json())
      .then((data: IbgeState[]) => setStates(data))
      .catch(() => setStates([]));
  }, [country]);

  // Load cities when state changes
  useEffect(() => {
    if (!selectedState || country !== "Brasil") {
      setCities([]);
      setSelectedCity("");
      return;
    }
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios?orderBy=nome`,
    )
      .then((r) => r.json())
      .then((data: IbgeCity[]) => setCities(data))
      .catch(() => setCities([]));
  }, [selectedState, country]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => {
      submitApplication(fd);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ── Seção: Dados Pessoais ── */}
      <SectionTitle>Dados Pessoais</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="fullName">
            Nome completo *
          </label>
          <input
            id="fullName"
            name="fullName"
            required
            placeholder="Seu nome real"
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="nick">
            Nick no Discord
          </label>
          <input
            id="nick"
            name="nick"
            value={username}
            readOnly
            style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="birthDate">
            Data de nascimento *
          </label>
          <input
            id="birthDate"
            name="birthDate"
            type="date"
            required
            style={{ ...inputStyle, colorScheme: "dark" }}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="country">
            País *
          </label>
          <select
            id="country"
            name="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={selectStyle}
          >
            <option value="Brasil">Brasil</option>
            <option value="Argentina">Argentina</option>
            <option value="Chile">Chile</option>
            <option value="Colômbia">Colômbia</option>
            <option value="México">México</option>
            <option value="Portugal">Portugal</option>
            <option value="EUA">Estados Unidos</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="state">
            Estado *
          </label>
          {country === "Brasil" ? (
            <select
              id="state"
              name="state"
              required
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity("");
              }}
              style={selectStyle}
            >
              <option value="">
                {states.length === 0 ? "Carregando..." : "Selecione o estado"}
              </option>
              {states.map((s) => (
                <option key={s.id} value={s.sigla}>
                  {s.nome}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="state"
              name="state"
              required
              placeholder="Estado / Província"
              style={inputStyle}
            />
          )}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="city">
            Cidade *
          </label>
          {country === "Brasil" ? (
            <select
              id="city"
              name="city"
              required
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedState}
              style={{ ...selectStyle, opacity: selectedState ? 1 : 0.5 }}
            >
              <option value="">
                {!selectedState
                  ? "Selecione o estado primeiro"
                  : cities.length === 0
                    ? "Carregando..."
                    : "Selecione a cidade"}
              </option>
              {cities.map((c) => (
                <option key={c.id} value={c.nome}>
                  {c.nome}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="city"
              name="city"
              required
              placeholder="Sua cidade"
              style={inputStyle}
            />
          )}
        </div>
      </div>

      {/* ── Seção: Sobre no jogo ── */}
      <SectionTitle>No Jogo</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="favoriteRole">
            Papel favorito *
          </label>
          <select id="favoriteRole" name="favoriteRole" style={selectStyle}>
            <option value="both">Ambos</option>
            <option value="crewmate">Tripulante</option>
            <option value="impostor">Impostor</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="amogusHours">
            Horas em Among Us *
          </label>
          <input
            id="amogusHours"
            name="amogusHours"
            type="number"
            min={0}
            max={99999}
            required
            placeholder="Ex: 500"
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="hoursPerWeek">
            Horas/semana disponíveis *
          </label>
          <input
            id="hoursPerWeek"
            name="hoursPerWeek"
            type="number"
            min={0}
            max={168}
            required
            placeholder="Ex: 10"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="otherGames">
          Outros jogos que você joga
        </label>
        <input
          id="otherGames"
          name="otherGames"
          placeholder="CS2, Valorant, League of Legends..."
          style={inputStyle}
        />
      </div>

      {/* ── Seção: Motivação ── */}
      <SectionTitle>Motivação</SectionTitle>

      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="howFound">
          Como conheceu o Packet Loss?
        </label>
        <select id="howFound" name="howFound" style={selectStyle}>
          <option value="">Prefiro não informar</option>
          <option value="amigo">Por um amigo / membro do clã</option>
          <option value="discord">Servidor do Discord</option>
          <option value="reddit">Reddit / fórum</option>
          <option value="youtube">YouTube / stream</option>
          <option value="site">Busca no Google / site</option>
          <option value="outro">Outro</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="reason">
          Por que quer entrar no clã? *
          <span
            style={{
              marginLeft: 8,
              fontSize: 10,
              color: "var(--hull-400)",
              textTransform: "none",
              letterSpacing: 0,
            }}
          >
            mínimo 50 caracteres
          </span>
        </label>
        <textarea
          id="reason"
          name="reason"
          required
          minLength={50}
          rows={5}
          placeholder="Conte-nos sobre sua motivação, experiência com o jogo, objetivos no clã..."
          style={{
            ...inputStyle,
            resize: "vertical",
            lineHeight: 1.6,
            minHeight: 120,
          }}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="extraInfo">
          Informações adicionais
          <span
            style={{
              marginLeft: 8,
              fontSize: 10,
              color: "var(--hull-400)",
              textTransform: "none",
              letterSpacing: 0,
            }}
          >
            opcional
          </span>
        </label>
        <textarea
          id="extraInfo"
          name="extraInfo"
          rows={3}
          placeholder="Algo mais que queira compartilhar? Habilidades especiais, conquistas, etc."
          style={{
            ...inputStyle,
            resize: "vertical",
            lineHeight: 1.6,
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          paddingTop: 8,
          flexWrap: "wrap",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--hull-400)",
          }}
        >
          * campos obrigatórios
        </p>
        <button
          type="submit"
          disabled={isPending}
          style={{
            background: isPending ? "var(--void-400)" : "var(--signal-500)",
            color: isPending ? "var(--hull-300)" : "var(--void-000)",
            border: "none",
            borderRadius: 6,
            padding: "12px 28px",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: ".10em",
            textTransform: "uppercase",
            cursor: isPending ? "not-allowed" : "pointer",
            boxShadow: isPending ? "none" : "var(--glow-signal)",
            transition: "background 0.2s, box-shadow 0.2s",
          }}
        >
          {isPending ? "Enviando..." : "Enviar candidatura →"}
        </button>
      </div>
    </form>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
        marginTop: 8,
        paddingBottom: 10,
        borderBottom: "1px solid var(--void-300)",
      }}
    >
      <span
        style={{
          width: 3,
          height: 16,
          background: "var(--signal-500)",
          borderRadius: 2,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "var(--hull-200)",
        }}
      >
        {children}
      </h2>
    </div>
  );
}
