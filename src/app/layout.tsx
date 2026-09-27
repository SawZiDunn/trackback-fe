import type { Metadata } from "next";
import { QueryProvider } from "@/core/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trackback | Campus Lost & Found",
  description: "A trusted place to reunite campus belongings with their owners.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
