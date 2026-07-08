import GoogleAnalytics from "./analytics/GoogleAnalytics";

export const Button = () => {
  const handleClick = () => {
    console.log("click");
    GoogleAnalytics.trackEvent("button_click", {
      event_category: "engagement",
      event_label: "cta_hero",
    });
  };

  const handleSecondaryClick = () => {
    console.log("secondary click");
    GoogleAnalytics.trackEvent("button_secondary_click", {
      event_category: "engagement",
      event_label: "cta_secondary",
    });
  };

  return (
    <div>
      <button onClick={handleClick}>Click</button>
      <button onClick={handleSecondaryClick} style={{ marginLeft: "8px" }}>
        Secondary Click
      </button>
    </div>
  );
};
