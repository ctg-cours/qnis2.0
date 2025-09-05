const { useState, useEffect } = React;
import type { CalculationInput, CalculationResult, SavedCalculation } from './types.js';
import { calculateCompoundInterest } from './services/calculationService.js';
import ResultsDisplay from './components/ResultsDisplay.js';
import History from './components/History.js';

const App = () => {
    const [inputs, setInputs] = useState<CalculationInput>({
        pieceTitle: 'Ordonnance exécutoire N°',
        pieceNumber: '109/01',
        pieceDate: '2001-02-26',
        principal: 996670,
        debtor: 'BEN AYED FATHI ET MEUBLES DE CARTHAGE A.V. FAIDHERBE',
        calculationStartDate: '1994-03-07',
        creditor: 'C.F.I Km10 Annis Bassit',
        legalMention: "(Aux termes du COCC-le taux d'intérêt est majoré de moitié -taux aggravés +2%.)",
        calculationEndDate: '2010-12-31',
    });

    const [result, setResult] = useState<CalculationResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<SavedCalculation[]>([]);

    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('interestCalculationHistory');
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (e) {
            console.error("Erreur lors du chargement de l'historique:", e);
            setHistory([]);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setInputs(prev => ({
            ...prev,
            [name]: isNumber && value !== '' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);

        setTimeout(() => {
            try {
                const calculationResult = calculateCompoundInterest(inputs);
                setResult(calculationResult);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Une erreur inattendue est survenue.");
                }
            } finally {
                setIsLoading(false);
            }
        }, 500);
    };

    const updateHistory = (newHistory: SavedCalculation[]) => {
        setHistory(newHistory);
        localStorage.setItem('interestCalculationHistory', JSON.stringify(newHistory));
    };

    const handleSaveToHistory = (name: string) => {
        if (!result) return;
        const newEntry: SavedCalculation = {
            id: new Date().toISOString(),
            name,
            savedAt: new Date().toISOString(),
            calculation: result,
        };
        updateHistory([newEntry, ...history]);
    };

    const handleLoadFromHistory = (id: string) => {
        const saved = history.find(item => item.id === id);
        if (saved) {
            setInputs(saved.calculation.inputs);
            setResult(saved.calculation);
            window.scrollTo(0, 0);
        }
    };

    const handleDeleteFromHistory = (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet élément de l'historique ?")) {
            const newHistory = history.filter(item => item.id !== id);
            updateHistory(newHistory);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <header className="bg-brand-dark shadow-md no-export">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-3xl font-bold text-white">Calculateur d'Intérêts Composés Juridiques</h1>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg no-export">
                    <h2 className="text-2xl font-bold text-brand-dark mb-6 border-b-2 border-brand-secondary pb-2">Informations du décompte</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="pieceTitle" className="block text-sm font-medium text-gray-700">Titre de la pièce</label>
                            <select id="pieceTitle" name="pieceTitle" value={inputs.pieceTitle} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary">
                                <option>Ordonnance exécutoire N°</option>
                                <option>Jugement N°</option>
                                <option>Arrêt N°</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="pieceNumber" className="block text-sm font-medium text-gray-700">N°</label>
                            <input type="text" id="pieceNumber" name="pieceNumber" value={inputs.pieceNumber} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label htmlFor="pieceDate" className="block text-sm font-medium text-gray-700">du (Date de la pièce)</label>
                            <input type="date" id="pieceDate" name="pieceDate" value={inputs.pieceDate} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label htmlFor="principal" className="block text-sm font-medium text-gray-700">Principal</label>
                            <div className="mt-1 flex items-center">
                                <input type="number" id="principal" name="principal" value={inputs.principal} onChange={handleInputChange} className="block w-full p-2 border border-gray-300 rounded-md shadow-sm" step="any"/>
                                <span className="ml-2 text-gray-500 whitespace-nowrap">F CFA</span>
                                <span className="ml-2 text-xs text-gray-400">(H.T.V.A)</span>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="debtor" className="block text-sm font-medium text-gray-700">A l'encontre de</label>
                            <input type="text" id="debtor" name="debtor" value={inputs.debtor} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label htmlFor="calculationStartDate" className="block text-sm font-medium text-gray-700">à partir du (Date de début du calcul)</label>
                            <input type="date" id="calculationStartDate" name="calculationStartDate" value={inputs.calculationStartDate} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                        </div>
                         <div>
                            <label htmlFor="creditor" className="block text-sm font-medium text-gray-700">En faveur de</label>
                            <select id="creditor" name="creditor" value={inputs.creditor} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                                <option>C.F.I Km10 Annis Bassit</option>
                                <option>Autre créancier</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="legalMention" className="block text-sm font-medium text-gray-700">Mention Légale</label>
                            <textarea id="legalMention" name="legalMention" value={inputs.legalMention} onChange={handleInputChange} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                        </div>
                        <div>
                            <label htmlFor="calculationEndDate" className="block text-sm font-medium text-gray-700">Date de fin du décompte</label>
                            <input type="date" id="calculationEndDate" name="calculationEndDate" value={inputs.calculationEndDate} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:bg-gray-400 flex items-center justify-center">
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Calcul en cours...
                                </>
                            ) : "Calculer"}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2">
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md mb-6" role="alert">
                            <p className="font-bold">Erreur</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {result ? (
                        <ResultsDisplay result={result} onSave={handleSaveToHistory} />
                    ) : (
                        <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col items-center justify-center text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="linejoin" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 14h.01M9 11h6m-3-4h.01M12 4h.01M4 7h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-600">En attente de calcul</h3>
                            <p className="text-gray-500 mt-2">Veuillez remplir le formulaire et cliquer sur "Calculer" pour voir les résultats.</p>
                        </div>
                    )}
                </div>
            </main>

            <section className="container mx-auto px-4 md:px-8 mt-8 no-export">
                <History history={history} onLoad={handleLoadFromHistory} onDelete={handleDeleteFromHistory} />
            </section>
        </div>
    );
};

export default App;
