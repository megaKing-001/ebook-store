export default function Footer() {
  return (
    <footer className="bg-ink text-parchment mt-24">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row justify-between gap-4 text-sm text-parchment/70">
        <p>&copy; {new Date().getFullYear()} The Reading Room. All rights reserved.</p>
        <p>Secure checkout powered by Paystack.</p>
      </div>
    </footer>
  );
}
