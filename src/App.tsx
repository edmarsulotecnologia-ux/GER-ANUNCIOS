/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from "react";
import { 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  Loader2, 
  Copy, 
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [adContent, setAdContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAdContent(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAd = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const response = await fetch("/api/generate-ad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = (await response.json()) as { text?: string };
      setAdContent(data.text || "Não foi possível gerar o anúncio.");
    } catch (error) {
      console.error("Erro ao gerar anúncio:", error);
      setAdContent("Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (adContent) {
      navigator.clipboard.writeText(adContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans selection:bg-orange-100">
      <header className="max-w-4xl mx-auto pt-12 pb-8 px-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-orange-500 p-2 rounded-xl shadow-sm">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Gerador de Anúncios Pro</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Transforme fotos de produtos em textos de vendas irresistíveis em segundos.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              1. Upload do Produto
            </h2>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-4 overflow-hidden group",
                image ? "border-transparent" : "border-gray-200 hover:border-orange-400 hover:bg-orange-50/30"
              )}
            >
              {image ? (
                <>
                  <img 
                    src={image} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gray-50 p-4 rounded-full group-hover:bg-orange-50 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-orange-500" />
                  </div>
                  <div className="text-center px-4">
                    <p className="font-medium">Clique para subir a foto</p>
                    <p className="text-xs text-gray-400 mt-1">PNG ou JPG até 5MB</p>
                  </div>
                </>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={generateAd}
              disabled={!image || loading}
              className={cn(
                "w-full mt-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
                !image || loading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200 active:scale-[0.98]"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando anúncio...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gerar Anúncio Agora
                </>
              )}
            </button>
          </div>
        </section>

        {/* Result Section */}
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 h-full flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                2. Resultado da IA
              </h2>
              {adContent && (
                <button 
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 flex items-center gap-2 text-xs font-medium"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto prose prose-sm max-w-none prose-orange">
              {adContent ? (
                <div className="markdown-body">
                  <ReactMarkdown>{adContent}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4 py-12">
                  <ImageIcon className="w-12 h-12 opacity-20" />
                  <p>O seu anúncio aparecerá aqui após o processamento.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-8 border-t border-gray-200 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Gerador de Anúncios Pro &bull; Powered by Google Gemini
      </footer>
    </div>
  );
}
