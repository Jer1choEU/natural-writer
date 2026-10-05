import type { M5SKnowledgeSource } from "./types";

export const M5S_KNOWLEDGE_SOURCES: M5SKnowledgeSource[] = [
  {
    id: "statuto-2025",
    title: "Statuto M5S e Carta dei Principi e dei Valori",
    authority: "foundational",
    priority: 100,
    effectiveDate: "2025-06-23",
    url: "https://www.movimento5stelle.eu/doctrasparenza/STATUTO-ASSOCIAZIONE-MOVIMENTO-5-STELLE-in-vigore-dal-23-giugno-2025.pdf",
    note: "La Carta dei Principi e dei Valori è parte integrante dell'art. 2 dello Statuto.",
  },
  {
    id: "codice-etico-2025",
    title: "Codice Etico del Movimento 5 Stelle",
    authority: "ethical",
    priority: 90,
    effectiveDate: "2025-06-23",
    url: "https://www.movimento5stelle.eu/doctrasparenza/CODICE-ETICO-IN-VIGORE-DAL-23-GIUGNO-2025.pdf",
  },
  {
    id: "nova-2026-energia-casa-scuola-digitale",
    title: "NOVA 2026 — Ambiente, energia, casa, scuola, informazione e digitale",
    authority: "member-approved-policy",
    priority: 80,
    effectiveDate: "2026-09-20",
    url: "https://www.movimento5stelle.eu/wp-content/uploads/2026/09/Ambiente-energia-casa-scuola-informazione-e-digitale.pdf",
  },
  {
    id: "nova-2026-giustizia-esteri-diritti",
    title: "NOVA 2026 — Giustizia, sicurezza, esteri, immigrazione, democrazia, partecipazione e diritti",
    authority: "member-approved-policy",
    priority: 80,
    effectiveDate: "2026-09-20",
    url: "https://www.movimento5stelle.eu/wp-content/uploads/2026/09/Giustizia-sicurezza-esteri-immigrazione-democraziapartecipazione-e-diritti.pdf",
  },
  {
    id: "nova-2026-sanita-lavoro-economia",
    title: "NOVA 2026 — Sanità, welfare, lavoro ed economia",
    authority: "member-approved-policy",
    priority: 80,
    effectiveDate: "2026-09-20",
    url: "https://www.movimento5stelle.eu/wp-content/uploads/2026/09/Sanita-welfare-lavoro-ed-economia.pdf",
  },
  {
    id: "nova-2026-risultati",
    title: "NOVA 2026 — Risultati delle votazioni",
    authority: "member-approved-policy",
    priority: 80,
    effectiveDate: "2026-09-20",
    url: "https://www.movimento5stelle.eu/nova-votazione-delle-proposte-conclusive-del-percorso-partecipato-risultati/",
  },
  {
    id: "regolamento-gt-2026",
    title: "Regolamento dei Gruppi Territoriali",
    authority: "organizational",
    priority: 75,
    effectiveDate: "2026-03-14",
    url: "https://www.movimento5stelle.eu/wp-content/uploads/2026/04/Regolamento-Gruppi-Territoriali-in-vigore-dal-14.03.2026.pdf",
  },
  {
    id: "nova-2024",
    title: "NOVA 2024 — Assemblea Costituente",
    authority: "member-approved-policy",
    priority: 70,
    effectiveDate: "2024-11-24",
    url: "https://www.movimento5stelle.eu/nova2024/",
    note: "Usata come contesto storico delle priorità, non per prevalere su deliberazioni successive.",
  },
];

export const M5S_SOURCE_BY_ID = new Map(
  M5S_KNOWLEDGE_SOURCES.map((source) => [source.id, source])
);
