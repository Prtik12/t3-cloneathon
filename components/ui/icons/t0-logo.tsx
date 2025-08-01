import type React from "react";

/**
 * Final ✨ **T3** logo – bold monospace 3 to match the weight of the T key‑cap.
 *
 * ▸ Left glyph: original filled path (unchanged).
 * ▸ Right glyph: now rendered with a *stroke* so we can match the chunky weight
 *   perfectly without fiddling with complex boolean‑union fills. Using
 *   `stroke-linecap="round"` and a generous `stroke-width` gives us that smooth
 *   thick look you see in the reference image.
 *
 * Both variants (regular + inverted) share the exact geometry; only their
 * colours differ.
 */

type T3LogoProps = {
  width?: number;
  height?: number;
  className?: string;
};

const ThreePathRegular = (
  <path
    d="M160 150 C240 70 400 70 400 210 C400 290 320 310 260 310 M260 310 C320 310 400 330 400 410 C400 550 240 550 160 470"
    stroke="var(--background)"
    strokeWidth={60}
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
  />
);

const ThreePathInverted = (
  <path
    d="M160 150 C240 70 400 70 400 210 C400 290 320 310 260 310 M260 310 C320 310 400 330 400 410 C400 550 240 550 160 470"
    stroke="var(--foreground)"
    strokeWidth={60}
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
  />
);

// ---------------------------------------------------------------------------------------------------------------------
//  Regular
// ---------------------------------------------------------------------------------------------------------------------
export const T3Logo: React.FC<T3LogoProps> = ({ width = 96, height = 96, className }) => (
  <svg
    aria-label="T3 Logo"
    role="img"
    width={width}
    height={height}
    viewBox="0 0 681 479"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Glyph and key-cap */}
    <path
      d="M75 1C103.05 1 131.1 1 160 1C160 31.36 160 61.72 160 93C191.68 93 223.36 93 256 93C256 116.43 256 139.86 256 164C224.32 164 192.64 164 160 164C160.12 195.804 160.12 195.804 160.258 227.607C160.318 240.584 160.377 253.56 160.422 266.537C160.455 275.989 160.495 285.441 160.543 294.894C160.568 299.894 160.59 304.894 160.603 309.894C160.616 314.611 160.638 319.328 160.667 324.045C160.676 325.765 160.682 327.486 160.684 329.207C160.713 349.478 161.949 368.89 176.125 384.688C187.613 395.592 202.238 396.291 217.195 396.414C219.097 396.441 219.097 396.441 221.037 396.468C225.733 396.53 230.429 396.577 235.125 396.625C245.644 396.749 256.163 396.873 267 397C267 423.4 267 449.8 267 477C257.992 478.126 257.992 478.126 253.424 478.161C252.401 478.171 251.378 478.18 250.324 478.19C248.694 478.197 248.694 478.197 247.031 478.203C245.879 478.209 244.726 478.215 243.539 478.22C241.098 478.23 238.657 478.236 236.216 478.24C232.567 478.25 228.919 478.281 225.27 478.312C186.49 478.488 144.177 472.527 114 446C112.757 444.971 112.757 444.971 111.488 443.922C87.904 423.841 77.6547 392.008 75 362C74.8766 359.132 74.8685 356.271 74.8797 353.401C74.8789 352.585 74.878 351.768 74.8772 350.927C74.8755 348.219 74.881 345.511 74.8865 342.802C74.8868 340.85 74.8866 338.898 74.886 336.946C74.8857 331.666 74.8916 326.386 74.8986 321.105C74.9049 315.58 74.9054 310.055 74.9066 304.30C74.9097 294.075 74.9179 283.621 74.928 273.166C74.9392 261.26 74.9447 249.355 74.9497 237.449C74.9601 212.966 74.9785 188.483 75 164C50.25 164 25.5 164 0 164C0 140.57 0 117.14 0 93C24.75 93 49.5 93 75 93C75 62.64 75 32.28 75 1Z"
      fill="var(--background)"
    />

    {/* Bold monospace 3 – stroked */}
    {ThreePathRegular}
  </svg>
);

// ---------------------------------------------------------------------------------------------------------------------
//  Inverted colours
// ---------------------------------------------------------------------------------------------------------------------
export const InvertedT3Logo: React.FC<T3LogoProps> = ({ width = 96, height = 96, className }) => (
  <svg
    aria-label="T3 Logo"
    role="img"
    width={width}
    height={height}
    viewBox="0 0 681 479"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Glyph and key-cap */}
    <path
      d="M75 1C103.05 1 131.1 1 160 1C160 31.36 160 61.72 160 93C191.68 93 223.36 93 256 93C256 116.43 256 139.86 256 164C224.32 164 192.64 164 160 164C160.12 195.804 160.12 195.804 160.258 227.607C160.318 240.584 160.377 253.56 160.422 266.537C160.455 275.989 160.495 285.441 160.543 294.894C160.568 299.894 160.59 304.894 160.603 309.894C160.616 314.611 160.638 319.328 160.667 324.045C160.676 325.765 160.682 327.486 160.684 329.207C160.713 349.478 161.949 368.89 176.125 384.688C187.613 395.592 202.238 396.291 217.195 396.414C219.097 396.441 219.097 396.441 221.037 396.468C225.733 396.53 230.429 396.577 235.125 396.625C245.644 396.749 256.163 396.873 267 397C267 423.4 267 449.8 267 477C257.992 478.126 257.992 478.126 253.424 478.161C252.401 478.171 251.378 478.18 250.324 478.19C248.694 478.197 248.694 478.197 247.031 478.203C245.879 478.209 244.726 478.215 243.539 478.22C241.098 478.23 238.657 478.236 236.216 478.24C232.567 478.25 228.919 478.281 225.27 478.312C186.49 478.488 144.177 472.527 114 446C112.757 444.971 112.757 444.971 111.488 443.922C87.904 423.841 77.6547 392.008 75 362C74.8766 359.132 74.8685 356.271 74.8797 353.401C74.8789 352.585 74.878 351.768 74.8772 350.927C74.8755 348.219 74.881 345.511 74.8865 342.802C74.8868 340.85 74.8866 338.898 74.886 336.946C74.8857 331.666 74.8916 326.386 74.8986 321.105C74.9049 315.58 74.9054 310.055 74.9066 304.30C74.9097 294.075 74.9179 283.621 74.928 273.166C74.9392 261.26 74.9447 249.355 74.9497 237.449C74.9601 212.966 74.9785 188.483 75 164C50.25 164 25.5 164 0 164C0 140.57 0 117.14 0 93C24.75 93 49.5 93 75 93C75 62.64 75 32.28 75 1Z"
      fill="var(--foreground)"
    />

    {ThreePathInverted}
  </svg>
);
