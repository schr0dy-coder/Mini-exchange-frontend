import { useContext } from "react";
import { BackendStatusContext } from "../context/BackendStatusContext";

export default function BackendRebootMessage() {
  const { isBackendDown } = useContext(BackendStatusContext);

  if (!isBackendDown) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md text-center">
        <div className="mb-6">
          <div className="inline-block">
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center animate-bounce">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5a4 4 0 100-8 4 4 0 000 8z"
                />
              </svg>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Backend Rebooting
        </h2>

        <p className="text-gray-600 mb-4">
          The backend server is currently rebooting.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <p className="text-sm text-blue-800 font-medium">
            ⏱️ This may take up to 11 minutes
          </p>
          <p className="text-xs text-blue-700 mt-2">
            Please wait… we're bringing your exchange back online.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Attempting to reconnect…
          </p>
          <div className="flex gap-1 justify-center mt-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
