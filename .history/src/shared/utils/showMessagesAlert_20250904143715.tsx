import Swal from "sweetalert2";

export function ShowMessagesAlert(messages: string[]) {
  return Swal.fire({
    title: "تنبيه",
    text: messages.join("\n"),
    icon: "info",
    confirmButtonText: "حسناً",
  });
}
