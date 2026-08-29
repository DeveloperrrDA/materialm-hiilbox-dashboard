import Image from "next/image";
import Link from "next/link";

import CampaignGrid from "@/components/CampaignGrid";
import ThemeShell from "@/components/theme/ThemeShell";

export const dynamic = "force-dynamic";

const categories = [
  ["Masjid", "Faith-based causes", "☪"],
  ["Orphans", "Care and protection", "♡"],
  ["Community", "Support local causes", "⌂"],
  ["Education", "Help students grow", "▣"],
  ["Health", "Medical support", "✚"],
  ["Water", "Clean water projects", "◉"],
  ["Shelter", "Homes and safety", "⌂"],
  ["Food Aid", "Meals for families", "♨"],
  ["Environment", "Protect the future", "♧"],
  ["Ramadan", "Seasonal giving", "☾"],
];

export default function Home() {
  return (
    <ThemeShell>
      <main>
        <section className="bg-[#f8fafd]">
          <div className="container-1218 grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#e6f6ed] px-5 py-2.5 text-sm font-bold text-[#01A14B]">
                <span>◇</span> Somali Crowdfunding Platform
              </div>
              <h1 className="mt-5 text-4xl font-bold leading-tight text-[#111c2d] sm:text-5xl lg:text-[56px] lg:leading-[64px]">
                A Trusted Way <span className="text-[#01A14B]">to</span>
                <span className="block">Raise Funds</span>
                <span className="block text-[#01A14B]">Online | Hiilbox</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[#5a6a85]">
                A transparent crowdfunding platform that lets people help each other and create meaningful impact through secure and transparent donations.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup" className="rounded-lg bg-[#01A14B] px-6 py-3.5 text-center text-sm font-bold text-white transition hover:bg-[#018d42]">Start Fundraising Now</Link>
                <Link href="/campaign-test" className="rounded-lg border border-[#dfe5eb] bg-white px-6 py-3.5 text-center text-sm font-bold text-[#111c2d] transition hover:border-[#01A14B] hover:text-[#01A14B]">Explore Campaigns</Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <Image src="https://cdn.hiilbox.com/2026/06/A-Trusted-Way-to-Raise-Funds-Online-Hiilbox.webp" alt="Hiilbox fundraising" width={1144} height={710} priority className="rounded-[20px]" />
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-white py-14 lg:py-20">
          <div className="container-1218">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-[#111c2d] sm:text-[44px] sm:leading-[48px]">Explore Campaigns by <span className="text-[#01A14B]">Category</span></h2>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {categories.map(([name, description, icon]) => (
                <Link href="/campaign-test" key={name} className="rounded-2xl bg-[#e8f6ee] px-4 py-5 text-center transition hover:-translate-y-1 hover:shadow-md">
                  <div className="text-3xl text-[#01A14B]">{icon}</div>
                  <div className="mt-2 font-semibold text-[#01A14B]">{name}</div>
                  <div className="mt-1 text-xs text-[#5a6a85]">{description}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f8fafd] py-14 lg:py-20">
          <div className="container-1218">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold text-[#111c2d] sm:text-[44px] sm:leading-[48px]">Explore <span className="text-[#01A14B]">Verified</span> Somali Crowdfunding Campaigns</h2>
              <p className="mt-4 text-base leading-8 text-[#5a6a85]">Discover trusted campaigns supporting health, education, emergencies, community projects, and charitable causes.</p>
            </div>
            <div className="mt-10"><CampaignGrid /></div>
          </div>
        </section>

        <section className="bg-white py-14 lg:py-20">
          <div className="container-1218">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold text-[#111c2d] sm:text-[44px] sm:leading-[48px]">Together, We Build <span className="text-[#01A14B]">Stronger Communities</span></h2>
              <p className="mt-5 text-base leading-8 text-[#5a6a85]">Hiilbox connects everyday donors and changemakers to create real, lasting impact.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[["10+", "Active Campaigns", "Campaigns currently making a difference."], ["$120K+", "Funds Raised", "Funds raised to support causes that matter."], ["400+", "Donors", "Generous people supporting change and impact."]].map(([number,title,text]) => (
                <div key={title} className="rounded-2xl bg-[#f8fafd] p-7 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#e6f6ed] font-bold text-[#01A14B]">✓</div>
                  <div className="mt-5 text-2xl font-bold text-[#111c2d]">{number}</div>
                  <h3 className="mt-1 text-xl font-bold text-[#111c2d]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5a6a85]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#01A14B] py-14 text-white lg:py-20">
          <div className="container-1218 text-center">
            <h2 className="mx-auto max-w-3xl text-3xl font-bold sm:text-[44px] sm:leading-[48px]">Turn compassion into action with Hiilbox.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/80">Start a fundraiser or support a verified campaign today.</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="rounded-lg bg-white px-6 py-3.5 text-sm font-bold text-[#01A14B]">Start Fundraising</Link>
              <Link href="/campaign-test" className="rounded-lg border border-white/40 px-6 py-3.5 text-sm font-bold text-white">Donate Now</Link>
            </div>
          </div>
        </section>
      </main>
    </ThemeShell>
  );
}
