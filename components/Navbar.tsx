'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Painel' },
  { href: '/add', label: 'Adicionar' },
  { href: '/history', label: 'Histórico' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-emerald-700 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⛽</span>
          <span className="font-bold text-lg tracking-tight">Controle de Combustível</span>
        </div>
        <div className="flex gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-emerald-900 text-white'
                  : 'text-emerald-100 hover:bg-emerald-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
