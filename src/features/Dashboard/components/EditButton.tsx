import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";

type EditButtonProps<T> = {
  editFn: (data: T) => Promise<any>;

  payload: T;

  successMessage: string;

  onSuccessAction: () => void;
};

const EditButton = <T,>({
  editFn,
  payload,
  successMessage,
  onSuccessAction,
}: EditButtonProps<T>) => {
  const { mutate, isPending } = useMutation({
    mutationFn: editFn,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: successMessage,
        timer: 1500,
        showConfirmButton: false,
      });

      // 👇 THE ONLY THING THAT CHANGES — YOUR CUSTOM LOGIC
      onSuccessAction();
    },

    onError: () => {
      Swal.fire({
        icon: "error",
        title: "حدث خطأ، حاول مرة أخرى",
      });
    },
  });

  return (
    <button
      className="cursor-pointer"
      onClick={() => mutate(payload)}
      disabled={isPending}
    >
      <EditIcon />
    </button>
  );
};

export default EditButton;
