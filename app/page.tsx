"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

interface Payment {
  id: number;
  title: string;
  dueDate: string;
  percentage: number;
  isDeposit: boolean;
}

interface PaymentPlan {
  title: string;
  payments: Payment[];
}

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingPaymentPlan, setIsEditingPaymentPlan] = useState(false);
  const [editingPlanType, setEditingPlanType] = useState('');
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>({
    title: '',
    payments: [
      { id: 1, title: 'Payment 1', dueDate: '', percentage: 25, isDeposit: false },
      { id: 2, title: 'Payment 2', dueDate: '', percentage: 25, isDeposit: false },
      { id: 3, title: 'Payment 3', dueDate: '', percentage: 25, isDeposit: false },
      { id: 4, title: 'Payment 4', dueDate: '', percentage: 25, isDeposit: false }
    ]
  });
  const [savedPlans, setSavedPlans] = useState<{[key: string]: PaymentPlan}>({});
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    startDate: '',
    endDate: '',
    isFree: false
  });

  const [paymentOptions, setPaymentOptions] = useState({
    fullPayment: false,
    fourInstallments: true,
    depositInstallments: true
  });

  const [expandedOptions, setExpandedOptions] = useState({
    fullPayment: false,
    fourInstallments: false,
    depositInstallments: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePriceChange = (value: string) => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    const formattedNumeric = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
    
    // Limit to 2 decimal places
    const limitedDecimals = formattedNumeric.includes('.') 
      ? formattedNumeric.split('.')[0] + '.' + formattedNumeric.split('.')[1]?.slice(0, 2)
      : formattedNumeric;
    
    setFormData(prev => ({ ...prev, price: limitedDecimals }));
  };

  const formatPriceForDisplay = (price: string) => {
    if (!price || price === '0') return '$0.00';
    
    const numericValue = parseFloat(price);
    if (isNaN(numericValue)) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  const formatPriceForInput = (price: string) => {
    if (!price || price === '0') return '';
    
    const numericValue = parseFloat(price);
    if (isNaN(numericValue)) return '';
    
    return numericValue.toFixed(2);
  };

  const handleFreeCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      isFree: checked,
      price: checked ? "0.00" : prev.price // Reset price to $0.00 when free is checked
    }));
  };

  const handlePaymentOptionChange = (option: string, checked: boolean) => {
    setPaymentOptions(prev => ({ ...prev, [option]: checked }));
  };

  const toggleExpandedOption = (option: string) => {
    setExpandedOptions(prev => ({ ...prev, [option]: !prev[option as keyof typeof prev] }));
  };

  const calculateInstallments = (total: number, count: number) => {
    const installment = total / count;
    return installment.toFixed(2);
  };

  const generatePaymentDates = (startDate: string, count: number) => {
    const dates = [];
    const start = new Date(startDate);
    
    // For the first payment, use the 1st of the month following the start date
    let firstPaymentDate = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    
    for (let i = 0; i < count; i++) {
      const date = new Date(firstPaymentDate);
      date.setMonth(date.getMonth() + i);
      dates.push(date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }));
    }
    
    return dates;
  };

  const openEditPlan = (planType: string) => {
    setEditingPlanType(planType);
    
    // Check if there's already a saved plan for this type
    const existingPlan = savedPlans[planType];
    
    if (existingPlan) {
      // Load the existing saved plan
      setPaymentPlan(existingPlan);
    } else {
      // Initialize with default payment plan based on type
      let title = '';
      let payments: Payment[] = [];
      
      if (planType === 'fourInstallments') {
        title = '4 Installments';
        const dates = generatePaymentDates(formData.startDate, 4);
        payments = [
          { id: 1, title: 'Payment 1', dueDate: dates[0], percentage: 25, isDeposit: false },
          { id: 2, title: 'Payment 2', dueDate: dates[1], percentage: 25, isDeposit: false },
          { id: 3, title: 'Payment 3', dueDate: dates[2], percentage: 25, isDeposit: false },
          { id: 4, title: 'Payment 4', dueDate: dates[3], percentage: 25, isDeposit: false }
        ];
      } else if (planType === 'depositInstallments') {
        title = 'Deposit + 4 Installments';
        const dates = generatePaymentDates(formData.startDate, 4);
        payments = [
          { id: 1, title: 'Deposit', dueDate: 'Due at checkout', percentage: 20, isDeposit: true },
          { id: 2, title: 'Payment 1', dueDate: dates[0], percentage: 20, isDeposit: false },
          { id: 3, title: 'Payment 2', dueDate: dates[1], percentage: 20, isDeposit: false },
          { id: 4, title: 'Payment 3', dueDate: dates[2], percentage: 20, isDeposit: false },
          { id: 5, title: 'Payment 4', dueDate: dates[3], percentage: 20, isDeposit: false }
        ];
      }
      
      setPaymentPlan({ title, payments });
    }
    
    setIsEditingPaymentPlan(true);
  };

  const handlePaymentChange = (id: number, field: string, value: any) => {
    setPaymentPlan(prev => ({
      ...prev,
      payments: prev.payments.map(payment => {
        if (payment.id === id) {
          // If this payment is being marked as a deposit, unmark all others
          if (field === 'isDeposit' && value === true) {
            return { ...payment, [field]: value };
          }
          return { ...payment, [field]: value };
        } else {
          // If another payment is being marked as deposit, unmark this one
          if (field === 'isDeposit' && value === true) {
            return { ...payment, isDeposit: false };
          }
          return payment;
        }
      })
    }));
  };

  const addPayment = () => {
    const newId = Math.max(...paymentPlan.payments.map(p => p.id)) + 1;
    const currentTotal = getTotalPercentage();
    const remainingPercentage = 100 - currentTotal;
    
    setPaymentPlan(prev => ({
      ...prev,
      payments: [...prev.payments, { 
        id: newId, 
        title: `Payment ${newId}`, 
        dueDate: '', 
        percentage: remainingPercentage > 0 ? remainingPercentage : 0, 
        isDeposit: false // Only first payment can be deposit
      }]
    }));
  };

  const removePayment = (id: number) => {
    setPaymentPlan(prev => ({
      ...prev,
      payments: prev.payments.filter(payment => payment.id !== id)
    }));
  };

  const getTotalPercentage = () => {
    return paymentPlan.payments.reduce((sum, payment) => sum + payment.percentage, 0);
  };

  const canSavePlan = () => {
    return getTotalPercentage() === 100;
  };

  const savePlan = () => {
    // Save the current plan to the saved plans
    setSavedPlans(prev => ({
      ...prev,
      [editingPlanType]: { ...paymentPlan }
    }));
    setIsEditingPaymentPlan(false);
  };

  const renderCustomPaymentPlan = (planType: string) => {
    const savedPlan = savedPlans[planType];
    if (!savedPlan) return null;

    return savedPlan.payments.map((payment, index) => (
      <div key={payment.id} className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {payment.title} due {payment.dueDate}
        </span>
        <span className="font-medium text-gray-900">
          ${formData.price ? ((parseFloat(formData.price) * payment.percentage / 100).toFixed(2)) : '0.00'}
        </span>
      </div>
    ));
  };

  const getCustomPlanTitle = (planType: string) => {
    const savedPlan = savedPlans[planType];
    return savedPlan?.title || (planType === 'fourInstallments' ? '4 Installments' : 'Deposit + 4 Installments');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Registrations</h1>
          <p className="text-gray-600 mt-2">Manage your event registrations</p>
        </div>

        {/* Add Registration Button */}
        <div className="mb-6">
                      <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Add Registration
              </Button>
            </SheetTrigger>
            <SheetContent 
              className="w-[642px] sm:max-w-[642px] p-0 flex flex-col bg-gray-50"
              onPointerDownOutside={(e) => {
                // Prevent closing when clicking outside if editing payment plan
                if (isEditingPaymentPlan) {
                  e.preventDefault();
                }
              }}
            >
              
              {/* Sticky Header */}
              <SheetHeader className="sticky top-0 z-10 bg-white border-b px-4 py-3">
                <SheetTitle className="text-lg font-semibold">Add Registration</SheetTitle>
              </SheetHeader>
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pl-4 pr-4">
                <div className="space-y-4">
                  
                  {/* Registration Details Card */}
                  <Card className="bg-white border border-gray-200">
                    <CardHeader className="pb-2">
                      
                      <div className="flex items-center gap-4">
                        <CardTitle className="text-lg font-semibold text-gray-900">Registration Details</CardTitle>
                        <span className="text-red-500">*</span>
                      </div>

                    </CardHeader>
                    <CardContent className="space-y-6">
                      
                      {/* Title Field */}
                      <div className="space-y-1">
                        <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                          Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          className="w-full"
                          maxLength={150}
                        />
                        <p className="text-sm text-gray-500">
                          Character limit: {formData.title.length}/150
                        </p>
                      </div>

                      {/* Price Field */}
                      <div className="space-y-1">
                        <Label htmlFor="price" className="text-sm font-semibold text-gray-700">
                          Price <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            id="price"
                            type="text"
                            value={formData.price}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            className="w-full pl-6"
                            placeholder="0.00"
                          />
                        </div>

                        {/* Free Checkbox */}
                        <div className="flex items-center space-x-2 pt-2">
                          <Checkbox
                            id="isFree"
                            checked={formData.isFree}
                            onCheckedChange={(checked) => handleFreeCheckboxChange(checked as boolean)}
                          />
                          <Label htmlFor="isFree" className="text-sm font-medium text-gray-700">
                            This registration is FREE
                          </Label>
                        </div>
                      </div>

                      

                      {/* Description Field */}
                      <div className="space-y-1">
                        <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className="w-full min-h-[80px]"
                          placeholder="Enter registration description..."
                          maxLength={1000}
                        />
                        <p className="text-xs text-gray-500">
                          Character limit: {formData.description.length}/1000
                        </p>
                      </div>

                      {/* Event Dates Section */}
                      <div className="space-y-0 pt-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold text-gray-900">Event Dates</h4>
                          <span className="text-red-500">*</span>
                        </div>
                        
                        <p className="text-sm text-gray-600 pt-1 pb-4">
                          Set this registration's start and end dates. These are the dates registrants will attend your program.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Start Date */}
                          <div className="space-y-1">
                            <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700">
                              Start Date
                            </Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={formData.startDate}
                              onChange={(e) => handleInputChange('startDate', e.target.value)}
                              className="w-full"
                            />
                          </div>

                          {/* End Date */}
                          <div className="space-y-1">
                            <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700">
                              End Date
                            </Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={formData.endDate}
                              onChange={(e) => handleInputChange('endDate', e.target.value)}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Options Card */}
                  {!isEditingPaymentPlan ? (
                    <Card className="bg-white border border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg font-semibold text-gray-900">Payment Options</CardTitle>
                          <span className="text-red-500">*</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Enable different payment options for this registration.
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {/* Full Payment Option */}
                        <div className="border border-gray-200 rounded-lg bg-white">
                          <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleExpandedOption('fullPayment')}>
                            <div className="flex items-center gap-3">
                              <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedOptions.fullPayment ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <span className="text-sm font-semibold text-gray-900">Full Payment</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium text-gray-700">{formatPriceForDisplay(formData.price)}</span>
                              <Switch
                                checked={paymentOptions.fullPayment}
                                onCheckedChange={(checked) => handlePaymentOptionChange('fullPayment', checked)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          
                          {expandedOptions.fullPayment && (
                            <div className="px-4 pb-4 border-t border-gray-100">
                              <div className="pt-3 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Payment 1 due {new Date(formData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  <span className="font-medium text-gray-900">{formatPriceForDisplay(formData.price)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-gray-500">
                                    Full payment is due on the registration start date.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 4 Installments Option */}
                        <div className="border border-gray-200 rounded-lg bg-white">
                          <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleExpandedOption('fourInstallments')}>
                            <div className="flex items-center gap-3">
                              <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedOptions.fourInstallments ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <span className="text-sm font-semibold text-gray-900">{getCustomPlanTitle('fourInstallments')}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium text-gray-700">{formatPriceForDisplay(formData.price)}</span>
                              <Switch
                                checked={paymentOptions.fourInstallments}
                                onCheckedChange={(checked) => handlePaymentOptionChange('fourInstallments', checked)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          
                          {expandedOptions.fourInstallments && (
                            <div className="px-4 pb-4 border-t border-gray-100">
                              <div className="pt-3 space-y-3">
                                {savedPlans.fourInstallments ? (
                                  renderCustomPaymentPlan('fourInstallments')
                                ) : (
                                  generatePaymentDates(formData.startDate, 4).map((date, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600">Payment {index + 1} due {date}</span>
                                      <span className="font-medium text-gray-900">${calculateInstallments(parseFloat(formData.price), 4)}</span>
                                    </div>
                                  ))
                                )}
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-gray-500">
                                    {savedPlans.fourInstallments ? 'Custom payment plan' : 'Payment dates auto-generate monthly based on your registration\'s start date.'}
                                  </p>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-xs"
                                    onClick={() => openEditPlan('fourInstallments')}
                                  >
                                    {savedPlans.fourInstallments ? 'Edit Plan' : 'Edit Plan'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Deposit + 4 Installments Option */}
                        <div className="border border-gray-200 rounded-lg bg-white">
                          <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleExpandedOption('depositInstallments')}>
                            <div className="flex items-center gap-3">
                              <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedOptions.depositInstallments ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <span className="text-sm font-semibold text-gray-900">{getCustomPlanTitle('depositInstallments')}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium text-gray-700">{formatPriceForDisplay(formData.price)}</span>
                              <Switch
                                checked={paymentOptions.depositInstallments}
                                onCheckedChange={(checked) => handlePaymentOptionChange('depositInstallments', checked)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          
                          {expandedOptions.depositInstallments && (
                            <div className="px-4 pb-4 border-t border-gray-100">
                              <div className="pt-3 space-y-3">
                                {savedPlans.depositInstallments ? (
                                  renderCustomPaymentPlan('depositInstallments')
                                ) : (
                                  <>
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600">Deposit due at checkout</span>
                                      <span className="font-medium text-gray-900">${calculateInstallments(parseFloat(formData.price), 5)}</span>
                                    </div>
                                    {generatePaymentDates(formData.startDate, 4).map((date, index) => (
                                      <div key={index} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Payment {index + 1} due {date}</span>
                                        <span className="font-medium text-gray-900">${calculateInstallments(parseFloat(formData.price), 5)}</span>
                                      </div>
                                    ))}
                                  </>
                                )}
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-gray-500">
                                    {savedPlans.depositInstallments ? 'Custom payment plan' : 'Payment dates auto-generate monthly based on your registration\'s start date.'}
                                  </p>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-xs"
                                    onClick={() => openEditPlan('depositInstallments')}
                                  >
                                    {savedPlans.depositInstallments ? 'Edit Plan' : 'Edit Plan'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    /* Inline Payment Plan Editor */
                    <Card className="bg-white border border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg font-semibold text-gray-900">Edit Payment Plan</CardTitle>
                            <span className="text-sm text-gray-600">
                              {editingPlanType === 'fourInstallments' ? '4 Installments' : 'Deposit + 4 Installments'}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingPaymentPlan(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Payment Plan Title */}
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-gray-900">Payment plan title</h3>
                          <p className="text-sm text-gray-600">This title will be visible to your customers at checkout.</p>
                          <Input
                            value={paymentPlan.title}
                            onChange={(e) => setPaymentPlan(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter plan title"
                            className="w-full"
                          />
                        </div>

                        {/* Plan Schedule */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900">Plan schedule</h3>
                          <p className="text-sm text-gray-600">These fees will be listed and collected during registration checkout.</p>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800">
                              <strong>Tip:</strong> Edit payment names, dates, and percentages. Only the first payment can be marked as a deposit. 
                              Total must equal 100% to save.
                            </p>
                          </div>
                          
                          {/* Payment Table */}
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 grid grid-cols-5 gap-4 text-sm font-medium text-gray-700">
                              <div>Title</div>
                              <div>Due Date</div>
                              <div>Percentage</div>
                              <div>Amount</div>
                              <div></div>
                            </div>
                            
                            {paymentPlan.payments.map((payment, index) => (
                              <div key={payment.id} className="px-4 py-3 grid grid-cols-5 gap-4 items-center border-t border-gray-200">
                                <Input
                                  value={payment.title}
                                  onChange={(e) => handlePaymentChange(payment.id, 'title', e.target.value)}
                                  className="text-sm"
                                  placeholder="Payment name"
                                />
                                <Input
                                  type="date"
                                  value={payment.dueDate}
                                  onChange={(e) => handlePaymentChange(payment.id, 'dueDate', e.target.value)}
                                  className="text-sm"
                                />
                                <div className="relative">
                                  <Input
                                    type="text"
                                    value={payment.percentage}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      // Allow typing numbers and decimals
                                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                        const numValue = parseFloat(value) || 0;
                                        handlePaymentChange(payment.id, 'percentage', numValue);
                                      }
                                    }}
                                    className="text-sm pr-8"
                                    placeholder="0"
                                  />
                                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  ${formData.price ? ((parseFloat(formData.price) * payment.percentage / 100).toFixed(2)) : '0.00'}
                                </div>
                                <div className="flex items-center gap-2">
                                  {index === 0 && (
                                    <div className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded">
                                      <Checkbox
                                        checked={payment.isDeposit}
                                        onCheckedChange={(checked) => handlePaymentChange(payment.id, 'isDeposit', checked)}
                                      />
                                      <span className="text-xs text-blue-700 font-medium">Deposit</span>
                                    </div>
                                  )}
                                  {paymentPlan.payments.length > 1 && (
                                    <button
                                      onClick={() => removePayment(payment.id)}
                                      className="text-red-500 hover:text-red-700 ml-auto p-1 rounded hover:bg-red-50"
                                      title="Remove payment"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Add Payment Button */}
                          <Button
                            variant="outline"
                            onClick={addPayment}
                            className="w-full"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Payment
                          </Button>

                          {/* Validation and Save */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="text-sm">
                              {getTotalPercentage() === 100 ? (
                                <div className="flex items-center gap-2 text-green-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Payment plan is complete (100%)</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-red-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                  <span>Remaining: {(100 - getTotalPercentage()).toFixed(2)}%</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-3">
                              {savedPlans[editingPlanType] && (
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    // Reset to default plan
                                    const defaultPlan = editingPlanType === 'fourInstallments' 
                                      ? { title: '4 Installments', payments: generatePaymentDates(formData.startDate, 4).map((date, i) => ({ id: i + 1, title: `Payment ${i + 1}`, dueDate: date, percentage: 25, isDeposit: false })) }
                                      : { title: 'Deposit + 4 Installments', payments: [{ id: 1, title: 'Deposit', dueDate: 'Due at checkout', percentage: 20, isDeposit: true }, ...generatePaymentDates(formData.startDate, 4).map((date, i) => ({ id: i + 2, title: `Payment ${i + 1}`, dueDate: date, percentage: 20, isDeposit: false }))] };
                                    setPaymentPlan(defaultPlan);
                                  }}
                                >
                                  Reset to Default
                                </Button>
                              )}
                              <Button
                                onClick={savePlan}
                                disabled={!canSavePlan()}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                              >
                                Save Plan
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 z-10 bg-white border-t px-4 py-3">
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Create Registration
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Registrations List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first registration</p>
            </div>
          </CardContent>
        </Card>
      </div>

      
    </div>
  );
}