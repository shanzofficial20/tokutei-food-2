import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

function checkAdmin(request) {
  const adminSecret = request.headers.get("x-admin-secret");
  return adminSecret && adminSecret === process.env.ADMIN_SECRET;
}

function getPremiumDays(plan, amount) {
  if (plan === "premium_3_months" || Number(amount) === 2500) {
    return 90;
  }

  return 30;
}

export async function GET(request) {
  try {
    if (!checkAdmin(request)) {
      return Response.json(
        {
          success: false,
          message: "Admin secret salah.",
        },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("transfer_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json(
        {
          success: false,
          message: "Gagal mengambil data transfer.",
          error: error.message,
        },
        { status: 500 }
      );
    }

    const withSignedUrls = await Promise.all(
      data.map(async (item) => {
        if (!item.proof_path) return item;

        const { data: signed } = await supabase.storage
          .from("payment-proofs")
          .createSignedUrl(item.proof_path, 60 * 10);

        return {
          ...item,
          proof_url: signed?.signedUrl || null,
        };
      })
    );

    return Response.json({
      success: true,
      requests: withSignedUrls,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Terjadi error server.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    if (!checkAdmin(request)) {
      return Response.json(
        {
          success: false,
          message: "Admin secret salah.",
        },
        { status: 401 }
      );
    }

    const { id, action } = await request.json();

    if (!id || !action) {
      return Response.json(
        {
          success: false,
          message: "ID dan action wajib ada.",
        },
        { status: 400 }
      );
    }

    const { data: transferRequest, error: findError } = await supabase
      .from("transfer_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (findError || !transferRequest) {
      return Response.json(
        {
          success: false,
          message: "Request transfer tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    if (action === "approve") {
      const days = getPremiumDays(
        transferRequest.plan,
        transferRequest.amount
      );

      const { data: existingProfile, error: existingProfileError } =
        await supabase
          .from("profiles")
          .select("premium_until")
          .eq("id", transferRequest.user_id)
          .maybeSingle();

      if (existingProfileError) {
        return Response.json(
          {
            success: false,
            message: "Gagal mengecek profile user.",
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
      premiumUntil.setDate(premiumUntil.getDate() + days);

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: transferRequest.user_id,
            email: transferRequest.email,
            is_paid: true,
            plan: "premium",
            paid_at: now.toISOString(),
            premium_until: premiumUntil.toISOString(),
            payment_id: `yuucho-${transferRequest.id}`,
          },
          {
            onConflict: "id",
          }
        );

      if (profileError) {
        return Response.json(
          {
            success: false,
            message: "Gagal mengaktifkan premium.",
            error: profileError.message,
          },
          { status: 500 }
        );
      }

      const { error: updateError } = await supabase
        .from("transfer_requests")
        .update({
          status: "approved",
          reviewed_at: now.toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        return Response.json(
          {
            success: false,
            message: "Premium aktif, tapi gagal update status request.",
            error: updateError.message,
          },
          { status: 500 }
        );
      }

      return Response.json({
        success: true,
        message: `User berhasil diaktifkan Premium selama ${days} hari.`,
        premiumUntil: premiumUntil.toISOString(),
      });
    }

    if (action === "reject") {
      const { error: updateError } = await supabase
        .from("transfer_requests")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        return Response.json(
          {
            success: false,
            message: "Gagal reject request.",
            error: updateError.message,
          },
          { status: 500 }
        );
      }

      return Response.json({
        success: true,
        message: "Request transfer ditolak.",
      });
    }

    return Response.json(
      {
        success: false,
        message: "Action tidak valid.",
      },
      { status: 400 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Terjadi error server.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}