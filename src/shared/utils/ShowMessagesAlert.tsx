import Swal from "sweetalert2";
import type { SweetAlertIcon } from "sweetalert2";

export function ShowMessagesAlert(
  messages: string[],
  icon: SweetAlertIcon = "info",
  title: string = "",
  confirmButtonText: string = ""
) {
  return Swal.fire({
    title: title,
    text: messages.join("\n"),
    icon,
    confirmButtonText,
  });
}
