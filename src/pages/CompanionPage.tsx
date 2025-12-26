import { useState } from 'react';
import { CompanionSelector } from '@/components/companion/CompanionSelector';
import { CompanionChat } from '@/components/companion/CompanionChat';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CompanionPage() {
  const { user, loading } = useAuth();
  const [selectedCompanionId, setSelectedCompanionId] = useState<string | null>(null);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI Companions</h1>
        <p className="text-muted-foreground">Choose a companion to chat with and build your connection</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Companion</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanionSelector selectedId={selectedCompanionId} onSelect={setSelectedCompanionId} />
        </CardContent>
      </Card>

      {selectedCompanionId && <CompanionChat companionId={selectedCompanionId} />}
    </div>
  );
}
