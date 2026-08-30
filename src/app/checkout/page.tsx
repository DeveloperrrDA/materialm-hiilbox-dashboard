"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  getCheckoutCurrencies,
  getCheckoutGateways,
  processCheckout,
  type CheckoutCurrency,
  type CheckoutGateway,
} from "@/lib/donations";
import ThemeShell from "@/components/theme/ThemeShell";

interface CampaignData {
  id: number;
  title: string;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [campaign, setCampaign] =
    useState<CampaignData | null>(null);

  // Keep checkout completely empty initially.
  const [amount, setAmount] = useState("");
  const [tipPercent, setTipPercent] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [currencies, setCurrencies] = useState<CheckoutCurrency[]>([
    { code: "USD", name: "US Dollar", rate: 1 },
  ]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [walletNumber, setWalletNumber] = useState("");


  // IMPORTANT: this must be inside the component.
  const [paymentMethod, setPaymentMethod] =
    useState("");

  const [paymentGroup, setPaymentGroup] = useState<
    "somali-wallets" | "ethiopia-wallets" | "east-africa-wallets" | "other" | ""
  >("");

  const [isAnonymous, setIsAnonymous] =
    useState(false);

  const [gateways, setGateways] =
    useState<CheckoutGateway[]>([]);

  const [loadingGateways, setLoadingGateways] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // --------------------------------------------------
  // LOAD CAMPAIGN
  // --------------------------------------------------

  useEffect(() => {
    const campaignId = Number(
      searchParams.get("campaign")
    );

    const campaignTitle =
      searchParams.get("title");

    if (!campaignId || !campaignTitle) {
      router.replace("/donate");
      return;
    }

    setCampaign({
      id: campaignId,
      title: campaignTitle,
    });
  }, [searchParams, router]);

  // --------------------------------------------------
  // LOAD CURRENCIES
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    getCheckoutCurrencies()
      .then((available) => {
        if (cancelled || !available.length) return;
        setCurrencies(available);
        setCurrency((current) =>
          available.some((item) => item.code === current) ? current : "USD"
        );
      })
      .catch(() => {
        // USD remains available as the safe fallback. The order API still
        // validates the selected currency against the backend before payment.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------
  // LOAD PAYMENT GATEWAYS
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadGateways() {
      try {
        setLoadingGateways(true);
        setError("");

        const available =
          await getCheckoutGateways();

        if (cancelled) {
          return;
        }

        setGateways(available);

        // Do not leave an invalid gateway selected.
        setPaymentMethod((current) => {
          if (
            current &&
            available.some(
              (gateway) =>
                gateway.id === current
            )
          ) {
            return current;
          }

          setPaymentGroup("");
          return "";
        });
      } catch (err) {
        if (!cancelled) {
          setGateways([]);
          setPaymentMethod("");

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load payment methods."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingGateways(false);
        }
      }
    }

    loadGateways();

    return () => {
      cancelled = true;
    };
  }, []);

  const gatewayById = (id: string) =>
    gateways.find((gateway) => gateway.id === id);

  const gatewayMatching = (patterns: RegExp[]) =>
    gateways.find((gateway) => {
      const haystack = `${gateway.id} ${gateway.title}`.toLowerCase();
      return patterns.some((pattern) => pattern.test(haystack));
    });

  const walletGatewayOptions = [
    {
      key: "zes",
      label: "ZAAD, EVC, SAHAL, CASHPLUS, JEEB",
      gateway: gatewayById("zes_pay"),
    },
    {
      key: "edahab",
      label: "eDahab",
      gateway: gatewayById("edahab_pay"),
    },
    {
      key: "premier",
      label: "Premier Wallet",
      gateway: gatewayById("premier_wallet_pay"),
    },
  ];

  const ethiopiaGatewayOptions = [
    {
      key: "ebirr",
      label: "eBirr",
      gateway: gatewayMatching([/ebirr/, /e-birr/]),
    },
    {
      key: "coopay",
      label: "COOPay",
      gateway: gatewayMatching([/coopay/, /coop.?pay/]),
    },
    {
      key: "cbebirr",
      label: "CBE Birr",
      gateway: gatewayMatching([/cbe.?birr/, /cbebirr/]),
    },
  ];

  const eastAfricaGatewayOptions = [
    {
      key: "mpesa",
      label: "M-Pesa",
      gateway: gatewayMatching([/m-?pesa/, /mpesa/]),
    },
    {
      key: "mtn",
      label: "MTN",
      gateway: gatewayMatching([/mtn/]),
    },
  ];

  const cardGateway =
    gatewayById("card_pay") ||
    gatewayMatching([/card/, /visa/, /mastercard/, /credit/, /debit/]);

  const bankGateway =
    gatewayMatching([/bank.?transfer/, /bacs/, /bank/]);

  // --------------------------------------------------
  // AMOUNT / TIP
  // --------------------------------------------------

  const donationAmount =
    amount === ""
      ? 0
      : Number(amount);

  const tipAmount = useMemo(() => {
    if (
      !Number.isFinite(donationAmount) ||
      donationAmount <= 0
    ) {
      return 0;
    }

    return (
      (donationAmount * tipPercent) /
      100
    );
  }, [donationAmount, tipPercent]);

  const total =
    donationAmount + tipAmount;

  const selectedCurrency =
    currencies.find((item) => item.code === currency) ?? currencies.find((item) => item.code === "USD");

  // Minimum donation is USD 0.10 equivalent in the donor-selected currency.
  const minimumDonationUsd = 0.1;
  const selectedRate = selectedCurrency?.rate && selectedCurrency.rate > 0 ? selectedCurrency.rate : 1;
  const minimumDonationInSelectedCurrency = minimumDonationUsd * selectedRate;
  const donationAmountUsd = currency === "USD" ? donationAmount : donationAmount / selectedRate;


  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------

  function validateForm() {
    if (
      !amount ||
      !Number.isFinite(donationAmount) ||
      donationAmount <= 0
    ) {
      return "Please enter a valid donation amount.";
    }

    if (!Number.isFinite(donationAmountUsd) || donationAmountUsd < minimumDonationUsd) {
      return `Minimum donation is USD $0.10 equivalent (${currency} ${minimumDonationInSelectedCurrency.toFixed(2)}).`;
    }

    if (!firstName.trim()) {
      return "Please enter your first name.";
    }

    if (!lastName.trim()) {
      return "Please enter your last name.";
    }

    if (!email.trim()) {
      return "Please enter your email address.";
    }

    if (!phoneNumber.trim()) {
      return "Please enter your phone number.";
    }


    if (!paymentMethod) {
      return "Please select a payment method.";
    }

    const selectedGateway = gateways.find((gateway) => gateway.id === paymentMethod);
    if (selectedGateway?.requires_account && !walletNumber.trim()) {
      return "Please enter the wallet/account number for this payment method.";
    }

    return null;
  }

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!campaign) {
      setError(
        "Campaign information is missing."
      );
      return;
    }

    setLoading(true);

    try {
      const result =
        await processCheckout({
          campaign_id: campaign.id,
          amount: donationAmount,
          currency,
          tip_amount: tipAmount,

          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),

          // IMPORTANT:
          // This is the exact property expected
          // by CheckoutInput in donations.ts.
          phone: phoneNumber.trim(),

          // Billing address is intentionally not collected for the
          // wallet-first HiilBox checkout. Keep the existing order contract.
          address: "",
          address_2: "",
          city: "",
          state: "",
          zip_code: "",
          country: "",

          payment_method: paymentMethod,
          wallet_number: walletNumber.trim(),
          is_anonymous: isAnonymous,
        });

      // The payment REST endpoint returns this path only after WooCommerce
      // confirms the order is paid. Use it before considering any gateway
      // redirect so a successful Sifalo payment can never fall through to
      // WooCommerce/GrowFund's classic "donation not found" return page.
      if (result.nextjs_success_path) {
        router.replace(result.nextjs_success_path);
        return;
      }

      // Defensive fallback for older backend responses. A confirmed paid order
      // still goes to the Next.js success page using Woo order ID + order key.
      const confirmedPaid =
        result.payment_status === "paid" ||
        result.status === "processing" ||
        result.status === "completed";

      if (confirmedPaid && result.order_id) {
        router.replace(
          `/donation-success?order=${encodeURIComponent(
            String(result.order_id)
          )}&key=${encodeURIComponent(result.order_key ?? "")}`
        );
        return;
      }

      // Only follow a provider redirect while payment is genuinely still
      // pending. Successful synchronous wallet payments never reach here.
      if (result.redirect && result.payment_status === "pending") {
        window.location.href = result.redirect;
        return;
      }

      if (result.payment_status === "pending") {
        throw new Error(
          "Your payment request was started, but the gateway has not confirmed the donation yet."
        );
      }

      throw new Error(
        "The payment gateway did not return a confirmed payment result."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while processing your donation."
      );

      setLoading(false);
    }
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (!campaign) {
    return (
      <main className="min-h-screen bg-[#f7f8f7] px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-[16px] bg-white p-8 text-center shadow-[0_10px_28px_rgba(17,28,45,0.06)]">
          <p className="text-sm text-gray-500">
            Loading checkout...
          </p>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <ThemeShell>
    <main className="min-h-screen bg-[#f8fafd]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1218px]">

          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="mb-6 text-sm font-medium text-gray-600 transition hover:text-[#01A14B] disabled:opacity-50"
          >
            ← Back
          </button>

          <div className="relative mb-8 overflow-hidden rounded-[20px] border border-[#e0e6eb] bg-white p-6 shadow-[0_14px_34px_rgba(17,28,45,0.07)] before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-[#01A14B]">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#01A14B]">
                <span className="text-sm font-bold text-white">
                  H
                </span>
              </div>

              <span className="text-lg font-bold text-[#111c2d]">
                HiilBox
              </span>
            </div>

            <h1 className="mt-8 text-3xl font-bold tracking-tight text-[#111c2d] sm:text-4xl">
              Make a donation
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Support this campaign with a secure donation.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">

              {/* LEFT */}
              <div className="space-y-6">

                {/* CAMPAIGN */}
                <section className="rounded-[16px] border border-[#e0e6eb] bg-white p-6 shadow-[0_10px_28px_rgba(17,28,45,0.06)]">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#01A14B]">
                    You are supporting
                  </p>

                  <h2 className="mt-2 text-xl font-bold leading-7 text-[#111c2d]">
                    {campaign.title}
                  </h2>
                </section>

                {/* AMOUNT */}
                <section className="rounded-[16px] border border-[#e0e6eb] bg-white p-6 shadow-[0_10px_28px_rgba(17,28,45,0.06)]">
                  <h2 className="text-xl font-bold text-[#111c2d]">
                    Choose your donation
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Enter the amount you would like to donate.
                  </p>

                  <div className="mt-6">
                    <label
                      htmlFor="amount"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Donation amount
                    </label>

                    <div className="mt-2 grid gap-2 sm:grid-cols-[150px_1fr]">
                      <select
                        aria-label="Donation currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        disabled={loading}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-4 font-semibold text-[#111c2d] outline-none focus:border-[#01A14B] focus:ring-4 focus:ring-[#01A14B]/10 disabled:bg-gray-100"
                      >
                        {currencies.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.code}
                          </option>
                        ))}
                      </select>

                      <input
                        id="amount"
                        name="amount"
                        type="number"
                        min={minimumDonationInSelectedCurrency}
                        step="0.01"
                        value={amount}
                        onChange={(e) =>
                          setAmount(e.target.value)
                        }
                        disabled={loading}
                        required
                        placeholder="0.00"
                        className="w-full rounded-xl border border-gray-300 px-4 py-4 text-xl font-bold text-[#111c2d] outline-none transition placeholder:text-gray-300 focus:border-[#01A14B] focus:ring-4 focus:ring-[#01A14B]/10 disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {[10, 25, 50, 100].map(
                      (value) => {
                        const selected =
                          donationAmount === value;

                        return (
                          <button
                            key={value}
                            type="button"
                            disabled={loading}
                            onClick={() =>
                              setAmount(
                                String(value)
                              )
                            }
                            className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                              selected
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/50"
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            {currency} {value}
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* TIP */}
                  <div className="mt-8 rounded-[16px] bg-gray-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-[#111c2d]">
                          Support HiilBox
                        </p>

                        <p className="mt-1 max-w-md text-xs leading-5 text-gray-500">
                          Help us keep HiilBox running and make it possible for more people to support important causes.
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                        {tipPercent}%
                      </span>
                    </div>

                    <input
                      aria-label="HiilBox support percentage"
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={tipPercent}
                      onChange={(e) =>
                        setTipPercent(
                          Number(e.target.value)
                        )
                      }
                      disabled={loading}
                      className="mt-6 h-2 w-full cursor-pointer accent-[#01A14B] disabled:cursor-not-allowed"
                    />

                    <div className="mt-2 flex justify-between text-xs text-gray-400">
                      <span>0%</span>
                      <span>5%</span>
                      <span>10%</span>
                      <span>15%</span>
                      <span>20%</span>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                      <span className="text-xs text-gray-500">
                        HiilBox support
                      </span>

                      <span className="text-sm font-bold text-gray-700">
                        {currency} {tipAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </section>

                {/* PERSONAL INFORMATION */}
                <section className="rounded-[16px] border border-[#e0e6eb] bg-white p-6 shadow-[0_10px_28px_rgba(17,28,45,0.06)]">
                  <h2 className="text-xl font-bold text-[#111c2d]">
                    Your information
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Enter the information associated with your donation.
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">

                    {/* FIRST NAME */}
                    <div>
                      <label
                        htmlFor="first_name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        First name
                      </label>

                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        value={firstName}
                        onChange={(e) =>
                          setFirstName(e.target.value)
                        }
                        disabled={loading}
                        required
                        autoComplete="given-name"
                        className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#01A14B] focus:ring-4 focus:ring-[#01A14B]/10"
                      />
                    </div>

                    {/* LAST NAME */}
                    <div>
                      <label
                        htmlFor="last_name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Last name
                      </label>

                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        value={lastName}
                        onChange={(e) =>
                          setLastName(e.target.value)
                        }
                        disabled={loading}
                        required
                        autoComplete="family-name"
                        className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#01A14B] focus:ring-4 focus:ring-[#01A14B]/10"
                      />
                    </div>

                    {/* EMAIL */}
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email address
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        disabled={loading}
                        required
                        autoComplete="email"
                        className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#01A14B] focus:ring-4 focus:ring-[#01A14B]/10"
                      />
                    </div>

                    {/* PHONE */}
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Phone number
                      </label>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) =>
                          setPhoneNumber(e.target.value)
                        }
                        disabled={loading}
                        required
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="Enter your phone number"
                        className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#01A14B] focus:ring-4 focus:ring-[#01A14B]/10"
                      />
                    </div>

                  </div>
                </section>

                {/* PAYMENT */}
                <section className="overflow-hidden rounded-[20px] border border-[#e0e6eb] bg-white shadow-[0_12px_32px_rgba(17,28,45,0.06)]">
                  <div className="flex flex-col gap-4 border-b border-[#e0e6eb] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-[#111c2d]">
                        Complete your payment
                      </h2>
                      <p className="mt-1 text-sm text-[#5a6a85]">
                        Your support makes a real difference. Choose how you&apos;d like to pay.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#edf9f2] px-3 py-2 text-xs font-semibold text-[#018d42]">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#01A14B]/30 bg-white">✓</span>
                      Secure &amp; encrypted
                    </div>
                  </div>

                  <div className="border-b border-[#e0e6eb] px-6 py-6">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#01A14B] text-xs font-bold text-white">
                        1
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-[#111c2d]">
                          Choose where you want to pay
                        </h3>
                        <p className="mt-1 text-xs text-[#5a6a85]">
                          Select the option that works best for you.
                        </p>
                      </div>
                    </div>

                    {loadingGateways ? (
                      <div className="mt-5 grid gap-3 md:grid-cols-3">
                        {[0, 1, 2].map((item) => (
                          <div key={item} className="h-[104px] animate-pulse rounded-[14px] border border-[#e0e6eb] bg-[#f8fafd]" />
                        ))}
                      </div>
                    ) : (
                      <div className="mt-5 grid gap-3 md:grid-cols-3">
                        {[
                          {
                            id: "somali-wallets" as const,
                            title: "Pay with Waafi, eDahab, Premier Wallet",
                            subtitle: "ZAAD, EVC, SAHAL and supported Somali wallets",
                            available: walletGatewayOptions.some((item) => Boolean(item.gateway)),
                          },
                          {
                            id: "ethiopia-wallets" as const,
                            title: "Pay with eBirr, COOPay, CBE Birr",
                            subtitle: "Ethiopian mobile money options",
                            available: ethiopiaGatewayOptions.some((item) => Boolean(item.gateway)),
                          },
                          {
                            id: "east-africa-wallets" as const,
                            title: "Pay with M-Pesa, MTN",
                            subtitle: "East African mobile money options",
                            available: eastAfricaGatewayOptions.some((item) => Boolean(item.gateway)),
                          },
                        ].map((group) => {
                          const selected = paymentGroup === group.id;

                          return (
                            <button
                              key={group.id}
                              type="button"
                              disabled={loading}
                              onClick={() => {
                                setPaymentGroup(group.id);
                                setPaymentMethod("");
                                setWalletNumber("");
                                setError("");
                              }}
                              className={`relative flex min-h-[108px] items-center gap-3 rounded-[14px] border p-4 text-left transition ${
                                selected
                                  ? "border-[#01A14B] bg-[#f3fbf6] shadow-[0_8px_22px_rgba(1,161,75,0.08)]"
                                  : group.available
                                    ? "border-[#e0e6eb] bg-white hover:border-[#01A14B]/45 hover:shadow-[0_8px_22px_rgba(17,28,45,0.05)]"
                                    : "cursor-not-allowed border-[#edf0f2] bg-[#fafbfc] opacity-60"
                              }`}
                            >
                              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] text-xl ${
                                selected ? "bg-[#e2f6ea] text-[#01A14B]" : "bg-[#f3f5f7] text-[#5a6a85]"
                              }`}>
                                ▯
                              </span>

                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-bold leading-5 text-[#111c2d]">
                                  {group.title}
                                </span>
                                <span className="mt-1 block text-xs leading-4 text-[#5a6a85]">
                                  {group.available ? group.subtitle : `${group.subtitle} · providers not yet enabled`}
                                </span>
                              </span>

                              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                                selected
                                  ? "border-[#01A14B] bg-[#01A14B] text-white"
                                  : "border-[#aeb8c4] bg-white text-transparent"
                              }`}>
                                ✓
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="border-b border-[#e0e6eb] px-6 py-6">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#01A14B] text-xs font-bold text-white">
                        2
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-[#111c2d]">
                          Enter your payment details
                        </h3>
                        <p className="mt-1 text-xs text-[#5a6a85]">
                          Provide your details to receive a payment prompt.
                        </p>
                      </div>
                    </div>

                    {!paymentGroup || paymentGroup === "other" ? (
                      <div className="mt-5 rounded-[14px] border border-dashed border-[#ccd4dc] bg-[#f8fafd] px-4 py-5 text-sm text-[#5a6a85]">
                        Choose one of the mobile payment options above to see its providers.
                      </div>
                    ) : (
                      <div className="mt-5">
                        <p className="mb-3 text-sm font-bold text-[#111c2d]">
                          Mobile Money Provider <span className="text-red-500">*</span>
                        </p>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {(paymentGroup === "somali-wallets"
                            ? walletGatewayOptions
                            : paymentGroup === "ethiopia-wallets"
                              ? ethiopiaGatewayOptions
                              : eastAfricaGatewayOptions
                          ).map((provider) => {
                            const gateway = provider.gateway;
                            const selected = Boolean(gateway && paymentMethod === gateway.id);

                            return (
                              <button
                                key={provider.key}
                                type="button"
                                disabled={!gateway || loading}
                                onClick={() => {
                                  if (!gateway) return;
                                  setPaymentMethod(gateway.id);
                                  setWalletNumber("");
                                  setError("");
                                }}
                                className={`flex min-h-[54px] items-center gap-3 rounded-[12px] border px-4 py-3 text-left text-sm font-semibold transition ${
                                  selected
                                    ? "border-[#01A14B] bg-[#f3fbf6] text-[#111c2d]"
                                    : gateway
                                      ? "border-[#d8dee4] bg-white text-[#111c2d] hover:border-[#01A14B]/45"
                                      : "cursor-not-allowed border-[#edf0f2] bg-[#fafbfc] text-[#9aa6b2]"
                                }`}
                              >
                                <span className={`h-4 w-4 shrink-0 rounded-full border ${
                                  selected
                                    ? "border-[5px] border-[#01A14B]"
                                    : "border-[#aeb8c4]"
                                }`} />
                                <span className="flex-1">{provider.label}</span>
                                {!gateway && (
                                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#9aa6b2]">
                                    Unavailable
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {paymentMethod &&
                          gateways.find((gateway) => gateway.id === paymentMethod)?.requires_account && (
                            <div className="mt-5">
                              <label htmlFor="wallet_number" className="block text-sm font-bold text-[#111c2d]">
                                Phone / wallet number <span className="text-red-500">*</span>
                              </label>

                              <div className="relative mt-2">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#8a98a8]">
                                  ☎
                                </span>
                                <input
                                  id="wallet_number"
                                  name="wallet_number"
                                  type="tel"
                                  value={walletNumber}
                                  onChange={(e) => {
                                    setWalletNumber(e.target.value);
                                    if (error) setError("");
                                  }}
                                  disabled={loading}
                                  required
                                  placeholder="0900 123 4567"
                                  autoComplete="tel"
                                  inputMode="tel"
                                  className="w-full rounded-[12px] border border-[#cfd7df] bg-white py-3.5 pl-11 pr-4 text-sm text-[#111c2d] outline-none transition placeholder:text-[#9aa6b2] focus:border-[#01A14B] focus:ring-4 focus:ring-[#01A14B]/10"
                                />
                              </div>
                            </div>
                          )}

                        {paymentMethod &&
                          !gateways.find((gateway) => gateway.id === paymentMethod)?.requires_account && (
                            <div className="mt-5 rounded-[14px] border border-[#dcefe4] bg-[#f3fbf6] px-4 py-4 text-sm text-[#355c47]">
                              This provider does not require an additional wallet number.
                            </div>
                          )}
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-6">
                    <p className="mb-3 text-sm font-bold text-[#111c2d]">
                      Other payment options
                    </p>

                    <div className="space-y-3">
                      <button
                        type="button"
                        disabled={!cardGateway || loading}
                        onClick={() => {
                          if (!cardGateway) return;
                          setPaymentGroup("other");
                          setPaymentMethod(cardGateway.id);
                          setWalletNumber("");
                          setError("");
                        }}
                        className={`flex w-full items-center gap-4 rounded-[14px] border px-4 py-4 text-left transition ${
                          cardGateway
                            ? paymentMethod === cardGateway.id
                              ? "border-[#01A14B] bg-[#f3fbf6]"
                              : "border-[#e0e6eb] bg-white hover:border-[#01A14B]/45"
                            : "cursor-not-allowed border-[#edf0f2] bg-[#fafbfc] opacity-60"
                        }`}
                      >
                        <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#f1eaff] text-xl text-[#7447e8]">▣</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-[#111c2d]">Credit / Debit Card</span>
                          <span className="mt-1 block text-xs text-[#5a6a85]">
                            {cardGateway ? "Pay securely with Visa, Mastercard or other cards" : "Card payments are not currently enabled"}
                          </span>
                        </span>
                        {cardGateway && <span className="rounded bg-[#f1eaff] px-2 py-1 text-[10px] font-bold text-[#7447e8]">Secure</span>}
                        <span className="text-lg text-[#5a6a85]">›</span>
                      </button>

                      <button
                        type="button"
                        disabled={!bankGateway || loading}
                        onClick={() => {
                          if (!bankGateway) return;
                          setPaymentGroup("other");
                          setPaymentMethod(bankGateway.id);
                          setWalletNumber("");
                          setError("");
                        }}
                        className={`flex w-full items-center gap-4 rounded-[14px] border px-4 py-4 text-left transition ${
                          bankGateway
                            ? paymentMethod === bankGateway.id
                              ? "border-[#01A14B] bg-[#f3fbf6]"
                              : "border-[#e0e6eb] bg-white hover:border-[#01A14B]/45"
                            : "cursor-not-allowed border-[#edf0f2] bg-[#fafbfc] opacity-60"
                        }`}
                      >
                        <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#eef3ff] text-xl text-[#4466d8]">▥</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-[#111c2d]">Bank Transfer</span>
                          <span className="mt-1 block text-xs text-[#5a6a85]">
                            {bankGateway ? "Transfer directly from your bank" : "Bank transfer is not currently enabled"}
                          </span>
                        </span>
                        {bankGateway && <span className="rounded bg-[#eef3ff] px-2 py-1 text-[10px] font-bold text-[#4466d8]">1–3 business days</span>}
                        <span className="text-lg text-[#5a6a85]">›</span>
                      </button>
                    </div>
                  </div>
                </section>
              </div>

              {/* RIGHT SUMMARY */}
              <aside className="lg:sticky lg:top-6">
                <div className="overflow-hidden rounded-[16px] border border-[#e0e6eb] bg-white shadow-[0_10px_28px_rgba(17,28,45,0.06)]">

                  <div className="border-b border-[#e0e6eb] px-6 py-5">
                    <h2 className="text-lg font-bold text-[#111c2d]">
                      Donation summary
                    </h2>
                  </div>

                  <div className="p-6">

                    <div className="rounded-xl bg-emerald-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        Donation to
                      </p>

                      <p className="mt-2 text-sm font-bold leading-5 text-[#111c2d]">
                        {campaign.title}
                      </p>
                    </div>

                    <div className="mt-6 space-y-4">

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Donation
                        </span>

                        <span className="font-semibold text-gray-900">
                          {currency} {donationAmount.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          HiilBox support ({tipPercent}%)
                        </span>

                        <span className="font-semibold text-gray-900">
                          {currency} {tipAmount.toFixed(2)}
                        </span>
                      </div>

                    </div>

                    <div className="mt-6 border-t border-[#e0e6eb] pt-5">
                      <div className="flex items-end justify-between">

                        <span className="font-bold text-[#111c2d]">
                          Total
                        </span>

                        <span className="text-2xl font-bold text-[#01A14B]">
                          {currency} {total.toFixed(2)}
                        </span>

                      </div>
                    </div>

                    <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-[#e0e6eb] bg-[#f8fafd] p-4 transition hover:border-[#01A14B]/40">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        disabled={loading}
                        className="mt-0.5 h-4 w-4 accent-[#01A14B]"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-[#111c2d]">Make my donation anonymous</span>
                        <span className="mt-1 block text-xs leading-5 text-[#5a6a85]">Your name will not be shown publicly with this donation.</span>
                      </span>
                    </label>

                    {error && (
                      <div
                        role="alert"
                        className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                      >
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={
                        loading ||
                        loadingGateways ||
                        gateways.length === 0 ||
                        !paymentMethod ||
                        Boolean(
                          gateways.find((gateway) => gateway.id === paymentMethod)?.requires_account &&
                          !walletNumber.trim()
                        )
                      }
                      className="mt-6 w-full rounded-xl bg-[#01A14B] px-5 py-4 text-sm font-bold text-white shadow-[0_10px_28px_rgba(17,28,45,0.06)] transition hover:bg-[#018d42] focus:outline-none focus:ring-4 focus:ring-[#01A14B]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading
                        ? "Connecting to secure payment..."
                        : `Donate ${currency} ${total.toFixed(2)} →`}
                    </button>

                    <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
                      <span>🔒</span>
                      <span>
                        Secure payment powered by HiilBox
                      </span>
                    </div>

                  </div>
                </div>
              </aside>

            </div>
          </form>

        </div>
      </div>
    </main>
    </ThemeShell>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f7f8f7] px-4 py-12">
          <div className="mx-auto max-w-3xl rounded-[16px] bg-white p-8 text-center shadow-[0_10px_28px_rgba(17,28,45,0.06)]">
            <p className="text-sm text-gray-500">
              Loading checkout...
            </p>
          </div>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}