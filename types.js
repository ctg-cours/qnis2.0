export interface CalculationInput {
  pieceTitle: string;
  pieceNumber: string;
  pieceDate: string;
  principal: number;
  debtor: string;
  calculationStartDate: string;
  creditor: string;
  legalMention: string;
  calculationEndDate: string;
}

export interface CalculationStep {
  periodStart: string;
  periodEnd: string;
  days: number;
  rate: number;
  principalStart: number;
  interest: number;
}

export interface CalculationResult {
  steps: CalculationStep[];
  initialPrincipal: number;
  finalPrincipal: number;
  totalInterest: number;
  inputs: CalculationInput;
}

export interface SavedCalculation {
  id: string;
  name: string;
  savedAt: string;
  calculation: CalculationResult;
}
