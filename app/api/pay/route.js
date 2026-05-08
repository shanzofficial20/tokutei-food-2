import Payjp from "payjp";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { token, userId, email, plan } = await request.json();

    if (!token) {
      return Response.json(
        {
          success: false,
          message: "Token pembayaran tidak ada.",
        },
        { status: 400 }
      );
    }

    if (!userId) {
      return Response.json(
        {
          success: false,
          message: "User ID tidak ada. Kamu harus login dulu.",
        },
        { status: 400 }
      );
    }

    if (!process.env.PAYJP_SECRET_KEY) {
      return Response.json(
        {
          success: false,
          message: "PAYJP_SECRET_KEY belum ada di environment.",
        },
        { status: 500 }
      );
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
      return Response.json(
        {
          success: false,
          message: "SUPABASE_URL atau SUPABASE_SECRET_KEY belum ada di environment.",
        },
        { status: 500 }
      );
    }

    const selectedPlan = plan || "premium_1_month";

    const planConfig = {
      premium_1_month: {
        amount: 980,
        days: 30,
        label: "Premium 1 Bulan",
      },
      premium_3_months: {
        amount: 2500,
        days: 90,
        label: "Premium 3 Bulan",
      },
    };

    const config = planConfig[selectedPlan];

    if (!config) {
      return Response.json(
        {
          success: false,
          message: "Paket premium tidak valid.",
        },
        { status: 400 }
      );
    }

    const payjpClient = Payjp(process.env.PAYJP_SECRET_KEY);

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY
    );

    const { data: existingProfile, error: existingProfileError } =
      await supabase
        .from("profiles")
        .select("premium_until")
        .eq("id", userId)
        .maybeSingle();

    if (existingProfileError) {
      console.error("GET EXISTING PROFILE ERROR:", existingProfileError);

      return Response.json(
        {
          success: false,
          message: "Gagal mengecek status premium user.",
          error: existingProfileError.message,
        },
        { status: 500 }
      );
    }

    const now = new Date();

    const currentPremiumUntil = existingProfile?.premium_until
      ? new Date(existingProfile.premium_until)
      : null;

    const startDate =
      currentPremiumUntil && currentPremiumUntil > now
        ? currentPremiumUntil
        : now;

    const premiumUntil = new Date(startDate);
    premiumUntil.setDate(premiumUntil.getDate() + config.days);

    console.log("Mulai pembayaran:", {
      userId,
      email,
      selectedPlan,
      amount: config.amount,
      premiumUntil: premiumUntil.toISOString(),
    });

    const charge = await payjpClient.charges.create({
      amount: config.amount,
      currency: "jpy",
      card: token,
      capture: true,
      description: `${config.label} Tokutei Food 2 - ${email || userId}`,
    });

    console.log("PAY.JP sukses:", charge.id);

    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          email: email || null,
          is_paid: true,
          plan: "premium",
          paid_at: now.toISOString(),
          premium_until: premiumUntil.toISOString(),
          payment_id: charge.id,
        },
        {
          onConflict: "id",
        }
      )
      .select();

    if (error) {
      console.error("SUPABASE UPDATE ERROR:", error);

      return Response.json(
        {
          success: false,
          message: "Pembayaran sukses, tapi gagal update database.",
          paymentId: charge.id,
          error: error.message,
        },
        { status: 500 }
      );
    }

    console.log("Supabase update sukses:", data);

    return Response.json({
      success: true,
      message: "Pembayaran sukses. Akun sekarang Premium.",
      chargeId: charge.id,
      plan: selectedPlan,
      amount: config.amount,
      premiumUntil: premiumUntil.toISOString(),
      profile: data,
    });
  } catch (error) {
    console.error("PAYMENT ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Pembayaran gagal.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}