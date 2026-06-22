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
        "accent-glow-sm rounded-2xl bg-gradient-to-br from-accent-blue via-accent-blue/80 to-accent-purple p-[2px]",
        sizeClassName,
        className
      )}
    >
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[14px] bg-bg-elevated">
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
