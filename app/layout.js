import "./globals.css";
import { Inter } from "next/font/google";

const mainFont = Inter({
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
      <body className={mainFont.className}>{children}</body>
    </html>
  );
}
