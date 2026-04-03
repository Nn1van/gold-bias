import "./globals.css";
import { Playfair_Display } from "next/font/google";

const luxuryFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata = {
  title: "Gold Bias",
  description: "Gold trading dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={luxuryFont.className}>{children}</body>
    </html>
  );
}
