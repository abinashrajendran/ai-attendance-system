export const metadata = {
  title: "Attendance System",
  description: "Geo-Bio Attendance System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Tailwind CSS CDN - Design work aagurathuku ithu podhum */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}