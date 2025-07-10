import * as React from "react";

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ open, onOpenChange, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center ${
          open ? "" : "hidden"
        }`}
        {...props}
      >
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[90vh] flex overflow-hidden">
          {children}
        </div>
      </div>
    );
  }
);
Dialog.displayName = "Dialog";

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={`flex h-full ${className}`} {...props} />
));
DialogContent.displayName = "DialogContent";

const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => (
  <button
    ref={ref}
    className="absolute top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    onClick={onClick}
    {...props}
  >
    Close
  </button>
));
DialogClose.displayName = "DialogClose";

export { Dialog, DialogContent, DialogClose };
