"use client";

import { Modal } from "@mantine/core";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opened, setOpened] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    message: "",
  });
  const resolveRef = useRef<(value: boolean) => void>(() => undefined);

  const confirm = useCallback((next: ConfirmOptions) => {
    setOptions(next);
    setOpened(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  function finish(value: boolean) {
    setOpened(false);
    resolveRef.current(value);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal
        opened={opened}
        onClose={() => finish(false)}
        title={options.title}
        centered
        radius="sm"
        size="sm"
        overlayProps={{ backgroundOpacity: 0.35, color: "#16130f", blur: 2 }}
        classNames={{
          content: "border border-line bg-white shadow-none",
          header: "px-5 pb-0 pt-5",
          title: "font-serif text-xl font-medium tracking-tight text-ink",
          body: "px-5 pb-5 pt-3",
          close: "text-ink hover:bg-ink/5",
        }}
      >
        <p className="text-sm leading-6 text-muted">{options.message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => finish(false)}>
            {options.cancelLabel ?? "Cancel"}
          </Button>
          <Button
            type="button"
            variant={options.danger ? "danger" : "primary"}
            onClick={() => finish(true)}
          >
            {options.confirmLabel ?? "OK"}
          </Button>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return context.confirm;
}
