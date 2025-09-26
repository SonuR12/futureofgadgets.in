export const metadata = {
  title: "Order Placed",
}

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="mb-3 text-2xl font-semibold text-foreground">Thank you! 🎉</h1>
      <p className="text-foreground/80">
        Your order has been placed successfully. You will receive an email confirmation shortly.
      </p>
      <p className="mt-6 text-sm text-foreground/70">Track orders in the Admin Dashboard under Orders (demo).</p>
    </main>
  )
}
