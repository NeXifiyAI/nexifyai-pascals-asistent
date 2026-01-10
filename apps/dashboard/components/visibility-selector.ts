// Visibility types for chat/document visibility settings
export type VisibilityType = "public" | "private";

export interface VisibilityOption {
  value: VisibilityType;
  label: string;
  description: string;
}

export const visibilityOptions: VisibilityOption[] = [
  {
    value: "private",
    label: "Privat",
    description: "Nur für dich sichtbar",
  },
  {
    value: "public",
    label: "Öffentlich",
    description: "Für alle sichtbar",
  },
];
