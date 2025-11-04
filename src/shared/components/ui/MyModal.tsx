import * as Dialog from "@radix-ui/react-dialog";
import CloseIcon from "@/assets/svgs/CloseIcon.svg?react";

type MyModalProps = {
  trigger?: React.ReactNode; // ✅ custom trigger
  headerTitle: string;
  children: React.ReactNode; // ✅ modal body content
  open?: boolean; // ✅ optional controlled state
  onOpenChange?: (open: boolean) => void;
};

export default function MyModal({
  trigger,
  headerTitle,
  children,
  open,
  onOpenChange,
}: MyModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[999]" />

        <Dialog.Content
          className="
            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000]
            bg-white rounded-lg shadow-lg w-[90%] max-w-md overflow-hidden
          "
        >
          <div className="relative bg-secondary px-4 py-2 pt-3">
            <Dialog.Title className="font-semibold text-lg text-white  text-center">
              {headerTitle}
            </Dialog.Title>

            <Dialog.Close className="absolute start-4 top-5 cursor-pointer hover:scale-110 transition">
              <CloseIcon className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <div className="p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
