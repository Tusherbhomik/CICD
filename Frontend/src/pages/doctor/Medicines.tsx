import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/url";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MedicinesPage = () => {
  const [search, setSearch] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("All");
  const [generics, setGenerics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch data from backend
  useEffect(() => {
    const fetchGenerics = async () => {
      try {
        setLoading(true);
        const search="";
        const response = await fetch(`${API_BASE_URL}/api/medicines/generics??q=${search}`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch medicines");
        }
        const data = await response.json();
        setGenerics(data);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setLoading(false);
      }
    };

    fetchGenerics();
  }, []);

  // Filter generics based on search and selected letter
  const filteredGenerics = generics.filter((generic) => {
    const matchesSearch = generic.genericName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesLetter =
      selectedLetter === "All" ||
      generic.genericName
        .toLowerCase()
        .startsWith(selectedLetter.toLowerCase());
    return matchesSearch && matchesLetter;
  });

  // Generate alphabet letters A-Z
  const alphabet = ["All", ...Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ")];

  if (loading) {
    return (
      <MainLayout userType="doctor">
        <div className="p-6 text-center">Loading...</div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userType="doctor">
        <div className="p-6 text-center text-red-600">Error: {error}</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userType="doctor">
      <div className="p-6">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Medicines Directory
        </h2>
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {alphabet.map((letter) => (
              <button
                key={letter}
                className={`px-2 py-1 rounded-md text-sm ${
                  selectedLetter === letter
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setSelectedLetter(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
          <div className="relative">
            <Input
              placeholder="Search generics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:max-w-md pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGenerics.map((generic) => (
            <Card
              key={generic.id}
              className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 hover:border-blue-200 bg-white rounded-lg cursor-pointer"
              onClick={() =>
                navigate(`/doctor/medicines/${generic.genericName}`, {
                  state: { generic },
                })
              }
            >
              <CardHeader className="p-4 bg-gray-50">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  {generic.genericName}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">
                  Available Brands:{" "}
                  <span className="font-medium">
                    {generic.medicines.length}
                  </span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default MedicinesPage;
