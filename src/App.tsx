import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { HouseholdListPage } from "@/features/households/pages/HouseholdListPage";
import { HouseholdDetailPage } from "@/features/households/pages/HouseholdDetailPage";
import { InsightsPage } from "@/features/insights/pages/InsightsPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry once, but never retry on 4xx client errors (e.g. 404, 401, 403)
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
      staleTime: 30_000,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HouseholdListPage />} />
            <Route path="households/:id" element={<HouseholdDetailPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="bottom-right" />
    </QueryClientProvider>
  );
}
