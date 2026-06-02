import { useAccountStore } from '@/stores/account';
import { initials } from '@/lib/format';
import { safeAvatarUrl } from '@/lib/security';

/** User avatar — shows the uploaded image, else initials on solid Rausch. */
export function Avatar({ className = '' }: { className?: string }) {
  const profile = useAccountStore((s) => s.profile);
  const safeSrc = safeAvatarUrl(profile.avatar);

  if (safeSrc) {
    return (
      <img
        src={safeSrc}
        alt=""
        // F-1: avatar URL is allowlisted through safeAvatarUrl, which
        // blocks javascript:, data:text/html, and svg data: schemes.
        referrerPolicy="no-referrer"
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-rausch text-[12px] font-bold text-white ${className}`}
    >
      {initials(profile.name)}
    </div>
  );
}
