import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-sm font-mono font-bold text-brand-yellow">404 ERROR</p>
      <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">Page Not Found</h1>
      <p className="mt-2 text-sm text-dark-400">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center rounded-xl bg-brand-yellow px-5 py-2.5 text-xs font-bold text-dark-950 transition hover:bg-brand-yellowHover"
      >
        Return to Home
      </Link>
    </div>
  );
}

