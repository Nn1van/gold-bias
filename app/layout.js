import "./globals.css";
import { Bodoni_Moda } from "next/font/google";

const luxuryFont = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
