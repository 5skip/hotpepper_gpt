// app/layout.tsx
import Head from 'next/head';
import "./globals.css";

export const metadata = {
  title: 'My Restaurant App',
  description: 'Google Maps and Hot Pepper API integrated restaurant search app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          async
          defer
          onLoad={() => {
            console.log("Google Maps JavaScript API script loaded.");
          }}
          onError={(e) => {
            console.error("Error loading Google Maps JavaScript API script:", e);
          }}
        ></script>
      </Head>
      <body>{children}</body>
    </html>
  );
}
