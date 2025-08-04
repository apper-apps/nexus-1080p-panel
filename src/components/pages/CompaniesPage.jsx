import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import CompaniesTable from "@/components/organisms/CompaniesTable";
import AddCompanyModal from "@/components/organisms/AddCompanyModal";
import { companyService } from "@/services/api/companyService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load companies on component mount
  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyService.getAll();
      setCompanies(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  // Handle company selection
  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
  };

  // Handle adding a new company
  const handleAddCompany = async (companyData) => {
    try {
      const newCompany = await companyService.create(companyData);
      setCompanies(prev => [...prev, newCompany]);
      toast.success('Company added successfully');
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error('Failed to add company');
      throw error;
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Error 
        message={error}
        onRetry={loadCompanies}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Companies
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your business relationships and accounts
          </p>
        </div>
        
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <ApperIcon name="Plus" size={16} />
          Add Company
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Building2" className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.reduce((sum, company) => sum + company.contactCount, 0)}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Users" className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.reduce((sum, company) => sum + company.employeeCount, 0).toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="TrendingUp" className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Industries</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(companies.map(company => company.industry)).size}
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="BarChart3" className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      {companies.length === 0 ? (
        <Empty
          icon="Building2"
          title="No companies yet"
          description="Add your first company to start managing your business relationships."
          action={
            <Button onClick={() => setIsAddModalOpen(true)} className="mt-4">
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Add Company
            </Button>
          }
        />
      ) : (
        <CompaniesTable
          companies={companies}
          onCompanySelect={handleCompanySelect}
          selectedCompany={selectedCompany}
          loading={loading}
        />
      )}

      {/* Add Company Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddCompanyModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleAddCompany}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompaniesPage;