import { Outlet } from "react-router-dom";
import { Skeleton } from "@/components/dev/Skeleton";

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-neutral">
      <aside className="hidden w-64 shrink-0 border-r border-tertiary/10 lg:block">
        <Skeleton
          elemento="AdminSidebar"
          responsable="Nicolas"
          className="h-full rounded-none border-y-0 border-l-0"
        />
      </aside>

      <div className="flex flex-1 flex-col">
        <Skeleton
          elemento="Header Admin"
          responsable="Nicolas"
          className="h-16 rounded-none border-x-0 border-t-0"
        />
        <main className="mx-auto w-full max-w-page flex-1 px-4 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
