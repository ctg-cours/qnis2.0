import { REFERENCE_RATES } from '../constants.js';

const formatDate = (dateString: string) => {
    const date = new Date(`${dateString}T00:00:00Z`);
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(date);
};

const formatPercent = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);


const RateTable = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg mt-8 no-export">
            <h2 className="text-2xl font-bold text-brand-dark mb-4">Table des Taux de Référence (Exemple)</h2>
            <p className="text-sm text-gray-500 mb-4">Ce composant est fourni à titre d'information et n'est pas directement utilisé dans l'application finale.</p>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">Date d'effet</th>
                            <th className="p-2 border">Taux Annuel</th>
                        </tr>
                    </thead>
                    <tbody>
                        {REFERENCE_RATES.map((rateInfo) => (
                            <tr key={rateInfo.startDate} className="border-b">
                                <td className="p-2 border text-center">{formatDate(rateInfo.startDate)}</td>
                                <td className="p-2 border text-center font-semibold">{formatPercent(rateInfo.rate)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RateTable;
