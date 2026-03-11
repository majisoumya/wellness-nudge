import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/80 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-slate-800 group-[.toaster]:border-white/40 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-slate-500",
          actionButton: "group-[.toast]:bg-indigo-600 group-[.toast]:text-white group-[.toast]:rounded-lg",
          cancelButton: "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500 group-[.toast]:rounded-lg",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
