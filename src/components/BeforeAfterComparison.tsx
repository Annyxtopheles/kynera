import React, { useRef } from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useInView, type Variants } from 'motion/react';

const milestones = [
  {
    time: '07:45 AM',
    without: {
      headline: '40 voicemails waiting before doors open',
      stat: '90 min lost',
    },
    with: {
      headline: '11 overnight calls answered & booked in EHR',
      stat: '0 backlog',
    },
  },
  {
    time: '10:30 AM',
    without: {
      headline: '35 manual reminder dials · 15% no-shows',
      stat: '15% empty chairs',
    },
    with: {
      headline: '2-way SMS confirms & auto-backfills cancellations',
      stat: '4% no-shows',
    },
  },
  {
    time: '01:15 PM',
    without: {
      headline: 'Paper clipboards & 40% uncollected copays',
      stat: '40% missed',
    },
    with: {
      headline: '84s kiosk check-in with contactless copay paid',
      stat: '95%+ collected',
    },
  },
  {
    time: '05:00 PM',
    without: {
      headline: 'Unbilled charts & 60–90 day claim cycles',
      stat: '60–90d cycle',
    },
    with: {
      headline: 'CPT/ICD-10 pre-mapped for 1-click sign-off',
      stat: '20–25d cycle',
    },
  },
];

// Motion variants for responsive scroll reveal
const cardVariantsLeft: Variants = {
  hidden: { opacity: 0, x: -20, y: 16 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const cardVariantsRight: Variants = {
  hidden: { opacity: 0, x: 20, y: 16 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
      delay: 0.08,
    },
  },
};

const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

interface MilestoneRowProps {
  item: typeof milestones[0];
  isReached: boolean;
}

const MilestoneRow: React.FC<MilestoneRowProps> = ({ item, isReached }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(rowRef, {
    margin: "-15% 0px -25% 0px",
  });

  const active = isReached || isInView;

  return (
    <motion.div
      ref={rowRef}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -40px 0px" }}
      className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center"
    >
      {/* Center Timeline Node (First on mobile, center on desktop) */}
      <motion.div
        variants={badgeVariants}
        className="order-1 lg:order-2 lg:col-span-2 flex justify-center z-10"
      >
        <div
          className={`px-3.5 py-1.5 rounded-full border bg-white shadow-xs flex items-center gap-1.5 text-xs font-bold font-heading transition-all duration-300 ${
            active
              ? "border-brand-blue/50 text-brand-navy ring-2 ring-brand-blue/15 shadow-sm"
              : "border-slate-200 text-slate-400"
          }`}
        >
          <Clock
            className={`w-3.5 h-3.5 transition-colors duration-300 ${
              active ? "text-brand-blue" : "text-slate-300"
            }`}
          />
          <span>{item.time}</span>
        </div>
      </motion.div>

      {/* Left Column: Without Kynera */}
      <motion.div
        variants={cardVariantsLeft}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className={`order-2 lg:order-1 lg:col-span-5 bg-[#FFF7F7] rounded-2xl p-4 sm:p-5 border shadow-xs flex items-center justify-between gap-3 transition-all duration-300 ${
          active ? "border-rose-300/90 shadow-sm" : "border-rose-200/70 hover:border-rose-300"
        }`}
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <h3 className="text-sm font-bold font-heading text-rose-950 leading-snug">
            {item.without.headline}
          </h3>
        </div>
        <span className="shrink-0 text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-md">
          {item.without.stat}
        </span>
      </motion.div>

      {/* Right Column: With Kynera */}
      <motion.div
        variants={cardVariantsRight}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className={`order-3 lg:order-3 lg:col-span-5 bg-[#F0FDF8] rounded-2xl p-4 sm:p-5 border shadow-xs flex items-center justify-between gap-3 transition-all duration-300 ${
          active
            ? "border-emerald-300 ring-2 ring-emerald-400/20 shadow-md"
            : "border-emerald-200/80 hover:border-emerald-300"
        }`}
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <h3 className="text-sm font-bold font-heading text-emerald-950 leading-snug">
            {item.with.headline}
          </h3>
        </div>
        <span className="shrink-0 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
          {item.with.stat}
        </span>
      </motion.div>
    </motion.div>
  );
};

export const BeforeAfterComparison: React.FC = () => {
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  // Progressive scroll-linked tracking through the shift timeline
  const { scrollYProgress } = useScroll({
    target: timelineContainerRef,
    offset: ["start 75%", "end 60%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  // Dynamic traveler bead position along the spine (clamped strictly between 0% and 100%)
  const travelerTop = useTransform(smoothProgress, (val) => `${Math.min(Math.max(val * 100, 0), 100)}%`);

  return (
    <section id="compare" className="py-14 md:py-20 bg-surface-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-12"
        >
          <span className="text-xs font-bold font-heading tracking-widest text-brand-blue uppercase bg-brand-blue/10 px-3 py-1 rounded-full border border-brand-blue/20">
            A Day in the Life
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-brand-navy tracking-tight text-balance mt-3">
            A shift without Kynera vs.&nbsp;with&nbsp;it.
          </h2>
        </motion.div>

        {/* Track Column Labels (Desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden lg:grid grid-cols-12 gap-8 mb-5 text-xs font-bold font-heading uppercase tracking-wider"
        >
          <div className="col-span-5 text-rose-800/80 pl-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            Without Kynera
          </div>
          <div className="col-span-2 text-center text-text-body/60 font-heading font-bold">
            Shift
          </div>
          <div className="col-span-5 text-emerald-800/90 pl-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            With Kynera
          </div>
        </motion.div>

        {/* Connected Shift Timeline with Scroll-linked Progression */}
        <div ref={timelineContainerRef} className="relative space-y-5 lg:space-y-6">
          
          {/* Vertical Progress Spine (Desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 -translate-x-1/2 w-0.5 pointer-events-none z-0">
            {/* Base resting track */}
            <div className="w-full h-full bg-slate-200/80" />

            {/* Dynamic scroll-driven progress line */}
            <motion.div
              style={{ scaleY: smoothProgress, originY: 0 }}
              className="absolute top-0 left-0 w-full h-full bg-brand-blue"
            />

            {/* Refined traveling dot tracking current scroll progression */}
            <motion.div
              style={{ top: travelerTop }}
              className="absolute -left-[3px] -translate-y-1/2 w-2 h-2 rounded-full bg-brand-blue shadow-[0_0_8px_rgba(46,148,193,0.6)] ring-2 ring-white pointer-events-none"
            />
          </div>

          {milestones.map((item, idx) => (
            <MilestoneRow
              key={idx}
              item={item}
              isReached={false}
            />
          ))}

        </div>

        {/* Quantified Clinic Shift Impact Summary Bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 sm:mt-16 bg-[#EFFAFB] rounded-2xl p-6 sm:p-8 border border-border-soft"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-border-soft">
            <div className="pt-2 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold font-heading text-brand-navy">
                +20 Hours
              </div>
              <div className="text-xs sm:text-sm font-medium text-text-body mt-1">
                Saved weekly per staff member
              </div>
            </div>

            <div className="pt-4 sm:pt-0 sm:px-4">
              <div className="text-2xl sm:text-3xl font-extrabold font-heading text-brand-blue">
                1-Ring Answer
              </div>
              <div className="text-xs sm:text-sm font-medium text-text-body mt-1">
                100% of inbound calls handled live
              </div>
            </div>

            <div className="pt-4 sm:pt-0 sm:pl-4">
              <div className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-700">
                &lt; 24 Hours
              </div>
              <div className="text-xs sm:text-sm font-medium text-text-body mt-1">
                Live with your existing phone &amp; EHR
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
