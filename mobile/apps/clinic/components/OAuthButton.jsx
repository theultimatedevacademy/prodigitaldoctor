// apps/clinic/components/OAuthButton.jsx
import React, { useCallback, useEffect } from "react";
import { TouchableOpacity, Text, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useOAuth } from "@clerk/clerk-expo";

WebBrowser.maybeCompleteAuthSession();

export default function OAuthButton({
  strategy = "oauth_google",
  children,
  style,
}) {
  const { startOAuthFlow } = useOAuth({ strategy });
  const router = useRouter();

  // Warm up the browser (for Android)
  useEffect(() => {
    if (Platform.OS === "android") {
      WebBrowser.warmUpAsync();
      return () => WebBrowser.coolDownAsync();
    }
  }, []);

  const onPress = useCallback(async () => {
    try {
      const isExpoGo = Constants.appOwnership === "expo";

      // Always produce a redirect URL as a plain string
      const redirectUrl = isExpoGo
        ? AuthSession.makeRedirectUri({ useProxy: true })
        : AuthSession.makeRedirectUri({
            scheme: "ocura360",
            path: "oauth-callback",
          });

      // Safety: ensure it's a valid string
      if (typeof redirectUrl !== "string" || redirectUrl.length === 0) {
        throw new Error("redirectUrl is undefined or not a string");
      }

      // Clean up any Expo Router artifacts
      const cleanedRedirectUrl = redirectUrl.replace("/--", "").trim();

      console.log("[OAuth] isExpoGo:", isExpoGo);
      console.log("[OAuth] redirectUrl (raw):", redirectUrl);
      console.log("[OAuth] redirectUrl (cleaned):", cleanedRedirectUrl);

      // Start OAuth flow with a guaranteed string URL
      const result = await startOAuthFlow({
        redirectUrl: cleanedRedirectUrl,
      });

      if (result?.createdSessionId && result?.setActive) {
        await result.setActive({ session: result.createdSessionId });
        console.log("[OAuth] ✅ Session created successfully!");

        if (isExpoGo) {
          router.replace("/oauth-callback");
        }
      } else {
        console.log("[OAuth] ℹ️ OAuth flow did not complete:", result);
      }
    } catch (err) {
      console.error("[OAuth] error (full):", err);
      alert(`OAuth error: ${err.message || JSON.stringify(err)}`);
    }
  }, [router, startOAuthFlow]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#ddd",
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          gap: 6,
        },
        style,
      ]}
    >
      {typeof children === "string" ? <Text>{children}</Text> : children}
    </TouchableOpacity>
  );
}
