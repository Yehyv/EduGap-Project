import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useLanguage } from "@/shared/localization/useLanguage";
import SaveIcon from "@/assets/svgs/SaveIconWhite.svg?react";
import SavedIcon from "@/assets/svgs/SavedIcon.svg?react";
import { useAuth } from "@/features/auth/context/AuthContext";
type InvalidateQuery = {
  queryKey: unknown[];
  exact?: boolean;
};

const SaveButton = ({
  isSaved,
  id,
  messageForSaved,
  messageForUnSaved,
  saveFunction,
  invalidateQueriesKeys = [],
}: {
  isSaved: boolean;
  id: number;
  messageForSaved: string;
  messageForUnSaved: string;
  invalidateQueriesKeys?: InvalidateQuery[];

  saveFunction: (id: number) => Promise<void>;
}) => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  const { t } = useLanguage();
  const { mutateAsync, isPending } = useMutation<void, Error, number>({
    mutationFn: (contentId: number) => saveFunction(contentId),
    onSuccess: () => {
      if (isSaved) {
        toast.warn(messageForUnSaved);
      } else {
        toast.success(messageForSaved);
      }

      invalidateQueriesKeys.forEach((query) => {
        queryClient.invalidateQueries({
          queryKey: query.queryKey,
          exact: query.exact ?? false,
        });
      });
    },
    onError: () => {
      toast.error(t("save_failed"));
    },
  });
  return (
    <>
      <motion.button
        className="rounded-full grid place-items-center cursor-pointer absolute start-2 top-1/2 -translate-y-1/2"
        whileHover={!isPending ? { scale: 1.1 } : {}}
        whileTap={!isPending ? { scale: 0.9 } : {}}
        disabled={isPending}
        onClick={() => {
          if (token) {
            mutateAsync(id ?? 0);
          } else {
            toast.warning(t("must_be_logged_in"));
          }
        }}
      >
        {!isPending &&
          (isSaved ? (
            <SavedIcon className="w-5 h-5" />
          ) : (
            <SaveIcon className="w-5 h-5" />
          ))}
        {isPending && (
          <motion.div
            className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              ease: "linear",
            }}
          />
        )}
      </motion.button>
    </>
  );
};

export default SaveButton;
