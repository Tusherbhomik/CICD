import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge"; // For status
import { API_BASE_URL } from '@/url';

// Corresponds to PrescriptionResponse.MedicineResponse in the backend
interface MedicineInfo {
  id: number;
  name: string;
  dosage: string;
  timing: string;
  instructions?: string;
}

// Corresponds to PrescriptionResponse.UserInfo in the backend
interface UserIdentifier {
  id: number;
  name: string;
  email: string;
}

// Corresponds to PrescriptionResponse in the backend
interface Prescription {
  id: number;
  diseaseDescription: string;
  issueDate: string; // Dates will be strings from JSON
  followUpDate?: string | null;
  status: string; // Assuming PrescriptionStatus is a string (e.g., "ACTIVE", "EXPIRED")
  advice?: string;
  doctor: UserIdentifier;
  patient: UserIdentifier; // Though for "My Prescriptions", patient info might be redundant
  medicines: MedicineInfo[];
  createdAt: string;
  updatedAt: string;
}

// For the paginated API response
interface PaginatedPrescriptions {
  content: Prescription[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // Current page number
  // Add other pagination fields if needed (e.g., first, last, etc.)
}


const MyPrescriptions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state (optional, if you want to implement pagination controls)
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');

      if (!token || userRole !== 'patient') {
        toast({
          title: "Access Denied",
          description: "You must be logged in as a patient to view prescriptions.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      try {
        // Adjust page and size as needed, or remove if not using pagination on this view initially
        const response = await fetch(`${API_BASE_URL}/api/prescriptions/patient?page=${currentPage}&size=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
             toast({
              title: "Authentication Error",
              description: "Your session may have expired. Please log in again.",
              variant: "destructive",
            });
            navigate('/login'); // Redirect to login
          } else {
            const errorData = await response.json().catch(() => ({ message: "Failed to fetch prescriptions." }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
        }

        const data: PaginatedPrescriptions = await response.json();
        setPrescriptions(data.content || []);
        setTotalPages(data.totalPages || 0);
        // Potentially set other pagination details from `data` if needed

      } catch (err) {
        console.error("Error fetching prescriptions:", err);
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(errorMessage);
        toast({
          title: "Error",
          description: `Could not fetch prescriptions: ${errorMessage}`,
          variant: "destructive",
        });
        setPrescriptions([]); // Clear prescriptions on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriptions();
  }, [navigate, toast, currentPage]); // Add currentPage to dependency array if using pagination controls

  if (isLoading) {
    return (
      <PageLayout>
        <div className="medical-container py-10 text-center">
          <p>Loading your prescriptions...</p>
          {/* You could add a spinner here */}
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="medical-container py-10 text-center text-red-600">
          <p>Error: {error}</p>
          <p>Please try refreshing the page or contact support if the issue persists.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="medical-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>
          <p className="text-gray-600">Here is a list of your past and current prescriptions.</p>
        </div>

        {prescriptions.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>You currently have no prescriptions.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {prescriptions.map((prescription) => (
              <AccordionItem value={`prescription-${prescription.id}`} key={prescription.id}>
                <AccordionTrigger>
                  <div className="flex justify-between w-full pr-4">
                    <span>Prescription ID: {prescription.id} - Issued on {new Date(prescription.issueDate).toLocaleDateString()}</span>
                    <Badge variant={prescription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {prescription.status}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardHeader>
                      <CardTitle>Dr. {prescription.doctor.name}</CardTitle>
                      <CardDescription>
                        Issued: {new Date(prescription.issueDate).toLocaleDateString()}
                        {prescription.followUpDate && ` | Follow-up: ${new Date(prescription.followUpDate).toLocaleDateString()}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold">Diagnosis:</h4>
                        <p>{prescription.diseaseDescription}</p>
                      </div>
                      
                      {prescription.advice && (
                        <div>
                          <h4 className="font-semibold">Advice:</h4>
                          <p>{prescription.advice}</p>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold mb-2">Medicines:</h4>
                        {prescription.medicines.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {prescription.medicines.map(med => (
                              <li key={med.id}>
                                <strong>{med.name}</strong> ({med.dosage}, {med.timing})
                                {med.instructions && <span className="text-sm text-gray-600 block">Instructions: {med.instructions}</span>}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No medicines listed for this prescription.</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 pt-2">Last updated: {new Date(prescription.updatedAt).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        {/* Optional: Add pagination controls here if totalPages > 1 */}
      </div>
    </PageLayout>
  );
};

export default MyPrescriptions; 