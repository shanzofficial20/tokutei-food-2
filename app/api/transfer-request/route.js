import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        {
          success: false,
          message: "Kamu harus login dulu.",
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return Response.json(
        {
          success: false,
          message: "Session login tidak valid.",
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const plan = formData.get("plan") || "premium_1_month";
    const amount = Number(formData.get("amount") || 980);
    const note = formData.get("note") || "";
    const proof = formData.get("proof");

    if (!proof) {
      return Response.json(
        {
          success: false,
          message: "Bukti transfer belum diupload.",
        },
        { status: 400 }
      );
    }

    const fileName = proof.name || "proof";
    const fileExt = fileName.split(".").pop() || "jpg";
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const arrayBuffer = await proof.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(filePath, buffer, {
        contentType: proof.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("UPLOAD ERROR:", uploadError);

      return Response.json(
        {
          success: false,
          message: "Gagal upload bukti transfer.",
          error: uploadError.message,
        },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("transfer_requests")
      .insert({
        user_id: user.id,
        email: user.email,
        plan,
        amount,
        status: "pending",
        proof_path: filePath,
        note,
      })
      .select()
      .single();

    if (error) {
      console.error("INSERT TRANSFER REQUEST ERROR:", error);

      return Response.json(
        {
          success: false,
          message: "Gagal menyimpan request transfer.",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "Bukti transfer berhasil dikirim.",
      request: data,
    });
  } catch (error) {
    console.error("TRANSFER REQUEST ERROR:", error);

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