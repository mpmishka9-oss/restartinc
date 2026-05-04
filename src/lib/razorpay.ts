declare global {
  interface Window {
    Razorpay?: any;
  }
}

export function initiateRazorpayCheckout({
  amount,
  planId,
  userName,
  userEmail,
  onSuccess,
  onFailure,
}: {
  amount: number; // in paise: ₹21 = 2100, ₹199 = 19900
  planId: string;
  userName: string;
  userEmail: string;
  onSuccess: (paymentId: string) => void;
  onFailure: (error: unknown) => void;
}) {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: amount,
    currency: "INR",
    name: "ReStart",
    description: "ReStart — 21-Day Reset Pass (Days 4–21)",
    image: "/src/assets/logo.png",
    prefill: {
      name: userName,
      email: userEmail,
    },
    notes: {
      plan: "reset_21_day",
      then: "₹199/mo from month 2",
      plan_id: planId,
    },
    theme: {
      color: "#7B9BD6",
    },
    handler: function (response: { razorpay_payment_id: string }) {
      onSuccess(response.razorpay_payment_id);
    },
    modal: {
      ondismiss: function () {
        onFailure("User closed payment window");
      },
    },
  };

  if (!window.Razorpay) {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const rzp = new window.Razorpay(options);
      rzp.open();
    };
    script.onerror = () => onFailure("Failed to load Razorpay script");
    document.body.appendChild(script);
  } else {
    const rzp = new window.Razorpay(options);
    rzp.open();
  }
}
