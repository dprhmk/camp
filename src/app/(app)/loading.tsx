import { Loading } from "@/components/ui/feedback";

/**
 * Global navigation fallback for all authenticated screens: shown instantly
 * while the target page's server component is still fetching, so every tap
 * on a nav link gives immediate feedback.
 */
export default function AppLoading() {
  return <Loading />;
}
