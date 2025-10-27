import { useEffect, useState } from "react";
import "./index.css"; // CSS nedan

export const Loading = ({ loading }) => {
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    if (loading) {
      setIsSpinning(true); // startar snurr
      const timer = setTimeout(() => {
        setIsSpinning(false); // efter 1s (snurren), startar pulsen via CSS
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return <div className={`robot-loader ${loading ? (isSpinning ? "spin" : "pulse") : ""}`} />;
};
