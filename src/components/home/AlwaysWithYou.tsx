import Image from "next/image";
import Link from "next/link";

export default function AlwaysWithYou() {
  return (
    <section className="relative w-full h-[400px] sm:h-[500px] md:h-[650px] bg-[#0c1a2a] overflow-hidden flex items-center">
      <div className="absolute inset-0">
        <Image
          src="/home-new-bg-free-img.png"
          alt="Laptop Background"
          fill
          className="object-cover opacity-100"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 items-center h-full">
        <div className="text-white space-y-3 sm:space-y-4 text-center md:text-left">
          <p className="text-sm sm:text-lg opacity-80">Future of Gadgets is always with you</p>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight">We are here for you</h1>
          <p className="text-xs sm:text-base max-w-md opacity-90 mx-auto md:mx-0">
            Contact Us for more best deals, We will surely assist you with the best solutions.
          </p>
          <p className="text-sm sm:text-lg font-medium opacity-95">
            We believe on built relationships with customers
          </p>
          <Link
            href="/products"
            className="inline-block mt-3 sm:mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-white text-black font-semibold rounded shadow hover:bg-gray-200 transition text-sm sm:text-base"
          >
            SHOP NOW
          </Link>
        </div>
      </div>
    </section>
  );
}