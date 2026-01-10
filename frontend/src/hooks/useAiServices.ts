"use client";

import { useState, useCallback } from 'react';

const AI_BACKEND_URL = "http://localhost:3000/api/ai";

export interface RiskAssessment {
    riskScore: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    analysis: string;
    recommendations?: string[];
}

export function useAiServices() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateDescription = useCallback(async (assetType: string, metadata: Record<string, unknown>) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${AI_BACKEND_URL}/generate-description`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assetType, metadata })
            });
            
            if (!response.ok) throw new Error('Failed to generate description');
            const data = await response.json();
            return data.description;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const assessRisk = useCallback(async (assetType: string, metadata?: Record<string, unknown>): Promise<RiskAssessment | null> => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${AI_BACKEND_URL}/assess-risk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assetType, metadata: metadata || {} })
            });
            
            if (!response.ok) throw new Error('Failed to assess risk');
            const data = await response.json();
            return data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const getComplianceChecklist = useCallback(async (assetType: string): Promise<string[]> => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${AI_BACKEND_URL}/compliance-checklist/${assetType}`);
            
            if (!response.ok) throw new Error('Failed to get compliance checklist');
            const data = await response.json();
            return data.checklist;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        generateDescription,
        assessRisk,
        getComplianceChecklist,
        loading,
        error
    };
}
