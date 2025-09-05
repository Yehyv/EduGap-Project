import Swal from "sweetalert2";

export function showMessagesAlert(messages: string[]) {
  return Swal.fire({
    title: "Warn",
    text: messages,
    icon: "info",
    confirmButtonText: "تمام",
  });
}
