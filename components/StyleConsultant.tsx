import React, { useState, useEffect } from 'react';
import Header from './Header';
import ImageUploader from './ImageUploader';
import AnalysisView from './AnalysisView';
import { generateHairstylePreview, analyzeHairCompatibility, findNearbySalons } from '../services/geminiService';
import { AppStep, HairAnalysis, Salon, GeoLocation } from '../types';
import { ArrowRight, Loader2 } from 'lucide-react';

const StyleConsultant: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD_CURRENT);
  const [currentImg, setCurrentImg] = useState<string | null>(null);
  const [targetImg, setTargetImg] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<HairAnalysis | null>(null);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  // Robust location fetching with fallback strategy
  const getLocation = async (): Promise<GeoLocation | null> => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return null;
    }

    const getPos = (options: PositionOptions): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    };

    try {
      // 1. Try High Accuracy first (fast timeout)
      // maximumAge: 0 forces fresh reading
      const position = await getPos({ enableHighAccuracy: true, timeout: 4000, maximumAge: 0 });
      return { latitude: position.coords.latitude, longitude: position.coords.longitude };
    } catch (e) {
      console.warn("High accuracy location failed, trying fallback...", e);

      try {
        // 2. Fallback: Low Accuracy (allows cached position up to 1 minute old)
        const position = await getPos({ enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
        return { latitude: position.coords.latitude, longitude: position.coords.longitude };
      } catch (e2) {
        console.error("All location retrieval attempts failed", e2);
        return null;
      }
    }
  };

  // Attempt to get location on mount silently
  useEffect(() => {
    getLocation().then(loc => {
      if (loc) {
        setLocation(loc);
        console.log("Location acquired silently");
      }
    });
  }, []);

  const handleProcess = async () => {
    if (!currentImg || !targetImg) return;

    setStep(AppStep.ANALYZING);
    setIsProcessing(true);

    try {
      // 1. Ensure we have location before starting
      let userLoc = location;

      // If we don't have location yet, try to get it again explicitly
      if (!userLoc) {
        setStatusMessage("위치 정보를 받아오는 중...");
        userLoc = await getLocation();

        if (userLoc) {
          setLocation(userLoc);
        } else {
          // If still failed, notify user but proceed with analysis
          // alert("위치 정보를 가져올 수 없습니다. 브라우저의 위치 권한 설정을 확인해주세요. 미용실 추천 기능이 제한됩니다.");
        }
      }

      // 2. Parallelize text analysis and image generation
      setStatusMessage("스타일 분석 및 이미지 생성 중...");

      const analysisPromise = analyzeHairCompatibility(currentImg, targetImg);
      const previewPromise = generateHairstylePreview(currentImg, targetImg);

      const [analysisResult, previewResult] = await Promise.all([analysisPromise, previewPromise]);

      setAnalysis(analysisResult);
      setGeneratedImg(previewResult);

      // 3. Find salons based on the analyzed keywords and user location
      if (userLoc && analysisResult.styleKeywords) {
        setStatusMessage("주변 미용실을 검색하고 있습니다...");
        try {
          const foundSalons = await findNearbySalons(userLoc, analysisResult.styleKeywords);
          setSalons(foundSalons);
        } catch (salonError) {
          console.error("Salon search error", salonError);
        }
      } else {
        console.log("Skipping salon search: Location missing.");
      }

      setStep(AppStep.RESULTS);
    } catch (error) {
      console.error("Processing failed", error);
      alert("분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setStep(AppStep.UPLOAD_TARGET); // Go back
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  const handleReset = () => {
    setStep(AppStep.UPLOAD_CURRENT);
    setCurrentImg(null);
    setTargetImg(null);
    setAnalysis(null);
    setGeneratedImg(null);
    setSalons([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">

        {step !== AppStep.RESULTS && (
          <div className="max-w-xl mx-auto text-center mb-10 space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">AI 헤어 스타일 컨설턴트</h2>
            <p className="text-gray-500">현재 모습과 원하는 스타일 사진을 올리면, AI가 분석하고 시뮬레이션 해드립니다.</p>
          </div>
        )}

        {step === AppStep.ANALYZING && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <Loader2 className="w-16 h-16 text-[#7c3aed] animate-spin mb-6" />
            <h3 className="text-xl font-semibold text-gray-800">AI가 열심히 분석하고 있습니다</h3>
            <p className="text-gray-500 mt-2">{statusMessage}</p>
          </div>
        )}

        {(step === AppStep.UPLOAD_CURRENT || step === AppStep.UPLOAD_TARGET) && (
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start">
            <ImageUploader
              label="1. 현재 내 사진"
              description="정면이 잘 나온 사진을 올려주세요."
              image={currentImg}
              onImageChange={(img) => {
                setCurrentImg(img);
                if (img && !targetImg) setStep(AppStep.UPLOAD_TARGET);
              }}
            />

            <div className={`transition-opacity duration-500 ${currentImg ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <ImageUploader
                label="2. 원하는 스타일 사진"
                description="따라하고 싶은 머리 사진을 올려주세요."
                image={targetImg}
                onImageChange={(img) => setTargetImg(img)}
              />
            </div>
          </div>
        )}

        {(step === AppStep.UPLOAD_TARGET || step === AppStep.UPLOAD_CURRENT) && currentImg && targetImg && (
          <div className="mt-12 flex justify-center animate-in fade-in slide-in-from-bottom-2">
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="group flex items-center gap-2 px-8 py-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-full font-bold text-lg shadow-lg shadow-[#7c3aed]/30 transition-all hover:scale-105 active:scale-95"
            >
              스타일 분석 시작하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {step === AppStep.RESULTS && analysis && (
          <AnalysisView
            analysis={analysis}
            generatedImage={generatedImg}
            salons={salons}
            onReset={handleReset}
          />
        )}

      </main>

      <footer className="py-6 text-center text-gray-400 text-sm border-t border-gray-200 bg-white">
        <p>© 2024 StyleSync AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default StyleConsultant;
