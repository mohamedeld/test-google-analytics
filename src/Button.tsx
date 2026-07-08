import GoogleAnalytics from "./analytics/GoogleAnalytics";

export const Button = () => {
  const handleClick = () => {
    console.log("click");
    GoogleAnalytics.trackEvent("button_click", {
      category: "engagement",
      label: "cta_hero",
    });
  };
  return <button onClick={handleClick}>Click</button>;
};
