import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type PaperPlaneSvgProps = {
  gradientId?: string;
  className?: string;
  width?: number;
  height?: number;
};

export const PaperPlaneSvg = forwardRef<SVGSVGElement, PaperPlaneSvgProps>(
  function PaperPlaneSvg(
    { gradientId = "paper-plane-gradient", className, width = 38, height = 28 },
    ref
  ) {
    return (
      <svg
        ref={ref}
        width={width}
        height={height}
        viewBox="0 0 34 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(className)}
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="34"
            y2="25"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#00D4FF" />
            <stop offset="1" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        <path
          d="M32.6705 0.534779L17.2743 24.5348L12.6705 19.5348L10.3309 17.2539L32.6705 0.534779L5.50068 15.6359L0.67049 13.7483L32.6705 0.534779Z"
          fill={`url(#${gradientId})`}
        />
        <path
          d="M12.6705 19.5348L9.67049 21.0348L5.67049 15.5348L32.6705 0.534779L10.3309 17.2539L12.6705 19.5348Z"
          fill="#1A6473"
        />
        <path
          d="M32.6705 0.534779L0.67049 13.7483L5.50068 15.6359L32.6705 0.534779L17.2743 24.5348L12.6705 19.5348L10.3309 17.2539L32.6705 0.534779ZM32.6705 0.534779L5.67049 15.5348L9.67049 21.0348L12.6705 19.5348"
          stroke="#1A6473"
          strokeOpacity="0.2"
          strokeWidth="0.5"
        />
      </svg>
    );
  }
);
