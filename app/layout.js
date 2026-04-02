import "./globals.css";

export const metadata = {
  title: "Gold Bias",
  description: "Gold Bias reference page"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
