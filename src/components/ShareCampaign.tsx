"use client";

import { useState } from "react";

interface ShareCampaignProps {
  title: string;
}

export default function ShareCampaign({
  title,
}: ShareCampaignProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        window.location.href
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

  function shareFacebook() {
    const url = encodeURIComponent(window.location.href);

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "width=600,height=500"
    );
  }

  function shareX() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);

    window.open(
      `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      "_blank",
      "width=600,height=500"
    );
  }

  function shareWhatsApp() {
    const url = encodeURIComponent(
      `${title}\n${window.location.href}`
    );

    window.open(
      `https://wa.me/?text=${url}`,
      "_blank"
    );
  }

  return (
    <div className="mt-8 flex basis-full flex-row items-center justify-between">

      <p className="text-sm font-semibold text-gray-900">
        Share this campaign
      </p>

      <div>
        <hr className="border-t border-gray-300 my-4" />
      </div>

      <div className="flex items-center justify-self-end gap-3">

        <button
          type="button"
          onClick={shareFacebook}
          aria-label="Share on Facebook"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-100 bg-white text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          f
        </button>

        <button
          type="button"
          onClick={shareX}
          aria-label="Share on X"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-100 bg-white text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          𝕏
        </button>

        <button
          type="button"
          onClick={shareWhatsApp}
          aria-label="Share on WhatsApp"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-100 bg-white text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          W
        </button>

        <button
          type="button"
          onClick={copyLink}
          aria-label="Copy campaign link"
          className="rounded-full border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>

      </div>
    </div>
  );
}