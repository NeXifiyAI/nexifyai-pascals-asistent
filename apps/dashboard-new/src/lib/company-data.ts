/**
 * ============================================================
 * NEXIFY AI - COMPANY DATA
 * Firmendaten für Impressum, Rechnungen, Angebote
 * ============================================================
 */

export const companyData = {
  // ============================================================
  // BASIC INFO
  // ============================================================
  name: "NeXify AI",
  legalName: "NeXify AI", // Anpassen wenn GmbH/UG etc.
  tagline: "Chat it. Automate it.",
  motto: "KI-gestützte Automatisierung für Ihr Business",

  // ============================================================
  // OWNER / REPRESENTATIVE
  // ============================================================
  owner: {
    firstName: "Pascal",
    lastName: "Courbois",
    fullName: "Pascal Courbois",
    title: "Gründer & Geschäftsführer",
    email: "p.courbois@icloud.com",
  },

  // ============================================================
  // CONTACT
  // ============================================================
  contact: {
    email: "info@nexify-automate.com",
    supportEmail: "support@nexify-automate.com",
    phone: "", // TODO: Add phone number
    website: "https://nexify-automate.com",
    calendly: "", // TODO: Add booking link
  },

  // ============================================================
  // ADDRESS
  // ============================================================
  address: {
    street: "", // TODO: Add street
    houseNumber: "",
    zip: "", // TODO: Add ZIP
    city: "", // TODO: Add city
    state: "", // Bundesland
    country: "Deutschland",
    countryCode: "DE",
  },

  // ============================================================
  // LEGAL / TAX
  // ============================================================
  legal: {
    vatId: "", // USt-IdNr. (z.B. DE123456789)
    taxId: "", // Steuernummer
    registryCourt: "", // Handelsregister (z.B. Amtsgericht Köln)
    registryNumber: "", // HRB Nummer
    smallBusiness: true, // Kleinunternehmerregelung §19 UStG?
    smallBusinessNote: "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.",
  },

  // ============================================================
  // BANK DETAILS
  // ============================================================
  bank: {
    accountHolder: "Pascal Courbois",
    bankName: "", // TODO: Add bank name
    iban: "", // TODO: Add IBAN
    bic: "", // TODO: Add BIC
  },

  // ============================================================
  // SOCIAL MEDIA
  // ============================================================
  social: {
    github: "https://github.com/NeXifiyAI",
    linkedin: "", // TODO
    twitter: "", // TODO
    instagram: "", // TODO
  },

  // ============================================================
  // BRANDING
  // ============================================================
  branding: {
    primaryColor: "#2563eb", // Royal Blue
    secondaryColor: "#d4a00a", // Gold
    accentColor: "#3b82f6", // Light Blue
    logoUrl: "/logo.svg",
    faviconUrl: "/favicon.ico",
    ogImageUrl: "/og-image.png",
  },

  // ============================================================
  // INVOICE SETTINGS
  // ============================================================
  invoice: {
    prefix: "NX",
    startNumber: 1,
    paymentTerms: 14, // Days
    defaultTaxRate: 0, // 0 if Kleinunternehmer, otherwise 19
    currency: "EUR",
    currencySymbol: "€",
    footer: [
      "Vielen Dank für Ihr Vertrauen.",
      "Bei Fragen stehen wir Ihnen gerne zur Verfügung.",
    ],
  },

  // ============================================================
  // OFFER SETTINGS
  // ============================================================
  offer: {
    prefix: "AG",
    startNumber: 1,
    validityDays: 30,
    defaultTaxRate: 0,
  },

  // ============================================================
  // SERVICE OFFERINGS
  // ============================================================
  services: [
    {
      id: "ai-code-agent",
      name: "AI Code Agent",
      description: "24/7 Code-Assistent für Ihr Entwicklungsprojekt",
      priceMonthly: 299,
      features: [
        "Automatische Code-Reviews",
        "Bug-Fixes und Optimierungen",
        "Dokumentation generieren",
        "Test-Erstellung",
      ],
    },
    {
      id: "ai-content-agent",
      name: "AI Content Agent",
      description: "Automatisierte Content-Erstellung",
      priceMonthly: 199,
      features: [
        "Blog-Artikel",
        "Social Media Posts",
        "Newsletter",
        "SEO-optimierte Texte",
      ],
    },
    {
      id: "ai-support-agent",
      name: "AI Support Agent",
      description: "Intelligenter Chatbot trainiert auf Ihr Business",
      priceMonthly: 149,
      features: [
        "Kundenanfragen beantworten",
        "FAQ automatisieren",
        "Lead-Qualifizierung",
        "24/7 Verfügbarkeit",
      ],
    },
    {
      id: "ai-design-agent",
      name: "AI Design Agent",
      description: "KI-gestützte Grafik-Erstellung",
      priceMonthly: 249,
      features: [
        "Social Media Grafiken",
        "Logo-Varianten",
        "Banner & Ads",
        "Präsentationen",
      ],
    },
    {
      id: "ai-seo-agent",
      name: "AI SEO Agent",
      description: "Automatische SEO-Optimierung",
      priceMonthly: 179,
      features: [
        "Keyword-Recherche",
        "Meta-Optimierung",
        "Content-Analyse",
        "Ranking-Reports",
      ],
    },
    {
      id: "ai-legal-agent",
      name: "AI Legal Agent",
      description: "Rechtstexte und DSGVO-Compliance",
      priceMonthly: 99,
      features: [
        "AGB Generator",
        "Datenschutzerklärung",
        "Impressum",
        "DSGVO-Check",
      ],
    },
    {
      id: "full-ai-suite",
      name: "Full AI Suite",
      description: "Alle AI Agents in einem Paket",
      priceMonthly: 799,
      features: [
        "Alle 6 AI Agents",
        "Priority Support",
        "Custom Integrationen",
        "Dedizierter Account Manager",
      ],
      popular: true,
    },
  ],

  // ============================================================
  // IMPRESSUM TEXT (Generated)
  // ============================================================
  getImpressum(): string {
    const { owner, address, contact, legal } = this;

    return `
# Impressum

## Angaben gemäß § 5 TMG

${this.legalName}
${address.street} ${address.houseNumber}
${address.zip} ${address.city}
${address.country}

## Vertreten durch

${owner.fullName}

## Kontakt

E-Mail: ${contact.email}
${contact.phone ? `Telefon: ${contact.phone}` : ""}
Website: ${contact.website}

${legal.vatId ? `## Umsatzsteuer-ID\n\nUmsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:\n${legal.vatId}` : ""}

${legal.registryCourt ? `## Handelsregister\n\n${legal.registryCourt}\nRegisternummer: ${legal.registryNumber}` : ""}

## Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV

${owner.fullName}
${address.street} ${address.houseNumber}
${address.zip} ${address.city}

## EU-Streitschlichtung

Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
https://ec.europa.eu/consumers/odr/

Unsere E-Mail-Adresse finden Sie oben im Impressum.

## Verbraucherstreitbeilegung

Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
    `.trim();
  },

  // ============================================================
  // DATENSCHUTZ HEADER (Needs full document)
  // ============================================================
  getDataProtectionHeader(): string {
    const { owner, address, contact } = this;

    return `
# Datenschutzerklärung

## 1. Datenschutz auf einen Blick

### Allgemeine Hinweise

Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.

### Verantwortlicher

${this.legalName}
${owner.fullName}
${address.street} ${address.houseNumber}
${address.zip} ${address.city}
E-Mail: ${contact.email}
    `.trim();
  },
} as const;

// Type export
export type CompanyData = typeof companyData;
export type Service = (typeof companyData.services)[number];

export default companyData;
