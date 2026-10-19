import { notifications } from "@mantine/notifications";

export function notifySuccess(message: string, title = "Done") {
  notifications.show({
    title,
    message,
    color: "teal",
    withBorder: true,
    autoClose: 4000,
  });
}

export function notifyError(message: string, title = "Something went wrong") {
  notifications.show({
    title,
    message,
    color: "red",
    withBorder: true,
    autoClose: 6000,
  });
}
