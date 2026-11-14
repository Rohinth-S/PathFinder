import { Redirect } from "expo-router";

export default function OAuthNativeCallback() {
  // ClerkProvider in _layout.tsx will intercept the OAuth tokens from the URL.
  // We simply redirect back to the root so the user is routed appropriately based on their auth state.
  return <Redirect href="/" />;
}
