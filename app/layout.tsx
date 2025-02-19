import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import { DataProvider } from "./components/dataProvider";

export const arabic = Noto_Sans_Arabic({
  variable: "--font-geist-sans",
  subsets: ["arabic"],
});


export const metadata: Metadata = {
  title: "Al Azal",
  description: "This app was created by Hussein Saleem fro the Al Azal shop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${arabic.variable} antialiased`}
      >
        <DataProvider>
          <div className="container mt-2 px-4 mx-auto ">
            <Header />
            {children}
          </div>
        </DataProvider>
      </body>
    </html>
  );
}
