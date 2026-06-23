export type CollageSize = "compact" | "comfortable";

/** Grid cell classes for each tile in a collage gallery. */
export function collageTileClass(
  count: number,
  index: number,
  size: CollageSize
): string {
  if (count === 1) {
    return size === "compact"
      ? "col-span-full min-h-[9rem] sm:min-h-[10rem]"
      : "col-span-full min-h-[11rem] sm:min-h-[14rem]";
  }

  if (count === 2) {
    return "col-span-1 min-h-[8rem] sm:min-h-[9.5rem]";
  }

  if (count === 3) {
    if (index === 0) {
      return size === "compact"
        ? "col-span-2 row-span-2 min-h-[11rem]"
        : "col-span-2 row-span-2 min-h-[13rem] sm:min-h-[15rem]";
    }
    return "col-span-1 min-h-[5.25rem] sm:min-h-[6.5rem]";
  }

  if (count === 4) {
    return "col-span-1 min-h-[7rem] sm:min-h-[8rem]";
  }

  if (count === 5) {
    if (index === 0) return "col-span-2 row-span-2 min-h-[11rem] sm:min-h-[13rem]";
    if (index === 4) return "col-span-2 min-h-[6.5rem] sm:min-h-[7.5rem]";
    return "col-span-1 min-h-[6.5rem] sm:min-h-[7.5rem]";
  }

  // 6+
  if (index === 0) {
    return size === "comfortable"
      ? "col-span-2 row-span-2 min-h-[11rem] sm:min-h-[13rem]"
      : "col-span-2 row-span-2 min-h-[10rem]";
  }

  return "col-span-1 min-h-[6rem] sm:min-h-[7rem]";
}

export function collageGridClass(size: CollageSize): string {
  if (size === "compact") {
    return "grid grid-cols-2 gap-2 sm:gap-2.5";
  }

  return "grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3";
}
