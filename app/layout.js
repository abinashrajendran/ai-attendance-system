import "./globals.css"; // Intha line error vandha remove pannidunga

export const metadata = {
  title: "Attendance System",
  description: "Geo-Bio Attendance System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}