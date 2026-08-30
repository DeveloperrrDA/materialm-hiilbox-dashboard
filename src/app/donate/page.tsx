import Link from "next/link";
import Image from "next/image";

import { getCampaign } from "@/lib/campaigns";
import ShareCampaign from "@/components/ShareCampaign";

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
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Link
            href="/campaign-test"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            ← Back to campaigns
          </Link>

          <div className="mt-10 rounded-2xl bg-gray-50 p-10">
            <h1 className="text-2xl font-bold text-gray-900">
              Campaign not found
            </h1>

            <p className="mt-2 text-gray-500">
              This campaign could not be found.
            </p>
          </div>
        </div>
      </main>
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
    <main className="min-h-screen bg-white">
      {/* ================= TOP ================= */}

      <div className="mx-auto max-w-6xl px-6 pt-8">
        <Link
          href="/campaign-test"
          className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          ← Back to campaigns
        </Link>
      </div>

      {/* ================= IMAGE ================= */}

      <div className="mx-auto mt-6 max-w-6xl px-6">
        <div className="relative aspect-[16/7] overflow-hidden rounded-2xl bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={campaign.title}
              fill
              priority
              unoptimized
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              No image available
            </div>
          )}
        </div>
      </div>

      {/* ================= MAIN ================= */}

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">

          {/* ================= STORY ================= */}

          <div>
            {/* Fundraiser */}

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600">
                {fundraiserInitial}
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Fundraiser
                </p>

                <p className="text-sm font-semibold text-gray-900">
                  {fundraiserName}
                </p>
              </div>
            </div>

            {/* Title */}

            <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl">
              {campaign.title}
            </h1>

            {/* Story */}

            <section className="mt-10">
              <h2 className="text-xl font-bold text-gray-900">
                About this campaign
              </h2>

              <p className="mt-5 whitespace-pre-line text-base leading-8 text-gray-600">
                {campaign.description}
              </p>
            </section>

            {/* Campaign information */}

            <section className="mt-12 border-t border-gray-100 pt-8">
              <h2 className="text-lg font-bold text-gray-900">
                Campaign information
              </h2>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">

                <div>
                  <p className="text-xs text-gray-400">
                    Fundraiser
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {fundraiserName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Goal
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    ${campaign.goal.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Raised
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    ${campaign.raised_amount.toLocaleString()}
                  </p>
                </div>

                {deadline && (
                  <div>
                    <p className="text-xs text-gray-400">
                      Deadline
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {deadline}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-400">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-medium capitalize text-gray-900">
                    {campaign.status}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Contributors
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {campaign.number_of_contributors.toLocaleString()}
                  </p>
                </div>

              </div>
            </section>

            {/* ================= DONATIONS ================= */}

            <section className="mt-12 border-t border-gray-100 pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Recent donations
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    People are supporting this campaign.
                  </p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-xl bg-gray-50">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5">
                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      ♥
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Donation activity
                      </p>

                      <p className="text-xs text-gray-500">
                        {campaign.number_of_contributions > 0
                          ? `${campaign.number_of_contributions.toLocaleString()} contributions`
                          : "No donations yet."}
                      </p>
                    </div>

                  </div>
                </div>

                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-gray-500">
                    Recent donations will appear here.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* ================= DONATION SIDEBAR ================= */}

          <aside>
            <div className="sticky top-6">
              <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-gray-100">

                {/* Raised */}

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-3xl font-bold tracking-tight text-gray-900">
                      ${campaign.raised_amount.toLocaleString()}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      raised of ${campaign.goal.toLocaleString()} goal
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-gray-500">
                    {progress}%
                  </span>
                </div>

                {/* Progress */}

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
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
                  className="mt-7 block w-full rounded-full bg-emerald-500 px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
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
  );
}