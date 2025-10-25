// apps/clinic/app/oauth-callback.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Button,
} from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useRouter, Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function OAuthCallback() {
  const [initialUrl, setInitialUrl] = useState(null);
  const [handled, setHandled] = useState(false);
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const url = await Linking.getInitialURL();
        console.log("[oauth-callback] Linking.getInitialURL ->", url);
        setInitialUrl(url ?? "(none)");
      } catch (e) {
        console.error("[oauth-callback] getInitialURL error", e);
        setInitialUrl(`error: ${String(e)}`);
      }

      // try to close browser tab if possible
      try {
        await WebBrowser.dismissBrowser();
      } catch (e) {
        // ignore
      }

      // small delay to let Clerk context initialize
      setTimeout(() => setHandled(true), 500);
    })();
  }, []);

  // When Clerk is loaded and handled is true, redirect to appropriate route
  if (isLoaded && handled) {
    if (isSignedIn) return <Redirect href="/(tabs)/dashboard" />;
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 12, fontWeight: "600" }}>
        Completing sign-in…
      </Text>
      <Text style={{ marginTop: 18, fontSize: 12, color: "#666" }}>
        Initial URL received by app:
      </Text>
      <Text selectable style={{ marginTop: 8 }}>
        {initialUrl ?? "loading..."}
      </Text>

      <View style={{ height: 24 }} />

      <Button
        title="Open callback URL in browser (for debug)"
        onPress={() => {
          // open the same proxy URL so you can inspect the web response
          const proxy =
            "https://auth.expo.io/@ashish.blackhawk/ocura360-clinic/oauth-callback";
          void Linking.openURL(proxy);
        }}
      />
    </ScrollView>
  );
}
