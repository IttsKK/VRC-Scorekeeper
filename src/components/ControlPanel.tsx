import { useState, useRef } from "react";
import ControlButton from "./ControlButton";

const ControlPanel = ({
  hasIndicator,
  activeCorner,
  addRing,
  removeRing,
  clearStake,
  setCorner,
}: {
  hasIndicator: boolean;
  activeCorner: "positive" | "negative" | "none";
  addRing: (color: "red" | "blue") => void;
  removeRing: () => void;
  clearStake: () => void;
  setCorner: (type: "positive" | "negative" | "none") => void;
}) => {
  const [holdTimeout, setHoldTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const triggeredRef = useRef(false);

  const handleCornerClick = (type: "positive" | "negative") => {
    setCorner(activeCorner === type ? "none" : type);
  };

  const handlePointerDown = () => {
    triggeredRef.current = false;
    const timeout = setTimeout(() => {
      clearStake(); // Long press clears stake
      triggeredRef.current = true;
      setHoldTimeout(null);
    }, 500);
    setHoldTimeout(timeout);
  };

  const handlePointerUp = () => {
    if (!holdTimeout) return; // Timer already fired or pointer canceled
    clearTimeout(holdTimeout);
    setHoldTimeout(null);

    // Only remove a ring if long-press didn't happen
    if (!triggeredRef.current) {
      removeRing();
      triggeredRef.current = true;
    }
  };

  const handlePointerCancel = () => {
    // Called if user swipes off button, etc.
    if (holdTimeout) {
      clearTimeout(holdTimeout);
      setHoldTimeout(null);
    }
    triggeredRef.current = false;
  };

  // Define button configurations to ensure consistency
  const cornerPositiveProps = {
    icon: "/images/corner_positive.svg",
    iconSize: "w-16 h-16",
  };

  const cornerNegativeProps = {
    icon: "/images/corner_negative.svg",
    iconSize: "w-16 h-16",
  };

  return (
    <div className="h-28 bg-background-400 flex justify-center items-center rounded-t-xl gap-2">
      {hasIndicator ? (
        <>
          <ControlButton
            onClick={() => handleCornerClick("negative")}
            isActive={activeCorner === "negative"}
            disabled={!hasIndicator}
            {...cornerNegativeProps}
          />
          <ControlButton
            onClick={() => handleCornerClick("positive")}
            isActive={activeCorner === "positive"}
            disabled={!hasIndicator}
            {...cornerPositiveProps}
          />
        </>
      ) : (
        <>
          <ControlButton
            onClick={() => {}}
            isActive={false}
            disabled={true}
            {...cornerNegativeProps}
          />
          <ControlButton
            onClick={() => {}}
            isActive={false}
            disabled={true}
            {...cornerPositiveProps}
          />
        </>
      )}

      {/* Remove ring button: no onClick—only pointer events */}
      <ControlButton
        onClick={() => {}}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerCancel}
        icon="/images/ring_negative.svg"
        iconSize="w-12 h-12"
        iconPosition="mt-[2px]"
      />

      <ControlButton
        onClick={() => addRing("blue")}
        color="blue"
        icon="/images/ring_positive.svg"
        iconSize="w-12 h-12"
        iconPosition="mb-[2px]"
      />
      <ControlButton
        onClick={() => addRing("red")}
        color="red"
        icon="/images/ring_positive.svg"
        iconSize="w-12 h-12"
        iconPosition="mb-[2px]"
      />
    </div>
  );
};

export default ControlPanel;
