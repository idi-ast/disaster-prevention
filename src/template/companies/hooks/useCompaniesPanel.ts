import { useEffect, useState, useCallback } from 'react';
import { companiesService } from '../services';
import type { Company, User } from '../types';

interface UseCompaniesPanelReturn {
  companies: Company[];
  selectedCompany: Company | null;
  companyUsers: User[];
  loading: boolean;
  loadingUsers: boolean;
  error: string | null;
  loadCompanies: () => Promise<void>;
  handleCompanyClick: (company: Company) => Promise<void>;
}

export function useCompaniesPanel(): UseCompaniesPanelReturn {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyUsers, setCompanyUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const data = await companiesService.getAllCompanies();
      setCompanies(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar compañías');
      console.error('Error loading companies:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCompanyClick = useCallback(async (company: Company) => {
    setSelectedCompany(company);
    try {
      setLoadingUsers(true);
      const users = await companiesService.getCompanyUsers(company.id);
      setCompanyUsers(users);
    } catch (err: any) {
      console.error('Error loading company users:', err);
      setCompanyUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  return {
    companies,
    selectedCompany,
    companyUsers,
    loading,
    loadingUsers,
    error,
    loadCompanies,
    handleCompanyClick,
  };
}
