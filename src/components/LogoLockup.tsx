/**
 * LogoLockup
 *
 * Brand name + optional tagline display.
 * Used in the logo end card and optionally in hook scenes.
 * Falls back gracefully if no logo image is provided.
 */

import React from "react";
import { Img, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BrandConfig } from "../data/types";
import { useFadeIn } from "../utils/animation";
import { getTypography } from "../utils/typography";

interface Props {
  brand: BrandConfig;
  delay?: number;
  /** Show logo image (if configured) */
  showImage?: boolean;
  /** Show brand name as text */
  showName?: boolean;
  /** Show tagline */
  showTagline?: boolean;
  size?: "small" | "medium" | "large";
}

export const LogoLockup: React.FC<Props> = ({
  brand,
  delay = 0,
  showImage = true,
  showName = true,
  showTagline = false,
  size = "medium",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typo = getTypography(brand.typography.preset);

  const opacity = useFadeIn(delay, 15);

  const scaleIn = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
    from: 0.8,
    to: 1,
  });

  const logoSizes = { small: 80, medium: 120, large: 160 };
  const nameSizes = { small: typo.subheadline, medium: typo.headline, large: typo.display };
  const taglineSizes = { small: typo.caption, medium: typo.body, large: typo.subheadline };

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scaleIn})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Logo image */}
      {showImage && brand.logoPath && (
        <Img
          src={brand.logoPath}
          style={{
            width: logoSizes[size],
            height: logoSizes[size],
            objectFit: "contain",
          }}
        />
      )}

      {/* Logo placeholder if no image */}
      {showImage && !brand.logoPath && (
        <div
          style={{
            width: logoSizes[size],
            height: logoSizes[size],
            borderRadius: logoSizes[size] * 0.25,
            background: `linear-gradient(135deg, ${brand.colors.primary}, ${brand.colors.secondary})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: logoSizes[size] * 0.4,
            fontFamily: typo.headlineFont,
            fontWeight: 800,
            color: "#FFFFFF",
          }}
        >
          {brand.name.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Brand name */}
      {showName && (
        <div
          style={{
            fontFamily: brand.typography.headlineFont || typo.headlineFont,
            fontSize: nameSizes[size],
            fontWeight: 800,
            color: brand.colors.text,
            letterSpacing: typo.headlineLetterSpacing,
            lineHeight: 1,
          }}
        >
          {brand.name}
        </div>
      )}

      {/* Tagline */}
      {showTagline && brand.tagline && (
        <div
          style={{
            fontFamily: typo.bodyFont,
            fontSize: taglineSizes[size],
            fontWeight: 400,
            color: brand.colors.textSecondary,
            letterSpacing: "0.05em",
          }}
        >
          {brand.tagline}
        </div>
      )}
    </div>
  );
};
