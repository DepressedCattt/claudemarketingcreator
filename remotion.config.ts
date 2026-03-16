import { Config } from "@remotion/cli/config";

// Output format — jpeg is faster to render than png for video
Config.setVideoImageFormat("jpeg");

// Always overwrite existing output files
Config.setOverwriteOutput(true);

// Codec — h264 is the most compatible for social platforms
Config.setCodec("h264");

// Concurrency — adjust based on your machine
// Config.setConcurrency(4);
