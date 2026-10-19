"use client";

import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "@/lib/auth-context";
import { ConfirmProvider } from "@/components/ui/confirm-modal";

const theme = createTheme({
  primaryColor: "teal",
  fontFamily: '"Source Sans 3", ui-sans-serif, system-ui, sans-serif',
  defaultRadius: "sm",
  colors: {
    teal: [
      "#f4f8f5",
      "#d7e2d8",
      "#b3c8b8",
      "#8aab92",
      "#668f73",
      "#4d7a5c",
      "#3d6b54",
      "#2c5442",
      "#16382c",
      "#0f261e",
    ],
  },
  components: {
    Notification: {
      defaultProps: {
        withBorder: true,
        radius: "sm",
      },
      styles: {
        root: {
          backgroundColor: "#ffffff",
          border: "1px solid #e5e5e5",
          boxShadow: "0 12px 32px -16px rgba(22, 19, 15, 0.28)",
          padding: "12px 14px",
        },
        title: {
          color: "#16130f",
          fontFamily: '"Source Sans 3", ui-sans-serif, system-ui, sans-serif',
          fontSize: "13px",
          fontWeight: 600,
        },
        description: {
          color: "#6b6560",
          fontFamily: '"Source Sans 3", ui-sans-serif, system-ui, sans-serif',
          fontSize: "13px",
        },
        closeButton: {
          color: "#6b6560",
        },
      },
    },
    Modal: {
      defaultProps: {
        centered: true,
        radius: "sm",
      },
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} forceColorScheme="light">
      <Notifications position="top-right" zIndex={500} />
      <AuthProvider>
        <ConfirmProvider>{children}</ConfirmProvider>
      </AuthProvider>
    </MantineProvider>
  );
}
