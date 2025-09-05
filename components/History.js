import type { SavedCalculation } from '../types.js';

interface HistoryProps {
    history: SavedCalculation[];
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value);

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const History = ({ history, onLoad, onDelete }: HistoryProps) => {
    if (history.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-brand-dark mb-4">Historique des Calculs</h2>
                <p className="text-gray-500">Aucun calcul n'a été sauvegardé pour le moment.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-brand-dark mb-4">Historique des Calculs</h2>
            <div className="space-y-4">
                {history.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 transition">
                        <div className="flex-grow">
                            <p className="font-bold text-lg text-brand-primary">{item.name}</p>
                            <p className="text-sm text-gray-500">Sauvegardé le: {formatDate(item.savedAt)}</p>
                            <div className="text-sm text-gray-700 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                <span>Principal: <span className="font-semibold">{formatCurrency(item.calculation.initialPrincipal)}</span></span>
                                <span>Intérêts (HT): <span className="font-semibold">{formatCurrency(item.calculation.totalInterest)}</span></span>
                                <span>Final: <span className="font-semibold">{formatCurrency(item.calculation.finalPrincipal)}</span></span>
                            </div>
                        </div>
                        <div className="flex-shrink-0 flex gap-2 mt-2 md:mt-0">
                            <button onClick={() => onLoad(item.id)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm transition">
                                Charger
                            </button>
                            <button onClick={() => onDelete(item.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm transition">
                                Supprimer
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default History;
