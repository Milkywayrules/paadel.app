import {
  createTheme,
  MantineProvider,
  type MantineProviderProps,
  type MantineThemeOverride,
} from "@mantine/core";

export const paadelTheme: MantineThemeOverride = createTheme({
  defaultRadius: "md",
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  primaryColor: "blue",
});

export type PaadelProviderProps = MantineProviderProps;

export function PaadelProvider({
  theme = paadelTheme,
  ...props
}: PaadelProviderProps) {
  return <MantineProvider theme={theme} {...props} />;
}

export {
  Button,
  ColorSchemeScript,
  Container,
  Group,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
