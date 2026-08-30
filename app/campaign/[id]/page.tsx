import Link from "next/link";

import { getCampaign } from "@/lib/campaigns";
import ShareCampaign from "@/components/ShareCampaign";
import ThemeShell from "@/components/theme/ThemeShell";

interface CampaignPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CampaignPage({
  params,
}: CampaignPageProps) {
  const { id } = await params;

  const response = await getCampaign(Number(id));

  if (!response.success || !response.data) {
    return (
      <ThemeShell>
      <main className="min-h-[60vh] bg-[#f8fafd]">
        <div className="mx-auto max-w-[1218px] px-6 py-10">
          <Link
            href="/campaign-test"
            className="text-sm font-medium text-[#5a6a85] transition-colors hover:text-[#01A14B]"
          >
            ← Back to campaigns
          </Link>

          <div className="mt-10 rounded-[16px] bg-[#f8fafd] p-10">
            <h1 className="text-2xl font-bold text-[#111c2d]">
              Campaign not found
            </h1>

            <p className="mt-2 text-[#5a6a85]">
              This campaign could not be found.
            </p>
          </div>
        </div>
      </main>
      </ThemeShell>
    );
  }

  const campaign = response.data;

  const progress =
    campaign.goal > 0
      ? Math.min(
          100,
          Math.round(
            (campaign.raised_amount / campaign.goal) * 100
          )
        )
      : 0;

  const deadline = campaign.deadline
    ? new Date(campaign.deadline).toLocaleDateString(
        "en-US",
        {
          month: "long",
          day: "numeric",
          year: "numeric",
        }
      )
    : null;

  const fundraiserName =
    campaign.fundraiser_name?.trim() ||
    "Anonymous fundraiser";

  const fundraiserInitial =
    fundraiserName.charAt(0).toUpperCase();

  const imageUrl =
    campaign.image_url ||
    campaign.images?.[0]?.url ||
    campaign.images?.[0]?.sizes?.medium?.url ||
    campaign.images?.[0]?.sizes?.woocommerce_thumbnail?.url ||
    "";

  return (
    <ThemeShell>
    <main className="min-h-screen bg-white">
      {/* ================= TOP ================= */}

      <div className="bg-[#f8fafd]"><div className="mx-auto max-w-[1218px] px-6 pt-8">
        <Link
          href="/campaign-test"
          className="text-sm font-medium text-[#5a6a85] transition-colors hover:text-[#01A14B]"
        >
          ← Back to campaigns
        </Link>
      </div>

      {/* ================= IMAGE ================= */}

      <div className="mx-auto mt-6 max-w-[1218px] px-6">
        
      </div>

      </div>

      {/* ================= MAIN ================= */}

      <div className="mx-auto max-w-[1218px] px-6 py-10">
        
        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
          

          {/* ================= STORY ================= */}

          <div>
            <div className="relative aspect-[16/7] overflow-hidden rounded-[16px] bg-gray-100 mb-10">
          {imageUrl ? (
            // Use the already-normalized campaign URL directly here. The
            // campaign cards use the same URL successfully; avoiding the
            // Next image pipeline on this server-rendered detail page also
            // avoids remote-image/proxy differences between the two views.
            <img
              src={imageUrl}
              alt={campaign.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              No image available
            </div>
          )}
        </div>
            {/* Fundraiser */}

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e6f6ed] text-sm font-bold text-[#01A14B]">
                {fundraiserInitial}
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Fundraiser
                </p>

                <p className="text-sm font-semibold text-[#111c2d]">
                  {fundraiserName}
                </p>
              </div>
            </div>

            {/* Title */}

            <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-[#111c2d] sm:text-4xl">
              {campaign.title}
            </h1>

            {/* Story */}

            <section className="mt-10">
              <h2 className="text-xl font-bold text-[#111c2d]">
                About this campaign
              </h2>

              <p className="mt-5 whitespace-pre-line text-base leading-8 text-[#5a6a85]">
                {campaign.description}
              </p>
            </section>

            {/* Campaign information */}

            <section className="mt-12 border-t border-[#e0e6eb] pt-8">
              <h2 className="text-lg font-bold text-[#111c2d]">
                Campaign information
              </h2>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">

                <div>
                  <p className="text-xs text-gray-400">
                    Fundraiser
                  </p>

                  <p className="mt-1 text-sm font-medium text-[#111c2d]">
                    {fundraiserName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Goal
                  </p>

                  <p className="mt-1 text-sm font-medium text-[#111c2d]">
                    ${campaign.goal.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Raised
                  </p>

                  <p className="mt-1 text-sm font-medium text-[#111c2d]">
                    ${campaign.raised_amount.toLocaleString()}
                  </p>
                </div>

                {deadline && (
                  <div>
                    <p className="text-xs text-gray-400">
                      Deadline
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#111c2d]">
                      {deadline}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-400">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-medium capitalize text-[#111c2d]">
                    {campaign.status}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Contributors
                  </p>

                  <p className="mt-1 text-sm font-medium text-[#111c2d]">
                    {campaign.number_of_contributors.toLocaleString()}
                  </p>
                </div>

              </div>
            </section>

            {/* ================= DONATIONS ================= */}

            <section className="mt-12 border-t border-[#e0e6eb] pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#111c2d]">
                    Recent donations
                  </h2>

                  <p className="mt-1 text-sm text-[#5a6a85]">
                    People are supporting this campaign.
                  </p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-xl bg-[#f8fafd]">
                <div className="flex items-center justify-between border-b border-[#e0e6eb] px-5 py-5">
                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f6ed] text-[#01A14B]">
                      ♥
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#111c2d]">
                        Donation activity
                      </p>

                      <p className="text-xs text-[#5a6a85]">
                        {campaign.number_of_contributions > 0
                          ? `${campaign.number_of_contributions.toLocaleString()} contributions`
                          : "No donations yet."}
                      </p>
                    </div>

                  </div>
                </div>

                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-[#5a6a85]">
                    Recent donations will appear here.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* ================= DONATION SIDEBAR ================= */}

          <aside>
            <div className="sticky top-28">
              <div className="rounded-[16px] bg-white p-6 shadow-[0_12px_30px_rgba(17,28,45,0.08)] ring-1 ring-[#e0e6eb]">

                {/* Raised */}

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-3xl font-bold tracking-tight text-[#111c2d]">
                      ${campaign.raised_amount.toLocaleString()}
                    </p>

                    <p className="mt-1 text-sm text-[#5a6a85]">
                      raised of ${campaign.goal.toLocaleString()} goal
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-[#5a6a85]">
                    {progress}%
                  </span>
                </div>

                {/* Progress */}

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#01A14B] transition-all"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                {/* Remaining */}

                <div className="mt-3 flex justify-between text-xs text-gray-400">
                  <span>
                    ${campaign.raised_amount.toLocaleString()} raised
                  </span>

                  <span>
                    ${Math.max(
                      0,
                      campaign.goal - campaign.raised_amount
                    ).toLocaleString()}{" "}
                    remaining
                  </span>
                </div>

                {/* Donate */}

                <Link
                  href={`/checkout?campaign=${campaign.id}&title=${encodeURIComponent(
                    campaign.title
                  )}`}
                  className="mt-7 block w-full rounded-full bg-[#01A14B] px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#018d42]"
                >
                  Donate to this campaign
                </Link>

                {/* Share */}

                <ShareCampaign title={campaign.title} />

                {/* Deadline */}

                {deadline && (
                  <p className="mt-6 text-center text-xs text-gray-400">
                    Campaign ends {deadline}
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
    </ThemeShell>
  );
}