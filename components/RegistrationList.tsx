import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface RegistrationListProps {
  registrations: Registration[];
  onEdit: (registration: Registration) => void;
  onDuplicate: (registration: Registration) => void;
  onDelete: (registrationId: string) => void;
}

export function RegistrationList({ registrations, onEdit, onDuplicate, onDelete }: RegistrationListProps) {
  const formatPrice = (price: string, isFree: boolean) => {
    if (isFree) return 'Free';
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getPaymentOptionsText = (paymentOptions: Registration['paymentOptions']) => {
    const options = [];
    if (paymentOptions.fullPayment) options.push('Full Payment');
    if (paymentOptions.fourInstallments) options.push('4 Installments');
    if (paymentOptions.depositInstallments) options.push('4 Installments (with deposit)');
    
    if (options.length === 0) return 'No payment options';
    return options.join(', ');
  };

  if (registrations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Registrations</CardTitle>
        </CardHeader>
              <CardContent>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-3">
            <svg className="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">No registrations yet</h3>
          <p className="text-gray-500 text-sm">Get started by creating your first registration</p>
        </div>
      </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Registrations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {registrations.map((registration) => (
            <div key={registration.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-900 truncate">{registration.title}</h3>
                    <Badge variant={registration.isFree ? "secondary" : "default"} className="text-xs px-2 py-0.5 flex-shrink-0">
                      {registration.isFree ? 'Free' : formatPrice(registration.price, registration.isFree)}
                    </Badge>
                  </div>
                  
                  {registration.description && (
                    <p className="text-gray-600 text-xs mb-2 line-clamp-1">
                      {registration.description}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-3 gap-3 text-xs text-gray-600 mb-1">
                    <div>
                      <span className="font-medium">Start:</span> {formatDate(registration.startDate)}
                    </div>
                    <div>
                      <span className="font-medium">End:</span> {formatDate(registration.endDate)}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {registration.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Payment:</span> {getPaymentOptionsText(registration.paymentOptions)}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(registration)}
                    className="h-7 w-7 p-0"
                    title="Edit registration"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDuplicate(registration)}
                    className="h-7 w-7 p-0"
                    title="Duplicate registration"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(registration.id)}
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Delete registration"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
