import TestPage from "./TestPage";

export default function Index() {
  // The route protection is handled in App.tsx
  // If user reaches here, they are authenticated
  return <TestPage />;
}
