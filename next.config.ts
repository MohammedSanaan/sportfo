import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 restricts next/image `quality` to this allowlist -- 75 stays
    // the default everywhere; 90 is opt-in for the sports gallery carousel,
    // whose small 3D-transformed cards read soft/blurry at the default.
    qualities: [75, 90],
  },
};

export default nextConfig;
