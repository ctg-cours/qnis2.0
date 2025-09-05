const { useState } = React;
const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;
import type { CalculationResult } from '../types.js';

// --- Helper Functions ---
const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value); // Using XOF for F CFA

const formatPercent = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

const formatDate = (dateString: string) => {
    const date = new Date(`${dateString}T00:00:00Z`);
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(date);
};

// --- Component Props ---
interface ResultsDisplayProps {
    result: CalculationResult;
    onSave: (name: string) => void;
}

const ResultsDisplay = ({ result, onSave }: ResultsDisplayProps) => {
    const [saveName, setSaveName] = useState(`Calcul du ${formatDate(new Date().toISOString().split('T')[0])}`);
    const { steps, initialPrincipal, totalInterest, finalPrincipal, inputs } = result;

    const tva = totalInterest * 0.18;
    const totalTTC = totalInterest + tva;

    const chartData = [
        { name: formatDate(inputs.calculationStartDate), capital: initialPrincipal },
        ...steps.map(step => ({
            name: formatDate(step.periodEnd),
            capital: step.principalStart + step.interest
        }))
    ];

    const handleExportPDF = () => {
        const element = document.getElementById('pdf-content');
        const opt = {
            margin:       [10, 10, 10, 10],
            filename:     `decompte-${inputs.pieceNumber.replace('/', '-')}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak:    { mode: ['css', 'legacy'] }
        };
        html2pdf().from(element).set(opt).save();
    };

    const handleSaveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (saveName.trim()) {
            onSave(saveName.trim());
            alert("Calcul sauvegardé !");
        }
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg animate-fade-in">
            {/* --- Part 1: Official Report --- */}
            <div id="report-container">

                <div className="no-export text-center mb-8">
                    <h2 className="text-2xl font-bold text-brand-dark underline decoration-brand-secondary decoration-4 underline-offset-8">
                        DECOMPTE D'INERÊTS DE DROIT
                    </h2>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div><strong className="text-brand-primary">Pièce N°:</strong> {inputs.pieceTitle} {inputs.pieceNumber}</div>
                        <div><strong className="text-brand-primary">du:</strong> {formatDate(inputs.pieceDate)}</div>
                        <div><strong className="text-brand-primary">A l'encontre de:</strong> {inputs.debtor}</div>
                        <div><strong className="text-brand-primary">En faveur de:</strong> {inputs.creditor}</div>
                    </div>
                    <div className="mt-6">
                        <p className="text-lg text-gray-600">Principal de</p>
                        <p className="text-6xl font-extrabold text-brand-primary tracking-tight">
                            {formatCurrency(initialPrincipal)}
                        </p>
                        <p className="text-lg text-gray-600 mt-2">
                            Arrêté au <strong className="text-brand-primary">{formatDate(inputs.calculationEndDate)}</strong>
                        </p>
                    </div>
                </div>

                <div id="pdf-content">
                    <h3 className="text-xl font-bold text-center mb-4">Détail du Calcul des Intérêts</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 border">Période</th>
                                    <th className="p-2 border">Jours</th>
                                    <th className="p-2 border">Taux</th>
                                    <th className="p-2 border">Principal Début</th>
                                    <th className="p-2 border">Formule de Calcul</th>
                                    <th className="p-2 border">Intérêts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {steps.map((step, index) => (
                                    <tr key={index} className="border-b hover:bg-brand-light">
                                        <td className="p-2 border text-center whitespace-nowrap">Du {formatDate(step.periodStart)}<br/>au {formatDate(step.periodEnd)}</td>
                                        <td className="p-2 border text-center">{step.days}</td>
                                        <td className="p-2 border text-center font-semibold">{formatPercent(step.rate)}</td>
                                        <td className="p-2 border text-right">{formatCurrency(step.principalStart)}</td>
                                        <td className="p-2 border text-center font-mono">
                                            <div className="flex flex-col items-center justify-center">
                                                <span>{formatCurrency(step.principalStart).replace(/\s/g, '')} x {formatPercent(step.rate)} x {step.days}</span>
                                                <span className="border-t-2 border-gray-800 w-full my-1"></span>
                                                <span>365.25</span>
                                            </div>
                                        </td>
                                        <td className="p-2 border text-right font-semibold text-green-700">{formatCurrency(step.interest)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <div className="w-full md:w-1/2 lg:w-2/5">
                            <h4 className="text-lg font-bold text-brand-dark mb-2">Résumé Financier</h4>
                            <div className="space-y-2 text-gray-700 border p-4 rounded-lg">
                                <div className="flex justify-between">
                                    <span>Total Intérêts (HT):</span>
                                    <span className="font-bold">{formatCurrency(totalInterest)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>TVA (18%):</span>
                                    <span>{formatCurrency(tva)}</span>
                                </div>
                                <hr className="my-2"/>
                                <div className="flex justify-between text-xl font-bold text-brand-primary">
                                    <span>Total TTC des Intérêts:</span>
                                    <span>{formatCurrency(totalTTC)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Part 2: Analysis & Actions (Screen only) --- */}
            <div className="mt-10 pt-6 border-t-2 border-dashed no-export">
                <h3 className="text-2xl font-bold text-brand-dark mb-6">Analyse et Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                     <div className="bg-brand-light p-6 rounded-lg shadow">
                        <h4 className="text-lg font-semibold text-brand-dark">Montant Final</h4>
                        <p className="text-4xl font-bold text-brand-dark mt-2">{formatCurrency(finalPrincipal)}</p>
                    </div>
                    <div className="bg-green-100 p-6 rounded-lg shadow">
                        <h4 className="text-lg font-semibold text-green-800">Intérêts (TTC)</h4>
                        <p className="text-4xl font-bold text-green-800 mt-2">{formatCurrency(totalTTC)}</p>
                    </div>
                    <button onClick={handleExportPDF} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition h-full text-2xl">
                        Exporter en PDF
                    </button>
                </div>

                <div className="mb-8">
                    <h4 className="text-xl font-semibold text-brand-dark mb-4">Évolution du Capital</h4>
                    <div className="w-full h-80 bg-gray-50 p-4 rounded-lg">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} tick={{fontSize: 12}} />
                                <YAxis tickFormatter={(value) => new Intl.NumberFormat('fr-FR', {notation: 'compact', compactDisplay: 'short'}).format(value as number)} />
                                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                <Legend />
                                <Line type="monotone" dataKey="capital" stroke="#1e40af" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Capital" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div>
                    <h4 className="text-xl font-semibold text-brand-dark mb-4">Enregistrer ce calcul</h4>
                    <form onSubmit={handleSaveSubmit} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                        <input
                            type="text"
                            value={saveName}
                            onChange={(e) => setSaveName(e.target.value)}
                            placeholder="Nom du calcul"
                            className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                        <button type="submit" className="bg-brand-secondary hover:bg-brand-primary text-white font-bold py-2 px-4 rounded-md transition">
                            Enregistrer
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResultsDisplay;
