export const metadata = {
  title: "AI Visibility Pro",
  description: "Check if your website is visible to AI assistants and search engines.",
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
