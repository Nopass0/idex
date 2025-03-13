/** @type {import("next").NextConfig} */
const config = {
    // Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
    // for Docker builds.
    typescript: {
        ignoreBuildErrors: true,
      },
      eslint: {
        ignoreDuringBuilds: true,
      },
};

export default config;
