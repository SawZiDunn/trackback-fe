import type { Metadata, Viewport } from "next";
import { QueryProvider } from "@/core/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TrackBack",
    template: "%s | TrackBack",
  },
  description: "A trusted place to reunite campus belongings with their owners.",
  applicationName: "TrackBack",
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
