import './globals.css';

export const metadata = {
  title: 'Ajaia Docs - Collaborative Document Editor',
  description: 'Lightweight collaborative document editor with rich text editing, file import, and document sharing.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
