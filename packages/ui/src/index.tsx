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
  Alert,
  Badge,
  Button,
  Card,
  ColorSchemeScript,
  Container,
  CopyButton,
  Group,
  Loader,
  Paper,
  PasswordInput,
  Select,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
