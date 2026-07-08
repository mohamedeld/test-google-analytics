import GoogleAnalytics from "./analytics/GoogleAnalytics";

export const Button = () => {
  const handleClick = () => {
    console.log("click");
    GoogleAnalytics.trackEvent("add_to_cart", {
      event_category: "engagement",
      event_label: "cta_hero",
    });
  };

  const handleSecondaryClick = () => {
    console.log("secondary click");
    GoogleAnalytics.trackEvent("secondary_click", {
      event_category: "engagement",
      event_label: "cta_secondary",
      event_id: `secondary-${Date.now()}`,
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
