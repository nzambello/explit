import { json } from "remix";
import type { LoaderFunction } from "remix";

export let loader: LoaderFunction = () => {
  return json(
    {
      short_name: "Explit",
      name: "Explit | Track and split shared expenses with friends and family.",
      start_url: "/",
      display: "standalone",
      background_color: "#22252d",
      theme_color: "#793ef9",
      icons: [
        {
          src: "/icons/favicon-32x32.png",
          sizes: "32x32",
          type: "image/png",
          density: "0.75",
        },
        {
          src: "/icons/android-icon-48x48.png",
          sizes: "48x48",
          type: "image/png",
          density: "1.0",
        },
        {
          src: "/icons/mstile-70x70.png",
          sizes: "70x70",
          type: "image/png",
          density: "1.5",
        },
        {
          src: "/icons/mstile-144x144.png",
          sizes: "144x144",
          type: "image/png",
          density: "3.0",
        },
        {
          src: "/icons/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
          density: "4.0",
        },
        {
          src: "/icons/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    }
  );
};
