interface RightBarProps {
  overlays?: React.ReactNode;
  title?: string;
  subTitle?: string;
  children?: React.ReactNode;
}

function RightBar({
  overlays,
  title = "Título por defecto",
  subTitle = "Subtítulo por defecto",
  children,
}: RightBarProps) {
  return (
    <div className="w-full bg-bg-100 text-text-100  h-full border-s border-s-border flex flex-col p-1">
      <div className="p-5 bg-bg-100 rounded-xl ">
        <h3>{title}</h3>
        <h5>{subTitle}</h5>
      </div>
      <div className="flex flex-col justify-center items-center flex-1">
        {overlays}
        <div className="p-1 flex-1 w-full">{children}</div>
      </div>
    </div>
  );
}

export default RightBar;
