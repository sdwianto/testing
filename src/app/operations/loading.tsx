// FP4: Route-based loading component for Operations module
export default function OperationsLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading Operations...</p>
      </div>
    </div>
  );
}
