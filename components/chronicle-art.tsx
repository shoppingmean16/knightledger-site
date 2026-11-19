import Image from 'next/image';
import tapestry from '@/public/art/warden-small-beasts-tapestry.webp';

export function ChronicleArt({ alias, title }: { alias: string; title: string }) {
  if (alias !== 'Sir Jasen of the Field Ledger' || title !== 'Warden of the Small Beasts') return null;

  return <Image
    src={tapestry}
    alt="Four embroidered scenes show a masked knight recording wildlife, a mechanical lobster at a laptop, and a ceremonial dubbing."
    className="chronicle-tapestry"
    unoptimized
  />;
}
