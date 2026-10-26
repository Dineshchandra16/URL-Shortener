import supabase, {supabaseUrl} from "./supabase";

export async function getUrls(user_id) {
  let {data, error} = await supabase
    .from("urls")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    console.error(error);
    throw new Error("Unable to load URLs");
  }

  return data;
}

export async function getUrl({id, user_id}) {
  const {data, error} = await supabase
    .from("urls")
    .select("*")
    .eq("id", id)
    .eq("user_id", user_id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Short Url not found");
  }

  return data;
}

export async function getLongUrl(id) {
  let {data: shortLinkData, error: shortLinkError} = await supabase
    .from("urls")
    .select("id, original_url")
    .or(`short_url.eq.${id},custom_url.eq.${id}`)
    .single();

  if (shortLinkError && shortLinkError.code !== "PGRST116") {
    console.error("Error fetching short link:", shortLinkError);
    return;
  }

  return shortLinkData;
}

export async function createUrl(options, qrcode, extraData = {}) {
  const title = extraData.title || options.title;
  const longUrl = extraData.longUrl || options.longUrl;
  const customUrl = (extraData.customUrl || options.customUrl || "").trim() || null;
  const user_id = extraData.user_id || options.user_id;
  const short_url =
    extraData.short_url ||
    options.short_url ||
    Math.random().toString(36).substr(2, 6);
  const fileName = `qr-${short_url}`;

  const {error: storageError} = await supabase.storage
    .from("qrs")
    .upload(fileName, qrcode);

  if (storageError) throw new Error(storageError.message);

  const qr = `${supabaseUrl}/storage/v1/object/public/qrs/${fileName}`;

  const {data: {session}} = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Please sign in again to create a short URL.");
  const response = await fetch("/api/urls", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      title,
      user_id,
      original_url: longUrl,
      custom_url: customUrl,
      short_url,
      qr,
    }),
  });
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("This custom alias or short URL is already taken. Please choose another.");
    }
    throw new Error(result.error || "Error creating short URL");
  }
  return result;
}

export async function deleteUrl(id) {
  const {data: {session}} = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Please sign in again to delete this URL.");
  const response = await fetch(`/api/urls/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || "Unable to delete URL");
  }
  return true;
}
