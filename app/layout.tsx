export const metadata = {
  title: 'CampusConnect',
  description: 'Connect with your campus community',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}