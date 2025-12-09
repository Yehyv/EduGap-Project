import { FC } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import DeleteIcon from "@/assets/svgs/TrashIconDashboard.svg?react";

type Props = {
  deleteApi: () => Promise<any>; // API Function (from parent)
  successMessage: string; // Message on success
  errorMessage: string; // Message on error
  refetchFunction: string;
};

const DeleteButton: FC<Props> = ({
  deleteApi,
  successMessage,
  errorMessage,
  refetchFunction,
}) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteApi,
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: successMessage,
        timer: 1500,
        showConfirmButton: true,
      });
      queryClient.invalidateQueries({ queryKey: [refetchFunction] });
    },
    onError: () => {
      Swal.fire({
        icon: "error",
        title: errorMessage,
        timer: 1500,
        showConfirmButton: true,
      });
    },
  });

  const handleDelete = () => {
    Swal.fire({
      title: "هل انت متأكد؟",
      text: "لا يمكنك التراجع بعد الحذف!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    }).then((result) => {
      if (result.isConfirmed) {
        mutation.mutate();
      }
    });
  };

  return (
    <button className="cursor-pointer" onClick={handleDelete}>
      <DeleteIcon />
    </button>
  );
};

export default DeleteButton;
