'use client';
import { GasStation } from '@/types/station';

interface Props {
  station: GasStation;
}

export default function StationRow({ station }: Props) {
  return (
    <tr>
      <td className="px-3 py-2">{station['Nom de Station']}</td>
      <td className="px-3 py-2">{station['Marque']}</td>
      <td className="px-3 py-2">{station['Commune']}</td>
      <td className="px-3 py-2 text-right">{station['Capacité Gasoil'] ?? '-'}</td>
      <td className="px-3 py-2 text-right">{station['Capacité SSP'] ?? '-'}</td>
    </tr>
  );
}