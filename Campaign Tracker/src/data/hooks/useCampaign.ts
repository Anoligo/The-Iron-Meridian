import { useState, useEffect, useCallback } from 'react';
import { campaignService, CampaignData } from '../services/CampaignService';

export function useCampaign() {
  const [campaign, setCampaign] = useState<CampaignData>(campaignService.getCampaignData());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to changes in the campaign data
  useEffect(() => {
    const unsubscribe = campaignService.subscribe(() => {
      setCampaign(campaignService.getCampaignData());
    });

    // Initial load
    setCampaign(campaignService.getCampaignData());
    setIsLoading(false);

    return () => {
      unsubscribe();
    };
  }, []);

  // Wrapper methods for the campaign service
  const updateCampaign = useCallback((updates: Partial<CampaignData>) => {
    try {
      campaignService.setCampaignData(updates);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update campaign'));
      return false;
    }
  }, []);

  const exportData = useCallback(() => {
    return campaignService.exportData();
  }, []);

  const importData = useCallback((jsonString: string) => {
    return campaignService.importData(jsonString);
  }, []);

  // Entity operations
  const createEntity = useCallback((type: string, data: any) => {
    try {
      return campaignService.createEntity(type, data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to create ${type}`));
      return null;
    }
  }, []);

  const updateEntity = useCallback((type: string, id: string, updates: any) => {
    try {
      return campaignService.updateEntity(type, id, updates);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update ${type}`));
      return null;
    }
  }, []);

  const deleteEntity = useCallback((type: string, id: string) => {
    return campaignService.deleteEntity(type as any, id);
  }, []);

  return {
    campaign,
    isLoading,
    error,
    updateCampaign,
    exportData,
    importData,
    createEntity,
    updateEntity,
    deleteEntity,
    // Type-specific helpers
    createFaction: (data: any) => campaignService.createFaction(data),
    createLocation: (data: any) => campaignService.createLocation(data),
    createNpc: (data: any) => campaignService.createNpc(data),
    createQuest: (data: any) => campaignService.createQuest(data),
    createItem: (data: any) => campaignService.createItem(data),
    getEntity: (type: string, id: string) => campaignService.getEntity(type as any, id),
  };
}

export default useCampaign;
