"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { AssetRegistrationForm } from "@/components/AssetRegistrationForm";
import { AssetCard } from "@/components/AssetCard";
import { RegulatorPanel } from "@/components/RegulatorPanel";
import { AssetDetailModal } from "@/components/AssetDetailModal";
import { useAssetRegistry } from "@/hooks/useAssetRegistry";
import { useBackend } from "@/hooks/useBackend";

export default function Home() {
  const { account, connectWallet, registerAsset, tokenizeAsset, redeemAsset, isPending: isTxPending } = useAssetRegistry();
  const { assets, isLoading, verifyAsset, freezeAsset } = useBackend();

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedAsset = assets.find((a: any) => a.id.toString() === selectedAssetId) || null;

  const handleAssetClick = (id: string) => {
    setSelectedAssetId(id);
    setIsModalOpen(true);
  };

  const handleRegulatorSelect = (id: string) => {
    setSelectedAssetId(id);
    // Don't open modal, just selecting for panel
  };

  return (
    <main className="min-h-screen pt-24 px-4 pb-10">
      <Navbar account={account} onConnect={connectWallet} />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Main Content: Registry & Minting */}
        <div className="lg:col-span-3 space-y-8">
          <section>
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">My Assets</h1>
                <p className="text-slate-400">Manage your real-world assets on the blockchain.</p>
              </div>
              {/* Placeholder for filters or total count */}
              <div className="text-right">
                <span className="text-2xl font-mono text-[var(--color-neon-blue)]">{assets.length}</span>
                <span className="text-sm text-slate-500 ml-2">Total Assets</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="md:col-span-2 xl:col-span-1">
                <AssetRegistrationForm onRegister={registerAsset} isPending={isTxPending} />
              </div>

              {isLoading ? (
                <div className="col-span-full text-center py-20 text-slate-500">Loading assets...</div>
              ) : (
                assets.map((asset: any) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onClick={() => handleAssetClick(asset.id.toString())}
                  />
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sidebar: Regulator Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <RegulatorPanel
              onVerify={(pk) => verifyAsset(selectedAssetId!, pk)}
              onFreeze={(pk) => freezeAsset(selectedAssetId!, pk)}
              selectedAssetId={selectedAssetId}
              assetStatus={selectedAsset?.status}
            />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AssetDetailModal
          asset={selectedAsset}
          currentAccount={account}
          onClose={() => setIsModalOpen(false)}
          onTokenize={tokenizeAsset}
          onRedeem={redeemAsset}
        />
      )}
    </main>
  );
}
