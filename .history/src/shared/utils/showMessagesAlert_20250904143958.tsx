import { AppSwal } from "./AppSwal";

export function ShowMessagesAlert(messages: string[]) {
  return AppSwal.fire({
    title: "تنبيه",
    text: messages.join("\n"),
    icon: "info",
    confirmButtonText: "حسناً",
  });
}
