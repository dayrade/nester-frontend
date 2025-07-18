"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Calculator, DollarSign, Percent, Calendar, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface MortgageCalculatorProps {
  propertyPrice?: number
  className?: string
}

interface MortgageCalculation {
  monthlyPayment: number
  totalInterest: number
  totalPayment: number
  principalAndInterest: number
  propertyTax: number
  insurance: number
  pmi: number
}

export function MortgageCalculator({ propertyPrice = 0, className = "" }: MortgageCalculatorProps) {
  const [homePrice, setHomePrice] = useState(propertyPrice || 500000)
  const [downPayment, setDownPayment] = useState(100000)
  const [downPaymentPercent, setDownPaymentPercent] = useState(20)
  const [interestRate, setInterestRate] = useState(6.5)
  const [loanTerm, setLoanTerm] = useState(30)
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.2)
  const [homeInsurance, setHomeInsurance] = useState(1200)
  const [pmiRate, setPmiRate] = useState(0.5)
  const [calculation, setCalculation] = useState<MortgageCalculation | null>(null)

  useEffect(() => {
    if (propertyPrice > 0) {
      setHomePrice(propertyPrice)
      setDownPayment(propertyPrice * 0.2)
    }
  }, [propertyPrice])

  useEffect(() => {
    calculateMortgage()
  }, [homePrice, downPayment, interestRate, loanTerm, propertyTaxRate, homeInsurance, pmiRate])

  const handleDownPaymentChange = (value: string) => {
    const amount = parseFloat(value) || 0
    setDownPayment(amount)
    setDownPaymentPercent((amount / homePrice) * 100)
  }

  const handleDownPaymentPercentChange = (percent: number[]) => {
    const percentage = percent[0]
    setDownPaymentPercent(percentage)
    setDownPayment((homePrice * percentage) / 100)
  }

  const calculateMortgage = () => {
    const principal = homePrice - downPayment
    const monthlyRate = interestRate / 100 / 12
    const numberOfPayments = loanTerm * 12

    // Monthly principal and interest
    const monthlyPI = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                     (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

    // Property tax (monthly)
    const monthlyPropertyTax = (homePrice * propertyTaxRate / 100) / 12

    // Home insurance (monthly)
    const monthlyInsurance = homeInsurance / 12

    // PMI (monthly) - only if down payment is less than 20%
    const monthlyPMI = downPaymentPercent < 20 ? (principal * pmiRate / 100) / 12 : 0

    // Total monthly payment
    const totalMonthlyPayment = monthlyPI + monthlyPropertyTax + monthlyInsurance + monthlyPMI

    // Total interest over life of loan
    const totalInterest = (monthlyPI * numberOfPayments) - principal

    // Total payment over life of loan
    const totalPayment = monthlyPI * numberOfPayments

    setCalculation({
      monthlyPayment: totalMonthlyPayment,
      totalInterest,
      totalPayment,
      principalAndInterest: monthlyPI,
      propertyTax: monthlyPropertyTax,
      insurance: monthlyInsurance,
      pmi: monthlyPMI
    })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Mortgage Calculator
          </CardTitle>
          <CardDescription>
            Calculate your monthly mortgage payment and see the breakdown
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Home Price */}
          <div className="space-y-2">
            <Label htmlFor="homePrice">Home Price</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="homePrice"
                type="number"
                value={homePrice}
                onChange={(e) => setHomePrice(parseFloat(e.target.value) || 0)}
                className="pl-10"
                placeholder="500000"
              />
            </div>
          </div>

          {/* Down Payment */}
          <div className="space-y-4">
            <Label>Down Payment</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="downPaymentAmount" className="text-sm text-gray-600">Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="downPaymentAmount"
                    type="number"
                    value={downPayment}
                    onChange={(e) => handleDownPaymentChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Percentage: {downPaymentPercent.toFixed(1)}%</Label>
                <Slider
                  value={[downPaymentPercent]}
                  onValueChange={handleDownPaymentPercentChange}
                  max={50}
                  min={0}
                  step={0.5}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                className="pl-10"
                placeholder="6.5"
              />
            </div>
          </div>

          {/* Loan Term */}
          <div className="space-y-2">
            <Label htmlFor="loanTerm">Loan Term (Years)</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="loanTerm"
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(parseFloat(e.target.value) || 0)}
                className="pl-10"
                placeholder="30"
              />
            </div>
          </div>

          {/* Property Tax Rate */}
          <div className="space-y-2">
            <Label htmlFor="propertyTaxRate">Property Tax Rate (% annually)</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="propertyTaxRate"
                type="number"
                step="0.1"
                value={propertyTaxRate}
                onChange={(e) => setPropertyTaxRate(parseFloat(e.target.value) || 0)}
                className="pl-10"
                placeholder="1.2"
              />
            </div>
          </div>

          {/* Home Insurance */}
          <div className="space-y-2">
            <Label htmlFor="homeInsurance">Home Insurance (annually)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="homeInsurance"
                type="number"
                value={homeInsurance}
                onChange={(e) => setHomeInsurance(parseFloat(e.target.value) || 0)}
                className="pl-10"
                placeholder="1200"
              />
            </div>
          </div>

          {/* PMI Rate */}
          {downPaymentPercent < 20 && (
            <div className="space-y-2">
              <Label htmlFor="pmiRate">PMI Rate (% annually)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="pmiRate"
                  type="number"
                  step="0.1"
                  value={pmiRate}
                  onChange={(e) => setPmiRate(parseFloat(e.target.value) || 0)}
                  className="pl-10"
                  placeholder="0.5"
                />
              </div>
              <p className="text-sm text-amber-600">
                PMI is required when down payment is less than 20%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Monthly Payment Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Total Monthly Payment */}
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Monthly Payment</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(calculation.monthlyPayment)}
                  </p>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Principal & Interest</span>
                    <span className="font-medium">{formatCurrency(calculation.principalAndInterest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Tax</span>
                    <span className="font-medium">{formatCurrency(calculation.propertyTax)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Home Insurance</span>
                    <span className="font-medium">{formatCurrency(calculation.insurance)}</span>
                  </div>
                  {calculation.pmi > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">PMI</span>
                      <span className="font-medium">{formatCurrency(calculation.pmi)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Loan Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Amount</span>
                  <span className="font-medium">{formatCurrency(homePrice - downPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest</span>
                  <span className="font-medium">{formatCurrency(calculation.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Payment</span>
                  <span className="font-medium">{formatCurrency(calculation.totalPayment)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MortgageCalculator