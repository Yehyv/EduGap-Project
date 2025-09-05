import Swal from "sweetalert2";

export function showMessagesAlert(messages: string[]) {
  const htmlContent = `
    <ul style="text-align: right; direction: rtl; list-style: none; padding: 0;">
      ${messages.map((msg) => `<li>• ${msg}</li>`).join("")}
    </ul>
  `;

  return Swal.fire({
    title: "Warn",
    html: htmlContent,
    icon: "info",
    confirmButtonText: "تمام",
  });
}
