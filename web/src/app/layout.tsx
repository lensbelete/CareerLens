import type { Metadata } from "next";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { AppProviders } from "@/components/providers/app-providers";
import "@mantine/core/styles.layer.css";
import "@mantine/notifications/styles.layer.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerLens",
  description:
    "Compare your CV with job descriptions, see the overlap, and track applications.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript forceColorScheme="light" />
      </head>
      <body className="min-h-full">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
