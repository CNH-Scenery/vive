import React, { useEffect, useState } from 'react';
import ImageUploader from './ImageUploader';
import AnalysisView from './AnalysisView';
import StylePresetSelector from './StylePresetSelector';
import {
  generateHairstylePreview,
  analyzeHairCompatibility,
  findNearbySalons,
} from '../services/geminiService';
import {
  AppStep,
  HairAnalysis,
  Salon,
  GeoLocation,
  PreviewVerification,
  HairStylePreset,
} from '../types';
import { STYLE_PRESETS } from '../stylePresets.js';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PRESETS = STYLE_PRESETS as HairStylePreset[];

const StyleConsultant: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD_CURRENT);
  const [currentImg, setCurrentImg] = useState<string | null>(null);
  const [targetImg, setTargetImg] = useState<string | null>(null);
  const [targetPrompt, setTargetPrompt] = useState<string>('');
  const [targetMode, setTargetMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<HairStylePreset | null>(null);
  const [currentHairAnalysis, setCurrentHairAnalysis] = useState<{currentLength?: 'short' | 'medium' | 'long' | 'extra_long' | 'unclear', currentTexture?: string} | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<HairAnalysis | null>(null);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [previewWarning, setPreviewWarning] = useState<string | null>(null);
  const [previewVerification, setPreviewVerification] = useState<PreviewVerification | null>(null);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const hasTargetStyle = targetMode === 'preset' ? Boolean(selectedPreset) : Boolean(targetImg);
  const canGenerate = (hasTargetStyle || Boolean(targetPrompt.trim())) && !isProcessing;

  const getLocation = async (): Promise<GeoLocation | null> => {
    if (!navigator.geolocation) return null;
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 5000 }
      );
    });
  };

  useEffect(() => {
    getLocation().then((loc) => loc && setLocation(loc));
  }, []);

  const handleAnalyzeCurrent = async () => {
    if (!currentImg) return;
    setStep(AppStep.ANALYZING_CURRENT);
    setIsProcessing(true);
    setStatusMessage('현재 헤어 기장 및 모질을 분석 중입니다.');
    
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyzeCurrent', currentPhoto: currentImg }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setCurrentHairAnalysis(data);
      setStep(AppStep.CHOOSE_STYLE);
    } catch (e) {
      alert('분석 중 오류가 발생했습니다.');
      setStep(AppStep.UPLOAD_CURRENT);
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const handleGenerate = async () => {
    if (!currentImg || !canGenerate) return;
    setStep(AppStep.GENERATING);
    setIsProcessing(true);
    setGeneratedImg(null);

    const activePreset = targetMode === 'preset' ? selectedPreset : null;
    const activeTargetPhoto = targetMode === 'custom' ? targetImg : null;
    const activePrompt = targetPrompt.trim() ? targetPrompt : null;

    try {
      let userLoc = location || await getLocation();
      if (userLoc) setLocation(userLoc);

      setStatusMessage('선택하신 스타일 시뮬레이션을 생성 중입니다.');

      const [analysisResult, previewResult] = await Promise.all([
        analyzeHairCompatibility(currentImg, activeTargetPhoto, activePreset, activePrompt),
        generateHairstylePreview(currentImg, activeTargetPhoto, activePreset, activePrompt),
      ]);

      if (currentHairAnalysis) {
        analysisResult.currentLength = currentHairAnalysis.currentLength;
        analysisResult.currentTexture = currentHairAnalysis.currentTexture;
      }

      setAnalysis(analysisResult);
      setGeneratedImg(previewResult.image);
      setPreviewWarning(previewResult.warning);
      setPreviewVerification(previewResult.verification);

      if (userLoc && analysisResult.styleKeywords) {
        setStatusMessage('주변 추천 살롱을 검색합니다.');
        const foundSalons = await findNearbySalons(userLoc, analysisResult.styleKeywords);
        setSalons(foundSalons);
      }

      setStep(AppStep.RESULTS);
    } catch (error) {
      alert('시뮬레이션 생성 중 오류가 발생했습니다.');
      setStep(AppStep.CHOOSE_STYLE);
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const handleReset = () => {
    setStep(AppStep.UPLOAD_CURRENT);
    setCurrentImg(null);
    setTargetImg(null);
    setTargetPrompt('');
    setTargetMode('preset');
    setSelectedPreset(null);
    setCurrentHairAnalysis(null);
  };

  const handleBack = () => {
    if (step === AppStep.CHOOSE_STYLE) setStep(AppStep.UPLOAD_CURRENT);
    else if (step === AppStep.RESULTS) setStep(AppStep.CHOOSE_STYLE);
    else navigate('/');
  };

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] font-sans text-gray-100 flex flex-col items-center">
      {/* Mobile App Container */}
      <div className="w-full max-w-md min-h-[100dvh] flex flex-col relative bg-[#111111] shadow-2xl pb-24">
        
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-5 py-4 bg-[#111111]/90 backdrop-blur-md border-b border-white/5">
          <button onClick={handleBack} className="p-1 -ml-1 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[16px] font-semibold tracking-widest uppercase">
            Hair<span className="text-[#D4AF37]">Sync</span>
          </span>
          <button onClick={handleReset} className="text-xs text-gray-500 hover:text-gray-300">
            초기화
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 w-full px-5 py-6 overflow-y-auto">
          
          {(step === AppStep.ANALYZING_CURRENT || step === AppStep.GENERATING) ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] animate-pulse">
              <Loader2 className="mb-6 h-10 w-10 animate-spin text-[#D4AF37]" />
              <h3 className="text-sm font-medium text-gray-300">
                {statusMessage}
              </h3>
            </div>
          ) : step === AppStep.RESULTS ? (
            <AnalysisView
              analysis={analysis!}
              generatedImage={generatedImg}
              previewWarning={previewWarning}
              previewVerification={previewVerification}
              salons={salons}
              onReset={handleReset}
            />
          ) : (
            <div className="space-y-6">
              {/* Step Progress */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`h-1 flex-1 rounded-full ${step === AppStep.UPLOAD_CURRENT ? 'bg-[#D4AF37]' : 'bg-[#D4AF37]/30'}`} />
                <div className={`h-1 flex-1 rounded-full ${step === AppStep.CHOOSE_STYLE ? 'bg-[#D4AF37]' : 'bg-zinc-800'}`} />
              </div>

              {step === AppStep.UPLOAD_CURRENT && (
                <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4">
                  <div>
                    <h2 className="text-xl font-light mb-2">고객님의 현재 모발 상태를<br/>확인합니다.</h2>
                    <p className="text-sm text-gray-500">정면 사진을 올려주시면 기장과 모질을 분석합니다.</p>
                  </div>
                  <div className="p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <ImageUploader
                      label=""
                      description=""
                      image={currentImg}
                      onImageChange={setCurrentImg}
                    />
                  </div>
                </div>
              )}

              {step === AppStep.CHOOSE_STYLE && (
                <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
                  <div>
                    <h2 className="text-xl font-light mb-2">어떤 스타일로<br/>변신하고 싶으신가요?</h2>
                    <p className="text-sm text-gray-500">시술 가능한 프리셋을 고르거나 직접 텍스트로 요청해보세요.</p>
                  </div>

                  {/* Toggle */}
                  <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                    <button
                      onClick={() => setTargetMode('preset')}
                      className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${targetMode === 'preset' ? 'bg-[#D4AF37] text-black' : 'text-gray-500'}`}
                    >
                      스타일 북 (추천)
                    </button>
                    <button
                      onClick={() => setTargetMode('custom')}
                      className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${targetMode === 'custom' ? 'bg-[#D4AF37] text-black' : 'text-gray-500'}`}
                    >
                      직접 업로드
                    </button>
                  </div>

                  {targetMode === 'preset' ? (
                    <StylePresetSelector
                      presets={PRESETS}
                      selectedPreset={selectedPreset}
                      onSelect={setSelectedPreset}
                      currentLength={currentHairAnalysis?.currentLength}
                    />
                  ) : (
                    <div className="p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
                      <ImageUploader
                        label=""
                        description=""
                        image={targetImg}
                        onImageChange={setTargetImg}
                      />
                    </div>
                  )}

                  {/* Refinement Area */}
                  <div className="pt-4 border-t border-zinc-800">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">원하시는 디테일이 있나요?</h4>
                    <textarea
                      className="w-full h-20 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] resize-none"
                      placeholder="예: 기장은 살짝 다듬고 붉은기 없는 브라운으로 염색하고 싶어요."
                      value={targetPrompt}
                      onChange={(e) => setTargetPrompt(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Bottom Sticky Action Bar */}
        {(step === AppStep.UPLOAD_CURRENT || step === AppStep.CHOOSE_STYLE) && !isProcessing && (
          <div className="absolute bottom-0 w-full p-5 bg-gradient-to-t from-[#111111] via-[#111111] to-transparent">
            {step === AppStep.UPLOAD_CURRENT ? (
              <button
                onClick={handleAnalyzeCurrent}
                disabled={!currentImg}
                className={`w-full py-4 text-sm font-semibold rounded-lg shadow-lg transition-all ${
                  currentImg ? 'bg-[#D4AF37] text-black active:scale-[0.98]' : 'bg-zinc-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                모발 분석 시작
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={`w-full py-4 text-sm font-semibold rounded-lg shadow-lg transition-all ${
                  canGenerate ? 'bg-[#D4AF37] text-black active:scale-[0.98]' : 'bg-zinc-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                AI 시뮬레이션 결과 보기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StyleConsultant;
