import Swal from "sweetalert2";

export const AppSwal = Swal.mixin({
  confirmButtonColor: getComputedStyle(document.documentElement)
    .getPropertyValue("--color-primary")
    .trim(),
  cancelButtonColor: "#dc3545",
  buttonsStyling: true,
});
