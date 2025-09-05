import { REFERENCE_RATES } from '../constants.js';
import type { CalculationInput, CalculationResult, CalculationStep } from '../types.js';

// Helper pour parser les dates en UTC et éviter les problèmes de fuseau horaire.
function parseUTCDate(dateString: string): Date {
    // Ajoute T00:00:00Z pour forcer l'interprétation en UTC.
    return new Date(`${dateString}T00:00:00Z`);
}

// Helper pour ajouter des jours à une date UTC.
function addUTCDays(date: Date, days: number): Date {
    const newDate = new Date(date.getTime());
    newDate.setUTCDate(newDate.getUTCDate() + days);
    return newDate;
}

// Helper pour calculer la différence en jours entre deux dates UTC.
function diffInDays(date1: Date, date2: Date): number {
    const oneDay = 1000 * 60 * 60 * 24;
    // La différence est calculée en millisecondes UTC.
    const diffTime = date2.getTime() - date1.getTime();
    return Math.round(diffTime / oneDay);
}

// Trouve le taux d'intérêt applicable pour une date donnée.
function findRateForDate(date: Date): number {
    // On suppose que REFERENCE_RATES est trié par date de début croissante.
    let applicableRate = 0;
    for (const rateInfo of REFERENCE_RATES) {
        if (parseUTCDate(rateInfo.startDate) <= date) {
            applicableRate = rateInfo.rate;
        } else {
            break; // Optimisation : on peut s'arrêter car la liste est triée.
        }
    }
    return applicableRate;
}

// Applique les modifications au taux en fonction de la mention légale.
function applyLegalMention(rate: number, legalMention: string): number {
    let modifiedRate = rate;
    if (legalMention.includes("majoré de moitié")) {
        modifiedRate *= 1.5;
    }
    if (legalMention.includes("+2%")) {
        modifiedRate += 0.02;
    }
    return modifiedRate;
}

export function calculateCompoundInterest(inputs: CalculationInput): CalculationResult {
    const { principal, calculationStartDate, calculationEndDate, legalMention } = inputs;

    const startDate = parseUTCDate(calculationStartDate);
    const endDate = parseUTCDate(calculationEndDate);

    if (startDate >= endDate) {
        throw new Error("La date de fin doit être postérieure à la date de début.");
    }

    let currentPrincipal = principal;
    let currentDate = startDate;
    const steps: CalculationStep[] = [];

    while (currentDate <= endDate) {
        const baseRate = findRateForDate(currentDate);
        const actualRate = applyLegalMention(baseRate, legalMention);

        // Détermine la fin du segment : soit la date de fin globale, soit la veille du prochain changement de taux.
        let segmentEndDate = endDate;
        // Trouver la prochaine date de changement de taux
        for (const rateInfo of REFERENCE_RATES) {
            const rateChangeDate = parseUTCDate(rateInfo.startDate);
            // Si la date de changement est après la date actuelle
            if (rateChangeDate > currentDate) {
                // La fin du segment est la veille de ce changement
                const dayBeforeRateChange = addUTCDays(rateChangeDate, -1);
                // On prend la date la plus proche : la fin du segment ou la fin globale
                if (dayBeforeRateChange < segmentEndDate) {
                    segmentEndDate = dayBeforeRateChange;
                }
                // Comme les taux sont triés, on peut sortir de la boucle
                break;
            }
        }

        // S'assurer que la fin du segment ne dépasse pas la date de fin globale
        if (segmentEndDate > endDate) {
            segmentEndDate = endDate;
        }

        // Le nombre de jours dans le segment est inclusif (fin - début + 1)
        const daysInSegment = diffInDays(currentDate, segmentEndDate) + 1;

        if (daysInSegment <= 0) {
            // S'il n'y a plus de jours à traiter, on sort.
            break;
        }

        // La formule utilise 365.25 pour tenir compte des années bissextiles.
        const interest = currentPrincipal * actualRate * (daysInSegment / 365.25);

        steps.push({
            periodStart: currentDate.toISOString().split('T')[0],
            periodEnd: segmentEndDate.toISOString().split('T')[0],
            days: daysInSegment,
            rate: actualRate,
            principalStart: currentPrincipal,
            interest: interest,
        });

        currentPrincipal += interest;
        // Passer au jour suivant la fin du segment actuel
        currentDate = addUTCDays(segmentEndDate, 1);
    }

    const totalInterest = currentPrincipal - principal;

    return {
        steps,
        initialPrincipal: principal,
        finalPrincipal: currentPrincipal,
        totalInterest,
        inputs,
    };
}
