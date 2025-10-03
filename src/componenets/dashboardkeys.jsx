import { memo } from "react";

const DashKeys = ({btn , buttonStatus , handleAction}) => {
  return (
    <>
      <button
        key={btn}
        className="baseBtn Keys"
        disabled={buttonStatus === btn}
        onClick={() => handleAction(btn)}
      >
        <span
          className={`spinner-border spinner-border-sm spinner margintoRight ${
            buttonStatus === btn ? "" : "d-none"
          }`}
          role="status"
          aria-hidden="true"
        ></span>
        {buttonStatus === btn
          ? btn.charAt(0).toUpperCase() + btn.slice(1) + "ing..."
          : btn.charAt(0).toUpperCase() + btn.slice(1)}
      </button>
    </>
  );
};

export default memo(DashKeys);
