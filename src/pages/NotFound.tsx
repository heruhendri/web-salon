import { Link } from "react-router-dom"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"

export default function NotFound() {
  return (
    <div className="space-y-6">
      <PageHeader title="Halaman tidak ditemukan" subtitle="Periksa menu di sebelah kiri atau kembali ke dashboard." />
      <Link to="/dashboard">
        <Button>Kembali ke Dashboard</Button>
      </Link>
    </div>
  )
}

