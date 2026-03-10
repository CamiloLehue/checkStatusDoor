import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { companiesService } from "../services";
import type { Company, User } from "../types";
import { userProfileService } from "@/template/user-profile/services";
import type { UserProfile } from "@/template/user-profile/types";

const QUERY_KEYS = {
  companies: ["companies"] as const,
  companyUsers: ["companies", "users"] as const,
  companyConfig: ["companies", "config"] as const,
  userProfile: ["companies", "user-profile"] as const,
};

const DEFAULT_LOAD_ERROR = "Error al cargar compañías";

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

interface UseCompaniesPanelReturn {
  companies: Company[];
  selectedCompany: Company | null;
  companyUsers: User[];
  assignedServices: UserProfile["services"];
  isSuperuser: boolean;
  loading: boolean;
  loadingUsers: boolean;
  error: string | null;
  loadCompanies: () => Promise<void>;
  handleCompanyClick: (company: Company) => Promise<void>;
  companyConfig: Company | null;
  loadCompanyConfig: (companyId: number) => Promise<void>;
}

export function useCompaniesPanel(initialCompanyId?: number): UseCompaniesPanelReturn {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyConfigId, setCompanyConfigId] = useState<number | null>(null);
  const activeCompanyConfigId = companyConfigId ?? initialCompanyId ?? null;

  const userProfileQuery = useQuery({
    queryKey: [...QUERY_KEYS.userProfile],
    queryFn: () => userProfileService.getUserProfile(),
    staleTime: 30 * 1000,
  });

  const companiesQuery = useQuery({
    queryKey: [...QUERY_KEYS.companies],
    queryFn: () => companiesService.getAllCompanies(),
    staleTime: 30 * 1000,
  });

  const companyUsersQuery = useQuery({
    queryKey: [...QUERY_KEYS.companyUsers, selectedCompany?.id],
    queryFn: () => companiesService.getCompanyUsers(selectedCompany!.id),
    enabled: Boolean(selectedCompany?.id),
    staleTime: 30 * 1000,
  });

  const companyConfigQuery = useQuery({
    queryKey: [...QUERY_KEYS.companyConfig, activeCompanyConfigId],
    queryFn: () => companiesService.getCompanyDetails(activeCompanyConfigId!),
    enabled: Boolean(activeCompanyConfigId),
    staleTime: 30 * 1000,
  });

  const isSuperuser = Boolean(userProfileQuery.data?.user?.is_superuser);

  const companies = useMemo(() => {
    const allCompanies = companiesQuery.data ?? [];
    if (isSuperuser) {
      return allCompanies;
    }

    const assignedCompanyIds = new Set(
      (userProfileQuery.data?.companies ?? []).map((company) => company.id),
    );

    return allCompanies.filter((company) => assignedCompanyIds.has(company.id));
  }, [companiesQuery.data, isSuperuser, userProfileQuery.data?.companies]);

  useEffect(() => {
    if (!companies.length) {
      setSelectedCompany(null);
      return;
    }

    if (!selectedCompany || !companies.some((company) => company.id === selectedCompany.id)) {
      setSelectedCompany(companies[0]);
    }
  }, [companies, selectedCompany]);

  const loadCompanyConfig = useCallback(async (companyId: number) => {
    setCompanyConfigId(companyId);
  }, []);

  const handleCompanyClick = useCallback(async (company: Company) => {
    setSelectedCompany(company);
  }, []);

  const loadCompanies = useCallback(async () => {
    await Promise.all([companiesQuery.refetch(), userProfileQuery.refetch()]);
  }, [companiesQuery, userProfileQuery]);

  const error = companiesQuery.error
    ? getErrorMessage(companiesQuery.error, DEFAULT_LOAD_ERROR)
    : userProfileQuery.error
      ? getErrorMessage(userProfileQuery.error, DEFAULT_LOAD_ERROR)
    : null;

  return {
    companies,
    selectedCompany,
    companyUsers: companyUsersQuery.data ?? [],
    assignedServices: userProfileQuery.data?.services ?? [],
    isSuperuser,
    loading:
      companiesQuery.isLoading ||
      companiesQuery.isFetching ||
      userProfileQuery.isLoading ||
      userProfileQuery.isFetching,
    loadingUsers: companyUsersQuery.isFetching,
    companyConfig: companyConfigQuery.data ?? null,
    error,
    loadCompanies,
    handleCompanyClick,
    loadCompanyConfig,
  };
}
