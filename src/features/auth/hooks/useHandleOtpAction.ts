import { toast } from "react-toastify";
import Swal from "sweetalert2";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../auth.types";

const useHandleOtpAction = async ({
  apiFn,
  data,
  successCallback,
  t,
}: {
  apiFn: (data: any) => Promise<any>;
  data: any;
  successCallback?: (res: any) => void;
  t: (key: string) => string;
}) => {
  try {
    const response = await apiFn(data);

    successCallback?.(response);

    toast.success(t("otp_verified_successfully"));
  } catch (error: unknown) {
    const err = error as AxiosError<ApiErrorResponse>;
    const errorMessage = Array.isArray(err.response?.data?.message)
      ? err.response?.data?.message[0]
      : err.response?.data?.message || t("verification_failed_title");

    Swal.fire({
      title: errorMessage,
      text: t("verification_failed_message"),
      icon: "error",
      confirmButtonText: t("okay"),
    });
  }
};

export default useHandleOtpAction;
