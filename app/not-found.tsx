import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen spotlight-bg flex flex-col items-center justify-center px-6">
      <h1 className="font-display text-4xl font-bold text-gold mb-4">
        Not found
      </h1>
      <p className="text-muted mb-6">
        That quiz or page does not exist.
      </p>
      <Link href="/" className="text-gold hover:underline">
        Back to home
      </Link>
    </div>
  );
}
