import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import { DataProvider } from "./components/dataProvider";
import DynamicTitle from "./components/DynamicTitle";

export const arabic = Noto_Sans_Arabic({
  variable: "--font-geist-sans",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Hussein Saleem',
    default: 'Hussein Saleem',
  },
  description: `This app was created by Hussein Saleem for the Al Azal shop`,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-shortcut.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${arabic.variable} antialiased`}>
        <DataProvider>
          <DynamicTitle />
          <div className="container mt-2 px-4 mx-auto">
            <Header />
            {children}
          </div>
        </DataProvider>
      </body>
    </html>
  );
}