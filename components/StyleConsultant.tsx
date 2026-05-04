import React, { useEffect, useMemo, useState } from 'react';
import Header from './Header';
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
  TargetMode,
} from '../types';
import { STYLE_PRESETS } from '../stylePresets.js';
import { ArrowRight, Loader2, Scissors, Upload } from 'lucide-react';

const PRESETS = STYLE_PRESETS as HairStylePreset[];

const StyleConsultant: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD_CURRENT);
  const [currentImg, setCurrentImg] = useState<string | null>(null);
  const [targetImg, setTargetImg] = useState<string | null>(null);
  const [targetMode, setTargetMode] = useState<TargetMode>('preset');
  const [selectedPreset, setSelectedPreset] = useState<HairStylePreset | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<HairAnalysis | null>(null);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [previewWarning, setPreviewWarning] = useState<string | null>(null);
  const [previewVerification, setPreviewVerification] = useState<PreviewVerification | null>(null);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const hasTargetStyle = targetMode === 'preset' ? Boolean(selectedPreset) : Boolean(targetImg);
  const canProcess = useMemo(() => {
    return Boolean(currentImg) && hasTargetStyle && !isProcessing;
  }, [currentImg, hasTargetStyle, isProcessing]);

  const getLocation = async (): Promise<GeoLocation | null> => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return null;
    }

    const getPos = (options: PositionOptions): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    };

    try {
      const position = await getPos({ enableHighAccuracy: true, timeout: 4000, maximumAge: 0 });
      return { latitude: position.coords.latitude, longitude: position.coords.longitude };
    } catch (error) {
      console.warn('High accuracy location failed, trying fallback...', error);

      try {
        const position = await getPos({
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
        });
        return { latitude: position.coords.latitude, longitude: position.coords.longitude };
      } catch (fallbackError) {
        console.error('All location retrieval attempts failed', fallbackError);
        return null;
      }
    }
  };

  useEffect(() => {
    getLocation().then((loc) => {
      if (loc) {
        setLocation(loc);
        console.log('Location acquired silently');
      }
    });
  }, []);

  const handleProcess = async () => {
    if (!currentImg || !canProcess) {
      return;
    }

    setStep(AppStep.ANALYZING);
    setIsProcessing(true);
    setGeneratedImg(null);
    setPreviewWarning(null);
    setPreviewVerification(null);

    const activePreset = targetMode === 'preset' ? selectedPreset : null;
    const activeTargetPhoto = targetMode === 'custom' ? targetImg : null;

    try {
      let userLoc = location;

      if (!userLoc) {
        setStatusMessage('위치 정보를 확인하는 중입니다.');
        userLoc = await getLocation();

        if (userLoc) {
          setLocation(userLoc);
        }
      }

      setStatusMessage('스타일 분석과 AI 미리보기를 생성하는 중입니다.');

      const analysisPromise = analyzeHairCompatibility(currentImg, activeTargetPhoto, activePreset);
      const previewPromise = generateHairstylePreview(currentImg, activeTargetPhoto, activePreset);

      const [analysisResult, previewResult] = await Promise.all([
        analysisPromise,
        previewPromise,
      ]);

      setAnalysis(analysisResult);
      setGeneratedImg(previewResult.image);
      setPreviewWarning(previewResult.warning);
      setPreviewVerification(previewResult.verification);

      if (userLoc && analysisResult.styleKeywords) {
        setStatusMessage('주변 미용실을 검색하는 중입니다.');
        try {
          const foundSalons = await findNearbySalons(userLoc, analysisResult.styleKeywords);
          setSalons(foundSalons);
        } catch (salonError) {
          console.error('Salon search error', salonError);
        }
      } else {
        console.log('Skipping salon search: Location missing.');
      }

      setStep(AppStep.RESULTS);
    } catch (error) {
      console.error('Processing failed', error);
      alert('분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setStep(AppStep.UPLOAD_TARGET);
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const handleReset = () => {
    setStep(AppStep.UPLOAD_CURRENT);
    setCurrentImg(null);
    setTargetImg(null);
    setTargetMode('preset');
    setSelectedPreset(null);
    setAnalysis(null);
    setGeneratedImg(null);
    setPreviewWarning(null);
    setPreviewVerification(null);
    setSalons([]);
  };

  const handleCurrentImageChange = (image: string | null) => {
    setCurrentImg(image);
    setStep(image ? AppStep.UPLOAD_TARGET : AppStep.UPLOAD_CURRENT);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {step !== AppStep.RESULTS && (
          <div className="mx-auto mb-8 max-w-2xl space-y-2 text-center">
            <h2 className="text-3xl font-bold text-gray-900">AI 헤어 스타일 컨설턴트</h2>
            <p className="text-gray-500">
              현재 사진과 원하는 헤어 스타일을 선택하면 AI가 분석하고 미리보기를 생성합니다.
            </p>
          </div>
        )}

        {step === AppStep.ANALYZING && (
          <div className="flex animate-pulse flex-col items-center justify-center py-20">
            <Loader2 className="mb-6 h-16 w-16 animate-spin text-[#7c3aed]" />
            <h3 className="text-xl font-semibold text-gray-800">AI가 헤어 스타일을 분석하고 있습니다</h3>
            <p className="mt-2 text-gray-500">{statusMessage}</p>
          </div>
        )}

        {(step === AppStep.UPLOAD_CURRENT || step === AppStep.UPLOAD_TARGET) && (
          <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
            <ImageUploader
              label="1. 현재 얼굴 사진"
              description="정면에 가깝고 얼굴이 선명한 사진을 올려주세요."
              image={currentImg}
              onImageChange={handleCurrentImageChange}
            />

            <section>
              <div className="mb-4">
                <h3 className="mb-1 text-lg font-semibold text-gray-800">2. 원하는 헤어 스타일</h3>
                <p className="text-sm text-gray-500">
                  프리셋을 먼저 선택해도 됩니다. 시작은 현재 사진과 스타일이 모두 준비된 뒤 가능합니다.
                </p>
              </div>

              <div className="mb-5 inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setTargetMode('preset')}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    targetMode === 'preset'
                      ? 'bg-[#7c3aed] text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Scissors className="h-4 w-4" />
                  프리셋 선택
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMode('custom')}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    targetMode === 'custom'
                      ? 'bg-[#7c3aed] text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  직접 업로드
                </button>
              </div>

              {targetMode === 'preset' ? (
                <StylePresetSelector
                  presets={PRESETS}
                  selectedPreset={selectedPreset}
                  onSelect={setSelectedPreset}
                />
              ) : (
                <div className="max-w-md">
                  <ImageUploader
                    label="원하는 스타일 사진"
                    description="따라 하고 싶은 헤어스타일 사진을 올려주세요."
                    image={targetImg}
                    onImageChange={setTargetImg}
                  />
                </div>
              )}
            </section>
          </div>
        )}

        {(step === AppStep.UPLOAD_TARGET || step === AppStep.UPLOAD_CURRENT) && (
          <div className="mt-10 flex justify-center animate-in fade-in slide-in-from-bottom-2">
            <button
              type="button"
              onClick={handleProcess}
              disabled={!canProcess}
              className="group flex items-center gap-2 rounded-full bg-[#7c3aed] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-[#7c3aed]/30 transition-all hover:scale-105 hover:bg-[#6d28d9] active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none disabled:hover:scale-100"
            >
              스타일 분석 시작하기
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {step === AppStep.RESULTS && analysis && (
          <AnalysisView
            analysis={analysis}
            generatedImage={generatedImg}
            previewWarning={previewWarning}
            previewVerification={previewVerification}
            salons={salons}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-400">
        <p>© 2026 StyleSync AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default StyleConsultant;
