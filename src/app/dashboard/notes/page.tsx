import AdminNotes from "@/components/AdminNotes";

export default function DashboardNotesPage() {
  return (
    <AdminNotes
      system="dashboard"
      systemLabel="Dashboard"
      systemIcon="🚀"
      backRoute="/dashboard"
    />
  );
}
