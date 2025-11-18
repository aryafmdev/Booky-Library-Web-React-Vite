import heroImage from "../assets/images/hero-image.png";

export default function Hero() {
  return (
    <section className="rounded-xl overflow-hidden">
      <img src={heroImage} alt="Hero" className="w-full object-cover" />
    </section>
  );
}
