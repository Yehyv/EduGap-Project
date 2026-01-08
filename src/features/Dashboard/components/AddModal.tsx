import * as Dialog from "@radix-ui/react-dialog";

type MyModalProps = {
  trigger?: React.ReactNode;
  headerTitle?: string;
  headerComponent?: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  headerBgColor?: string;
  headerTextColor?: string;
};

export default function AddModal({
  trigger,
  headerComponent,
  children,
  open,
  onOpenChange,
  headerBgColor,
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
            {headerComponent}
          </div>

          <div className="p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
