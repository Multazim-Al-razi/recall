import { Link } from 'react-router';
import { Illustration } from '@/components/ui/Illustration';

export function DonateWidget() {
  return (
    <div className="text-center">
      <Illustration
        name="donateCharity"
        decorative={false}
        className="mx-auto h-[140px] w-full max-w-[240px] object-contain"
      />
      <p className="mt-4 text-[14px] leading-[1.6] text-muted">
        If Recall has saved you money or hassle,{' '}
        <Link
          to="/donate"
          className="text-rausch underline decoration-rausch/30 underline-offset-2 transition-colors hover:text-rausch-hover"
        >
          consider sending a tip
        </Link>
        . It keeps this project free for everyone.
      </p>
    </div>
  );
}
