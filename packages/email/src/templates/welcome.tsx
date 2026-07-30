import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

export interface WelcomeEmailProps {
  appUrl: string;
  displayName: string;
}

export function WelcomeEmail({ displayName, appUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Paadel — your padel match hub</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Welcome, {displayName}</Heading>
          <Text style={text}>
            Paadel helps you create casual matches and invite other players.
            Your account is ready — open the app to get started.
          </Text>
          <Button href={appUrl} style={button}>
            Open Paadel
          </Button>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  margin: "40px auto",
  maxWidth: "480px",
  padding: "32px",
};

const heading = {
  color: "#111827",
  fontSize: "24px",
  fontWeight: "700",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  padding: "12px 20px",
  textDecoration: "none",
};
