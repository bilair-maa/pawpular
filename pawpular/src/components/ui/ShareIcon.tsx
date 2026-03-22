interface Props { size?: number; strokeWidth?: number; }

// Path scaled from the 512×512 reference into a 24×24 viewBox:
// content bounds (124–438 x, 124–377 y) mapped to a 22px wide region with 1px padding.
export function ShareIcon({ size = 24, strokeWidth = 1.5 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 21C1.3 14.6 4.8 7.6 14.2 7.5L14.2 3L23 10.6L14.2 18.1L14.2 13.7C7.8 13.7 3.6 16.5 1 21Z" />
    </svg>
  );
}
