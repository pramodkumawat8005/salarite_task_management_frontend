import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Salarite | Virtual HR Workspace",
  description: "Task tracking and interview coordination workspace.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
