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
import { RegistrationList } from "@/components/RegistrationList";

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

interface Registration {
  id: string;
  title: string;
  price: string;
  description: string;
  startDate: string;
  endDate: string;
  isFree: boolean;
  paymentOptions: {
    fullPayment: boolean;
    fourInstallments: boolean;
    depositInstallments: boolean;
  };
  savedPlans: {[key: string]: PaymentPlan};
  createdAt: Date;
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
  const [editedPercentages, setEditedPercentages] = useState<Set<number>>(new Set());
  const [savedPlans, setSavedPlans] = useState<{[key: string]: PaymentPlan}>({});
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    startDate: '',
    endDate: '',
    isFree: false
  });
  const [dateValidation, setDateValidation] = useState({
    startDateValid: true,
    startDateError: ''
  });

  const [paymentOptions, setPaymentOptions] = useState({
    fullPayment: true,
    fourInstallments: false,
    depositInstallments: false
  });

  const [expandedOptions, setExpandedOptions] = useState({
    fullPayment: false,
    fourInstallments: false,
    depositInstallments: false
  });

  const validateStartDate = (dateString: string) => {
    if (!dateString) {
      return { isValid: true, error: '' };
    }
    
    const selectedDate = new Date(dateString);
    const today = new Date();
    
    // Reset time to start of day for comparison
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return { isValid: false, error: 'Start date must be today or in the future' };
    }
    
    return { isValid: true, error: '' };
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If start date changes, validate and update all payment plan dates
    if (field === 'startDate') {
      const validation = validateStartDate(value as string);
      setDateValidation({
        startDateValid: validation.isValid,
        startDateError: validation.error
      });
      
      // Update payment plans based on validation
      if (validation.isValid) {
        // Update current payment plan if editing
        if (isEditingPaymentPlan && paymentPlan.payments.length > 0) {
          const dates = generatePaymentDates(value as string || '', paymentPlan.payments.length);
          setPaymentPlan(prev => ({
            ...prev,
            payments: prev.payments.map((payment, index) => {
              if (payment.isDeposit) {
                return { ...payment, dueDate: 'Due at checkout' };
              } else {
                const dateIndex = index - (prev.payments.filter(p => p.isDeposit).length);
                return { ...payment, dueDate: dates[dateIndex] || '' };
              }
            })
          }));
        }
        
        // Update saved plans with new dates
        setSavedPlans(prev => {
          const updatedPlans = { ...prev };
          
          // Update fourInstallments plan
          if (updatedPlans.fourInstallments) {
            const dates = generatePaymentDates(value as string || '', updatedPlans.fourInstallments.payments.length);
            updatedPlans.fourInstallments = {
              ...updatedPlans.fourInstallments,
              payments: updatedPlans.fourInstallments.payments.map((payment, index) => {
                if (payment.isDeposit) {
                  return { ...payment, dueDate: 'Due at checkout' };
                } else {
                  const dateIndex = index - (updatedPlans.fourInstallments.payments.filter(p => p.isDeposit).length);
                  return { ...payment, dueDate: dates[dateIndex] || '' };
                }
              })
            };
          }
          
          // Update depositInstallments plan
          if (updatedPlans.depositInstallments) {
            const dates = generatePaymentDates(value as string || '', updatedPlans.depositInstallments.payments.length);
            updatedPlans.depositInstallments = {
              ...updatedPlans.depositInstallments,
              payments: updatedPlans.depositInstallments.payments.map((payment, index) => {
                if (payment.isDeposit) {
                  return { ...payment, dueDate: 'Due at checkout' };
                } else {
                  const dateIndex = index - (updatedPlans.depositInstallments.payments.filter(p => p.isDeposit).length);
                  return { ...payment, dueDate: dates[dateIndex] || '' };
                }
              })
            };
          }
          
          return updatedPlans;
        });
      } else {
        // Clear payment dates when start date is invalid
        if (isEditingPaymentPlan && paymentPlan.payments.length > 0) {
          setPaymentPlan(prev => ({
            ...prev,
            payments: prev.payments.map((payment) => {
              if (payment.isDeposit) {
                return { ...payment, dueDate: 'Due at checkout' };
              } else {
                return { ...payment, dueDate: '' };
              }
            })
          }));
        }
        
        // Clear saved plans dates when start date is invalid
        setSavedPlans(prev => {
          const updatedPlans = { ...prev };
          
          // Clear fourInstallments plan dates
          if (updatedPlans.fourInstallments) {
            updatedPlans.fourInstallments = {
              ...updatedPlans.fourInstallments,
              payments: updatedPlans.fourInstallments.payments.map((payment) => {
                if (payment.isDeposit) {
                  return { ...payment, dueDate: 'Due at checkout' };
                } else {
                  return { ...payment, dueDate: '' };
                }
              })
            };
          }
          
          // Clear depositInstallments plan dates
          if (updatedPlans.depositInstallments) {
            updatedPlans.depositInstallments = {
              ...updatedPlans.depositInstallments,
              payments: updatedPlans.depositInstallments.payments.map((payment) => {
                if (payment.isDeposit) {
                  return { ...payment, dueDate: 'Due at checkout' };
                } else {
                  return { ...payment, dueDate: '' };
                }
              })
            };
          }
          
          return updatedPlans;
        });
      }
    }
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

  const generatePaymentDates = (registrationDate: string, count: number) => {
    const dates = [];
    
    // Validate the registration date
    const registration = new Date(registrationDate);
    if (isNaN(registration.getTime()) || !registrationDate) {
      // If invalid date, return empty dates
      for (let i = 0; i < count; i++) {
        dates.push('');
      }
      return dates;
    }
    
    // For the first payment, use the 1st of the month following the month after registration
    // Example: Register on March 15 -> First payment due May 1
    const firstPaymentDate = new Date(registration.getFullYear(), registration.getMonth() + 2, 1);
    
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
    
    // Reset edited percentages when opening a new plan
    setEditedPercentages(new Set());
    
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
        title = '4 Installments';
        const dates = generatePaymentDates(formData.startDate, 4);
        payments = [
          { id: 1, title: 'Payment 1', dueDate: 'Due at checkout', percentage: 25, isDeposit: true },
          { id: 2, title: 'Payment 2', dueDate: dates[0], percentage: 25, isDeposit: false },
          { id: 3, title: 'Payment 3', dueDate: dates[1], percentage: 25, isDeposit: false },
          { id: 4, title: 'Payment 4', dueDate: dates[2], percentage: 25, isDeposit: false }
        ];
      }
      
      setPaymentPlan({ title, payments });
    }
    
    setIsEditingPaymentPlan(true);
  };

  const handlePaymentChange = (id: number, field: string, value: string | number | boolean) => {
    setPaymentPlan(prev => {
      // If this is a deposit status change, we need to regenerate all payment dates
      if (field === 'isDeposit') {
        const updatedPayments = prev.payments.map(payment => {
          if (payment.id === id) {
            // If this payment is being marked as a deposit
            if (value === true) {
              return { ...payment, isDeposit: true, dueDate: 'Due at checkout' };
            }
            // If this payment is being unmarked as a deposit
            else {
              // We'll regenerate the date below
              return { ...payment, isDeposit: false, dueDate: '' };
            }
          } else {
            // If another payment is being marked as deposit, unmark this one
            if (value === true) {
              return { ...payment, isDeposit: false };
            }
            return payment;
          }
        });

        // Now regenerate all payment dates based on the new deposit configuration
        if (formData.startDate && dateValidation.startDateValid) {
          const startDate = new Date(formData.startDate);
          let dateIndex = 0;
          
          updatedPayments.forEach((payment, index) => {
            if (!payment.isDeposit) {
              // Generate date for non-deposit payments
              const paymentMonth = startDate.getMonth() + 2 + dateIndex; // Start 2 months after event
              const paymentDate = new Date(startDate.getFullYear(), paymentMonth, 1);
              payment.dueDate = paymentDate.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              });
              dateIndex++;
            }
          });
        }

        return {
          ...prev,
          payments: updatedPayments
        };
      }

      // For non-deposit field changes, use the original logic
      return {
        ...prev,
        payments: prev.payments.map(payment => {
          if (payment.id === id) {
            return { ...payment, [field]: value };
          }
          return payment;
        })
      };
    });
  };

  const handlePercentageChange = (id: number, newPercentage: number) => {
    // Mark this percentage as edited
    setEditedPercentages(prev => new Set([...prev, id]));
    
    setPaymentPlan(prev => {
      const currentPayment = prev.payments.find(p => p.id === id);
      if (!currentPayment) return prev;

      // Get other payments (excluding the one being changed)
      const otherPayments = prev.payments.filter(p => p.id !== id);
      
      if (otherPayments.length === 0) {
        // Only one payment, just update it
        return {
          ...prev,
          payments: prev.payments.map(p => 
            p.id === id ? { ...p, percentage: newPercentage } : p
          )
        };
      }

      // Calculate the remaining percentage to distribute
      const remainingPercentage = 100 - newPercentage;
      
      if (remainingPercentage <= 0) {
        // If the new percentage is 100% or more, set others to 0
        return {
          ...prev,
          payments: prev.payments.map(p => 
            p.id === id ? { ...p, percentage: newPercentage } : { ...p, percentage: 0 }
          )
        };
      }

      // Calculate how much of the remaining percentage is taken by edited payments
      const editedPayments = otherPayments.filter(p => editedPercentages.has(p.id));
      const editedTotal = editedPayments.reduce((sum, p) => sum + p.percentage, 0);
      
      // Calculate how much is left for placeholder payments
      const placeholderRemaining = remainingPercentage - editedTotal;
      
      if (placeholderRemaining <= 0) {
        // Not enough remaining for edited payments, don't change anything
        return {
          ...prev,
          payments: prev.payments.map(p => 
            p.id === id ? { ...p, percentage: newPercentage } : p
          )
        };
      }

      // Get placeholder payments (those not yet edited)
      const placeholderPayments = otherPayments.filter(p => !editedPercentages.has(p.id));
      
      if (placeholderPayments.length === 0) {
        // No placeholder payments, just update the current one
        return {
          ...prev,
          payments: prev.payments.map(p => 
            p.id === id ? { ...p, percentage: newPercentage } : p
          )
        };
      }

      // Distribute the remaining percentage equally among placeholder payments
      const distributedShares = distributePercentagesEqually(placeholderRemaining, placeholderPayments.length);
      
      return {
        ...prev,
        payments: prev.payments.map(p => {
          if (p.id === id) {
            return { ...p, percentage: newPercentage };
          } else if (placeholderPayments.some(pp => pp.id === p.id)) {
            // This is a placeholder payment, redistribute it
            const paymentIndex = placeholderPayments.findIndex(pp => pp.id === p.id);
            return { ...p, percentage: distributedShares[paymentIndex] };
          } else {
            // This is an edited payment, keep its current value
            return p;
          }
        })
      };
    });
  };

  const addPayment = () => {
    const newId = Math.max(...paymentPlan.payments.map(p => p.id)) + 1;
    
    setPaymentPlan(prev => {
      // Find the last payment with a date to calculate the next month
      const lastPaymentWithDate = prev.payments
        .filter(p => p.dueDate && p.dueDate !== 'Due at checkout')
        .sort((a, b) => {
          if (a.dueDate === 'Due at checkout') return 1;
          if (b.dueDate === 'Due at checkout') return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        })
        .pop();
      
      let nextDueDate = '';
      if (lastPaymentWithDate && lastPaymentWithDate.dueDate !== 'Due at checkout') {
        const lastDate = new Date(lastPaymentWithDate.dueDate);
        nextDueDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 1).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        });
      } else if (formData.startDate && dateValidation.startDateValid) {
        // If no existing payments with dates, generate from start date
        const startDate = new Date(formData.startDate);
        nextDueDate = new Date(startDate.getFullYear(), startDate.getMonth() + 2, 1).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        });
      }
      
      const newPayment = {
        id: newId,
        title: `Payment ${newId}`,
        dueDate: nextDueDate,
        percentage: 0,
        isDeposit: false
      };
      
      // Separate edited and unedited payments
      const editedPayments = prev.payments.filter(p => editedPercentages.has(p.id));
      const uneditedPayments = prev.payments.filter(p => !editedPercentages.has(p.id));
      
      // Calculate total percentage of unedited payments
      const uneditedTotal = uneditedPayments.reduce((sum, p) => sum + p.percentage, 0);
      
      // Distribute unedited total + new payment among unedited payments + new payment
      const totalToDistribute = uneditedTotal;
      const paymentsToDistribute = [...uneditedPayments, newPayment];
      const distributedShares = distributePercentagesEqually(totalToDistribute, paymentsToDistribute.length);
      
      // Create new payments array with updated percentages
      const updatedPayments = [
        ...editedPayments, // Keep edited payments unchanged
        ...uneditedPayments.map((payment, index) => ({
          ...payment,
          percentage: distributedShares[index]
        })),
        {
          ...newPayment,
          percentage: distributedShares[distributedShares.length - 1]
        }
      ];
      
      return {
        ...prev,
        payments: updatedPayments
      };
    });
  };

  const removePayment = (id: number) => {
    setPaymentPlan(prev => {
      const paymentToRemove = prev.payments.find(p => p.id === id);
      const remainingPayments = prev.payments.filter(payment => payment.id !== id);
      
      if (remainingPayments.length === 0) {
        return prev; // Don't remove the last payment
      }
      
      // Separate edited and unedited remaining payments
      const editedPayments = remainingPayments.filter(p => editedPercentages.has(p.id));
      const uneditedPayments = remainingPayments.filter(p => !editedPercentages.has(p.id));
      
      let updatedPayments = [...editedPayments]; // Keep edited payments unchanged
      
      if (uneditedPayments.length > 0) {
        // If the removed payment was edited, add its percentage to unedited payments
        const removedPercentage = paymentToRemove?.percentage || 0;
        const uneditedTotal = uneditedPayments.reduce((sum, p) => sum + p.percentage, 0);
        const totalToDistribute = uneditedTotal + removedPercentage;
        
        // Distribute among unedited payments
        const distributedShares = distributePercentagesEqually(totalToDistribute, uneditedPayments.length);
        
        updatedPayments = [
          ...editedPayments,
          ...uneditedPayments.map((payment, index) => ({
            ...payment,
            percentage: distributedShares[index]
          }))
        ];
      } else {
        // All remaining payments are edited, just remove the payment
        updatedPayments = remainingPayments;
      }
      
      return {
        ...prev,
        payments: updatedPayments
      };
    });
  };

  const distributePercentagesEqually = (totalPercentage: number, count: number) => {
    if (count === 0) return [];
    
    // Use integer arithmetic to avoid floating-point precision issues
    const totalCents = Math.round(totalPercentage * 100);
    const baseCents = Math.floor(totalCents / count);
    const remainderCents = totalCents - (baseCents * count);
    
    // Distribute the shares, adding the remainder to the last payment
    const shares = [];
    for (let i = 0; i < count; i++) {
      if (i === count - 1) {
        // Last payment gets the remainder to ensure exact total
        shares.push((baseCents + remainderCents) / 100);
      } else {
        shares.push(baseCents / 100);
      }
    }
    
    return shares;
  };

  const getTotalPercentage = () => {
    return paymentPlan.payments.reduce((sum, payment) => sum + payment.percentage, 0);
  };

  const canSavePlan = () => {
    return getTotalPercentage() === 100;
  };

  const canSaveRegistration = () => {
    // Check required fields
    const hasTitle = formData.title.trim().length > 0;
    const hasPrice = formData.isFree || (formData.price && parseFloat(formData.price) > 0);
    const hasStartDate = formData.startDate && dateValidation.startDateValid;
    
    return hasTitle && hasPrice && hasStartDate;
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

    return savedPlan.payments.map((payment) => (
      <div key={payment.id} className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {payment.title} due {payment.dueDate || 'mm/dd/yyyy'}
        </span>
        <span className="font-medium text-gray-900">
          ${formData.price ? ((parseFloat(formData.price) * payment.percentage / 100).toFixed(2)) : '0.00'}
        </span>
      </div>
    ));
  };

  const getCustomPlanTitle = (planType: string) => {
    const savedPlan = savedPlans[planType];
    return savedPlan?.title || (planType === 'fourInstallments' ? '4 Installments' : '4 Installments');
  };

  const createRegistration = () => {
    const newRegistration: Registration = {
      id: Date.now().toString(),
      title: formData.title,
      price: formData.price,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isFree: formData.isFree,
      paymentOptions: { ...paymentOptions },
      savedPlans: { ...savedPlans },
      createdAt: new Date()
    };

    setRegistrations(prev => [...prev, newRegistration]);
    setIsOpen(false);
    resetForm();
  };

  const editRegistration = (registration: Registration) => {
    setEditingRegistration(registration);
    setFormData({
      title: registration.title,
      price: registration.price,
      description: registration.description,
      startDate: registration.startDate,
      endDate: registration.endDate,
      isFree: registration.isFree
    });
    setPaymentOptions(registration.paymentOptions);
    setSavedPlans(registration.savedPlans);
    setIsOpen(true);
  };

  const updateRegistration = () => {
    if (!editingRegistration) return;

    const updatedRegistration: Registration = {
      ...editingRegistration,
      title: formData.title,
      price: formData.price,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isFree: formData.isFree,
      paymentOptions: { ...paymentOptions },
      savedPlans: { ...savedPlans }
    };

    setRegistrations(prev => 
      prev.map(reg => reg.id === editingRegistration.id ? updatedRegistration : reg)
    );
    setIsOpen(false);
    setEditingRegistration(null);
    resetForm();
  };

  const duplicateRegistration = (registration: Registration) => {
    const duplicatedRegistration: Registration = {
      ...registration,
      id: Date.now().toString(),
      title: `${registration.title} (Copy)`,
      createdAt: new Date()
    };

    setRegistrations(prev => [...prev, duplicatedRegistration]);
  };

  const deleteRegistration = (registrationId: string) => {
    setRegistrations(prev => prev.filter(reg => reg.id !== registrationId));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      price: '',
      description: '',
      startDate: '',
      endDate: '',
      isFree: false
    });
    setPaymentOptions({
      fullPayment: true,
      fourInstallments: false,
      depositInstallments: false
    });
    setExpandedOptions({
      fullPayment: false,
      fourInstallments: false,
      depositInstallments: false
    });
    setIsEditingPaymentPlan(false);
    setEditingPlanType('');
    setPaymentPlan({
      title: '',
      payments: [
        { id: 1, title: 'Payment 1', dueDate: '', percentage: 25, isDeposit: false },
        { id: 2, title: 'Payment 2', dueDate: '', percentage: 25, isDeposit: false },
        { id: 3, title: 'Payment 3', dueDate: '', percentage: 25, isDeposit: false },
        { id: 4, title: 'Payment 4', dueDate: '', percentage: 25, isDeposit: false }
      ]
    });
    setEditedPercentages(new Set());
    setSavedPlans({});
    setDateValidation({
      startDateValid: true,
      startDateError: ''
    });
    setEditingRegistration(null);
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
          <Sheet open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) {
              // Reset all form data when opening the sheet
              resetForm();
            }
          }}>
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
                <SheetTitle className="text-lg font-semibold">
                  {editingRegistration ? 'Edit Registration' : 'Add Registration'}
                </SheetTitle>
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
                          Set this registration&apos;s start and end dates. These are the dates registrants will attend your program.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Start Date */}
                          <div className="space-y-1">
                            <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700">
                              Start Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={formData.startDate}
                              onChange={(e) => handleInputChange('startDate', e.target.value)}
                              className={`w-full ${!dateValidation.startDateValid ? 'border-red-500' : ''}`}
                            />
                            {!dateValidation.startDateValid && (
                              <p className="text-sm text-red-600">
                                {dateValidation.startDateError}
                              </p>
                            )}
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
                                disabled={true}
                              />
                            </div>
                          </div>
                          
                          {expandedOptions.fullPayment && (
                            <div className="px-4 pb-4 border-t border-gray-100">
                              <div className="pt-3 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Payment 1 due at checkout</span>
                                  <span className="font-medium text-gray-900">{formatPriceForDisplay(formData.price)}</span>
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
                                  (dateValidation.startDateValid ? generatePaymentDates(formData.startDate, 4) : ['', '', '', '']).map((date, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600">Payment {index + 1} due {date || 'mm/dd/yyyy'}</span>
                                      <span className="font-medium text-gray-900">${calculateInstallments(parseFloat(formData.price), 4)}</span>
                                    </div>
                                  ))
                                )}
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-gray-500">
                                    {savedPlans.fourInstallments ? 'Custom payment plan' : 'Payment dates auto-generate monthly based on your registration&apos;s start date.'}
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

                        {/* 4 Installments with Deposit Option */}
                        <div className="border border-gray-200 rounded-lg bg-white">
                          <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleExpandedOption('depositInstallments')}>
                            <div className="flex items-center gap-3">
                              <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedOptions.depositInstallments ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <span className="text-sm font-semibold text-gray-900">4 Installments (with deposit)</span>
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
                                    {(dateValidation.startDateValid ? generatePaymentDates(formData.startDate, 4) : ['', '', '', '']).map((date, index) => (
                                      <div key={index} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Payment {index + 1} due {date || 'mm/dd/yyyy'}</span>
                                        <span className="font-medium text-gray-900">${calculateInstallments(parseFloat(formData.price), 5)}</span>
                                      </div>
                                    ))}
                                  </>
                                )}
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-gray-500">
                                    {savedPlans.depositInstallments ? 'Custom payment plan' : 'Payment dates auto-generate monthly based on your registration&apos;s start date.'}
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
                              {editingPlanType === 'fourInstallments' ? '4 Installments' : '4 Installments (with deposit)'}
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
                              <strong>Tip:</strong> Edit payment names, dates, and percentages. When you change a percentage, other payments will automatically adjust to maintain 100% total. Only the first payment can be marked as a deposit.
                            </p>
                          </div>
                          
                          {/* Payment Table */}
                          <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                            <div className="bg-gray-50 px-3 py-2 grid grid-cols-12 gap-2 text-xs font-medium text-gray-700 sticky top-0">
                              <div className="col-span-3">Title</div>
                              <div className="col-span-3">Due Date</div>
                              <div className="col-span-2">%</div>
                              <div className="col-span-2">Amount</div>
                              <div className="col-span-1">Deposit</div>
                              <div className="col-span-1"></div>
                            </div>
                            
                            {paymentPlan.payments.map((payment, index) => (
                              <div key={payment.id} className="px-3 py-2 grid grid-cols-12 gap-2 items-center border-t border-gray-200 min-h-[48px]">
                                <div className="col-span-3">
                                  <Input
                                    value={payment.title}
                                    onChange={(e) => handlePaymentChange(payment.id, 'title', e.target.value)}
                                    className="text-xs h-8"
                                    placeholder="Payment name"
                                  />
                                </div>
                                <div className="col-span-3">
                                  <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1.5 rounded border border-gray-200 h-8 flex items-center">
                                    {payment.dueDate || 'mm/dd/yyyy'}
                                  </div>
                                </div>
                                <div className="col-span-2 relative">
                                  <Input
                                    type="text"
                                    value={payment.percentage}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      // Allow typing numbers and decimals
                                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                        const numValue = parseFloat(value) || 0;
                                        handlePercentageChange(payment.id, numValue);
                                      }
                                    }}
                                    className={`text-xs pr-6 h-8 ${editedPercentages.has(payment.id) ? 'text-gray-900' : 'text-gray-500'}`}
                                    placeholder="0"
                                  />
                                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">%</span>
                                </div>
                                <div className="col-span-2 text-xs text-gray-600 h-8 flex items-center">
                                  ${formData.price ? ((parseFloat(formData.price) * payment.percentage / 100).toFixed(2)) : '0.00'}
                                </div>
                                <div className="col-span-1 flex items-center justify-center">
                                  {index === 0 && (
                                    <Checkbox
                                      checked={payment.isDeposit === true}
                                      onCheckedChange={(checked) => {
                                        handlePaymentChange(payment.id, 'isDeposit', checked === true);
                                      }}
                                      className="w-4 h-4"
                                    />
                                  )}
                                </div>
                                <div className="col-span-1 flex items-center justify-center">
                                  {paymentPlan.payments.length > 1 && (
                                    <button
                                      onClick={() => removePayment(payment.id)}
                                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                      title="Remove payment"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                      : { title: '4 Installments', payments: [{ id: 1, title: 'Payment 1', dueDate: 'Due at checkout', percentage: 25, isDeposit: true }, ...generatePaymentDates(formData.startDate, 3).map((date, i) => ({ id: i + 2, title: `Payment ${i + 2}`, dueDate: date, percentage: 25, isDeposit: false }))] };
                                    setPaymentPlan(defaultPlan);
                                    // Reset edited percentages
                                    setEditedPercentages(new Set());
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
                    onClick={() => {
                      setIsOpen(false);
                      setEditingRegistration(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    onClick={editingRegistration ? updateRegistration : createRegistration}
                    disabled={!canSaveRegistration()}
                  >
                    {editingRegistration ? 'Update Registration' : 'Create Registration'}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Registrations List */}
        <RegistrationList
          registrations={registrations}
          onEdit={editRegistration}
          onDuplicate={duplicateRegistration}
          onDelete={deleteRegistration}
        />
      </div>

      
    </div>
  );
}