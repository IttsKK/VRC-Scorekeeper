const Ring = ({ color }: { color: "red" | "blue" | "off" }) => {
  if (color === "off") return <div className="w-14 h-4"></div>;

  const ringColor = color === "red" ? "bg-[#FF0000]" : "bg-[#0090FF]";

  return (
    <div
      className={`w-12 h-4 ${ringColor} outline-3 outline-black rounded-[12px]`}
    />
  );
};

export default Ring;
