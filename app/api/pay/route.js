import Payjp from "payjp";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const payjpClient = Payjp(process.env.PAYJP_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export async function POST(request) {
  try {
    const { token, userId, email } = await request.json();

    if (!token) {
      return Response.json(
        {
          success: false,
          message: "Token pembayaran tidak ada",
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
          message: "PAYJP_SECRET_KEY belum ada di .env.local",
        },
        { status: 500 }
      );
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
      return Response.json(
        {
          success: false,
          message: "SUPABASE_URL atau SUPABASE_SECRET_KEY belum ada di .env.local",
        },
        { status: 500 }
      );
    }

    console.log("Mulai pembayaran untuk user:", userId);

    const charge = await payjpClient.charges.create({
      amount: 980,
      currency: "jpy",
      card: token,
      capture: true,
      description: `Pembayaran akses premium TG2 - ${email || userId}`,
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
          paid_at: new Date().toISOString(),
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
          message: "Pembayaran sukses, tapi gagal update database",
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
      profile: data,
    });
  } catch (error) {
    console.error("PAYMENT ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Pembayaran gagal",
        error: error.message,
      },
      { status: 500 }
    );
  }
}