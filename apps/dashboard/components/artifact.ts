// Artifact types for document/content creation
export type ArtifactKind = "text" | "code" | "image" | "sheet";

export interface Artifact {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  createdAt: Date;
}
