import AdminNotes from "@/components/AdminNotes";

export default function PMSNotesPage() {
  return (
    <AdminNotes
      system="pms"
      systemLabel="Project Management System"
      systemIcon="📋"
      backRoute="/pms"
    />
  );
}
