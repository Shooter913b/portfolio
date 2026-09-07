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
    <div
      className={cn(
        "relative overflow-hidden bg-bg-elevated",
        "shadow-[inset_0_0_0_1px_rgb(0_0_0/0.65),inset_0_0_24px_-8px_rgb(0_0_0/0.7),0_0_28px_-6px_rgb(0_212_255/0.45),0_0_56px_-10px_rgb(168_85_247/0.4)]",
        sizeClassName,
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          boxShadow:
            "inset 0 1px 0 rgb(255 255 255 / 0.14), inset 0 -20px 36px -24px rgb(0 212 255 / 0.2)",
          background:
            "linear-gradient(118deg, transparent 22%, rgb(255 255 255 / 0.06) 32%, transparent 48%)",
        }}
      />
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
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
  );
}
