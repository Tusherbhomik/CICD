
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import PageLayout from '@/components/layout/PageLayout';

// Mock prescription data (in a real app, this would be fetched from an API)
const prescriptionsData = [
  { 
    id: "1", 
    doctor: {
      name: "Dr. Sarah Williams",
      specialization: "Cardiologist",
      phone: "123-456-7890"
    },
    date: "2023-04-18",
    condition: "Hypertension",
    medicines: [
      {
        name: "Lisinopril 10mg",
        dosage: "Once daily",
        timing: "In the morning",
        instructions: "Take with or without food"
      },
      {
        name: "Hydrochlorothiazide 12.5mg",
        dosage: "Once daily",
        timing: "In the morning",
        instructions: "Take with food"
      }
    ],
    followUpDate: "2023-05-18",
    advice: "Reduce salt intake. Monitor blood pressure daily. Regular moderate exercise for 30 minutes at least 5 days a week."
  },
  { 
    id: "2", 
    doctor: {
      name: "Dr. Michael Chen",
      specialization: "General Practitioner",
      phone: "987-654-3210"
    },
    date: "2023-03-10",
    condition: "Upper Respiratory Infection",
    medicines: [
      {
        name: "Amoxicillin 500mg",
        dosage: "Three times daily",
        timing: "Every 8 hours",
        instructions: "Take until complete"
      },
      {
        name: "Guaifenesin 400mg",
        dosage: "Twice daily",
        timing: "Morning and evening",
        instructions: "Take with plenty of water"
      }
    ],
    followUpDate: "2023-03-20",
    advice: "Rest well. Stay hydrated. Call if symptoms worsen or fever persists more than 3 days."
  },
  { 
    id: "3", 
    doctor: {
      name: "Dr. Elizabeth Taylor",
      specialization: "Endocrinologist",
      phone: "555-123-4567"
    },
    date: "2023-02-25",
    condition: "Hypothyroidism",
    medicines: [
      {
        name: "Levothyroxine 50mcg",
        dosage: "Once daily",
        timing: "30 minutes before breakfast",
        instructions: "Take on empty stomach"
      }
    ],
    followUpDate: "2023-05-25",
    advice: "Take medication consistently at same time each day. Repeat thyroid function tests in 3 months."
  }
];

const PrescriptionDetail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const [prescription, setPrescription] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in as patient
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'patient') {
      toast({
        title: "Access denied",
        description: "You must be logged in as a patient to view prescriptions.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    // In a real app, you would fetch the prescription from an API
    const fetchPrescription = () => {
      setLoading(true);
      // Simulating API call with setTimeout
      setTimeout(() => {
        const found = prescriptionsData.find(p => p.id === id);
        if (found) {
          setPrescription(found);
        } else {
          toast({
            title: "Error",
            description: "Prescription not found",
            variant: "destructive",
          });
          navigate('/patient/prescriptions');
        }
        setLoading(false);
      }, 500);
    };
    
    fetchPrescription();
  }, [id, navigate, toast]);
  
  if (loading) {
    return (
      <PageLayout>
        <div className="medical-container py-10 flex justify-center">
          <p>Loading prescription...</p>
        </div>
      </PageLayout>
    );
  }
  
  if (!prescription) {
    return (
      <PageLayout>
        <div className="medical-container py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Prescription Not Found</h1>
            <Link to="/patient/prescriptions">
              <Button>Return to Prescriptions</Button>
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <div className="medical-container py-10">
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Prescription Details</h1>
            <p className="text-gray-600">Issued on {prescription.date}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link to="/patient/prescriptions">
              <Button variant="outline">Back to Prescriptions</Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Doctor info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Doctor Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-medium">{prescription.doctor.name}</p>
                  <p className="text-gray-600">{prescription.doctor.specialization}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="text-gray-700">{prescription.doctor.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Center column - Diagnosis and medicines */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Diagnosis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">{prescription.condition}</p>
              
              <h3 className="font-medium text-lg mb-3">Prescribed Medications</h3>
              {prescription.medicines.map((medicine: any, index: number) => (
                <div 
                  key={index} 
                  className="mb-4 border border-gray-200 rounded-md p-4 bg-gray-50"
                >
                  <p className="font-medium">{medicine.name}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-sm">
                    <div>
                      <span className="text-gray-500">Dosage:</span> {medicine.dosage}
                    </div>
                    <div>
                      <span className="text-gray-500">Timing:</span> {medicine.timing}
                    </div>
                    <div>
                      <span className="text-gray-500">Instructions:</span> {medicine.instructions}
                    </div>
                  </div>
                </div>
              ))}
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="font-medium text-lg mb-2">Follow-up</h3>
                <p className="text-gray-700 mb-4">
                  Please schedule a follow-up appointment on or around: <span className="font-medium">{prescription.followUpDate}</span>
                </p>
                
                <h3 className="font-medium text-lg mb-2">Additional Advice</h3>
                <p className="text-gray-700">{prescription.advice}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default PrescriptionDetail;
