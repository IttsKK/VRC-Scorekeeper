import Ring from "./Ring";

type HighStakeCounterProps = {
  ringColor: "red" | "blue" | "off"; // Current color of the ring
  onUpdate: (color: "red" | "blue" | "off") => void; // Function to update ring color in parent
};

const HighStakeCounter = ({ ringColor, onUpdate }: HighStakeCounterProps) => {
  const handleClick = () => {
    // Cycle through: none -> red -> blue -> none
    if (ringColor === "off") {
      onUpdate("red");
    } else if (ringColor === "red") {
      onUpdate("blue");
    } else {
      onUpdate("off");
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* High Stake Counter - half height of AllianceCounter */}
      <div
        className="w-15 h-7 outline-3 outline-black rounded-[15px] flex flex-col justify-center items-center bg-[#BBBBBB] md:hover:bg-[#8C8C8C] cursor-pointer"
        onMouseDown={handleClick}
      >
        <Ring color={ringColor} />
      </div>
    </div>
  );
};

export default HighStakeCounter;
