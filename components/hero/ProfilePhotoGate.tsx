"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import type { Profile } from "@/lib/schemas/profile";
import { ProfilePhoto } from "./ProfilePhoto";

type ProfilePhotoGateProps = {
  profile: Profile;
};

const TRIPLE_CLICK_MS = 600;

export function ProfilePhotoGate({ profile }: ProfilePhotoGateProps) {
  const router = useRouter();
  const clicks = useRef(0);
  const timer = useRef<number | null>(null);

  const onClick = () => {
    clicks.current += 1;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      clicks.current = 0;
    }, TRIPLE_CLICK_MS);

    if (clicks.current >= 3) {
      clicks.current = 0;
      if (timer.current) window.clearTimeout(timer.current);
      router.push("/admin");
    }
  };

  return (
    <div onClick={onClick} className="w-fit">
      <ProfilePhoto profile={profile} />
    </div>
  );
}
