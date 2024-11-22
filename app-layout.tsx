tsx
import { UserfrontProvider, SignUpForm } from "@userfront/next/client";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <UserfrontProvider tenantId="6nzz556n">
          {children}
        </UserfrontProvider>
      </body>
    </html>
  );
}
export default indexpage;