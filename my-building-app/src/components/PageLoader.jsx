// Shown while a page's code downloads; keeps height so the footer doesn't jump.
export default function PageLoader() {
  return (
    <div role="status" aria-label="Loading page" className="grid min-h-[60vh] place-items-center">
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-600 motion-reduce:animate-none" />
    </div>
  );
}
