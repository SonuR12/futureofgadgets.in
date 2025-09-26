import OrdersAdminTable from "@/components/admin/orders-admin-table"
import ProductAdminTable from "@/components/admin/product-admin-table"
import UsersAdminTable from "@/components/admin/users-admin-table"


export const metadata = {
  title: "Admin Dashboard",
  description: "Manage products, orders, and users",
}

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-foreground text-balance">Admin Dashboard</h1>

      <div className="grid gap-8">
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">Products</h2>
          <ProductAdminTable />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">Orders</h2>
          <OrdersAdminTable />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">Users</h2>
          <UsersAdminTable />
        </section>
      </div>
    </main>
  )
}
