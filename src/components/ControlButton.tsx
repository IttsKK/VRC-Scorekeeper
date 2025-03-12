const ControlButton = ({
  onClick,
  onMouseDown,
  onMouseUp,
  onTouchStart,
  onTouchEnd,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onPointerLeave,
  isActive = false,
  disabled = false,
  children,
  color,
  icon,
  iconSize = "w-12 h-12",
  iconPosition = "",
}: {
  onClick: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  onPointerCancel?: () => void;
  onPointerLeave?: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  color?: "red" | "blue";
  icon?: string;
  iconSize?: string;
  iconPosition?: string;
}) => {
  // Generate the base class for the button
  let baseClass = "";

  if (disabled) {
    baseClass = "bg-gray-600";
  } else if (isActive) {
    baseClass = "bg-[#555555] md:hover:bg-[#444444] active:bg-[#333333]";
  } else if (color === "red") {
    baseClass = "bg-red-500 md:hover:bg-red-600 active:bg-red-700";
  } else if (color === "blue") {
    baseClass = "bg-blue-500 md:hover:bg-blue-600 active:bg-blue-700";
  } else {
    baseClass = "bg-gray-500 md:hover:bg-gray-600 active:bg-gray-700";
  }

  // Generate the icon class for filter effects
  const iconClass = disabled
    ? "opacity-60"
    : "transition-filter duration-150 md:group-hover:brightness-90 group-active:brightness-75";

  return (
    <button
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerLeave={onPointerLeave}
      disabled={disabled}
      className={`w-16 h-16 rounded-[15px] outline-3 outline-black cursor-pointer flex justify-center items-center transition-colors duration-150 group select-none ${baseClass}`}
    >
      {icon && (
        <img
          src={icon}
          alt="Button icon"
          className={`${iconSize} ${iconPosition} ${iconClass} select-none pointer-events-none`}
          draggable="false"
        />
      )}
      {children}
    </button>
  );
};

export default ControlButton;
