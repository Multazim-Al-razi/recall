import { useAccountStore } from '@/stores/account';
import { initials } from '@/lib/format';

/** User avatar — shows the uploaded image, else initials on a Rausch gradient. */
export function Avatar({ className = '' }: { className?: string }) {
  const profile = useAccountStore((s) => s.profile);
  if (profile.avatar) {
    return (
      <img
        src={profile.avatar}
        alt=""
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rausch to-[#e8726a] text-[12px] font-bold text-white ${className}`}
    >
      {initials(profile.name)}
    </div>
  );
}
