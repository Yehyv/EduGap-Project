import * as Dialog from "@radix-ui/react-dialog";
import CloseIcon from "@/assets/svgs/CloseIcon.svg?react";

type MyModalProps = {
  trigger?: React.ReactNode;
  headerTitle?: string;
  headerComponent?: React.ReactNode; // ← إضافة هذا
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  headerBgColor?: string;
  headerTextColor?: string;
};

export default function MyModal({
  trigger,
  headerTitle,
  headerComponent,
  children,
  open,
  onOpenChange,
  headerBgColor = "bg-secondary",
  headerTextColor = "text-white",
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
          <div className={`relative ${headerBgColor} px-4 py-2 pt-3`}>
            {headerComponent ? (
              headerComponent
            ) : (
              <>
                <Dialog.Title
                  className={`font-semibold text-lg ${headerTextColor} text-center`}
                >
                  {headerTitle}
                </Dialog.Title>
                <Dialog.Close className="absolute start-4 top-5 cursor-pointer hover:scale-110 transition">
                  <CloseIcon className="w-4 h-4" />
                </Dialog.Close>
              </>
            )}
          </div>

          <div className="p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
