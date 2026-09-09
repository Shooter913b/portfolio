import type { Profile } from "@/lib/schemas/profile";
import Image from "next/image";
import { cn } from "@/lib/cn";

type ProfilePhotoProps = {
  profile: Profile;
  className?: string;
  sizeClassName?: string;
  initialsClassName?: string;
};

export function ProfilePhoto({
  profile,
  className,
  sizeClassName = "h-44 w-44 md:h-52 md:w-52",
  initialsClassName = "text-4xl md:text-5xl",
}: ProfilePhotoProps) {
  const { photo } = profile;

  return (
    <div className={cn("accent-glow-halo relative", sizeClassName, className)}>
      <div
        className="relative h-full w-full overflow-hidden rounded-none bg-bg-elevated"
        style={{
          boxShadow:
            "inset 0 0 0 1px rgb(0 0 0 / 0.65), inset 0 0 24px -8px rgb(0 0 0 / 0.7)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] rounded-none"
          style={{
            boxShadow:
              "inset 0 1px 0 rgb(255 255 255 / 0.14), inset 0 -20px 36px -24px rgb(0 212 255 / 0.2)",
            background:
              "linear-gradient(118deg, transparent 22%, rgb(255 255 255 / 0.06) 32%, transparent 48%)",
          }}
        />
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-none">
          {photo.src ? (
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 320px, 320px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-bg-elevated">
              <span
                className={cn(
                  "font-display font-semibold tracking-tight text-accent-blue",
                  initialsClassName
                )}
              >
                {photo.placeholderInitials}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
