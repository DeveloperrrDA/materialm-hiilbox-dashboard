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

  const [address, setAddress] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");

  // IMPORTANT: this must be inside the component.
  const [paymentMethod, setPaymentMethod] =
    useState("");

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

    if (!address.trim()) {
      return "Please enter your address.";
    }

    if (!city.trim()) {
      return "Please enter your city.";
    }

    if (!zipCode.trim()) {
      return "Please enter your ZIP/postal code.";
    }

    if (!country.trim()) {
      return "Please enter your country.";
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

          address: address.trim(),
          address_2: address2.trim(),
          city: city.trim(),
          state: state.trim(),
          zip_code: zipCode.trim(),
          country: country.trim(),

          payment_method: paymentMethod,
          wallet_number: walletNumber.trim(),
          is_anonymous: isAnonymous,
        });

      // A synchronous wallet gateway can return WooCommerce's normal
      // order-received redirect even though the payment is already complete.
      // In headless checkout we must keep confirmed payments in Next.js.
      // Only follow a gateway redirect while payment is still pending.
      if (result.redirect && result.payment_status !== "paid") {
        window.location.href = result.redirect;
        return;
      }

      // Confirmed/immediate payments land on the headless success page.
      // The order key lets that page securely reload the WooCommerce order.
      if (result.order_id) {
        router.push(
          `/donation-success?order=${encodeURIComponent(
            String(result.order_id)
          )}&key=${encodeURIComponent(result.order_key ?? "")}`
        );
        return;
      }

      if (result.donation_id) {
        router.push(
          `/donation-success?donation=${encodeURIComponent(
            String(result.donation_id)
          )}`
        );
        return;
      }

      throw new Error(
        "The payment gateway did not return a payment result."
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

          <div className="mb-8 rounded-[16px] bg-white p-6 shadow-[0_10px_28px_rgba(17,28,45,0.05)]">
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
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">

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
                        min="1"
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

                  <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) =>
                        setIsAnonymous(
                          e.target.checked
                        )
                      }
                      disabled={loading}
                      className="h-4 w-4 accent-[#01A14B]"
                    />

                    <span>
                      Make this donation anonymous
                    </span>
                  </label>
                </section>

                {/* BILLING */}
                <section className="rounded-[16px] border border-[#e0e6eb] bg-white p-6 shadow-[0_10px_28px_rgba(17,28,45,0.06)]">
                  <h2 className="text-xl font-bold text-[#111c2d]">
                    Billing address
                  </h2>

                  <div className="mt-6 space-y-4">

                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Address
                      </label>

                      <input
                        id="address"
                        name="address"
                        type="text"
                        value={address}
                        onChange={(e) =>
                          setAddress(e.target.value)
                        }
                        disabled={loading}
                        required
                        autoComplete="street-address"
                        className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#01A14B] focus:ring-4 focus:ring-[#01A14B]/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="address2"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Address line 2{" "}
                        <span className="font-normal text-gray-400">
                          (optional)
                        </span>
                      </label>

                      <input
                        id="address2"
                        name="address_2"
                        type="text"
                        value={address2}
                        onChange={(e) =>
                          setAddress2(e.target.value)
                        }
                        disabled={loading}
                        autoComplete="address-line2"
                        className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#01A14B] focus:ring-4 focus:ring-[#01A14B]/10"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">

                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-700"
                        >
                          City
                        </label>

                        <input
                          id="city"
                          name="city"
                          type="text"
                          value={city}
                          onChange={(e) =>
                            setCity(e.target.value)
                          }
                          disabled={loading}
                          required
                          autoComplete="address-level2"
                          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#01A14B] focus:ring-4 focus:ring-[#01A14B]/10"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="state"
                          className="block text-sm font-medium text-gray-700"
                        >
                          State / Region
                        </label>

                        <input
                          id="state"
                          name="state"
                          type="text"
                          value={state}
                          onChange={(e) =>
                            setState(e.target.value)
                          }
                          disabled={loading}
                          autoComplete="address-level1"
                          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#01A14B] focus:ring-4 focus:ring-[#01A14B]/10"
                        />
                      </div>

                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">

                      <div>
                        <label
                          htmlFor="zip_code"
                          className="block text-sm font-medium text-gray-700"
                        >
                          ZIP / Postal code
                        </label>

                        <input
                          id="zip_code"
                          name="zip_code"
                          type="text"
                          value={zipCode}
                          onChange={(e) =>
                            setZipCode(e.target.value)
                          }
                          disabled={loading}
                          required
                          autoComplete="postal-code"
                          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#01A14B] focus:ring-4 focus:ring-[#01A14B]/10"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="country"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Country
                        </label>

                        <input
                          id="country"
                          name="country"
                          type="text"
                          value={country}
                          onChange={(e) =>
                            setCountry(e.target.value)
                          }
                          disabled={loading}
                          required
                          autoComplete="country-name"
                          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#01A14B] focus:ring-4 focus:ring-[#01A14B]/10"
                        />
                      </div>

                    </div>

                  </div>
                </section>

                {/* PAYMENT */}
                <section className="rounded-[16px] border border-[#e0e6eb] bg-white p-6 shadow-[0_10px_28px_rgba(17,28,45,0.06)]">
                  <h2 className="text-xl font-bold text-[#111c2d]">
                    Payment method
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Choose how you would like to complete your donation.
                  </p>

                  <div className="mt-5">

                    {loadingGateways ? (
                      <div className="rounded-xl bg-gray-50 px-4 py-4 text-sm text-gray-500">
                        Loading available payment methods...
                      </div>
                    ) : gateways.length === 0 ? (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                        No payment methods are currently available.
                      </div>
                    ) : (
                      <div className="space-y-3">

                        {gateways.map(
                          (gateway) => (
                            <label
                              key={gateway.id}
                              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                                paymentMethod ===
                                gateway.id
                                  ? "border-emerald-500 bg-emerald-50"
                                  : "border-gray-200 hover:border-emerald-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="payment_method"
                                value={gateway.id}
                                checked={
                                  paymentMethod ===
                                  gateway.id
                                }
                                onChange={(e) =>
                                  setPaymentMethod(
                                    e.target.value
                                  )
                                }
                                disabled={loading}
                                className="mt-1 accent-[#01A14B]"
                              />

                              <span>
                                <span className="block text-sm font-semibold text-[#111c2d]">
                                  {gateway.title}
                                </span>

                                {gateway.description && (
                                  <span className="mt-1 block text-xs text-gray-500">
                                    {gateway.description}
                                  </span>
                                )}
                              </span>
                            </label>
                          )
                        )}

                      </div>
                    )}

                  </div>

                  {gateways.find((gateway) => gateway.id === paymentMethod)?.requires_account && (
                    <div className="mt-5">
                      <label htmlFor="wallet_number" className="block text-sm font-semibold text-[#111c2d]">
                        Wallet / account number
                      </label>
                      <input
                        id="wallet_number"
                        name="wallet_number"
                        type="tel"
                        value={walletNumber}
                        onChange={(e) => setWalletNumber(e.target.value)}
                        disabled={loading}
                        placeholder="Enter the number used for this wallet"
                        autoComplete="tel"
                        className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#01A14B] focus:ring-4 focus:ring-[#01A14B]/10"
                      />
                      <p className="mt-2 text-xs text-gray-500">This is sent to WooCommerce, which lets the configured Sifalo gateway process the payment.</p>
                    </div>
                  )}
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

                    {isAnonymous && (
                      <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-600">
                        This donation will be made anonymously.
                      </div>
                    )}

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
                        gateways.length === 0
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