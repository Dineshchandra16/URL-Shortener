import {UAParser} from "ua-parser-js";
import supabase from "./supabase";

// export async function getClicks() {
//   let {data, error} = await supabase.from("clicks").select("*");

//   if (error) {
//     console.error(error);
//     throw new Error("Unable to load Stats");
//   }

//   return data;
// }

export async function getClicksForUrls(urlIds) {
  const {data, error} = await supabase
    .from("clicks")
    .select("*")
    .in("url_id", urlIds);

  if (error) {
    console.error("Error fetching clicks:", error);
    return null;
  }

  return data;
}

export async function getClicksForUrl(url_id) {
  const {data, error} = await supabase
    .from("clicks")
    .select("*")
    .eq("url_id", url_id);

  if (error) {
    console.error(error);
    throw new Error("Unable to load Stats");
  }

  return data;
}

const parser = new UAParser();

export const storeClicks = async ({id, originalUrl}) => {
  try {
    const res = parser.getResult();
    const device = res.type || "desktop"; // Default to desktop if type is not detected

    let city = "Unknown";
    let country = "Unknown";

    // Attempt geolocation lookup without blocking redirection if blocked or failed
    try {
      const response = await fetch("https://ipapi.co/json");
      if (response.ok) {
        const geo = await response.json();
        city = geo.city || "Unknown";
        country = geo.country_name || "Unknown";
      }
    } catch (geoError) {
      console.warn("Could not fetch location stats (adblocker or rate limit):", geoError);
    }

    // Record the click in Supabase
    if (id) {
      await supabase.from("clicks").insert({
        url_id: id,
        city: city,
        country: country,
        device: device,
      });
    }
  } catch (error) {
    console.error("Error recording click:", error);
  } finally {
    // ALWAYS redirect to the destination URL
    if (originalUrl) {
      const targetUrl =
        originalUrl.startsWith("http://") || originalUrl.startsWith("https://")
          ? originalUrl
          : `https://${originalUrl}`;
      window.location.href = targetUrl;
    }
  }
};
