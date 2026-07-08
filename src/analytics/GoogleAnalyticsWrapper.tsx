import { useLocation } from "react-router-dom";
import GoogleAnalytics from "./GoogleAnalytics";

function GoogleAnalyticsWrapper() {
  const location = useLocation();
  return <GoogleAnalytics measurementId="G-0FW2W48YBN" location={location} />;
}

export default GoogleAnalyticsWrapper;
