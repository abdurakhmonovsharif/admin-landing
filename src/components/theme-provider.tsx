"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      attribute={props.attribute ?? "class"}
      defaultTheme={props.defaultTheme ?? "light"}
      enableSystem={props.enableSystem ?? true}
      disableTransitionOnChange={props.disableTransitionOnChange ?? true}
    >
      {children}
    </NextThemesProvider>
  );
}
