import "./SideMenu.css";

const COLORS = ["red", "blue", "green", "yellow", "white"];
const VARIANTS = ["A", "B"];

function SideMenu({
  isOpen,
  onClose,
  soldRanges,
  onRangesChange,
  availableCount,
}) {
  const handleRangeChange = (color, variant, value) => {
    onRangesChange((prev) => ({
      ...prev,
      [color]: {
        ...prev[color],
        [variant]: value,
      },
    }));
  };

  return (
    <>
      {isOpen && <div className="overlay" onClick={onClose}></div>}
      <div className={`side-menu ${isOpen ? "open" : ""}`}>
        <div className="side-menu-header">
          <h2>Configuration</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="side-menu-content">
          <div className="info-box">
            <p>
              <strong>Available Tickets:</strong> {availableCount}
            </p>
            <p className="help-text">
              Enter ticket ranges (e.g., "1-50, 60-80" or "1, 5, 10-20")
            </p>
          </div>

          {COLORS.map((color) => (
            <div key={color} className="color-section">
              <h3 className={`color-title color-${color}`}>
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </h3>
              {VARIANTS.map((variant) => (
                <div key={variant} className="range-input-group">
                  <label>
                    Variant {variant}:
                    <input
                      type="text"
                      value={soldRanges[color][variant]}
                      onChange={(e) =>
                        handleRangeChange(color, variant, e.target.value)
                      }
                      placeholder="e.g., 1-50, 60-80"
                      className="range-input"
                    />
                  </label>
                  {soldRanges[color][variant] && (
                    <div className="range-display">
                      <small>Configured: {soldRanges[color][variant]}</small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default SideMenu;
