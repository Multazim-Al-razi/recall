import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AnimatedCalendarDropdown } from "@/components/ui/AnimatedCalendarDropdown";
import { SubscriptionCardCarousel } from "@/components/ui/SubscriptionCardCarousel";

interface Subscription {
  id: string;
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv?: string;
  subscriptionName: string;
  isActive: boolean;
  price: string;
}

export const DashboardScheduler = () => {
  // State for scheduled timer selection
  const [scheduleType, setScheduleType] = useState<"once" | "range">("range");
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);

  // Sample subscriptions data
  const subscriptions: Subscription[] = [
    {
      id: "1",
      cardNumber: "4532123456789010",
      cardholderName: "John Doe",
      expiryDate: "12/25",
      cvv: "123",
      subscriptionName: "Netflix Premium",
      isActive: true,
      price: "$19.99/mo",
    },
    {
      id: "2",
      cardNumber: "5425233430109903",
      cardholderName: "John Doe",
      expiryDate: "08/26",
      cvv: "456",
      subscriptionName: "Spotify Family",
      isActive: true,
      price: "$16.99/mo",
    },
    {
      id: "3",
      cardNumber: "4916338506082832",
      cardholderName: "Jane Smith",
      expiryDate: "03/25",
      cvv: "789",
      subscriptionName: "Adobe Creative Cloud",
      isActive: false,
      price: "$54.99/mo",
    },
  ];

  const handleScheduleChange = (type: "once" | "range") => {
    setScheduleType(type);
    if (type === "once") {
      setSelectedEndDate(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="text-sm text-muted">
          Manage your subscriptions and scheduling preferences
        </p>
      </div>

      {/* Timer Schedule Configuration Card */}
      <section className={cn(
        "card-premium p-6",
        "animate-in fade-in slide-in-from-bottom-4 duration-500"
      )}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-rausch-glow">
            <svg
              className="w-5 h-5 text-rausch"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">Schedule Timer</h2>
            <p className="text-sm text-muted">Configure your subscription billing schedule</p>
          </div>
        </div>

        {/* Schedule Type Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => handleScheduleChange("once")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              scheduleType === "once"
                ? "bg-rausch text-white shadow-md"
                : "bg-surface-2 text-ink-soft hover:bg-surface-2/80"
            )}
          >
            One-time
          </button>
          <button
            onClick={() => handleScheduleChange("range")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              scheduleType === "range"
                ? "bg-rausch text-white shadow-md"
                : "bg-surface-2 text-ink-soft hover:bg-surface-2/80"
            )}
          >
            Period range
          </button>
        </div>

        {/* Date Selection */}
        <div className="grid gap-6 md:grid-cols-2">
          {scheduleType === "range" && (
            <>
              {/* Start Date Dropdown */}
              <AnimatedCalendarDropdown
                label="Start Date"
                value={selectedStartDate}
                onChange={(date) => {
                  setSelectedStartDate(date);
                  if (!selectedEndDate || date > selectedEndDate) {
                    setSelectedEndDate(date);
                  }
                }}
                placeholder="Select start date"
                className="shadow-sm"
              />

              {/* End Date Dropdown */}
              <AnimatedCalendarDropdown
                label="End Date"
                value={selectedEndDate}
                onChange={setSelectedEndDate}
                placeholder="Select end date"
                className="shadow-sm"
              />

              {/* Duration Summary */}
              {selectedStartDate && selectedEndDate && (
                <div className={cn(
                  "md:col-span-2 p-4 rounded-xl border",
                  "bg-surface-2 border-hairline"
                )}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Duration:</span>
                    <span className="font-semibold text-teal">
                      {format(selectedEndDate, "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-surface rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal to-chart-5 rounded-full transition-all duration-500"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {scheduleType === "once" && (
            <div className="md:col-span-2">
              <AnimatedCalendarDropdown
                label="Scheduled Date"
                value={selectedStartDate}
                onChange={setSelectedStartDate}
                placeholder="Select schedule date"
                className="shadow-sm"
              />
              
              <div className="mt-4 p-4 rounded-xl border border-dashed border-line bg-surface-2">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-gold mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-ink">
                      Selected: {format(selectedStartDate!, "EEEE, MMMM d, yyyy")}
                    </p>
                    <p className="text-sm text-muted mt-1">
                      Your subscription will be processed on this date.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Subscriptions Carousel Section */}
      <section className={cn(
        "card-premium p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100",
        "animate-in"
      )}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-glow">
              <svg
                className="w-5 h-5 text-teal"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">Active Subscriptions</h2>
              <p className="text-sm text-muted">Swipe or tap arrows to view more cards</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal"></span>
              Active
            </span>
            <span className="flex items-center gap-1 ml-2">
              <span className="w-2 h-2 rounded-full bg-muted"></span>
              Inactive
            </span>
          </div>
        </div>

        <SubscriptionCardCarousel
          subscriptions={subscriptions}
          autoPlay={true}
          autoPlayInterval={5000}
          description={`Showing ${subscriptions.length} subscription(s)`}
        />

        {/* Quick Stats Below Cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className={cn(
            "p-4 rounded-xl",
            "bg-surface-2 border border-hairline"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-rausch" />
              <span className="text-xs font-medium text-ink-soft">Total</span>
            </div>
            <p className="text-2xl font-bold text-ink">$91.97</p>
            <p className="text-[10px] text-muted mt-1">monthly total</p>
          </div>

          <div className={cn(
            "p-4 rounded-xl",
            "bg-surface-2 border border-hairline"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-teal" />
              <span className="text-xs font-medium text-ink-soft">Active</span>
            </div>
            <p className="text-2xl font-bold text-ink">{subscriptions.filter(s => s.isActive).length}</p>
            <p className="text-[10px] text-muted mt-1">subscriptions running</p>
          </div>

          <div className={cn(
            "p-4 rounded-xl",
            "bg-surface-2 border border-hairline"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-muted" />
              <span className="text-xs font-medium text-ink-soft">Past</span>
            </div>
            <p className="text-2xl font-bold text-ink">{subscriptions.filter(s => !s.isActive).length}</p>
            <p className="text-[10px] text-muted mt-1">inactive cards</p>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-end pt-2">
        <button className={cn(
          "px-6 py-3 rounded-xl text-sm font-medium transition-all",
          "bg-surface-2 text-ink hover:bg-surface",
          "border border-hairline"
        )}>
          View All
        </button>
        <button className={cn(
          "px-6 py-3 rounded-xl text-sm font-medium transition-all",
          "bg-rausch text-white shadow-md hover:bg-rausch-hover",
          "hover:scale-105 active:scale-95"
        )}>
          Add New Card
        </button>
      </div>
    </div>
  );
};
