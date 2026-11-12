import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, Play, Pause, CheckCircle2 } from 'lucide-react';
import { BigStatDisplay } from './BigStatDisplay';

import bgVoice from '../assets/cards/card-voice.png';
import bgReminders from '../assets/cards/card-reminders.png';
import bgKiosk from '../assets/cards/card-kiosk.png';
import bgClaims from '../assets/cards/card-claims.png';

interface WorkflowPillarsProps {
  onRequestDemo: () => void;
}

export const WorkflowPillars: React.FC<WorkflowPillarsProps> = ({ onRequestDemo }) => {
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [audioSeconds, setAudioSeconds] = useState(0);
  const audioIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleClaraAudio = () => {
    if (isVoicePlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      setIsVoicePlaying(false);
      setAudioSeconds(0);
    } else {
      setIsVoicePlaying(true);
      setAudioSeconds(0);

      const totalDuration = 8;
      audioIntervalRef.current = window.setInterval(() => {
        setAudioSeconds((prev) => {
          if (prev >= totalDuration) {
            if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
            setIsVoicePlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text =
          'Hi, thank you for calling Northside Family Care. My name is Clara. I see an open hygiene slot tomorrow at 10 AM with Doctor Reyes. Would that time work for you?';
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Samantha') ||
              v.name.includes('Zira') ||
              v.name.includes('Google US English') ||
              v.name.includes('Female'))
        );
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.onend = () => {
          if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
          setIsVoicePlaying(false);
          setAudioSeconds(0);
        };
        utterance.onerror = () => {
          if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
          setIsVoicePlaying(false);
          setAudioSeconds(0);
        };
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <section id="features" className="py-10 md:py-14 bg-surface-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs font-bold font-heading tracking-widest text-brand-blue uppercase bg-brand-blue/10 px-3 py-1 rounded-full border border-brand-blue/20">
            Four Autonomous Fixes
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-brand-navy tracking-tight text-balance mt-3">
            One platform. Four fixes. Real numbers.
          </h2>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-7 items-stretch">
          {/* Card 1 — AI Voice Scheduling */}
          <div className="relative bg-white rounded-2xl overflow-hidden p-6 sm:p-7 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group border border-border-soft">
            <div className="absolute top-5 right-5 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center pointer-events-none select-none z-0">
              <img
                src={bgVoice}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="relative z-10 flex flex-col items-start text-left space-y-2 pr-28 sm:pr-32">
              <span className="text-xs font-bold font-heading text-brand-navy uppercase tracking-wider">
                AI VOICE SCHEDULING
              </span>
              <BigStatDisplay before="42%" target={0} suffix="%" textColor="black" />
              <p className="text-sm sm:text-base text-text-body font-medium leading-relaxed">
                Every call answered in 1 ring and booked straight into your EHR.
              </p>
            </div>

            <div className="relative z-10 mt-6 p-3 rounded-xl bg-[#EFFAFB] border border-border-soft flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={toggleClaraAudio}
                className="w-8 h-8 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 cursor-pointer"
                aria-label={isVoicePlaying ? 'Pause Clara sample' : 'Play Clara sample'}
              >
                {isVoicePlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-brand-navy truncate">
                    {isVoicePlaying ? 'Clara: Booking Thu 10:00 AM…' : 'Hear Clara book a visit'}
                  </span>
                  <span className="text-brand-blue text-[10px] font-bold tabular-nums">
                    {isVoicePlaying ? `${audioSeconds}s / 8s` : '0:08'}
                  </span>
                </div>
                <div className="flex items-center gap-1 h-2.5 mt-1">
                  {[40, 75, 55, 95, 60, 85, 45, 90, 70, 40, 80, 65, 90, 50, 75, 45].map(
                    (defaultHeight, i) => (
                      <span
                        key={i}
                        className={`w-1 rounded-full transition-all duration-150 ${
                          isVoicePlaying ? 'bg-brand-blue animate-pulse' : 'bg-brand-blue/35'
                        }`}
                        style={{
                          height: isVoicePlaying
                            ? `${Math.max(25, Math.min(100, Math.sin(audioSeconds * 3 + i) * 60 + 50))}%`
                            : `${defaultHeight}%`,
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 — Automated Reminders */}
          <div className="relative bg-white rounded-2xl overflow-hidden p-6 sm:p-7 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group border border-border-soft">
            <div className="absolute top-5 right-5 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center pointer-events-none select-none z-0">
              <img
                src={bgReminders}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="relative z-10 flex flex-col items-start text-left space-y-2 pr-28 sm:pr-32">
              <span className="text-xs font-bold font-heading text-brand-navy uppercase tracking-wider">
                AUTOMATED REMINDERS
              </span>
              <BigStatDisplay before="15%" target={5} suffix="%" textColor="black" />
              <p className="text-sm sm:text-base text-text-body font-medium leading-relaxed">
                Two-way SMS confirms slots and backfills cancellations automatically.
              </p>
            </div>

            <div className="relative z-10 mt-6 p-3 rounded-xl bg-[#EFFAFB] border border-border-soft flex items-center justify-between gap-3 text-xs">
              <span className="text-brand-navy font-medium truncate">
                &ldquo;Reply C to confirm 2:00 PM&rdquo; → <strong>Replied C</strong>
              </span>
              <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                3× fewer no-shows
              </span>
            </div>
          </div>

          {/* Card 3 — Kiosk Check-In & Copay */}
          <div className="relative bg-white rounded-2xl overflow-hidden p-6 sm:p-7 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group border border-border-soft">
            <div className="absolute top-5 right-5 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center pointer-events-none select-none z-0">
              <img
                src={bgKiosk}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="relative z-10 flex flex-col items-start text-left space-y-2 pr-28 sm:pr-32">
              <span className="text-xs font-bold font-heading text-brand-navy uppercase tracking-wider">
                KIOSK CHECK-IN &amp; COPAY
              </span>
              <BigStatDisplay before="60%" target={95} suffix="%" textColor="black" />
              <p className="text-sm sm:text-base text-text-body font-medium leading-relaxed">
                Intake forms signed and copays collected before the patient sits down.
              </p>
            </div>

            <div className="relative z-10 mt-6 p-3 rounded-xl bg-[#EFFAFB] border border-border-soft flex items-center justify-between gap-3 text-xs">
              <span className="text-brand-navy font-semibold truncate">
                $25.00 Copay Paid · Forms Signed
              </span>
              <span className="shrink-0 text-[11px] font-bold text-brand-blue bg-white px-2 py-0.5 rounded border border-border-soft">
                84s Check-In
              </span>
            </div>
          </div>

          {/* Card 4 — AI Claims Prep */}
          <div className="relative bg-white rounded-2xl overflow-hidden p-6 sm:p-7 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group border border-border-soft">
            <div className="absolute top-5 right-5 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center pointer-events-none select-none z-0">
              <img
                src={bgClaims}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="relative z-10 flex flex-col items-start text-left space-y-2 pr-28 sm:pr-32">
              <span className="text-xs font-bold font-heading text-brand-navy uppercase tracking-wider">
                AI CLAIMS PREP
              </span>
              <BigStatDisplay before="60–90d" target={25} prefix="~" suffix="d" textColor="black" />
              <p className="text-sm sm:text-base text-text-body font-medium leading-relaxed">
                Clean CPT/ICD-10 claims staged and ready before the visit ends.
              </p>
            </div>

            <div className="relative z-10 mt-6 p-3 rounded-xl bg-[#EFFAFB] border border-border-soft flex items-center justify-between gap-3 text-xs">
              <span className="text-brand-navy font-semibold truncate">
                CPT 99214 + D0150 · Pre-Auth Verified
              </span>
              <span className="shrink-0 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                1-Click EDI 837
              </span>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-9 text-center">
          <button
            onClick={onRequestDemo}
            className="py-3 px-6 rounded-xl font-heading font-bold text-sm text-white bg-brand-blue hover:bg-brand-blue-hover hover:shadow-btn-hover transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
          >
            <span>See All 4 Workflows in Action</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
