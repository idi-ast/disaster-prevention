import { useState } from "react";

interface BottomBarProps {
  overlays?: React.ReactNode;
  title?: string;
  subTitle?: string;
  children?: React.ReactNode;
}

function BottomBar({
  overlays,
  title = "Título por defecto",
  children,
}: BottomBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div
      onClick={() => {
        if (!isOpen) setIsOpen(true);
      }}
      className={`w-full bg-bg-100 ${isOpen ? "h-70" : "h-10 bg-bg-300 cursor-pointer"} transition-all ease-in-out duration-200 border-t border-t-border border-s border-s-border flex flex-col`}
    >
      <div className="p-2 flex items-center gap-2 justify-between">
        <h3>{title}</h3>
        <small
          onClick={handleToggle}
          className="text-text-200 bg-bg-300 px-2 cursor-pointer"
        >
          click para {isOpen ? "ocultar" : "abrir"}
        </small>
        {overlays}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default BottomBar;
