import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider(props: React.ComponentProps<typeof NextThemesProvider>) {
  const { children, ...forward_props } = props;
  return <NextThemesProvider {...forward_props}>{props.children}</NextThemesProvider>;
}
