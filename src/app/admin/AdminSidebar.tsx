"use client";

import { useState } from "react";

interface NavItem {
  key: string;
  label: string;
  badge: number | null;
}

interface AdminSidebarProps {
  activeSection: string;
  navItems: NavItem[];
  roleLabel: string;
  currentUser: { username: string; role: string };
}

export function AdminSidebar({
  activeSection,
  navItems,
  roleLabel,
  currentUser,
}: AdminSidebarProps) {
  const [open, setOpen] = useState(false);

  const sidebarContent = (
    <>
      <div style={{ padding: "0 20px 28px" }}>
        <a
          href="/"
          style={{
            display: "block",
            fontSize: 10,
            letterSpacing: ".12em",
            color: "var(--hull-400)",
            textDecoration: "none",
            marginBottom: 20,
            textTransform: "uppercase",
          }}
        >
          ← Início
        </a>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 15,
            color: "var(--hull-100)",
            letterSpacing: ".02em",
          }}
        >
          PACKET<span style={{ color: "var(--signal-500)" }}>·</span>LOSS
        </div>
        <div
          style={{
            fontSize: 10,
            color: "var(--hull-400)",
            marginTop: 2,
            letterSpacing: ".06em",
          }}
        >
          Painel de Admin
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {navItems.map(({ key, label, badge }) => (
          <a
            key={key}
            href={`/admin?sec=${key}`}
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "11px 20px",
              fontSize: 12,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color:
                activeSection === key ? "var(--signal-300)" : "var(--hull-300)",
              background:
                activeSection === key ? "rgba(0,229,199,0.07)" : "transparent",
              borderLeft: `2px solid ${activeSection === key ? "var(--signal-500)" : "transparent"}`,
              textDecoration: "none",
              transition: "color 0.15s",
            }}
          >
            {label}
            {badge !== null && (
              <span
                style={{
                  background:
                    key === "candidaturas"
                      ? "var(--crew-yellow)"
                      : "var(--void-400)",
                  color:
                    key === "candidaturas"
                      ? "var(--void-000)"
                      : "var(--hull-200)",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: 10,
                  minWidth: 20,
                  textAlign: "center",
                }}
              >
                {badge}
              </span>
            )}
          </a>
        ))}
      </nav>

      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--void-300)",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "var(--hull-400)",
            letterSpacing: ".06em",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          {roleLabel}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--hull-200)",
            marginBottom: 10,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {currentUser.username}
        </div>
        <form action="/auth/logout" method="POST">
          <button
            type="submit"
            style={{
              background: "var(--void-300)",
              color: "var(--hull-100)",
              border: "none",
              borderRadius: 4,
              padding: "6px 12px",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              cursor: "pointer",
              width: "100%",
              textAlign: "center",
              letterSpacing: ".08em",
              textTransform: "uppercase",
            }}
          >
            Sair
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="admin-mobile-topbar">
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 15,
            color: "var(--hull-100)",
            letterSpacing: ".02em",
          }}
        >
          PACKET<span style={{ color: "var(--signal-500)" }}>·</span>LOSS
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            background: "none",
            border: "1px solid var(--void-400)",
            borderRadius: 6,
            cursor: "pointer",
            color: "var(--hull-200)",
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          onClick={() => setOpen(false)}
          aria-label="Fechar menu"
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar${open ? " admin-sidebar--open" : ""}`}>
        {sidebarContent}
      </aside>
    </>
  );
}
