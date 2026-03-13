/**
 * Centralized calculation logic for SolControle
 * Ensures consistency between Dashboards and PDFs
 */

export const DEFAULT_ENERGY_TARIFF = 1.13;

export interface CalculationInput {
  injectedKwh: number;
  solarValue: number;
  energisaBillValue: number;
  utilityTariffUsed?: number;
}

export interface CalculationResult {
  estimatedUtilityCost: number;
  solarCost: number;
  monthlySavings: number;
  savingsPercentage: number;
}

/**
 * Calculates financial metrics for a bill
 * @param input - Bill data (kWh, values, tariff)
 * @returns Resulting costs and savings
 */
export function calculateBillMetrics(input: CalculationInput): CalculationResult {
  const { injectedKwh, solarValue, energisaBillValue, utilityTariffUsed } = input;
  
  const tariff = utilityTariffUsed || DEFAULT_ENERGY_TARIFF;
  
  // Estimated cost if paying the utility provider (Energisa)
  // Logic: Consumption (kWh) * Tariff
  const estimatedUtilityCost = Number(injectedKwh) * tariff;
  
  // Real cost with SolControle
  // Logic: Just the solar energy charge (taxes are separate)
  const solarCost = Number(solarValue);
  
  // Monthly Savings
  const monthlySavings = estimatedUtilityCost - solarCost;
  
  // Savings Percentage
  const savingsPercentage = estimatedUtilityCost > 0 
    ? (monthlySavings / estimatedUtilityCost) * 100 
    : 0;

  return {
    estimatedUtilityCost: Number(estimatedUtilityCost.toFixed(2)),
    solarCost: Number(solarCost.toFixed(2)),
    monthlySavings: Number(monthlySavings.toFixed(2)),
    savingsPercentage: Number(savingsPercentage.toFixed(2))
  };
}

/**
 * Standard utility tariff used across the system
 * Fallback to 1.13 if not provided by settings
 */
export function getStandardTariff(settingsTariff?: number | null): number {
  return settingsTariff || DEFAULT_ENERGY_TARIFF;
}
