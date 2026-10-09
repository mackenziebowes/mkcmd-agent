import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "mkcmd-agent",
    short_name: "mkcmd-agent",
    description: "Scaffold Bun CLIs that agents can drive.",
    start_url: "/",
    display: "standalone",
    background_color: "#fcfcfc",
    theme_color: "#3d5afe",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
