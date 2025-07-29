import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical, Pill } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const GenericDetailPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [generic] = useState(state?.generic || null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [parseError, setParseError] = useState(null);

  if (!generic) {
    return (
      <MainLayout userType="doctor">
        <div className="p-6">Generic not found</div>
      </MainLayout>
    );
  }

  // Parse the description JSON string into sections with error handling
  let parsedDescription = {
    usage: "Not available",
    side_effects: "Not available",
  };
  console.log("djhnkjd", typeof generic.description, generic.description);
  // try {
    parsedDescription = JSON.parse(generic.description);
    console.log(
      "Parsed description:",
      parsedDescription,
      typeof parsedDescription
    );
    // if (!parsedDescription.usage || !parsedDescription.side_effects) {
    //   throw new Error("Missing usage or side_effects in description");
    // }
  // } catch (error) {
    // console.error("Failed to parse description:", error);
    // setParseError("Unable to load description details");
  // }

  const sections = [
    { title: "Indications", content: parsedDescription.usage },
    { title: "Side Effects", content: parsedDescription.side_effects },
  ];

  return (
    <MainLayout userType="doctor">
      <div className="p-6">
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          {generic.genericName}
        </h2>
        {parseError && (
          <div className="p-4 text-red-600 bg-red-100 rounded-lg mb-6">
            {parseError}
          </div>
        )}
        <div className="flex mb-6">
          <div className="w-1/2 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Brands</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {generic.medicines.map((brand) => (
                <Card
                  key={brand.id}
                  className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 hover:border-blue-200 bg-white rounded-lg cursor-pointer"
                  onClick={() => setSelectedBrand(brand.id)}
                >
                  <CardHeader className="p-4 bg-gray-50 flex items-center">
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      {brand.name}
                    </CardTitle>
                    {brand.form === "TABLET" ? (
                      <Pill className="ml-2 text-blue-600" size={20} />
                    ) : brand.form === "CAPSULE" ? (
                      <FlaskConical className="ml-2 text-blue-600" size={20} />
                    ) : null}
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">
                      Dosage: {brand.strength}
                    </p>
                    <p className="text-sm text-gray-600">
                      Price: ${brand.price}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="w-1/2 p-4 overflow-y-auto border-l border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Description
            </h3>
            <div className="text-sm text-green-600 space-y-2">
              {sections.map((section, index) => (
                <div key={index}>
                  <h4 className="font-medium text-gray-800">{section.title}</h4>
                  <p className="font-medium text-red-800">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {selectedBrand && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {generic.medicines.find((b) => b.id === selectedBrand)?.name}
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <span className="font-medium">Manufacturer:</span>{" "}
                  {
                    generic.medicines.find((b) => b.id === selectedBrand)
                      ?.manufacturer
                  }
                </p>
                <p>
                  <span className="font-medium">Dosage:</span>{" "}
                  {
                    generic.medicines.find((b) => b.id === selectedBrand)
                      ?.strength
                  }
                </p>
                <p>
                  <span className="font-medium">Price:</span> $
                  {generic.medicines.find((b) => b.id === selectedBrand)?.price}
                </p>
                <p>
                  <span className="font-medium">Form:</span>{" "}
                  {generic.medicines.find((b) => b.id === selectedBrand)?.form}
                </p>
              </div>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => setSelectedBrand(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default GenericDetailPage;
