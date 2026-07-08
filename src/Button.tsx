import { trackEvent } from "./analytics/GoogleAnalytics";

export const Button = () => {
  return (
    <button onClick={() => trackEvent("signup_click", { plan: "pro" })}>
      Sign up
    </button>
  );
};
