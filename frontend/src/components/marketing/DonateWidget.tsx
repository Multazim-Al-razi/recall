import { Illustration } from '@/components/ui/Illustration';

const DONATE_URL = 'https://buymeacoffee.com/recall';

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
        <a
          href={DONATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-rausch underline decoration-rausch/30 underline-offset-2 transition-colors hover:text-rausch-hover"
        >
          consider buying us a coffee
        </a>
        . It keeps this project free for everyone.
      </p>
    </div>
  );
}
