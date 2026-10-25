import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-xl font-bold text-navy-900">Page not found</h1>
      <p className="mt-1 text-sm text-navy-500">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-4 inline-block text-sm font-medium text-emerald-700 underline underline-offset-2"
      >
        Go home
      </Link>
    </div>
  );
}
